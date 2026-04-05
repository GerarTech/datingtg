// Simple server for testing with public tunneling service
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Webhook endpoint
app.post('/telegram-webhook', (req, res) => {
  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Time:', new Date().toISOString());
  console.log('From:', req.body.message?.from?.first_name);
  console.log('Text:', req.body.message?.text);
  console.log('Chat ID:', req.body.message?.chat?.id);
  console.log('========================');
  
  if (req.body.message && req.body.message.text === '/start') {
    console.log('🎉 START COMMAND DETECTED!');
    
    res.json({
      method: 'sendMessage',
      chat_id: req.body.message.chat.id,
      text: '🎉 Welcome to Yene Dating Bot! Server is working!',
      parse_mode: 'HTML'
    });
  } else {
    res.json({ ok: true });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Telegram webhook server is running',
    instructions: 'Use a tunneling service like ngrok or localtunnel'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Telegram webhook server running on port ${PORT}`);
  console.log(`📡 Local URL: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health check: http://127.0.0.1:${PORT}/health`);
  console.log('');
  console.log('🌐 TO MAKE IT PUBLIC, USE:');
  console.log('1. ngrok: npm install -g ngrok && ngrok http 3001');
  console.log('2. localtunnel: npm install -g localtunnel && lt --port 3001');
  console.log('3. cloudflare: npx cloudflared tunnel --url http://localhost:3001');
  console.log('');
  console.log('🔧 Then set the public URL in BotFather webhook settings');
});
