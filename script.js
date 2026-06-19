let currentTopic = 'coding'; 

const chatTitle = document.getElementById('chat-title');
const chatSubtitle = document.getElementById('chat-subtitle');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const btnCoding = document.getElementById('btn-coding');
const btnFinance = document.getElementById('btn-finance');

const selectDifficulty = document.getElementById('difficulty-select');
const btnExport = document.getElementById('btn-export');

const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authUsername = document.getElementById('auth-username');
const authPassword = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');
const mainAppContainer = document.querySelector('.app-container');
const btnLogout = document.getElementById('btn-logout');
const displayUsername = document.getElementById('display-username');

async function checkUserSession() {
    try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.user) {
            authModal.classList.add('hidden');
            mainAppContainer.classList.remove('auth-blurred');
            displayUsername.innerText = data.user.username;
            switchTopic(currentTopic);
        } else {
            authModal.classList.remove('hidden');
            mainAppContainer.classList.add('auth-blurred');
        }
    } catch (err) {
        console.error("Session verification error:", err);
    }
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.innerText = '';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: authUsername.value.trim(),
                password: authPassword.value
            })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
            authForm.reset();
            checkUserSession();
        } else {
            authError.innerText = data.message || "Invalid authentication details.";
        }
    } catch (err) {
        authError.innerText = "Error completing authentication validation requests.";
    }
});

btnLogout.addEventListener('click', async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        checkUserSession();
    } catch (err) {
        console.error("Logout request failed:", err);
    }
});

async function updateDashboardMetrics() {
    try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) return;
        
        const data = await response.json();
        
        document.getElementById('dash-total-msgs').innerText = data.totalMessages;
        document.getElementById('dash-coding-msgs').innerText = data.codingCount;
        document.getElementById('dash-finance-msgs').innerText = data.financeCount;
        document.getElementById('dash-active-sessions').innerText = `${data.activeTopics}/2`;
    } catch (err) {
        console.error("Dashboard analytics processing mismatch:", err);
    }
}

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
                addMessage("Hello! I am your coding tutor. You share your code here and I will help you fix it by explaining it to you instead of giving code.", 'model');
            } else {
                addMessage("Hello! I am your personal finance advisor. You can ask questions regarding your savings, budgeting, and your expenses.", 'model');
            }
        }
    } catch (error) {
        console.error("Error loading history:", error);
        addMessage("Getting difficult to load previous history.", 'model');
    }
    
    updateDashboardMetrics();
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
        
        const currentDifficulty = selectDifficulty ? selectDifficulty.value : 'beginner';

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: currentTopic,
                message: message,
                difficulty: currentDifficulty 
            })
        });

        const data = await response.json();
        if (response.ok) {
            loadingBubble.innerText = data.reply;
            updateDashboardMetrics();
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

async function exportChatToPDF() {
    try {
        const response = await fetch(`/api/export-data/${currentTopic}`);
        if (!response.ok) {
            const data = await response.json();
            alert(data.error || "No dialogue available to export!");
            return;
        }
        
        const pack = await response.json();
        
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        
        let htmlContent = `
            <html>
            <head>
                <title>Exported Chat Log - ${pack.topic.toUpperCase()}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
                    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #4f46e5; font-size: 24px; text-transform: uppercase; }
                    .header p { margin: 5px 0 0 0; font-size: 13px; color: #666; }
                    .msg-block { margin-bottom: 20px; padding: 15px; border-radius: 8px; background: #f9fafb; border-left: 4px solid #d1d5db; }
                    .msg-block.user { border-left-color: #4f46e5; background: #f5f3ff; }
                    .msg-block.model { border-left-color: #10b981; background: #ecfdf5; }
                    .role-title { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 6px; color: #4b5563; }
                    .msg-block.user .role-title { color: #4f46e5; }
                    .msg-block.model .role-title { color: #059669; }
                    .text-content { font-size: 14px; white-space: pre-wrap; }
                    .meta { font-size: 11px; color: #9ca3af; margin-top: 5px; text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>ContextAI Archive Report</h1>
                    <p><strong>Topic Mode:</strong> ${pack.topic.toUpperCase()} | <strong>Generated:</strong> ${new Date(pack.exportedAt).toLocaleString()}</p>
                </div>
        `;
        
        pack.data.forEach(msg => {
            const levelMeta = msg.difficulty ? ` (${msg.difficulty.toUpperCase()})` : '';
            htmlContent += `
                <div class="msg-block ${msg.role}">
                    <div class="role-title">${msg.role === 'user' ? 'User' + levelMeta : 'AI Assistant'}</div>
                    <div class="text-content">${msg.text}</div>
                    <div class="meta">${msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}</div>
                </div>
            `;
        });
        
        htmlContent += `
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        
    } catch (err) {
        console.error("PDF engine processing runtime exception:", err);
        alert("Failed to build PDF payload stream.");
    }
}

btnExport.addEventListener('click', exportChatToPDF);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.requestSubmit();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
});