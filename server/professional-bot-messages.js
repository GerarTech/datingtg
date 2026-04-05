// Professional and beautiful bot messages
const botMessages = {
  welcome: {
    text: `🌟 *Welcome to Yene Dating!*

🎯 *Ethiopia's Premier Dating Platform*

I'm your personal dating assistant! Here's what I can help you with:

💝 *Find Your Perfect Match*
📱 *Professional Profile Management*
🔒 *Secure Verification*
📊 *Dating Analytics*
💬 *24/7 Support*

🚀 *Get Started:*
/verify - Complete your profile verification
/profile - Link your dating profile
/stats - View your dating statistics
/help - See all available commands

💬 *Need Help?*
/support - Contact our support team

*Your journey to love starts here!* ❤️`,
    parse_mode: 'Markdown'
  },

  help: {
    text: `📋 *Yene Dating Bot Commands*

🎯 *Profile & Verification*
/verify - Complete verification process
/profile - Link your dating profile
/status - Check your account status

📊 *Statistics & Analytics*
/stats - View your dating statistics
/matches - See recent matches
/activity - View your activity log

💬 *Support & Information*
/help - Show this help menu
/support - Contact support
/about - Learn about Yene Dating
/privacy - Privacy policy
/terms - Terms of service

🎉 *Interactive Features*
/start - Welcome message
/feedback - Send us feedback

💡 *Tips:*
• Complete verification for better matches
• Keep your profile updated
• Use descriptive photos
• Be respectful and authentic

*Need help? Use /support* 🌟`,
    parse_mode: 'Markdown'
  },

  verify: {
    text: `🔐 *Profile Verification*

📝 *Why Verify?*
✅ Increased trust and credibility
✅ Better match recommendations
✅ Premium features access
✅ Higher visibility to other users

📋 *Verification Steps:*
1️⃣ Complete your dating profile
2️⃣ Upload clear photos
3️⃣ Verify your phone number
4️⃣ Connect social accounts (optional)

🔗 *Quick Links:*
📱 [Complete Profile](https://yene-dating.com/profile)
📸 [Upload Photos](https://yene-dating.com/photos)
📞 [Verify Phone](https://yene-dating.com/verify)

⏱️ *Processing Time:* Usually within 24 hours

💡 *Pro Tip:* Verified users get 3x more matches!

*Need help? Use /support* 🌟`,
    parse_mode: 'Markdown'
  },

  profile: {
    text: `👤 *Your Dating Profile*

📊 *Profile Status:* 
🔍 Visibility: Active
⭐ Verification: Pending/Complete
📈 Match Rate: Calculating...

🔗 *Profile Links:*
📱 [View Full Profile](https://yene-dating.com/profile)
✏️ [Edit Profile](https://yene-dating.com/edit)
📸 [Manage Photos](https://yene-dating.com/photos)

💡 *Profile Tips:*
• Use recent, clear photos
• Write an engaging bio
• Be specific about interests
• Update regularly

📈 *Boost Your Profile:*
• Complete verification
• Add more photos
• Be active daily
• Respond to messages promptly

*Check /stats for detailed analytics* 📊`,
    parse_mode: 'Markdown'
  },

  stats: {
    text: `📊 *Your Dating Statistics*

🎯 *Performance Metrics:*
👁️ Profile Views: [calculating...]
💬 Messages Sent: [calculating...]
❤️ Matches Made: [calculating...]
⭐ Response Rate: [calculating...]

📈 *Weekly Trends:*
• Profile Views: +[X]%
• Message Activity: [Active/Moderate/Low]
• Match Quality: [Good/Fair/Excellent]

🎯 *Recommendations:*
• Post new photos to increase views
• Respond within 24 hours for better rates
• Complete verification for more matches

🔄 *Last Updated:* Just now

*Detailed analytics available on web platform* 🌟`,
    parse_mode: 'Markdown'
  },

  support: {
    text: `💬 *Yene Dating Support*

🤝 *We're here to help!*

📞 *Contact Options:*
• Chat with support team
• Email: support@yene-dating.com
• Response time: Within 2 hours

🆘 *Common Issues:*
🔐 Account verification problems
📸 Photo upload issues
💬 Messaging troubles
🔒 Privacy concerns

📝 *Report an Issue:*
1. Describe your issue
2. Include screenshots if possible
3. Mention your username
4. We'll respond ASAP

⏰ *Support Hours:*
24/7 for premium users
9 AM - 9 PM for free users

*Priority support for verified users* ⭐`,
    parse_mode: 'Markdown'
  },

  about: {
    text: `🌟 *About Yene Dating*

🇪🇹 *Ethiopia's Trusted Dating Platform*

🎯 *Our Mission:*
Connecting Ethiopian singles through meaningful relationships built on trust, culture, and shared values.

💝 *What Makes Us Different:*
✅ Culturally-aware matching
✅ Verified user base
✅ Privacy-focused
✅ Local community support
✅ Modern, intuitive interface

📱 *Features:*
• Smart matching algorithm
• Video chat capabilities
• Cultural compatibility filters
• Secure messaging
• Profile verification

🌍 *Community:*
50,000+ active users
75% success rate
24/7 support

*Join thousands finding love on Yene Dating* ❤️`,
    parse_mode: 'Markdown'
  }
};

module.exports = botMessages;
