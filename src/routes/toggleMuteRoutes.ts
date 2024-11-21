import TelegramBot from 'node-telegram-bot-api';
import  GroupSetting  from '../models/groupSetting';

// Function to set up routes for muting and unmuting chat
function setupToggleMuteRoutes(bot: TelegramBot) {
  // Command to unmute chat
  bot.onText(/\/unmute/, async (msg) => {
    const chatId = msg.chat.id;  // chatId is already a string
    const userId = msg.from?.id;  // userId is already a string

    try {
      // Find the current settings and unmute the chat
      await GroupSetting.findOneAndUpdate(
        { userId },
        { mute: false },
        { new: true }
      );

      bot.sendMessage(chatId, "Chat has been unmuted.");
    } catch (error) {
      console.error("Error unmuting chat:", error);
      bot.sendMessage(chatId, "Failed to unmute the chat. Please try again.");
    }
  });

  // Command to mute chat
  bot.onText(/\/mute/, async (msg) => {
    const chatId = msg.chat.id;  // chatId is already a string
    const userId = msg.from?.id;  // userId is already a string

    try {
      // Find the current settings and mute the chat
      await GroupSetting.findOneAndUpdate(
        { userId },
        { mute: true },
        { new: true }
      );

      bot.sendMessage(chatId, "Chat has been muted.");
    } catch (error) {
      console.error("Error muting chat:", error);
      bot.sendMessage(chatId, "Failed to mute the chat. Please try again.");
    }
  });
}

export default setupToggleMuteRoutes;
