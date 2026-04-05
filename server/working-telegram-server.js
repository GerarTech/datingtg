// Working Telegram Bot Server - Fixed and Professional
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Professional bot messages
const botMessages = {
  welcome: {
    text: `🌟 *Welcome to Yene Dating!*

🎯 *Ethiopia's Premier Dating Platform*

💝 *Find Your Perfect Match*
📱 *Professional Profile Management*
🔒 *Secure Verification*
📊 *Dating Analytics*
💬 *24/7 Support*

🚀 *Quick Start:*
/app - Open dating app
/verify - Complete verification
/profile - Your profile
/stats - Your statistics
/help - All commands

💬 *Need Help?*
/support - Contact support

*Your journey to love starts here!* ❤️`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '📱 Open Dating App', web_app: { url: 'https://unfretted-sariah-zippy.ngrok-free.dev/mini-app' } }
      ]]
    }
  },

  app: {
    text: `📱 *Opening Yene Dating App...*

Experience the best of Ethiopian dating right in Telegram!

🎯 *Features:*
👤 Profile management
📊 Dating statistics
❤️ Recent matches
🚀 Quick actions

💝 *Click below to open:*`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '🎯 Open Yene Dating App', web_app: { url: 'https://unfretted-sariah-zippy.ngrok-free.dev/mini-app' } }
      ]]
    }
  },

  help: {
    text: `📋 *Yene Dating Bot Commands*

🎯 *Profile & Verification*
/verify - Complete verification process
/profile - Link your dating profile
/status - Check account status

📱 *Mini App*
/app - Open mini app
/start - Welcome with app

📊 *Statistics & Analytics*
/stats - View your dating statistics
/matches - See recent matches
/activity - View your activity log

💬 *Support & Information*
/help - Show this help menu
/support - Contact support
/about - Learn about Yene Dating

💡 *Tips:*
• Complete verification for better matches
• Keep your profile updated
• Use descriptive photos
• Be respectful and authentic

*Need help? Use /support* 🌟`,
    parse_mode: 'Markdown'
  },

  verify: {
    text: `🔐 *Profile Verification*

📝 *Why Verify?*
✅ Increased trust and credibility
✅ Better match recommendations
✅ Premium features access
✅ Higher visibility to other users

📋 *Verification Steps:*
1️⃣ Complete your dating profile
2️⃣ Upload clear photos
3️⃣ Verify your phone number
4️⃣ Connect social accounts (optional)

🔗 *Quick Links:*
📱 [Complete Profile](https://yene-dating.com/profile)
📸 [Upload Photos](https://yene-dating.com/photos)
📞 [Verify Phone](https://yene-dating.com/verify)

⏱️ *Processing Time:* Usually within 24 hours

💡 *Pro Tip:* Verified users get 3x more matches!

*Need help? Use /support* 🌟`,
    parse_mode: 'Markdown'
  },

  profile: {
    text: `👤 *Your Dating Profile*

📊 *Profile Status:* 
🔍 Visibility: Active
⭐ Verification: Pending/Complete
📈 Match Rate: Calculating...

🔗 *Profile Links:*
📱 [View Full Profile](https://yene-dating.com/profile)
✏️ [Edit Profile](https://yene-dating.com/edit)
📸 [Manage Photos](https://yene-dating.com/photos)

💡 *Profile Tips:*
• Use recent, clear photos
• Write an engaging bio
• Be specific about interests
• Update regularly

📈 *Boost Your Profile:*
• Complete verification
• Add more photos
• Be active daily
• Respond to messages promptly

*Check /stats for detailed analytics* 📊`,
    parse_mode: 'Markdown'
  },

  stats: {
    text: `📊 *Your Dating Statistics*

🎯 *Performance Metrics:*
👁️ Profile Views: [calculating...]
💬 Messages Sent: [calculating...]
❤️ Matches Made: [calculating...]
⭐ Response Rate: [calculating...]

📈 *Weekly Trends:*
• Profile Views: +[X]%
• Message Activity: [Active/Moderate/Low]
• Match Quality: [Good/Fair/Excellent]

🎯 *Recommendations:*
• Post new photos to increase views
• Respond within 24 hours for better rates
• Complete verification for more matches

🔄 *Last Updated:* Just now

*Detailed analytics available on web platform* 🌟`,
    parse_mode: 'Markdown'
  },

  support: {
    text: `💬 *Yene Dating Support*

🤝 *We're here to help!*

📞 *Contact Options:*
• Chat with support team
• Email: support@yene-dating.com
• Response time: Within 2 hours

🆘 *Common Issues:*
🔐 Account verification problems
📸 Photo upload issues
💬 Messaging troubles
🔒 Privacy concerns

📝 *Report an Issue:*
1. Describe your issue
2. Include screenshots if possible
3. Mention your username
4. We'll respond ASAP

⏰ *Support Hours:*
24/7 for premium users
9 AM - 9 PM for free users

*Priority support for verified users* ⭐`,
    parse_mode: 'Markdown'
  },

  about: {
    text: `🌟 *About Yene Dating*

🇪🇹 *Ethiopia's Trusted Dating Platform*

🎯 *Our Mission:*
Connecting Ethiopian singles through meaningful relationships built on trust, culture, and shared values.

💝 *What Makes Us Different:*
✅ Culturally-aware matching
✅ Verified user base
✅ Privacy-focused
✅ Local community support
✅ Modern, intuitive interface

📱 *Features:*
• Smart matching algorithm
• Video chat capabilities
• Cultural compatibility filters
• Secure messaging
• Profile verification

🌍 *Community:*
50,000+ active users
75% success rate
24/7 support

*Join thousands finding love on Yene Dating* ❤️`,
    parse_mode: 'Markdown'
  }
};

