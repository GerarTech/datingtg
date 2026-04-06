const crypto = require('crypto');

/**
 * Middleware to validate Telegram WebApp initData using HMAC-SHA256
 * @param {string} botToken - Your Telegram bot token
 * @returns {Function} Express middleware function
 */
function createTelegramAuthMiddleware(botToken) {
  return (req, res, next) => {
    try {
      const initData = req.body.initData || req.headers['x-telegram-init-data'];
      
      if (!initData) {
        return res.status(401).json({ 
          error: 'Missing initData',
          message: 'Telegram WebApp initData is required'
        });
      }

      // Parse the initData query string
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        return res.status(401).json({ 
          error: 'Missing hash',
          message: 'Hash is required in initData'
        });
      }

      // Remove hash from the data for validation
      urlParams.delete('hash');
      
      // Create the data-check-string
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Create secret key
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      // Calculate hash
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      // Compare hashes
      if (calculatedHash !== hash) {
        return res.status(401).json({ 
          error: 'Invalid hash',
          message: 'Telegram initData validation failed'
        });
      }

      // Parse user data and attach to request
      const userStr = urlParams.get('user');
      if (userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          req.telegramUser = user;
          
          // Add additional Telegram data
          req.telegramData = {
            user,
            query_id: urlParams.get('query_id'),
            auth_date: urlParams.get('auth_date'),
            hash: hash
          };
        } catch (parseError) {
          return res.status(400).json({ 
            error: 'Invalid user data',
            message: 'Failed to parse user information from initData'
          });
        }
      }

      // Check if data is not too old (optional, 24 hours)
      const authDate = parseInt(urlParams.get('auth_date'));
      const now = Math.floor(Date.now() / 1000);
      const maxAge = 24 * 60 * 60; // 24 hours
      
      if (now - authDate > maxAge) {
        return res.status(401).json({ 
          error: 'Expired data',
          message: 'Telegram initData is too old'
        });
      }

      next();
    } catch (error) {
      console.error('Telegram auth middleware error:', error);
      return res.status(500).json({ 
        error: 'Validation error',
        message: 'Internal server error during Telegram validation'
      });
    }
  };
}

/**
 * Utility function to validate initData directly
 * @param {string} initData - The initData string from Telegram
 * @param {string} botToken - Your Telegram bot token
 * @returns {Object} Validation result with user data if valid
 */
function validateInitData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return { valid: false, error: 'Missing hash' };
    }

    urlParams.delete('hash');
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { valid: false, error: 'Invalid hash' };
    }

    const userStr = urlParams.get('user');
    let user = null;
    if (userStr) {
      user = JSON.parse(decodeURIComponent(userStr));
    }

    return {
      valid: true,
      user,
      data: {
        user,
        query_id: urlParams.get('query_id'),
        auth_date: urlParams.get('auth_date'),
        hash
      }
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

module.exports = {
  createTelegramAuthMiddleware,
  validateInitData
};
