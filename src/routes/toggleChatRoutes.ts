import TelegramBot from 'node-telegram-bot-api';
import { lockChat, unlockChat } from '../controllers/toggleChatController';

  function setupChatRoutes(bot:TelegramBot) {
    bot.onText(/\/lockchat/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;
    
        const response = await lockChat(chatId,userId);
        bot.sendMessage(chatId, response);
      });
    
      bot.onText(/\/unlockchat/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;
    
        const response = await unlockChat(chatId,userId);
        bot.sendMessage(chatId, response);
      });
  }


  export default  setupChatRoutes;