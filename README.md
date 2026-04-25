# ⚖️ LegalAI – Conversational Legal Awareness Assistant

> An AI-powered legal awareness assistant that provides structured, safe, and contextual legal guidance — designed as a “legal first-aid” system.

---

## 🚀 Overview

LegalAI is a full-stack conversational AI application that helps users understand legal situations in a structured and safe manner.

It does **NOT replace a lawyer**, but acts as a **first step guidance system**, helping users:

* Understand their situation
* Take immediate actions
* Stay aware of legal boundaries
* Decide when to consult a professional

---

## ✨ Key Features

### 🧠 AI-Powered Legal Guidance

* Context-aware responses
* Structured legal explanations
* Safe and non-definitive advice

### 💬 Conversational Chat Interface

* ChatGPT-like UI
* Real-time message flow
* Session-based conversations

### 📂 Chat Management

* Create new chats automatically
* Sidebar with chat history
* Delete & manage conversations

### 🌐 Full Stack Architecture

* React frontend (Vite)
* Python backend (FastAPI)
* AI integration via Groq (LLaMA models)

### 🔐 Safety First Design

* No legal guarantees
* Encourages professional consultation
* Built-in disclaimers

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Context API (State Management)

### Backend

* Python (FastAPI)
* REST API architecture

### AI / LLM

* Groq API
* LLaMA 3.3 70B model

### Other Tools

* Git & GitHub
* Postman (API testing)

---

## 📁 Project Structure

```
legal-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│
├── backend/
│   ├── app/
│   ├── routes/
│   └── chat.py
│
├── .gitignore
└── README.md
```

---

## ⚙️ How It Works

1. User enters a legal query
2. Frontend sends request to backend
3. Backend calls AI model (Groq API)
4. AI generates structured legal response
5. Response is displayed in chat UI

---

## 🧪 Example Output Structure

The AI responds in a structured format:

1. Situation Understanding
2. Immediate Steps
3. Legal Awareness
4. Caution
5. Suggestion to consult a lawyer
6. Disclaimer

---

## 🛠️ Setup Instructions

### 🔹 1. Clone Repository

```
git clone https://github.com/YOUR_USERNAME/legal-ai.git
cd legal-ai
```

---

### 🔹 2. Backend Setup

```
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```
GROQ_API_KEY=your_api_key_here
```

Run backend:

```
uvicorn app.main:app --reload
```

---

### 🔹 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 🌍 Environment Variables

### Backend

```
GROQ_API_KEY=your_api_key
```

### Frontend

```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📸 Screenshots

> Add your UI screenshots here 👇

* Chat Interface
* Sidebar
* AI Response Example

---

## 🚀 Future Improvements

* 🔹 Chat history persistence (Database)
* 🔹 Voice input support
* 🔹 Emotion-aware responses
* 🔹 Lawyer connection system
* 🔹 Multi-language support
* 🔹 Authentication & user accounts

---

## ⚠️ Disclaimer

This project provides **general legal information only** and does **NOT constitute legal advice**.
Always consult a qualified legal professional for serious matters.

---

## 👨‍💻 Author

**Ayush Kumar**

* GitHub: https://github.com/ayush-kumar-24
* Project: LegalAI

---

## ⭐ Show Your Support

If you like this project:

⭐ Star the repo
🍴 Fork it
🧠 Contribute

---

## 💡 Inspiration

Built with the vision of making **legal awareness accessible to everyone**, especially for people who lack immediate legal guidance.

---
