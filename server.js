import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 8500; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'database.json');

// --- HELPER DATABASE FUNCTIONS ---
function readLocalDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            return { coding: { messages: [] }, finance: { messages: [] }, user: null };
        }
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return data ? JSON.parse(data) : { coding: { messages: [] }, finance: { messages: [] }, user: null };
    } catch (err) {
        return { coding: { messages: [] }, finance: { messages: [] }, user: null };
    }
}

function writeLocalDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- FEATURE 4: BASIC AUTHENTICATION ENDPOINTS ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple mock authentication for testing
    if (username === 'admin' && password === 'password123') {
        const db = readLocalDB();
        db.user = { username: 'admin', loggedInAt: new Date() };
        writeLocalDB(db);
        return res.json({ success: true, user: db.user });
    }
    
    res.status(401).json({ success: false, message: "Invalid username or password! Try admin/password123" });
});

app.post('/api/auth/logout', (req, res) => {
    const db = readLocalDB();
    db.user = null;
    writeLocalDB(db);
    res.json({ success: true });
});

app.get('/api/auth/session', (req, res) => {
    const db = readLocalDB();
    res.json({ user: db.user });
});

// --- FEATURE 1: MEMORY DASHBOARD ENDPOINT ---
app.get('/api/dashboard', (req, res) => {
    try {
        const db = readLocalDB();
        
        const codingCount = db.coding?.messages?.length || 0;
        const financeCount = db.finance?.messages?.length || 0;
        const totalMessages = codingCount + financeCount;

        let activeTopics = 0;
        if (codingCount > 0) activeTopics++;
        if (financeCount > 0) activeTopics++;

        res.json({
            totalMessages,
            codingCount,
            financeCount,
            activeTopics
        });
    } catch (error) {
        console.error("❌ Dashboard metric error:", error);
        res.status(500).json({ error: "Could not load dashboard metrics" });
    }
});

// History Endpoint
app.get('/api/history/:topic', (req, res) => {
    const { topic } = req.params;
    try {
        const db = readLocalDB();
        const history = db[topic] ? db[topic].messages : [];
        res.json({ history });
    } catch (error) {
        console.error("❌ History fetch error:", error);
        res.status(500).json({ error: "Could not fetch history" });
    }
});

// --- FEATURE 2: DIFFICULTY-AWARE TUTOR CHAT INTEGRATION ---
app.post('/api/chat', async (req, res) => {
    const { topic, message, difficulty } = req.body; 
    const currentDifficulty = difficulty || 'beginner'; // fallback default
    
    console.log(`[LOG] Msg received for [${topic}] at [${currentDifficulty}] level: "${message}"`);
    
    try {
        const db = readLocalDB();
        if (!db[topic]) {
            db[topic] = { messages: [] };
        }

        // Build customized system instructions depending on choice profiles
        let systemInstruction = "";
        if (topic === 'coding') {
            systemInstruction = 
                "You are an expert programming tutor. Your sole purpose is to help users debug their code. " +
                "When a user pastes code with an error, your task is to analyze it and explain WHAT the error is, " +
                "WHY it happened, and HOW they can conceptually fix it. " +
                "CRITICAL RULE: Do not provide any corrected code blocks or code snippets under any circumstances. " +
                "Force the user to write the code themselves based on your explanation. Keep the tone encouraging and educational. ";
            
            if (currentDifficulty === 'beginner') {
                systemInstruction += "The user is a BEGINNER. Explain concepts using simple real-world analogies, avoid heavy jargon, and break things down step-by-step.";
            } else if (currentDifficulty === 'intermediate') {
                systemInstruction += "The user is an INTERMEDIATE developer. Focus on architectural logic, code structure flaws, and reference standard documentation paths.";
            } else if (currentDifficulty === 'advanced') {
                systemInstruction += "The user is an ADVANCED programmer. Talk about edge cases, memory complexity, optimization trade-offs, and design patterns deeply.";
            }
        } else if (topic === 'finance') {
            systemInstruction = 
                "You are a smart personal finance advisor. Your job is to analyze user spending, budgeting, " +
                "and investment questions and provide tailored financial suggestions. Do not give official legal or professional " +
                "investment advice, but guide them on budgeting frameworks, savings strategies, and financial literacy. " +
                "Keep your answers structured and easy to read using bullet points if necessary. ";
                
            if (currentDifficulty === 'beginner') {
                systemInstruction += "The user is a BEGINNER to finance. Keep it centered on basics like savings matching, tracking expenses, and simple definitions.";
            } else if (currentDifficulty === 'intermediate') {
                systemInstruction += "The user is an INTERMEDIATE manager. Incorporate concepts like tax-advantaged account strategies, asset diversification, and inflation protections.";
            } else if (currentDifficulty === 'advanced') {
                systemInstruction += "The user is an ADVANCED investor. Speak confidently about macro-economics, options/hedging structures, real estate yields, and sophisticated portfolio optimization.";
            }
        }

        const contents = [];
        db[topic].messages.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: String(msg.text) }]
            });
        });
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            throw new Error("GEMINI_API_KEY is missing from your .env file!");
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
        
        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: { parts: [{ text: systemInstruction }] }
            })
        });

        const responseData = await apiResponse.json();
        if (!apiResponse.ok) {
            throw new Error(responseData.error?.message || "Gemini HTTP Request failed");
        }

        const aiResponseText = responseData.candidates[0].content.parts[0].text;

        // Save conversation history with metadata
        db[topic].messages.push({ role: 'user', text: message, difficulty: currentDifficulty, timestamp: new Date() });
        db[topic].messages.push({ role: 'model', text: aiResponseText, timestamp: new Date() });
        
        writeLocalDB(db);
        res.json({ reply: aiResponseText });
        
    } catch (error) {
        console.error("ERROR LOG:", error.message);
        res.status(500).json({ reply: `Error: ${error.message}.` });
    }
});

// --- FEATURE 3: EXPORT HISTORY CONFIGURATION DATA ---
app.get('/api/export-data/:topic', (req, res) => {
    const { topic } = req.params;
    try {
        const db = readLocalDB();
        const messages = db[topic] ? db[topic].messages : [];
        
        if (messages.length === 0) {
            return res.status(400).json({ error: "No history found to export for this topic!" });
        }
        
        res.json({ topic, exportedAt: new Date(), data: messages });
    } catch (error) {
        res.status(500).json({ error: "Failed to assemble export data pack." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Upgraded HTTP Server running on http://localhost:${PORT}`);
});