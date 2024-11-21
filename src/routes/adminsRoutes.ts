import TelegramBot from "node-telegram-bot-api";
import { getGroupAdmins } from "../controllers/adminsController";

  function setupAdminsRoutes(bot:TelegramBot) {
    bot.onText(/\/listadmins/, (msg:any) => {
        const chatId = msg.chat.id;
        getGroupAdmins(bot, chatId);
      });
      
  }
  
  export default setupAdminsRoutes;
  