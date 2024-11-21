// Import necessary modules and functions
import { getGeneralSettings, setGeneralSettings } from "../controllers/groupSettingController";
import { handleRaidSettingsCommand } from "../bot/commands/groupCommands";
import groupSetting from "../models/groupSetting"; // Default import if it's a default export
import TelegramBot from "node-telegram-bot-api";


// Define CustomCallbackQuery if handleSettingsCallback requires a non-optional message
interface CustomCallbackQuery extends TelegramBot.CallbackQuery {
  message: TelegramBot.Message; // Define message as non-optional
}


function setupGroupRoutes(bot:TelegramBot) {
  // Command to get raid settings
  bot.onText(/\/raidsettings/,  async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const chatType = msg.chat.type;


    try {
      const existingSettings = await groupSetting.findOne({ userId });

      if (!existingSettings) {
        await setGeneralSettings(userId);
      }
    } catch (error) {
      console.error(
        `Error fetching or setting group settings for chatId ${userId}:`,
        error
      );
    }




    handleRaidSettingsCommand(bot, chatId,chatType,userId);
  });

  // Handle button clicks for adjusting settings
  bot.on("callback_query", (query) => {
    if (!query.message) {
      console.error("CallbackQuery message is undefined.");
      return;
    }

  });


}

export default setupGroupRoutes;
