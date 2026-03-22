# algo-interviewer project
AlgoInterviewer AI is a React + Vite chatbot project for practicing data structures and algorithms interviews.
It starts with a landing page, lets the user choose a difficulty level, generates an interview question through Groq, and then continues the interview inside a chat-style interface.

## What This Project Does

- Starts the user on a simple home screen
- Lets the user pick a difficulty level: easy, medium, or hard
- Fetches an AI-generated DSA interview question
- Shows the question in a dedicated question panel
- Lets the user type an answer or paste code
- Gives AI feedback on the answer
- Supports follow-up actions like explaining the idea, showing code, and moving to the next question

## How The Chatbot Works

1. The app opens on the home page.
2. The user clicks Start Interview.
3. The app moves to the difficulty selection page.
4. When the user selects a level, the app saves that choice and requests the first interview question from the Groq API.
5. The question is stored and displayed in the chat screen.
6. The user can respond in the conversation box.
7. The chatbot reads the current question plus the user reply and returns interviewer-style feedback.
8. The user can also ask the bot to explain the problem, show a solution in C++, or generate the next DSA question.

## Pages In The App

- Home page: the entry screen with the Start Interview button
- Select page: difficulty picker and first question generator
- Chat page: main interview interface with question area, action buttons, and conversation box

## Main Flow In The Code

- [src/App.jsx](src/App.jsx) sets up routing for the three pages.
- [src/pages/Home.jsx](src/pages/Home.jsx) handles the first screen and navigation to difficulty selection.
- [src/pages/Select.jsx](src/pages/Select.jsx) stores the selected level and requests the first question.
- [src/pages/Chat.jsx](src/pages/Chat.jsx) manages the interview session, API calls, markdown rendering, code highlighting, and user/AI messages.

## AI Behavior

The chatbot is configured to act like a DSA interviewer.
It is instructed to stay focused on algorithm problems, keep the difficulty tied to the selected level, and default to C++ when code is requested without a language choice.

## Environment Setup

Create a `.env` file and add your Groq API key:

```env
VITE_API_KEY=your_groq_api_key
```

## Run The Project

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

## Available Scripts

- `npm run dev` starts the local Vite development server
- `npm run build` creates a production build
- `npm run lint` checks the project with ESLint
- `npm run preview` previews the production build locally

## Tech Stack

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- React Markdown
- highlight.js

## Notes

- Interview history is handled in memory during the session and also stored in `localStorage` for continuity.
- The question and difficulty can survive a refresh because they are saved locally.
- If the API request fails, the app falls back gracefully and keeps the chat usable.
