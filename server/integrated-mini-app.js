// Integrated Mini App - Opens Your Actual Yene Dating App
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Serve your actual React app as mini app
app.get('/mini-app', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
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
        
        .telegram-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(102, 126, 234, 0.9);
            backdrop-filter: blur(10px);
            padding: 10px 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .app-title {
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .back-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            cursor: pointer;
        }
        
        .app-container {
            margin-top: 60px;
            height: calc(100vh - 60px);
            overflow-y: auto;
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            flex-direction: column;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .app-frame {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        }
        
        .error {
            text-align: center;
            padding: 20px;
            color: #ff6b6b;
        }
    </style>
</head>
<body>
    <div class="telegram-header">
        <button class="back-btn" onclick="closeMiniApp()">← Back</button>
        <div class="app-title">💝 Yene Dating</div>
        <div></div>
    </div>
    
    <div class="app-container">
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <div>Loading Yene Dating...</div>
        </div>
        
        <iframe id="appFrame" class="app-frame" style="display: none;"></iframe>
        
        <div id="error" class="error" style="display: none;">
            <h3>❌ Failed to load app</h3>
            <p>Please try again or contact support</p>
            <button onclick="retryLoad()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Retry</button>
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
        
        // Get user info from Telegram
        const user = tg.initDataUnsafe?.user;
        let telegramUserData = {};
        
        if (user) {
            telegramUserData = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name || '',
                username: user.username || '',
                language_code: user.language_code || 'en'
            };
            
            // Store user data for the app
            localStorage.setItem('telegramUser', JSON.stringify(telegramUserData));
        }
        
        // Load your actual app
        function loadApp() {
            const appFrame = document.getElementById('appFrame');
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            
            // Your app URL - adjust this to your actual app
            const appUrl = 'http://127.0.0.1:3000'; // Your React app URL
            
            appFrame.src = appUrl;
            
            appFrame.onload = function() {
                loading.style.display = 'none';
                appFrame.style.display = 'block';
                
                // Send user data to the app
                try {
                    appFrame.contentWindow.postMessage({
                        type: 'TELEGRAM_USER_DATA',
                        userData: telegramUserData
                    }, '*');
                } catch (e) {
                    console.log('Could not send user data to app');
                }
            };
            
            appFrame.onerror = function() {
                loading.style.display = 'none';
                error.style.display = 'block';
            };
            
            // Timeout handling
            setTimeout(() => {
                if (loading.style.display !== 'none') {
                    loading.style.display = 'none';
                    error.style.display = 'block';
                }
            }, 10000);
        }
        
        function closeMiniApp() {
            tg.close();
        }
        
        function retryLoad() {
            document.getElementById('loading').style.display = 'flex';
            document.getElementById('error').style.display = 'none';
            document.getElementById('appFrame').style.display = 'none';
            loadApp();
        }
        
        // Load app when ready
        setTimeout(loadApp, 1000);
        
        // Listen for messages from the app
        window.addEventListener('message', function(event) {
            if (event.data.type === 'APP_READY') {
                // App is ready, send user data
                event.source.postMessage({
                    type: 'TELEGRAM_USER_DATA',
                    userData: telegramUserData
                }, '*');
            }
        });
    </script>
</body>
</html>
  `);
});

// Enhanced webhook with mini app integration
app.post('/telegram-webhook', async (req, res) => {
  console.log('🎉 WEBHOOK RECEIVED (POST)!');
  console.log('From:', req.body.message?.from?.first_name);
  console.log('Text:', req.body.message?.text);
  console.log('Chat ID:', req.body.message?.chat?.id);
  
  const message = req.body.message;
  const text = message?.text?.toLowerCase();
  const chatId = message?.chat?.id;
  
  // Always respond immediately
  res.json({ ok: true });
  
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
/verify - Complete verification
/profile - Your dating profile
/stats - Your statistics
/help - All commands

*Your journey to love starts here!* ❤️`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '📱 Open Yene Dating App', web_app: { url: 'https://unfretted-sariah-zippy.ngrok-free.dev/mini-app' } }
          ]]
        }
      };
      console.log('🚀 START COMMAND - Welcome with actual app sent');
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
      console.log('📱 APP COMMAND - Actual app link sent');
      break;
      
    default:
      response = {
        text: `🤔 *Unknown Command*

Hi ${message.from.first_name || 'there'}! 

🎯 *Available Commands:*
/start - Welcome + dating app
/app - Open your dating app
/help - All commands
/verify - Profile verification
/profile - Your profile
/stats - Your statistics
/support - Get help

📱 *Try our mini app for the full experience!*

*Happy dating on Yene!* ❤️`,
        parse_mode: 'Markdown'
      };
  }
  
  // Send response to Telegram
  const botToken = '8248243239:AAHFs6GDOWbJgKASXbgKl2y_XkN_XN33CYE';
  
  try {
    const response_result = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, ...response })
    });
    
    if (response_result.ok) {
      console.log('✅ Response sent successfully');
    } else {
      console.error('❌ Failed to send response');
    }
  } catch (error) {
    console.error('❌ Error sending response:', error);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Yene Dating App with Mini App Integration',
    features: [
      'Loads actual React app',
      'Telegram user integration',
      'Professional bot messages',
      'Mini app with real app'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Yene Dating App + Mini App running on port ${PORT}`);
  console.log(`📡 Webhook: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`📱 Mini App: http://127.0.0.1:${PORT}/mini-app`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🌐 Public: https://unfretted-sariah-zippy.ngrok-free.dev`);
  console.log('');
  console.log('✨ Features:');
  console.log('• Loads your actual React app');
  console.log('• Telegram user integration');
  console.log('• Professional bot messages');
  console.log('• Mini app with real app content');
  console.log('');
  console.log('🎯 Test:');
  console.log('• /start - Welcome with app');
  console.log('• /app - Open your dating app');
  console.log(`📱 Mini App: https://unfretted-sariah-zippy.ngrok-free.dev/mini-app`);
  console.log('');
  console.log('⚠️  Make sure your React app is running on http://127.0.0.1:3000');
});
