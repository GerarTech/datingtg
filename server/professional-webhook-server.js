// Professional Telegram Bot Webhook Server
const express = require('express');
const bodyParser = require('body-parser');
const botMessages = require('./professional-bot-messages');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Webhook endpoint with professional responses
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
  
  // Command handling with professional messages
  switch (text) {
    case '/start':
      response = botMessages.welcome;
      console.log('🚀 START COMMAND - Welcome message sent');
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
      // Handle unknown commands
      response = {
        text: `🤔 *Unknown Command*

Hi ${message.from.first_name || 'there'}! 

I didn't recognize that command. Here's what I can help you with:

🎯 *Popular Commands:*
/start - Welcome message
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
    message: 'Professional Yene Dating Bot is running',
    features: [
      'Beautiful markdown messages',
      'Professional branding',
      'Complete command system',
      'Error handling',
      'User-friendly responses'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Professional Yene Dating Bot running on port ${PORT}`);
  console.log(`📡 Webhook: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🌐 Public: https://unfretted-sariah-zippy.ngrok-free.dev/telegram-webhook`);
  console.log('');
  console.log('✨ Professional Features:');
  console.log('• Beautiful markdown formatting');
  console.log('• Professional branding');
  console.log('• Complete command system');
  console.log('• Error handling');
  console.log('• User-friendly responses');
  console.log('');
  console.log('🎯 Test commands: /start, /help, /verify, /profile, /stats, /support, /about');
});
