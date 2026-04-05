// Simple test server for debugging
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Test webhook endpoint
app.post('/telegram-webhook', (req, res) => {
  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================');
  
  // Check if it's a /start command
  if (req.body.message && req.body.message.text === '/start') {
    console.log('START COMMAND DETECTED!');
    
    // Send response back
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
    message: 'Test server is running' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://127.0.0.1:${PORT}`);
  console.log(`📡 Webhook: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  console.log('Ready to test /start command!');
});
