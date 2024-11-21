import TelegramBot from "node-telegram-bot-api";
import { generateRaidSuggestions } from "../controllers/automaticRaidController";
import cron from "node-cron";

function setupAutomaticRaidRoutes(bot:TelegramBot) {
  // Manual command to generate raid suggestions
  bot.onText(/\/generateRaidSuggestions/, async (msg:any) => {  // Updated regex pattern

    const chatId = msg.chat.id;

    // Run generateRaidSuggestions immediately for the command
    await generateRaidSuggestions(bot, chatId);

    // Schedule the suggestions to be sent every day at 9 AM
    cron.schedule("0 9 * * *", () => {
      console.log("Running scheduled task at 9 AM to generate raid suggestions.");
      generateRaidSuggestions(bot, chatId);
    });
  });
}

export default setupAutomaticRaidRoutes;
