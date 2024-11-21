import TelegramBot from "node-telegram-bot-api";
import { repostLatestRaid }  from "../controllers/repostRaidController";

function setupRepostRaidRoutes(bot:TelegramBot) {
  bot.onText(/\/repostraid/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    await repostLatestRaid(bot, chatId, userId);
  });
}

export default setupRepostRaidRoutes;