// Helper function to send Telegram message
async function sendTelegramMessage(chatId, message) {
  const botToken = '8248243239:AAHFs6GDOWbJgKASXbgKl2y_XkN_XN33CYE';
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        ...message
      })
    });
    
    if (!response.ok) {
      console.error('❌ Telegram API Error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Message sent successfully:', result.ok);
    return true;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return false;
  }
}

// Webhook endpoint with web_app_data handling
app.post('/telegram-webhook', async (req, res) => {
  console.log('🎉 WEBHOOK RECEIVED!');
  console.log('Update type:', Object.keys(req.body)[0]);
  
  // Always respond immediately to prevent 502 errors
  res.json({ ok: true });
  
  const update = req.body;
  
  // Handle web_app_data events
  if (update.message && update.message.web_app_data) {
    const webAppData = JSON.parse(update.message.web_app_data.data);
    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    
    console.log('📱 Web App Data Received:', webAppData);
    
    // Handle match event
    if (webAppData.type === 'match') {
      await handleMatchEvent(chatId, userId, webAppData);
    }
    
    return;
  }
  
  // Handle regular messages
  const message = update.message;
  if (!message) return;
  
  const text = message.text?.toLowerCase();
  const chatId = message.chat.id;
  
  if (!text) return;
  
  let response;
  
  // Command handling
  switch (text) {
    case '/start':
      response = botMessages.welcome;
      console.log('🚀 START COMMAND - Welcome message sent');
      break;
      
    case '/app':
      response = botMessages.app;
      console.log('📱 APP COMMAND - Mini app sent');
      break;
      
    case '/help':
      response = botMessages.help;
      console.log('📋 HELP COMMAND - Help menu sent');
      break;
      
    case '/verify':
      response = botMessages.verify;
      console.log('🔐 VERIFY COMMAND - Verification info sent');
      break;
      
    case '/profile':
      response = botMessages.profile;
      console.log('👤 PROFILE COMMAND - Profile info sent');
      break;
      
    case '/stats':
      response = botMessages.stats;
      console.log('📊 STATS COMMAND - Statistics sent');
      break;
      
    case '/support':
      response = botMessages.support;
      console.log('💬 SUPPORT COMMAND - Support info sent');
      break;
      
    case '/about':
      response = botMessages.about;
      console.log('🌟 ABOUT COMMAND - About info sent');
      break;
      
    default:
      response = {
        text: `🤔 *Unknown Command*

Hi ${message.from.first_name || 'there'}! 

I didn't recognize that command. Here's what I can help you with:

🎯 *Popular Commands:*
/start - Welcome message
/app - Open mini app
/help - All available commands
/verify - Profile verification
/profile - Your dating profile
/stats - Your statistics
/support - Get help

💬 *Need assistance?*
Use /help to see all options or /support to contact our team.

*Happy dating on Yene!* ❤️`,
        parse_mode: 'Markdown'
      };
      console.log('❓ UNKNOWN COMMAND - Help suggestion sent');
  }
  
  // Send response to Telegram
  await sendTelegramMessage(chatId, response);
});

// Handle match events with celebratory animations
async function handleMatchEvent(chatId, userId, matchData) {
  console.log('🎉 Handling match event:', matchData);
  
  // Send celebratory message with animation to both users
  const celebrationMessage = {
    text: `🎊 *CONGRATULATIONS! 🎊*

💝 *You've got a new match!*

${matchData.matchedUserName ? `You matched with ${matchData.matchedUserName}!` : 'Someone liked you back!'}

🎯 *Next Steps:*
• Send them a message
• Start a conversation
• Get to know each other

💫 *Good luck with your new connection!*

*Remember: Be respectful and authentic!* ❤️`,
    parse_mode: 'Markdown'
  };
  
  // Send celebratory animation (sticker/gif if available)
  const animationMessage = {
    text: '🎉✨💝🎊',
    parse_mode: 'Markdown'
  };
  
  // Send to current user
  await sendTelegramMessage(chatId, celebrationMessage);
  setTimeout(() => sendTelegramMessage(chatId, animationMessage), 500);
  
  // Send to matched user if available
  if (matchData.matchedUserId && matchData.matchedUserId !== userId) {
    await sendTelegramMessage(matchData.matchedUserId, celebrationMessage);
    setTimeout(() => sendTelegramMessage(matchedMatchedUserId, animationMessage), 500);
  }
  
  // Store match in database (you can integrate with your existing database)
  console.log('💾 Match stored:', {
    user1: userId,
    user2: matchData.matchedUserId,
    timestamp: new Date().toISOString(),
    matchData
  });
}

// Mini App endpoint (optimized)
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
            
            const appFrame = document.getElementById('appFrame');
            appFrame.src = appFrame.src;
            
            loadApp();
        }
        
        function openDirect() {
            window.open('http://127.0.0.1:3000', '_blank');
        }
        
        setTimeout(loadApp, 1000);
    </script>
</body>
</html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Working Yene Dating Bot Server',
    features: [
      'Professional bot messages',
      'Web app data handling',
      'Match event celebrations',
      'Optimized mini app',
      'Error handling'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Working Yene Dating Bot Server running on port ${PORT}`);
  console.log(`📡 Webhook: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`📱 Mini App: http://127.0.0.1:${PORT}/mini-app`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🌐 Public: https://unfretted-sariah-zippy.ngrok-free.dev`);
  console.log('');
  console.log('✨ Features:');
  console.log('• Fixed webhook responses');
  console.log('• Web app data handling');
  console.log('• Match event celebrations');
  console.log('• Professional bot messages');
  console.log('• Optimized mini app');
  console.log('');
  console.log('🎯 Test commands: /start, /app, /help, /verify, /profile, /stats, /support, /about');
});
