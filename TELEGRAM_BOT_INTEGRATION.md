# Telegram Bot Integration Guide

This guide will help you set up complete Telegram bot integration for your Yene dating app.

## 🚀 Quick Setup

### 1. Create a Telegram Bot
1. Open [BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` command
3. Choose a name (e.g., "Yene Dating Bot")
4. Choose a username (e.g., "yene_dating_bot")
5. Copy the **Bot Token** (looks like: `123456789:ABCdefGhIJKlmnoPQRstUVwxyZ`)

### 2. Get Your Chat ID
1. Start a chat with your bot
2. Send any message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `chat_id` in the response (usually a negative number like `-123456789`)
5. Or use [@userinfobot](https://t.me/userinfobot) to get your Chat ID

### 3. Configure in Admin Panel
1. Go to Admin → System Settings
2. Enter your **Bot Token** in the "Telegram bot token" field
3. Enter your **Chat ID** in the "Telegram chat ID" field
4. Click "Save Admin Settings"

## 📋 Configuration Fields

| Field | Description | Example |
|-------|-------------|---------|
| Bot Token | Secret token from BotFather | `123456789:ABCdefGhIJKlmnoPQRstUVwxyZ` |
| Chat ID | Your personal/group chat ID | `-123456789` or `@channel_name` |

## 🔧 Features Available

### ✅ What Works Now
- **Send Messages**: Admin can send text messages to Telegram
- **Send Photos**: Admin can send images with captions
- **User Notifications**: Get notified of new users, reports, etc.
- **Status Monitoring**: See bot connection status in admin panel

### 🎯 Planned Features

### ✅ **Now Implemented**

#### **Two-Way Communication** 
- **Webhook Handler**: `telegramWebhook.ts` - Processes incoming messages
- **Command System**: `/start`, `/help`, `/verify`, `/profile`, `/support`, `/stats`
- **Auto-Responses**: Interactive bot commands with helpful replies
- **Message Routing**: Handles private chats, ignores bots, filters by chat type

#### **User Verification**
- **Auto-Verification**: `userVerification.ts` - Approves complete profiles automatically  
- **Manual Review**: Admin can approve/reject verification requests
- **Status Tracking**: pending → approved/rejected with timestamps and notes
- **Verification Messages**: Pre-formatted templates for all statuses

#### **Daily Reports**
- **Statistics Engine**: `dailyReports.ts` - Generates comprehensive daily analytics
- **Key Metrics**: New users, active users, premium conversions, engagement
- **Top Analytics**: Interests, locations, gender distribution, average age
- **Report Formatting**: Beautiful markdown reports for Telegram

### 🚀 **How to Enable**

#### **1. Webhook Setup**
```typescript
// Add to your server (Express.js example)
import { handleTelegramWebhook } from './src/lib/telegramWebhook';

app.post('/telegram-webhook', (req, res) => {
  const result = await handleTelegramWebhook(req.body);
  res.json(result);
});
```

#### **2. Verification Integration**
```typescript
// Add to onboarding or user creation
import { autoVerifyUser } from './src/lib/userVerification';

const newUser = await createUser(userData);
const verification = autoVerifyUser(telegramUserId, telegramUsername, newUser);

if (verification.success) {
  // User gets premium features automatically!
  toast.success('Profile verified! Welcome to Yene Premium.');
}
```

#### **3. Daily Reports Automation**
```typescript
// Add to your daily cron job
import { generateDailyReport, formatDailyReportMessage } from './src/lib/dailyReports';

// Schedule daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  const stats = generateDailyReport(users);
  const message = formatDailyReportMessage(stats);
  
  await sendTelegramMessage(message);
  saveDailyStats(stats);
});
```

### 📱 **Advanced Commands Available**

| Command | Description | Usage |
|---------|-------------|-------|
| `/start` | Welcome message and feature overview |
| `/help` | Show all available commands |
| `/verify` | Get profile verification instructions |
| `/profile` | Link dating profile to Telegram |
| `/support` | Contact customer support |
| `/stats` | View personal dating statistics |

### 🔧 **Configuration**

Add these to your `.env` file:
```bash
# Webhook Configuration
TELEGRAM_WEBHOOK_URL=https://your-domain.com/telegram-webhook
TELEGRAM_WEBHOOK_SECRET=your-secret-key

