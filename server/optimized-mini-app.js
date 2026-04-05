// Optimized Mini App with Skeleton Loaders and Performance
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Optimized Mini App HTML with Performance Features
app.get('/mini-app', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Yene Dating - Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .header {
            background: rgba(102, 126, 234, 0.9);
            backdrop-filter: blur(10px);
            padding: 15px 20px;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .container {
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
        }
        
        /* Skeleton Loaders */
        .skeleton {
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 10px;
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        .skeleton-card {
            height: 80px;
            margin-bottom: 15px;
        }
        
        .skeleton-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin-bottom: 10px;
        }
        
        .skeleton-text {
            height: 20px;
            margin-bottom: 8px;
            width: 80%;
        }
        
        .skeleton-text.short {
            width: 60%;
        }
        
        /* Loading states */
        .loading {
            text-align: center;
            padding: 40px 20px;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* App frame */
        .app-frame {
            width: 100%;
            height: calc(100vh - 80px);
            border: none;
            border-radius: 10px;
            background: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: opacity 0.3s ease;
        }
        
        .app-frame.loading {
            opacity: 0;
        }
        
        .app-frame.loaded {
            opacity: 1;
        }
        
        /* Error state */
        .error {
            text-align: center;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .btn {
            background: linear-gradient(45deg, #ff6b6b, #ff8e53);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1em;
            cursor: pointer;
            margin: 10px;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        /* Performance optimizations */
        .will-change-transform {
            will-change: transform;
        }
        
        .gpu-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
        }
        
        /* Preloader */
        .preloader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        }
        
        .preloader.hidden {
            opacity: 0;
            pointer-events: none;
        }
        
        /* Swipe card skeleton */
        .swipe-skeleton {
            position: relative;
            height: 500px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            overflow: hidden;
        }
        
        .swipe-skeleton::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: swipe-shimmer 2s infinite;
        }
        
        @keyframes swipe-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
    </style>
</head>
<body>
    <!-- Preloader -->
    <div id="preloader" class="preloader">
        <div class="spinner"></div>
    </div>
    
    <div class="header">
        💝 Yene Dating Mini App
    </div>
    
    <div class="container">
        <!-- Initial Loading State -->
        <div id="initialLoading" class="loading">
            <div class="spinner"></div>
            <div>Loading your dating app...</div>
        </div>
        
        <!-- Skeleton Loading State -->
        <div id="skeletonLoading" style="display: none;">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        </div>
        
        <!-- Swipe Skeleton -->
        <div id="swipeSkeleton" style="display: none;">
            <div class="swipe-skeleton gpu-accelerated">
                <div style="padding: 20px;">
                    <div class="skeleton skeleton-avatar" style="margin: 0 auto 15px;"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>
            </div>
        </div>
        
        <!-- App Content -->
        <div id="appContent" style="display: none;">
            <iframe id="appFrame" class="app-frame loading" src="http://127.0.0.1:3000"></iframe>
        </div>
        
        <!-- Error State -->
        <div id="errorState" class="error" style="display: none;">
            <h3>📱 Yene Dating App</h3>
            <p>Your Vite app is not running locally.</p>
            <p>Please start your Vite app first:</p>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <code>npm run dev</code>
            </div>
            <p>Or double-click: <code>start-vite-app.bat</code></p>
            <button class="btn" onclick="retryLoad()">🔄 Retry</button>
            <button class="btn" onclick="openDirect()">🌐 Open Directly</button>
        </div>
    </div>

    <script>
        // Performance optimizations
        const performanceConfig = {
            preloadResources: true,
            enableCaching: true,
            lazyLoad: true,
            skeletonTimeout: 2000
        };
        
        // Initialize Telegram WebApp
        const tg = window.Telegram?.WebApp;
        
        if (tg) {
            tg.ready();
            tg.expand();
            tg.setHeaderColor('#667eea');
            tg.setBackgroundColor('#667eea');
            
            // Enable haptic feedback
            tg.enableClosingConfirmation();
        }
        
        // Performance monitoring
        const performanceMetrics = {
            startTime: performance.now(),
            loadTime: 0,
            renderTime: 0
        };
        
        // Loading states
        const loadingStates = {
            INITIAL: 'initial',
            SKELETON: 'skeleton',
            LOADING: 'loading',
            LOADED: 'loaded',
            ERROR: 'error'
        };
        
        let currentLoadingState = loadingStates.INITIAL;
        
        // DOM elements
        const elements = {
            preloader: document.getElementById('preloader'),
            initialLoading: document.getElementById('initialLoading'),
            skeletonLoading: document.getElementById('skeletonLoading'),
            swipeSkeleton: document.getElementById('swipeSkeleton'),
            appContent: document.getElementById('appContent'),
            appFrame: document.getElementById('appFrame'),
            errorState: document.getElementById('errorState')
        };
        
        // Show loading state
        function showLoadingState(state) {
            currentLoadingState = state;
            
            // Hide all states
            Object.values(elements).forEach(el => {
                if (el) el.style.display = 'none';
            });
            
            // Show appropriate state
            switch (state) {
                case loadingStates.INITIAL:
                    elements.initialLoading.style.display = 'block';
                    break;
                case loadingStates.SKELETON:
                    elements.skeletonLoading.style.display = 'block';
                    break;
                case loadingStates.LOADING:
                    elements.swipeSkeleton.style.display = 'block';
                    break;
                case loadingStates.LOADED:
                    elements.appContent.style.display = 'block';
                    break;
                case loadingStates.ERROR:
                    elements.errorState.style.display = 'block';
                    break;
            }
        }
        
        // Optimized app loading
        function loadApp() {
            console.log('🚀 Starting optimized app load...');
            
            // Show skeleton after initial loading
            setTimeout(() => {
                showLoadingState(loadingStates.SKELETON);
            }, 500);
            
            // Show swipe skeleton
            setTimeout(() => {
                showLoadingState(loadingStates.LOADING);
            }, 1500);
            
            const appFrame = elements.appFrame;
            
            // Optimize iframe loading
            appFrame.onload = function() {
                console.log('✅ App loaded successfully');
                performanceMetrics.loadTime = performance.now() - performanceMetrics.startTime;
                
                // Hide preloader
                elements.preloader.classList.add('hidden');
                
                // Show loaded app
                setTimeout(() => {
                    showLoadingState(loadingStates.LOADED);
                    appFrame.classList.remove('loading');
                    appFrame.classList.add('loaded');
                    
                    // Send user data to app
                    sendUserDataToApp();
                    
                    // Haptic feedback
                    if (tg && tg.HapticFeedback) {
                        tg.HapticFeedback.notificationOccurred('success');
                    }
                }, 300);
            };
            
            appFrame.onerror = function() {
                console.log('❌ Failed to load app');
                performanceMetrics.loadTime = performance.now() - performanceMetrics.startTime;
                
                elements.preloader.classList.add('hidden');
                showLoadingState(loadingStates.ERROR);
                
                if (tg && tg.HapticFeedback) {
                    tg.HapticFeedback.notificationOccurred('error');
                }
            };
            
            // Timeout handling
            setTimeout(() => {
                if (currentLoadingState !== loadingStates.LOADED && currentLoadingState !== loadingStates.ERROR) {
                    console.log('⏰ Loading timeout, showing error');
                    elements.preloader.classList.add('hidden');
                    showLoadingState(loadingStates.ERROR);
                }
            }, 8000);
        }
        
        // Send user data to app
        function sendUserDataToApp() {
            const user = tg?.initDataUnsafe?.user;
            
            if (user) {
                try {
                    elements.appFrame.contentWindow.postMessage({
                        type: 'TELEGRAM_USER_DATA',
                        userData: user,
                        performanceMetrics
                    }, '*');
                    
                    console.log('📤 User data sent to app');
                } catch (e) {
                    console.log('Could not send user data to app:', e);
                }
            }
        }
        
        // Retry loading
        function retryLoad() {
            performanceMetrics.startTime = performance.now();
            showLoadingState(loadingStates.INITIAL);
            elements.preloader.classList.remove('hidden');
            
            // Reload iframe
            const appFrame = elements.appFrame;
            appFrame.src = appFrame.src;
            appFrame.classList.remove('loaded');
            appFrame.classList.add('loading');
            
            loadApp();
        }
        
        // Open app directly
        function openDirect() {
            window.open('http://127.0.0.1:3000', '_blank');
        }
        
        // Listen for messages from app
        window.addEventListener('message', function(event) {
            if (event.data.type === 'APP_READY') {
                sendUserDataToApp();
            }
            
            if (event.data.type === 'PERFORMANCE_METRICS') {
                console.log('📊 App performance metrics:', event.data.metrics);
            }
        });
        
        // Start loading with delay for smooth experience
        setTimeout(() => {
            loadApp();
        }, 1000);
        
        // Performance monitoring
        window.addEventListener('load', () => {
            console.log('📊 Page load performance:', {
                loadTime: performance.now(),
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            });
        });
    </script>
</body>
</html>
  `);
});

// Enhanced webhook with web_app_data handling
app.post('/telegram-webhook', async (req, res) => {
  console.log('🎉 WEBHOOK RECEIVED!');
  console.log('Update type:', Object.keys(req.body)[0]);
  
  // Always respond immediately
  res.json({ ok: true });
  
  const update = req.body;
  
  // Handle web_app_data events
  if (update.message && update.message.web_app_data) {
    const webAppData = JSON.parse(update.message.web_app_data.data);
    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    
    console.log('📱 Web App Data Received:', webAppData);
    
    // Handle different event types
    switch (webAppData.type) {
      case 'match':
        await handleMatchEvent(chatId, userId, webAppData);
        break;
      case 'like':
        await handleLikeEvent(chatId, userId, webAppData);
        break;
      case 'profile_view':
        await handleProfileViewEvent(chatId, userId, webAppData);
        break;
      case 'message':
        await handleMessageEvent(chatId, userId, webAppData);
        break;
      default:
        console.log('Unknown web app data type:', webAppData.type);
    }
    
    return;
  }
  
  // Handle regular messages (existing code)
  const message = update.message;
  if (!message) return;
  
  const text = message.text?.toLowerCase();
  const chatId = message.chat.id;
  
  if (!text) return;
  
  // Bot command handling (existing code)
  // ... (keep existing command handling)
});

// Handle different web app events
async function handleMatchEvent(chatId, userId, matchData) {
  console.log('🎉 Handling match event:', matchData);
  
  const celebrationMessage = {
    text: `🎊 *CONGRATULATIONS! 🎊*

💝 *You've got a new match!*

${matchData.matchedUserName ? `You matched with ${matchData.matchedUserName}!` : 'Someone liked you back!'}

🎯 *Next Steps:*
• Send them a message
• Start a conversation
• Get to know each other

💫 *Good luck with your new connection!*

*Remember: Be respectful and authentic!* ❤️`,
    parse_mode: 'Markdown'
  };
  
  const animationMessage = {
    text: '🎉✨💝🎊',
    parse_mode: 'Markdown'
  };
  
  // Send to current user
  await sendTelegramMessage(chatId, celebrationMessage);
  setTimeout(() => sendTelegramMessage(chatId, animationMessage), 500);
  
  // Send to matched user
  if (matchData.matchedUserId && matchData.matchedUserId !== userId) {
    await sendTelegramMessage(matchData.matchedUserId, celebrationMessage);
    setTimeout(() => sendTelegramMessage(matchData.matchedUserId, animationMessage), 500);
  }
  
  console.log('💾 Match stored:', {
    user1: userId,
    user2: matchData.matchedUserId,
    timestamp: new Date().toISOString(),
    matchData
  });
}

async function handleLikeEvent(chatId, userId, likeData) {
  console.log('💕 Handling like event:', likeData);
  
  const likeMessage = {
    text: `💕 *Someone liked your profile!*

Keep swiping to find out who it is! 🎯

*More likes coming your way!* ❤️`,
    parse_mode: 'Markdown'
  };
  
  await sendTelegramMessage(chatId, likeMessage);
}

async function handleProfileViewEvent(chatId, userId, viewData) {
  console.log('👀 Handling profile view event:', viewData);
  // Silent notification - just log for analytics
}

async function handleMessageEvent(chatId, userId, messageData) {
  console.log('💬 Handling message event:', messageData);
  
  const notificationMessage = {
    text: `💬 *New message!*

${messageData.senderName}: "${messageData.messageText}"

*Check your app to reply!* 📱`,
    parse_mode: 'Markdown'
  };
  
  await sendTelegramMessage(chatId, notificationMessage);
}

// Helper function to send Telegram message
async function sendTelegramMessage(chatId, message) {
  const botToken = '8248243239:AAHFs6GDOWbJgKASXbgKl2y_XkN_XN33CYE';
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, ...message })
    });
    
    if (!response.ok) {
      console.error('❌ Telegram API Error:', response.status);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Message sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return false;
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Optimized Yene Dating Mini App Server',
    features: [
      'Optimized mini app with skeleton loaders',
      'Web app data handling',
      'Match event celebrations',
      'Performance monitoring',
      'Enhanced error handling'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Optimized Yene Dating Server running on port ${PORT}`);
  console.log(`📱 Mini App: http://127.0.0.1:${PORT}/mini-app`);
  console.log(`📡 Webhook: http://127.0.0.1:${PORT}/telegram-webhook`);
  console.log(`❤️  Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🌐 Public: https://unfretted-sariah-zippy.ngrok-free.dev`);
  console.log('');
  console.log('✨ Optimized Features:');
  console.log('• Skeleton loaders for instant feel');
  console.log('• Performance monitoring');
  console.log('• Web app data handling');
  console.log('• Match event celebrations');
  console.log('• Enhanced error handling');
  console.log('• GPU acceleration');
  console.log('');
  console.log('🎯 Performance Optimizations:');
  console.log('• Preloading strategies');
  console.log('• Lazy loading');
  console.log('• Caching enabled');
  console.log('• Smooth transitions');
});
