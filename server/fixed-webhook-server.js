// Fixed Telegram Bot Webhook Server
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

I'm your personal dating assistant! Here's what I can help you with:

💝 *Find Your Perfect Match*
📱 *Professional Profile Management*
🔒 *Secure Verification*
📊 *Dating Analytics*
💬 *24/7 Support*

🚀 *Get Started:*
/verify - Complete your profile verification
/profile - Link your dating profile
/stats - View your dating statistics
/app - Open mini app
/help - See all available commands

💬 *Need Help?*
/support - Contact our support team

*Your journey to love starts here!* ❤️`,
    parse_mode: 'Markdown'
  },

  app: {
    text: `📱 *Opening Yene Dating Mini App...*

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
        { text: '🎯 Open Mini App', web_app: { url: 'https://unfretted-sariah-zippy.ngrok-free.dev/mini-app' } }
      ]]
    }
  },

  help: {
    text: `📋 *Yene Dating Bot Commands*

🎯 *Profile & Verification*
/verify - Complete verification process
/profile - Link your dating profile
/status - Check your account status

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

// Webhook endpoint
app.post('/telegram-webhook', async (req, res) => {
  console.log('🎉 WEBHOOK RECEIVED (POST)!');
  console.log('From:', req.body.message?.from?.first_name);
  console.log('Text:', req.body.message?.text);
  console.log('Chat ID:', req.body.message?.chat?.id);
  
  const message = req.body.message;
  const text = message?.text?.toLowerCase();
  const chatId = message?.chat?.id;
  
  // Always respond immediately to prevent 502 errors
  res.json({ ok: true });
  
  if (!text || !chatId) {
    return;
  }
  
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
      // Handle unknown commands
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
  const success = await sendTelegramMessage(chatId, response);
  if (success) {
    console.log('✅ Response sent successfully to Telegram');
  } else {
    console.log('❌ Failed to send response to Telegram');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Fixed Yene Dating Bot is running',
    features: [
      'Fixed webhook responses',
      'Professional bot messages',
      'Error handling',
      'Async message sending',
      '502 error prevention'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fixed Yene Dating Bot running on port ${PORT}`);
  console.log(`📡 Webhook: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🌐 Public: https://unfretted-sariah-zippy.ngrok-free.dev/telegram-webhook`);
  console.log('');
  console.log('✅ Fixed Issues:');
  console.log('• 502 Bad Gateway errors');
  console.log('• Async message sending');
  console.log('• Proper error handling');
  console.log('• Immediate webhook responses');
  console.log('');
  console.log('🎯 Test commands: /start, /app, /help, /verify, /profile, /stats, /support, /about');
});
