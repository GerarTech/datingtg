// Use localtunnel instead of ngrok
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
        text: '🎉 Welcome to Yene Dating Bot! Working with localtunnel!',
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
    message: 'Webhook server with localtunnel is running'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Local URL: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  
  // Start localtunnel
  console.log('');
  console.log('🌐 Starting localtunnel...');
  const localtunnel = spawn('npx', ['localtunnel', '--port', PORT.toString()]);
  
  localtunnel.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // Extract localtunnel URL
    const urlMatch = output.match(/https:\/\/[a-zA-Z0-9.-]+\.localtunnel\.me\/[a-zA-Z0-9.-]+/g);
    
    if (urlMatch && urlMatch[0]) {
      const tunnelUrl = urlMatch[0];
      console.log(`\\n✅ LOCALTUNNEL URL: ${tunnelUrl}`);
      console.log(`📡 Webhook URL: ${tunnelUrl}/telegram-webhook`);
      console.log(`\\n🔧 Update BotFather with: ${tunnelUrl}/telegram-webhook`);
    }
  });
  
  localtunnel.stderr.on('data', (data) => {
    console.error('Localtunnel error:', data.toString());
  });
  
  localtunnel.on('close', (code) => {
    console.log(`Localtunnel closed with code ${code}`);
  });
});
