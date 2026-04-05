// Start ngrok with proper configuration
const { spawn } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Webhook endpoint
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Enhanced webhook server is running'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Local URL: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  
  // Start ngrok with explicit configuration
  console.log('');
  console.log('🌐 Starting ngrok with proper configuration...');
  const ngrok = spawn('ngrok', ['http', '--region=us', '3001']);
  
  ngrok.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // Extract ngrok URL with better regex
    const urlMatch = output.match(/https:\/\/[a-zA-Z0-9.-]+\.ngrok\.io\/[a-zA-Z0-9.-]+/g);
    const tunnelMatch = output.match(/ Tunnel URL: (https:\/\/[^\s]+)/);
    
    if (urlMatch && urlMatch[1]) {
      const ngrokUrl = urlMatch[1];
      console.log(`\\n✅ NGROK URL: ${ngrokUrl}`);
      console.log(`📡 Webhook URL: ${ngrokUrl}/telegram-webhook`);
      console.log(`\\n🔧 Update BotFather with: ${ngrokUrl}/telegram-webhook`);
    }
  });
  
  ngrok.stderr.on('data', (data) => {
    console.error('Ngrok error:', data.toString());
  });
  
  ngrok.on('close', (code) => {
    console.log(`Ngrok closed with code ${code}`);
  });
});
