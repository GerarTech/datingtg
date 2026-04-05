// Telegram Mini App Integration
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Mini App HTML
const miniAppHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yene Dating - Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        
        .container {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .tagline {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .card h3 {
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .stat {
            text-align: center;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        
        .stat-number {
            font-size: 1.8em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .btn {
            background: linear-gradient(45deg, #ff6b6b, #ff8e53);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1em;
            cursor: pointer;
            width: 100%;
            margin-bottom: 10px;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .profile-section {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .profile-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(45deg, #ff6b6b, #ff8e53);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            margin-right: 15px;
        }
        
        .profile-info h4 {
            margin-bottom: 5px;
        }
        
        .profile-info p {
            opacity: 0.8;
            font-size: 0.9em;
        }
        
        .matches {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 10px;
        }
        
        .match-card {
            min-width: 80px;
            height: 80px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">💝 Yene Dating</div>
            <div class="tagline">Find Your Perfect Match</div>
        </div>
        
        <div class="card">
            <div class="profile-section">
                <div class="profile-avatar">👤</div>
                <div class="profile-info">
                    <h4 id="userName">Loading...</h4>
                    <p id="userStatus">Checking profile...</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3>📊 Your Stats</h3>
            <div class="stats">
                <div class="stat">
                    <div class="stat-number" id="profileViews">0</div>
                    <div class="stat-label">Profile Views</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="matches">0</div>
                    <div class="stat-label">Matches</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="messages">0</div>
                    <div class="stat-label">Messages</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="responseRate">0%</div>
                    <div class="stat-label">Response Rate</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3>❤️ Recent Matches</h3>
            <div class="matches" id="matchesContainer">
                <div class="loading">Loading matches...</div>
            </div>
        </div>
        
        <div class="card">
            <h3>🚀 Quick Actions</h3>
            <button class="btn" onclick="openMainApp()">📱 Open Full App</button>
            <button class="btn btn-secondary" onclick="editProfile()">✏️ Edit Profile</button>
            <button class="btn btn-secondary" onclick="viewMatches()">💝 View Matches</button>
            <button class="btn btn-secondary" onclick="getSupport()">💬 Get Support</button>
        </div>
    </div>

    <script>
        // Initialize Telegram WebApp
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Set theme colors
        tg.setHeaderColor('#667eea');
        tg.setBackgroundColor('#667eea');
        
        // Get user info
        const user = tg.initDataUnsafe?.user;
        
        if (user) {
            document.getElementById('userName').textContent = user.first_name + ' ' + (user.last_name || '');
            document.getElementById('userStatus').textContent = 'Premium Member ✨';
        }
        
        // Simulate loading data
        setTimeout(() => {
            document.getElementById('profileViews').textContent = '127';
            document.getElementById('matches').textContent = '23';
            document.getElementById('messages').textContent = '89';
            document.getElementById('responseRate').textContent = '94%';
            
            // Add sample matches
            const matchesContainer = document.getElementById('matchesContainer');
            matchesContainer.innerHTML = \`
                <div class="match-card">👩</div>
                <div class="match-card">👨</div>
                <div class="match-card">👩</div>
                <div class="match-card">👨</div>
                <div class="match-card">👩</div>
            \`;
        }, 1500);
        
        // Action functions
        function openMainApp() {
            tg.openLink('https://yene-dating.com');
        }
        
        function editProfile() {
            tg.openLink('https://yene-dating.com/profile/edit');
        }
        
        function viewMatches() {
            tg.openLink('https://yene-dating.com/matches');
        }
        
        function getSupport() {
            tg.openLink('https://yene-dating.com/support');
        }
        
        // Show main button
        tg.MainButton.setText('💝 Open Full App');
        tg.MainButton.onClick(openMainApp);
        tg.MainButton.show();
    </script>
</body>
</html>
`;

// Mini app endpoint
app.get('/mini-app', (req, res) => {
  res.send(miniAppHTML);
});

// Enhanced webhook with mini app integration
app.post('/telegram-webhook', (req, res) => {
  console.log('🎉 WEBHOOK RECEIVED (POST)!');
  console.log('From:', req.body.message?.from?.first_name);
  console.log('Text:', req.body.message?.text);
  console.log('Chat ID:', req.body.message?.chat?.id);
  
  const message = req.body.message;
  const text = message?.text?.toLowerCase();
  const chatId = message?.chat?.id;
  
  if (!text || !chatId) {
    res.json({ ok: true });
    return;
  }
  
  let response;
  
  // Command handling with mini app integration
  switch (text) {
    case '/start':
      response = {
        text: `🌟 *Welcome to Yene Dating!*

🎯 *Ethiopia's Premier Dating Platform*

💝 *Try our Mini App:*
📱 [Open Mini App](https://unfretted-sariah-zippy.ngrok-free.dev/mini-app)

🚀 *Quick Commands:*
/verify - Complete verification
/profile - Link your profile
/stats - View statistics
/help - All commands
/app - Open mini app

*Your journey to love starts here!* ❤️`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '📱 Open Mini App', web_app: { url: 'https://unfretted-sariah-zippy.ngrok-free.dev/mini-app' } }
          ]]
        }
      };
      console.log('🚀 START COMMAND - Welcome with mini app sent');
      break;
      
    case '/app':
      response = {
        text: '📱 *Opening Yene Dating Mini App...*',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🎯 Open Mini App', web_app: { url: 'https://unfretted-sariah-zippy.ngrok-free.dev/mini-app' } }
          ]]
        }
      };
      console.log('📱 APP COMMAND - Mini app link sent');
      break;
      
    case '/help':
      response = {
        text: `📋 *Yene Dating Bot Commands*

🎯 *Profile & Verification*
/verify - Complete verification
/profile - Link your profile
/status - Check account status

📱 *Mini App*
/app - Open mini app
/start - Welcome with app

📊 *Statistics*
/stats - View your statistics
/matches - See recent matches

💬 *Support*
/support - Contact support
/help - Show this help menu

*Try our mini app for the best experience!* 🌟`,
        parse_mode: 'Markdown'
      };
      break;
      
    default:
      response = {
        text: `🤔 *Unknown Command*

Hi ${message.from.first_name || 'there'}! 

🎯 *Available Commands:*
/start - Welcome + mini app
/app - Open mini app
/help - All commands
/verify - Profile verification
/profile - Your profile
/stats - Your statistics
/support - Get help

📱 *Try our mini app for the best experience!*

*Happy dating on Yene!* ❤️`,
        parse_mode: 'Markdown'
      };
  }
  
  // Send response to Telegram
  const botToken = '8248243239:AAHFs6GDOWbJgKASXbgKl2y_XkN_XN33CYE';
  
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      ...response
    })
  }).then(response => {
    console.log('📤 Response sent:', response.status);
  }).catch(error => {
    console.error('❌ Error sending response:', error);
  });
  
  res.json({ ok: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Yene Dating Bot with Mini App is running',
    features: [
      'Professional bot messages',
      'Telegram Mini App integration',
      'Beautiful UI/UX',
      'WebApp functionality',
      'Inline keyboards'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Yene Dating Bot + Mini App running on port ${PORT}`);
  console.log(`📡 Webhook: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`📱 Mini App: http://127.0.0.1:${PORT}/mini-app`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🌐 Public: https://unfretted-sariah-zippy.ngrok-free.dev`);
  console.log('');
  console.log('✨ Features:');
  console.log('• Professional bot with beautiful messages');
  console.log('• Telegram Mini App integration');
  console.log('• WebApp functionality');
  console.log('• Inline keyboards');
  console.log('• Modern UI/UX design');
  console.log('');
  console.log('🎯 Test:');
  console.log('• /start - Welcome with mini app');
  console.log('• /app - Open mini app');
  console.log('• /help - All commands');
  console.log(`📱 Mini App: https://unfretted-sariah-zippy.ngrok-free.dev/mini-app`);
});
