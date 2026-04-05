// Start server with ngrok tunnel
const { spawn } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Webhook endpoint
app.post('/telegram-webhook', (req, res) => {
  console.log('=== WEBHOOK RECEIVED ===');
  console.log('From:', req.body.message?.from?.first_name);
  console.log('Text:', req.body.message?.text);
  
  if (req.body.message && req.body.message.text === '/start') {
    console.log('START COMMAND DETECTED!');
    
    res.json({
      method: 'sendMessage',
      chat_id: req.body.message.chat.id,
      text: '🎉 Welcome to Yene Dating Bot! Working with ngrok!',
      parse_mode: 'HTML'
    });
  } else {
    res.json({ ok: true });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start ngrok
  console.log('🌐 Starting ngrok tunnel...');
  const ngrok = spawn('ngrok', ['http', PORT.toString(), '--log=stdout']);
  
  ngrok.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // Extract ngrok URL
    const match = output.match(/url=(https:\/\/[^\\s]+)/);
    if (match) {
      const ngrokUrl = match[1];
      console.log(`\\n✅ NGROK URL: ${ngrokUrl}`);
      console.log(`📡 Webhook URL: ${ngrokUrl}/telegram-webhook`);
      console.log(`\\n🔧 Set this in BotFather: ${ngrokUrl}/telegram-webhook`);
    }
  });
  
  ngrok.stderr.on('data', (data) => {
    console.error('Ngrok error:', data.toString());
  });
  
  ngrok.on('close', (code) => {
    console.log(`Ngrok closed with code ${code}`);
  });
});
