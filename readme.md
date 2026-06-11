# Context-Aware Intelligent Assistant with Persistent Storage

DualMind AI is a production-ready, full-stack web application featuring a dual-domain AI conversational assistant powered by the Google Gemini API. The core architecture leverages dynamic context switching, advanced prompt engineering guardrails, and automated local data persistence to create an optimized, lightweight user experience without heavy database overhead.

The platform splits into two highly specialized domains with fluid visual themes:
1. **Coding & Debugging Tutor:** A strict, concepts-first mentor that prevents spoon-feeding.
2. **Personal Finance Guide:** A structured literacy advisor implementing financial frameworks like the 50/30/20 rule.

---

## Key Architectural Features

### Dynamic Context Switching
The client-side infrastructure dynamically modulates system prompts, visual styling variables (`--current-glow`), messaging containers, and context banners on the fly. Switching domains immediately signals the backend node to swap execution constraints and reload domain-specific histories.

###  Advanced Prompt Engineering & Guardrails
- **The Non-Spoonfeeding Rule:** The Coding Assistant is injected with behavioral directives that restrict it from outputting complete refactored code blocks or snippets. It forces the user into an active debugging loop by explaining the *What*, *Why*, and *How* conceptually.
- **Structured Financial Frameworks:** The Finance Guide strictly formats recommendations with readable bullet points, tables, or numeric breakdowns, maintaining a clear distinction between generic financial literacy and regulated professional advice.

### Native File System Data Persistence
Instead of relying on heavy local database servers (like MongoDB or SQL installs), this project utilizes an asynchronous/synchronous pipeline with the Node.js native File System (`fs`) module. 
- All conversations are structured, serialized, and safely committed into a centralized `database.json` store.
- On page load (`DOMContentLoaded`) or tab toggling, automated endpoint hooks (`/api/history/:topic`) fetch and render previous message structures seamlessly.

###  Optimized Direct REST Communication
To bypass package version conflicts and engine performance overhead frequently caused by heavy generative AI wrapper SDKs, the backend architecture connects directly to Google's API servers using secure HTTP `fetch` streams over REST.

---

##  Technology Stack & Dependencies

- **Frontend Layers:** - Semantic HTML5 & Modern CSS3 (featuring Glassmorphism, CSS Custom Properties, and responsive flex grids).
  - Vanilla JavaScript (ES6+, utilizing asynchronous event workflows and Fetch APIs).
- **Backend Architecture:** Node.js framework paired with Express.js router.
- **Storage Tier:** Document Object Serialization via local JSON streams.
- **AI Integration Core:** Google Gemini API Protocol (`gemini-1.5-flash` engine).

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