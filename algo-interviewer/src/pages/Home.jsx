import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="mb-4 text-4xl font-bold">AlgoInterviewer AI</h1>
      <p className="mb-6 text-gray-400">Practice DSA interviews with AI</p>
      <button
        onClick={() => nav("/select")}
        className="rounded bg-green-500 px-6 py-3"
      >
        Start Interview
      </button>
    </div>
  );
}
