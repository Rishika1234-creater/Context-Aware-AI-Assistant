
let currentTopic = 'coding'; 

const chatTitle = document.getElementById('chat-title');
const chatSubtitle = document.getElementById('chat-subtitle');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const btnCoding = document.getElementById('btn-coding');
const btnFinance = document.getElementById('btn-finance');
async function switchTopic(topic) {
    
    if (currentTopic === topic && chatBox.innerHTML !== '') return;

    currentTopic = topic;
    chatBox.innerHTML = '';

    
    if (topic === 'coding') {
        btnCoding.classList.add('active');
        btnFinance.classList.remove('active');
        chatTitle.innerText = "Coding & Debugging Assistant";
        chatSubtitle.innerText = "Paste your error or code snippet here. I will explain";
        document.documentElement.style.setProperty('--current-glow', '#818cf8');
    } else if (topic === 'finance') {
        btnFinance.classList.add('active');
        btnCoding.classList.remove('active');
        chatTitle.innerText = "Personal Finance Guide";
        chatSubtitle.innerText = "Ask me about budgeting, savings, investments, or the 50/30/20 rule!";
        document.documentElement.style.setProperty('--current-glow', '#34d399');
    }

    try {
        const response = await fetch(`/api/history/${topic}`);
        const data = await response.json();
        if (data.history && data.history.length > 0) {
            data.history.forEach(msg => {
                addMessage(msg.text, msg.role);
            });
        } else {
            if (topic === 'coding') {
                addMessage("Hello! I am your coding tutor.You share your code here and i will help you fix it by explaining it to you instead of giving code.", 'model');
            } else {
                addMessage("Hello! I am your personal finance advisor. You can ask quetions regarding your savings,budgeting and your expenses.", 'model');
            }
        }
    } catch (error) {
        console.error("Error loading history:", error);
        addMessage("Getting difficult to load previous history.", 'model');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    if (sender === 'user') {
        messageDiv.classList.add('user-message');
    } else {
        messageDiv.classList.add('model-message');
    }
    
    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const message = userInput.value.trim();
    if (!message) return;


    addMessage(message, 'user');
    
    userInput.value = '';

    try {
        addMessage("Thinking...", 'model');
        
        const bubbles = chatBox.getElementsByClassName('model-message');
        const loadingBubble = bubbles[bubbles.length - 1];
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: currentTopic,
                message: message
            })
        });

        const data = await response.json();
        if (response.ok) {
            loadingBubble.innerText = data.reply;
        } else {
            loadingBubble.innerText = data.reply || "Oops! There is getting error connecting server.";
        }

    } catch (error) {
        console.error("Backend communication error:", error);
        const bubbles = chatBox.getElementsByClassName('model-message');
        if (bubbles.length > 0) {
            bubbles[bubbles.length - 1].innerText = "Error: Server is either closed or not responding.";
        }
    }
});
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.requestSubmit();
    }
});


window.addEventListener('DOMContentLoaded', () => {
    switchTopic('coding');
});