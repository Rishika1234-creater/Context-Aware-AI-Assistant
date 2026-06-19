# Context-Aware AI Chatbot

A full-stack AI chatbot built using **Node.js, Express.js, Vanilla JavaScript, and Google Gemini API**.

The application provides two specialized AI assistants:

-  Coding Tutor
-  Personal Finance Guide

Users can switch between both modes instantly, with separate chat histories and AI behavior for each domain.

---

##  Features

###  Coding Tutor

- Explains programming concepts and debugging errors.
- Identifies:
  - What is wrong in the code
  - Why the error occurs
  - How to approach the solution
- Does **not provide complete code solutions**, encouraging active learning.
- Supports multiple learning levels:
  - Beginner
  - Intermediate
  - Advanced
- Responses are customized according to the selected level.

###  Personal Finance Guide

- Provides financial literacy guidance.
- Explains budgeting, saving, and money management concepts.
- Uses frameworks such as the **50/30/20 budgeting rule**.
- Gives structured and easy-to-understand advice.

###  Authentication System

- User Signup and Login functionality.
- Secure access to personal conversations.

###  Chat History Dashboard

- View previous conversations.
- Continue old chats anytime.
- Separate history maintained for different assistant modes.

###  Dynamic Mode Switching

- Instantly switch between Coding Tutor and Finance Guide.
- Updates assistant behavior based on the selected mode.
- Changes UI theme dynamically.

###  Local Data Persistence

- Chat history is automatically saved.
- Uses a local `database.json` file.
- No external database required.

###  Responsive UI

- Modern Glassmorphism-inspired design.
- Works across desktop and mobile devices.

---

##  Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)

### Backend
- Node.js
- Express.js

### AI Integration
- Google Gemini API (Gemini 1.5 Flash)

### Storage
- JSON File Storage
- Node.js File System (`fs`)

---

##  How It Works

1. User logs into the application.
2. Selects either Coding Tutor or Finance Guide.
3. Sends a message to the AI assistant.
4. Backend forwards the request to Gemini API.
5. AI generates a response based on the selected mode.
6. Conversation is automatically stored.
7. Previous chats can be accessed from the dashboard.

---

##  Key Highlights

- Dual-domain AI assistant
- Skill-based Coding Tutor (Beginner, Intermediate, Advanced)
- No-spoonfeeding learning approach
- Personal Finance guidance
- User Authentication
- Chat History Dashboard
- Local JSON-based storage
- Dynamic UI theme switching
- Gemini API integration

---

##  What I Learned

- Full-Stack Development
- REST APIs
- Authentication & Authorization
- Prompt Engineering
- AI Chatbot Development
- File-based Data Storage
- Frontend-Backend Integration
- State & History Management

---

##  Future Improvements

- Cloud Database Integration
- User Profile Customization
- Export Chat History
- Multiple AI Model Support
- Analytics Dashboard


---

##  Detailed Project Structure

```text
📁 project3
│
├── 📁 node_modules/        # System and runtime server dependencies
├── 📄 .env                 # Environment file keeping the Gemini API Token secure
├── 📄 .env.example         # Template file for quick setup reference
├── 📄 .gitignore           # Stops critical tokens and data from reaching public repos
├── 📄 database.json        # Auto-generated JSON database storing chat arrays
├── 📄 index.html           # Main UI shell (Input nodes, tab controllers, message boxes)
├── 📄 style.css            # Responsive styles, theme glows, and sleek user experience
├── 📄 script.js            # Main frontend orchestration & history mapping engine
└── 📄 server.js            # Core entry point, Express server, and API logic gateway

---

## 📌 Project Summary

Context-Aware AI is an AI-powered chatbot that combines a **Coding Tutor** and a **Personal Finance Guide** into a single platform. The application includes authentication, chat history management, skill-based AI responses, dynamic mode switching, and local data persistence to provide an interactive learning experience.
