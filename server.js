import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = 8000; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));


const DB_FILE = path.join(__dirname, 'database.json');


function readLocalDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            return { coding: { messages: [] }, finance: { messages: [] } };
        }
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return data ? JSON.parse(data) : { coding: { messages: [] }, finance: { messages: [] } };
    } catch (err) {
        return { coding: { messages: [] }, finance: { messages: [] } };
    }
}


function writeLocalDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

app.post('/api/chat', async (req, res) => {
    const { topic, message } = req.body;
    console.log(`[LOG] Message received for [${topic}]: "${message}"`);
    
    try {
        const db = readLocalDB();
        if (!db[topic]) {
            db[topic] = { messages: [] };
        }

        let systemInstruction = "";
        if (topic === 'coding') {
            systemInstruction = 
                "You are an expert programming tutor. Your sole purpose is to help users debug their code. " +
                "When a user pastes code with an error, your task is to analyze it and explain WHAT the error is, " +
                "WHY it happened, and HOW they can conceptually fix it. " +
                "CRITICAL RULE: Do not provide any corrected code blocks or code snippets under any circumstances. " +
                "Force the user to write the code themselves based on your explanation. Keep the tone encouraging and educational.";
        } else if (topic === 'finance') {
            systemInstruction = 
                "You are a smart personal finance advisor. Your job is to analyze user spending, budgeting, " +
                "and investment questions and provide tailored financial suggestions. Do not give official legal or professional " +
                "investment advice, but guide them on budgeting frameworks (like 50/30/20), savings strategies, and financial literacy. " +
                "Keep your answers structured and easy to read using bullet points if necessary.";
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
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        console.log(`[LOG] Dispatching standard HTTP fetch to Gemini API...`);
        
        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                }
            })
        });

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("❌ Gemini API Direct Error Response:", responseData);
            throw new Error(responseData.error?.message || "Gemini HTTP Request failed");
        }

        const aiResponseText = responseData.candidates[0].content.parts[0].text;
        console.log(`[LOG] Gemini responded successfully via HTTP Rest!`);

        
        db[topic].messages.push({ role: 'user', text: message, timestamp: new Date() });
        db[topic].messages.push({ role: 'model', text: aiResponseText, timestamp: new Date() });
        
        writeLocalDB(db);
        res.json({ reply: aiResponseText });
        
    } catch (error) {
        console.error("ERROR LOG:", error.message);
        res.status(500).json({ 
            reply: `Error: ${error.message}. Kindly check your API Key in .env file.`
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 HTTP Server running on http://localhost:${PORT}`);
    console.log("📁 Local JSON database integration active.");
});