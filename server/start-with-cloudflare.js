// Start server with Cloudflare tunnel (no authentication required)
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
      text: '🎉 Welcome to Yene Dating Bot! Working with Cloudflare tunnel!',
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
    message: 'Telegram webhook server is running with Cloudflare tunnel'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Local URL: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  
  // Start Cloudflare tunnel
  console.log('');
  console.log('🌩 Starting Cloudflare tunnel (no auth required)...');
  const cloudflare = spawn('npx', ['cloudflared', 'tunnel', '--url', `http://localhost:${PORT}`]);
  
  cloudflare.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // Extract Cloudflare URL
    const match = output.match(/https:\/\/[^\\s]+\.trycloudflare\.com\/[^\\s]+/);
    if (match) {
      const cloudflareUrl = match[0];
      console.log(`\\n✅ CLOUDFLARE URL: ${cloudflareUrl}`);
      console.log(`📡 Webhook URL: ${cloudflareUrl}/telegram-webhook`);
      console.log(`\\n🔧 Set this in BotFather: ${cloudflareUrl}/telegram-webhook`);
    }
  });
  
  cloudflare.stderr.on('data', (data) => {
    console.error('Cloudflare error:', data.toString());
  });
  
  cloudflare.on('close', (code) => {
    console.log(`Cloudflare tunnel closed with code ${code}`);
  });
});
