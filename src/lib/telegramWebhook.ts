// Telegram Webhook Handler for Two-Way Communication
import { UserProfile } from '../context/AppContext';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username: string;
    };
    chat: {
      id: number;
      type: 'private' | 'group' | 'supergroup' | 'channel';
    };
    text: string;
    date: number;
  };
}

export interface WebhookResponse {
  ok: boolean;
  description?: string;
}

// Handle incoming Telegram messages
export const handleTelegramWebhook = async (update: TelegramUpdate): Promise<WebhookResponse> => {
  try {
    if (!update.message) {
      return { ok: true };
    }

    const { message } = update;
    const { from, chat, text, date } = message;

    // Ignore messages from bots
    if (from?.is_bot) {
      return { ok: true };
    }

    // Only handle private chats
    if (chat.type !== 'private') {
      return { ok: true };
    }

    console.log('Received Telegram message:', { 
      from: `${from?.first_name} ${from?.last_name || ''} (@${from?.username})`,
      text,
      chatId: chat.id,
      timestamp: new Date(date * 1000).toISOString()
    });

    // Check if message is a command
    const trimmedText = text.toLowerCase().trim();
    if (trimmedText.startsWith('/')) {
      const commandResult = handleTelegramCommand(trimmedText, from.id);
      
      if (commandResult.shouldNotify) {
        // Send response back to user
        await sendTelegramResponse(chat.id, commandResult.response);
      }
      
      return { 
        ok: true,
        description: `Command processed: ${trimmedText}`
      };
    }

    // Handle non-command messages (optional)
    // TODO: Add chat logic here if needed

    return { 
      ok: true,
      description: 'Message processed successfully'
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return { 
      ok: false, 
      description: 'Failed to process message' 
    };
  }
};

// Helper function to send responses
const sendTelegramResponse = async (chatId: number, text: string): Promise<void> => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('No bot token configured');
      return;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram response');
    }
  } catch (error) {
    console.error('Error sending Telegram response:', error);
  }
};

// Common command handlers
export const handleTelegramCommand = (text: string, userId: number) => {
  const command = text.toLowerCase().trim();
  
  switch (command) {
    case '/start':
      return {
        response: '🎉 Welcome to Yene Dating Bot! Use /help to see available commands.',
        shouldNotify: true
      };
      
    case '/help':
      return {
        response: `📋 Available commands:
/start - Start using the bot
/verify - Get verification instructions
/profile - Link your dating profile
/support - Contact support
/stats - View your dating statistics`,
        shouldNotify: true
      };
      
    case '/verify':
      return {
        response: '🔍 To verify your account:\n1. Complete your dating profile\n2. Send your username\n3. We\'ll verify and notify you',
        shouldNotify: true
      };
      
    case '/profile':
      return {
        response: '👤 Link your profile by sending your dating username',
        shouldNotify: true
      };
      
    case '/support':
      return {
        response: '📞 Support team has been notified. We\'ll respond within 24 hours.',
        shouldNotify: true
      };
      
    case '/stats':
      return {
        response: '📊 Daily statistics:\n- Swipes today: 45\n- Matches today: 3\n- Profile views: 12',
        shouldNotify: true
      };
      
    default:
      return {
        response: '❓ Unknown command. Use /help for available commands.',
        shouldNotify: true
      };
  }
};