# Verification Settings
AUTO_VERIFY_COMPLETE_PROFILES=true
MIN_VERIFICATION_AGE=18
REQUIRE_PROFILE_PHOTO=true

# Report Settings
DAILY_REPORT_TIME=09:00
REPORT_TIMEZONE=Africa/Addis_Ababa
```

### 🎊 **Example Daily Report Output**
```
📊 Daily Report - 2024-04-05

👥 User Activity
• New Users: 23
• Active Users: 156
• Premium Conversions: 8

💕 Engagement
• Total Swipes: 1,247
• Total Matches: 89
• Average Age: 26

👫 Top Interests
1. Travel
2. Music
3. Fitness
4. Art
5. Coffee

📍 Top Locations
1. Addis Ababa
2. Nairobi
3. Dire Dawa

👥 Gender Distribution
• Men: 89 (57%)
• Women: 65 (41%)
• Other: 2 (1%)

📈 Growth continues strong! Keep up the great work!
```

## 🎉 **Production Ready Features**

Your Telegram bot now supports:
- ✅ **Interactive Commands** - Full command-based user interaction
- ✅ **Automated Verification** - Smart profile verification system
- ✅ **Daily Analytics** - Comprehensive reporting and insights
- ✅ **Two-Way Communication** - Users can reply and interact
- ✅ **Premium Integration** - Automatic premium feature unlocking
- ✅ **Support System** - Customer service automation

## 🚨 **Security Notes**

- Always validate webhook signatures
- Rate limit command usage
- Sanitize user inputs
- Monitor for suspicious activity
- Use HTTPS for webhook URLs

## 🛠 API Endpoints Used

### Send Message
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "<CHAT_ID>",
    "text": "Your message here",
    "parse_mode": "HTML"
  }'
```

### Send Photo
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendPhoto" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "<CHAT_ID>",
    "photo": "https://example.com/image.jpg",
    "caption": "Photo description",
    "parse_mode": "HTML"
  }'
```

## 🔒 Security Best Practices

1. **Never expose your bot token** in client-side code
2. **Use environment variables** for production deployment
3. **Validate input** before processing bot commands
4. **Rate limit** API calls to avoid Telegram restrictions
5. **Monitor logs** for suspicious activity

## 🚨 Troubleshooting

### Bot Not Responding
- Check if bot token is correct
- Verify chat ID is valid
- Ensure bot is running and has internet access

### Messages Not Sending
- Check bot token permissions
- Verify chat ID format (remove @ if using username)
- Check Telegram API status

### Webhook Issues
- Ensure your server is accessible from internet
- Check SSL certificate (Telegram requires HTTPS)
- Verify webhook URL is correct

## 📱 Testing Your Bot

1. **Test Connection**: Go to Admin → Bot Status
2. **Send Test Message**: Use the message composer in admin panel
3. **Check Response**: Verify message appears in Telegram
4. **Test Photos**: Try sending an image with caption

## 🔄 Next Steps

1. **Set up Webhooks** for real-time updates
2. **Add Bot Commands** for user interactions
3. **Implement User Verification** through Telegram
4. **Create Automated Responses** for common queries

## 📞 Support

- **Telegram Bot API**: [Official Documentation](https://core.telegram.org/bots/api)
- **BotFather**: [@BotFather](https://t.me/BotFather)
- **API Testing**: [Telegram API Tester](https://core.telegram.org/bots/api)

---

**🎉 Your Yene app is now ready for full Telegram bot integration!**

Once configured, you'll be able to:
- Send announcements to users
- Receive notifications from your app
- Manage user verification through Telegram
- Automate customer support responses
