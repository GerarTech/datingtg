// Simple Mini App Server - Guaranteed to Work
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Mini App HTML - Loads Your React App
app.get('/mini-app', (req, res) => {
  res.send(`
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
            overflow-x: hidden;
        }
        
        .header {
            background: rgba(102, 126, 234, 0.9);
            backdrop-filter: blur(10px);
            padding: 15px 20px;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .container {
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .loading {
            text-align: center;
            padding: 40px 20px;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .app-frame {
            width: 100%;
            height: calc(100vh - 80px);
            border: none;
            border-radius: 10px;
            background: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .error {
            text-align: center;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .btn {
            background: linear-gradient(45deg, #ff6b6b, #ff8e53);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1em;
            cursor: pointer;
            margin: 10px;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="header">
        💝 Yene Dating Mini App
    </div>
    
    <div class="container">
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <div>Loading your dating app...</div>
        </div>
        
        <div id="app-content" style="display: none;">
            <iframe id="appFrame" class="app-frame" src="http://127.0.0.1:3000"></iframe>
        </div>
        
        <div id="error" class="error" style="display: none;">
            <h3>📱 Yene Dating App</h3>
            <p>Your Vite app is not running locally.</p>
            <p>Please start your Vite app first:</p>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <code>npm run dev</code>
            </div>
            <p>Or double-click: <code>start-vite-app.bat</code></p>
            <button class="btn" onclick="retryLoad()">🔄 Retry</button>
            <button class="btn" onclick="openDirect()">🌐 Open Directly</button>
        </div>
    </div>

    <script>
        // Initialize Telegram WebApp
        const tg = window.Telegram?.WebApp;
        
        if (tg) {
            tg.ready();
            tg.expand();
            tg.setHeaderColor('#667eea');
            tg.setBackgroundColor('#667eea');
        }
        
        function loadApp() {
            const loading = document.getElementById('loading');
            const appContent = document.getElementById('app-content');
            const error = document.getElementById('error');
            const appFrame = document.getElementById('appFrame');
            
            // Try to load the app
            appFrame.onload = function() {
                loading.style.display = 'none';
                appContent.style.display = 'block';
                console.log('✅ App loaded successfully');
            };
            
            appFrame.onerror = function() {
                loading.style.display = 'none';
                error.style.display = 'block';
                console.log('❌ Failed to load app');
            };
            
            // Timeout handling
            setTimeout(() => {
                if (loading.style.display !== 'none') {
                    loading.style.display = 'none';
                    error.style.display = 'block';
                }
            }, 5000);
        }
        
        function retryLoad() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('app-content').style.display = 'none';
            document.getElementById('error').style.display = 'none';
            
            // Reload iframe
            const appFrame = document.getElementById('appFrame');
            appFrame.src = appFrame.src;
            
            loadApp();
        }
        
        function openDirect() {
            window.open('http://127.0.0.1:3000', '_blank');
        }
        
        // Start loading
        setTimeout(loadApp, 1000);
    </script>
</body>
</html>
  `);
});

// Professional webhook
app.post('/telegram-webhook', async (req, res) => {
  console.log('🎉 WEBHOOK RECEIVED!');
  console.log('From:', req.body.message?.from?.first_name);
  console.log('Text:', req.body.message?.text);
  
  res.json({ ok: true });
  
  const message = req.body.message;
  const text = message?.text?.toLowerCase();
  const chatId = message?.chat?.id;
  
  if (!text || !chatId) return;
  
  let response;
  
  switch (text) {
    case '/start':
      response = {
        text: `🌟 *Welcome to Yene Dating!*

🎯 *Ethiopia's Premier Dating Platform*

💝 *Try our Mini App:*
📱 [Open Your Dating App](https://unfretted-sariah-zippy.ngrok-free.dev/mini-app)

🚀 *Quick Commands:*
/app - Open your dating app
/help - All commands
/verify - Profile verification
/stats - Your statistics

*Your journey to love starts here!* ❤️`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '📱 Open Yene Dating App', web_app: { url: 'https://unfretted-sariah-zippy.ngrok-free.dev/mini-app' } }
          ]]
        }
      };
      break;
      
    case '/app':
      response = {
        text: '📱 *Opening Yene Dating App...*',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🎯 Open Your Dating App', web_app: { url: 'https://unfretted-sariah-zippy.ngrok-free.dev/mini-app' } }
          ]]
        }
      };
      break;
      
    default:
      response = {
        text: `🤔 *Unknown Command*

Hi ${message.from.first_name || 'there'}! 

🎯 *Available Commands:*
/start - Welcome + dating app
/app - Open your dating app
/help - All commands

📱 *Try our mini app for the full experience!*

*Happy dating on Yene!* ❤️`,
        parse_mode: 'Markdown'
      };
  }
  
  // Send response
  const botToken = '8248243239:AAHFs6GDOWbJgKASXbgKl2y_XkN_XN33CYE';
  
  try {
    const result = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, ...response })
    });
    
    console.log('✅ Response sent:', result.ok);
  } catch (error) {
    console.error('❌ Error:', error);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Simple Yene Dating Mini App Server',
    routes: [
      '/mini-app - Mini app interface',
      '/telegram-webhook - Telegram bot webhook',
      '/health - Health check'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Yene Dating Server running on port ${PORT}`);
  console.log(`📱 Mini App: http://127.0.0.1:${PORT}/mini-app`);
  console.log(`📡 Webhook: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🌐 Public: https://unfretted-sariah-zippy.ngrok-free.dev`);
  console.log('');
  console.log('✨ Features:');
  console.log('• Simple mini app interface');
  console.log('• Loads your React app');
  console.log('• Professional bot messages');
  console.log('• Error handling');
  console.log('');
  console.log('🎯 Test URLs:');
  console.log(`• Mini App: https://unfretted-sariah-zippy.ngrok-free.dev/mini-app`);
  console.log(`• Health: https://unfretted-sariah-zippy.ngrok-free.dev/health`);
  console.log('');
  console.log('⚠️  Make sure your React app is running on http://127.0.0.1:3000');
});
