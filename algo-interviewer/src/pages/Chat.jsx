import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const getLanguageLabel = (className) => {
  const match = /language-([\w-]+)/.exec(className || "");

  if (!match) return "Code";

  const language = match[1].toLowerCase();

  if (language === "cpp" || language === "c++" || language === "cplusplus") {
    return "C++";
  }

  if (language === "py" || language === "python") {
    return "Python";
  }

  if (language === "js" || language === "javascript") {
    return "JavaScript";
  }

  if (language === "ts" || language === "typescript") {
    return "TypeScript";
  }

  return language.charAt(0).toUpperCase() + language.slice(1);
};

const requestGroq = async (level, nextMessages, mode) => {
  const systemPrompt = `
You are AlgoInterviewer AI.

Only answer DSA questions.
Difficulty: ${level}
If code is requested and no language is specified, default to C++.
`;

  const modePrompt =
    mode === "question"
      ? "Return only one DSA question. Include a short example or test case if helpful. Do not provide the answer, approach, code, or complexity."
      : mode === "explain"
        ? "Explain the current interview question step by step in a clear interview style."
        : mode === "code"
          ? "Give only the C++ solution for the current interview question. Treat C++ as the default language for code requests, with brief comments and no extra fluff."
          : mode === "next"
            ? "Ask the next DSA interview question only. Do not repeat previous questions."
            : "Check the user's answer or code carefully, point out mistakes, and give interviewer-style feedback with a corrected version if needed.";

  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n${modePrompt}`,
        },
        ...nextMessages,
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      },
    },
  );

  return res.data.choices[0].message;
};

const MarkdownContent = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
    components={{
      pre: ({ children }) => (
        <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b1020] p-4 text-sm leading-6 text-white shadow-inner shadow-black/20">
          {children}
        </pre>
      ),
      code: ({ inline, className, children, ...props }) =>
        inline ? (
          <code
            className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-green-200"
            {...props}
          >
            {children}
          </code>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] shadow-inner shadow-black/20">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">
              <span>{getLanguageLabel(className)}</span>
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-6 text-white">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        ),
    }}
  >
    {content}
  </ReactMarkdown>
);

export default function Chat() {
  const location = useLocation();
  const [selectedLevel] = useState(
    () => location.state?.level || localStorage.getItem("level") || "medium",
  );
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState(
    () => location.state?.question || localStorage.getItem("question") || "",
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const startedRef = useRef(false);

  const addBotMessage = (content) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  };

  useEffect(() => {
    if (startedRef.current) return;

    if (question) return;

    startedRef.current = true;

    const timer = window.setTimeout(() => {
      setLoading(true);

      void requestGroq(
        selectedLevel,
        [
          {
            role: "user",
            content:
              "Start the interview with one DSA question and one example or test case.",
          },
        ],
        "question",
      )
        .then((bot) => {
          localStorage.setItem("question", bot.content);
          setQuestion(bot.content);
        })
        .catch(() => {
          alert("API error");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedLevel, question]);

  const send = async () => {
    if (!input) return;

    const userMsg = {
      role: "user",
      content: input,
    };

    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const bot = await requestGroq(
        selectedLevel,
        [
          {
            role: "user",
            content: `Current question: ${question}\n\nPlease check this answer or code carefully and give feedback:\n\n${userMsg.content}`,
          },
        ],
        "answer",
      );

      addBotMessage(bot.content);
    } catch {
      alert("API error");
    }

    setLoading(false);
  };

  const askExplainIdea = async () => {
    if (!question) return;

    setLoading(true);

    try {
      const bot = await requestGroq(
        selectedLevel,
        [
          {
            role: "user",
            content: `Explain this DSA interview question in simple steps:\n${question}`,
          },
        ],
        "explain",
      );

      addBotMessage(bot.content);
    } catch {
      alert("API error");
    }

    setLoading(false);
  };

  const askShowCode = async () => {
    if (!question) return;

    setLoading(true);

    try {
      const bot = await requestGroq(
        selectedLevel,
        [
          {
            role: "user",
            content: `Give the C++ solution for this DSA interview question:\n${question}`,
          },
        ],
        "code",
      );

      addBotMessage(bot.content);
    } catch {
      alert("API error");
    }

    setLoading(false);
  };

  const askNextQuestion = async () => {
    setLoading(true);

    try {
      const bot = await requestGroq(
        selectedLevel,
        [
          {
            role: "user",
            content:
              "Give the next DSA interview question with one example or test case.",
          },
        ],
        "next",
      );

      localStorage.setItem("question", bot.content);
      setQuestion(bot.content);
      setMessages([]);
    } catch {
      alert("API error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_34%),linear-gradient(180deg,_#050816_0%,_#02040a_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-green-400/80">
              AlgoInterviewer AI
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
              DSA Interview Session
            </h1>
          </div>

          <div className="rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-medium text-green-300">
            {selectedLevel}
          </div>
        </div>

        <div className="grid flex-1 gap-4 p-4 md:grid-cols-[1.15fr_1.85fr] md:p-6">
          <section className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-lg shadow-black/20">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-green-300/90">
                  Question Box
                </h2>
                {loading && (
                  <span className="text-xs text-white/60">Thinking...</span>
                )}
              </div>

              <div className="min-h-40 rounded-2xl border border-green-400/15 bg-white/5 p-4 text-sm leading-7 text-white/90">
                {question ? (
                  <MarkdownContent content={question} />
                ) : (
                  <p className="text-white/50">
                    Loading your first interview question...
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-lg shadow-black/20">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-green-300/90">
                Action Buttons
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1">
                <button
                  onClick={askExplainIdea}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white transition hover:border-green-400/40 hover:bg-green-400/10"
                >
                  Explain Idea
                </button>
                <button
                  onClick={askShowCode}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white transition hover:border-green-400/40 hover:bg-green-400/10"
                >
                  Show Code
                </button>
                <button
                  onClick={askNextQuestion}
                  className="rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-left text-sm font-semibold text-green-300 transition hover:bg-green-500/20"
                >
                  Next Question
                </button>
              </div>
            </div>
          </section>

          <section className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-black/25 shadow-lg shadow-black/20">
            <div className="border-b border-white/10 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-green-300/90">
                Conversation Box
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-white/45">
                  Your answer and interview feedback will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[92%] rounded-2xl border px-4 py-3 text-sm leading-6 sm:max-w-[85%] ${
                        m.role === "user"
                          ? "ml-auto border-green-400/25 bg-green-500/15 text-green-50"
                          : "border-white/10 bg-white/8 text-white/90"
                      }`}
                    >
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                        {m.role === "user" ? "You" : "AI"}
                      </p>
                      {m.role === "user" ? (
                        <p className="whitespace-pre-line">{m.content}</p>
                      ) : (
                        <MarkdownContent content={m.content} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-4 sm:p-5">
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-start">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste code or type your answer here..."
                  rows={4}
                  className="min-h-28 w-full flex-1 resize-y rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-green-400/50"
                />

                <button
                  onClick={send}
                  className="rounded-2xl bg-green-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-44 sm:self-start"
                  disabled={loading}
                >
                  Send Answer
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
