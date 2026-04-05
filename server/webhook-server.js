// Simple Express server for Telegram webhook
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import the webhook handler
const telegramWebhookPath = path.join(__dirname, '..', 'src', 'lib', 'telegramWebhook.js');
const { handleTelegramWebhook } = require(telegramWebhookPath);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Webhook endpoint
app.post('/telegram-webhook', async (req, res) => {
  console.log('Webhook received:', req.body);
  
  try {
    const result = await handleTelegramWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Telegram webhook server running on port ${PORT}`);
  console.log(`Webhook URL: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`Health check: http://127.0.0.1:${PORT}/health`);
});
