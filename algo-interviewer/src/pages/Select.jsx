import axios from "axios";
import { useNavigate } from "react-router-dom";

const requestFirstQuestion = async (level) => {
  const systemPrompt = `
You are AlgoInterviewer AI.

Only answer DSA questions.
Difficulty: ${level}
`;

  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\nReturn only one DSA question. Include a short example or test case if helpful. Do not provide the answer, approach, code, or complexity.`,
        },
        {
          role: "user",
          content:
            "Start the interview with one DSA question and one example or test case.",
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      },
    },
  );

  return res.data.choices[0].message.content;
};

export default function Select() {
  const nav = useNavigate();

  const go = async (level) => {
    localStorage.setItem("level", level);
    localStorage.removeItem("question");

    try {
      const question = await requestFirstQuestion(level);
      localStorage.setItem("question", question);
      nav("/chat", { state: { level, question } });
    } catch {
      localStorage.removeItem("question");
      nav("/chat", { state: { level } });
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="mb-6 text-3xl">Select Difficulty</h1>

      <div className="flex gap-4">
        <button onClick={() => go("easy")} className="bg-green-600 px-4 py-2">
          Easy
        </button>

        <button
          onClick={() => go("medium")}
          className="bg-yellow-600 px-4 py-2"
        >
          Medium
        </button>

        <button onClick={() => go("hard")} className="bg-red-600 px-4 py-2">
          Hard
        </button>
      </div>
    </div>
  );
}
