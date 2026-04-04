# ⚖️ Legal AI — Frontend

> Your AI-powered Legal Companion · Production-ready React frontend

---

## 📁 Project Structure

```
legal-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInput.jsx        # Message input with quick prompts
│   │       ├── ChatMessage.jsx      # User + AI message bubbles (Markdown)
│   │       ├── ChatSidebar.jsx      # Sidebar with history, search, profile
│   │       ├── ChatWindow.jsx       # Main chat area + welcome screen
│   │       ├── ConfidenceBadge.jsx  # AI confidence level indicator
│   │       └── TypingIndicator.jsx  # Animated "thinking" state
│   ├── context/
│   │   ├── AuthContext.jsx          # Auth state + login/signup/logout
│   │   ├── ChatContext.jsx          # Chat sessions + localStorage
│   │   └── ThemeContext.jsx         # Dark/light mode toggle
│   ├── hooks/
│   │   ├── useLocalStorage.js       # Generic localStorage hook
│   │   └── useScrollToBottom.js     # Auto-scroll for chat
│   ├── pages/
│   │   ├── LandingPage.jsx          # Full marketing landing page
│   │   ├── LoginPage.jsx            # Auth - login
│   │   ├── SignupPage.jsx           # Auth - signup
│   │   └── ChatPage.jsx             # Main chat application
│   ├── services/
│   │   └── api.js                   # Axios client → backend /ask
│   ├── App.jsx                      # Router + providers
│   ├── index.css                    # Tailwind + design system
│   └── main.jsx                     # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend running at `http://127.0.0.1:8000`

### 1. Install dependencies

```bash
cd legal-ai
npm install
```

### 2. Start development server

```bash
npm run dev
```

App opens at → **http://localhost:3000**

### 3. Build for production

```bash
npm run build
npm run preview   # Preview production build
```

---

## 🔌 Backend Connection

The frontend calls your FastAPI backend at:

```
POST http://127.0.0.1:8000/ask
Content-Type: application/json

{
  "query": "user question",
  "session_id": "session_abc123"
}
```

Expected response:
```json
{
  "answer": "...",
  "confidence": 0.87,
  "safe": true
}
```

**Configuration:** Edit `src/services/api.js` to change the base URL:
```js
const BASE_URL = 'http://127.0.0.1:8000'  // ← change this
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🌙 Dark Mode | Default dark, toggle in sidebar |
| 🔐 Auth | Frontend-only (localStorage), swap for real API |
| 💬 Chat History | Per-session persistence, search, delete |
| 🤖 AI Responses | Markdown rendering, confidence badge |
| ⌨️ Typing Indicator | Animated while waiting for API |
| 📱 Responsive | Mobile drawer sidebar, tablet/desktop layouts |
| 🔁 Session Memory | Unique session_id sent per chat |
| ⚡ Quick Prompts | Suggested questions for new users |

---

## 🎨 Design System

- **Fonts:** Playfair Display (headings) + Outfit (body) + JetBrains Mono (code)
- **Colors:** Navy dark theme + Gold accents
- **Components:** Glassmorphism cards, gradient buttons
- **Animations:** fade-up, typing dots, shimmer

---

## ⚠️ Disclaimer

This frontend is built for a legal awareness AI platform.
All AI responses are for **educational purposes only**.
Users should consult licensed legal professionals for actual legal advice.
