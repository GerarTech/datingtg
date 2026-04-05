// Test webhook endpoint to verify it's working
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('========================');
  next();
});

app.use(bodyParser.json());

// Test webhook endpoint
app.post('/telegram-webhook', (req, res) => {
  console.log('🎉 WEBHOOK RECEIVED (POST)!');
  console.log('From:', req.body.message?.from?.first_name);
  console.log('Text:', req.body.message?.text);
  console.log('Chat ID:', req.body.message?.chat?.id);
  
  if (req.body.message && req.body.message.text === '/start') {
    console.log('🚀 START COMMAND DETECTED!');
    
    // Send response back to Telegram
    const botToken = '8248243239:AAHFs6GDOWbJgKASXbgKl2y_XkN_XN33CYE';
    const chatId = req.body.message.chat.id;
    
    // Use fetch to send response
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🎉 Welcome to Yene Dating Bot! Server is working!',
        parse_mode: 'HTML'
      })
    }).then(response => {
      console.log('📤 Response sent:', response.status);
    }).catch(error => {
      console.error('❌ Error sending response:', error);
    });
  }
  
  res.json({ ok: true });
});

// Add GET handler for testing
app.get('/telegram-webhook', (req, res) => {
  console.log('📡 GET request received on /telegram-webhook');
  console.log('Query params:', req.query);
  res.json({ 
    message: 'Yene Dating Bot Webhook Endpoint',
    method: 'GET',
    status: 'Webhook is active',
    timestamp: new Date().toISOString(),
    note: 'Telegram should send POST requests here'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Enhanced webhook server is running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced webhook server running on port ${PORT}`);
  console.log(`📡 Webhook: http://127.0.0.1:3001/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:3001/health`);
  console.log(`🌐 Public: https://unfretted-sariah-zippy.ngrok-free.dev/telegram-webhook`);
  console.log('');
  console.log('🔧 Test webhook by sending /start to your bot');
  console.log('📊 Watch this console for incoming requests');
});
