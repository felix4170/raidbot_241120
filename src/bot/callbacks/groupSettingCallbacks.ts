// import { TelegramBot, CallbackQuery } from "node-telegram-bot-api";
import TelegramBot from "node-telegram-bot-api";
import { CallbackQuery } from "node-telegram-bot-api";
// Adjust the import if you use a different Telegram bot library
import { getGeneralSettings } from "../../controllers/groupSettingController";
import GroupSetting from "../../models/groupSetting";
import { adjustSettingsMenu, targetMenu } from "../../utils/adjustSettingMenu";

// Define the structure for the callback query message
//

export const handleSettingsCallback = async (
  bot: TelegramBot,
  query: CallbackQuery
) => {
  const chatId = query.message.chat.id;
  const data = query.data || "";
  console.log(data, "data");

  const settings = await getGeneralSettings(chatId);

  // Check if settings is an object before accessing properties
  if (typeof settings !== "object" || !settings) {
    bot.sendMessage(chatId, "No settings found for this group.");
    return;
  }

  if (data.startsWith("targets_")) {
    await bot.sendMessage(
      chatId,
      "⚙️ Raider Options > Default \n Targets\nYou can specify the number of likes, retweets, replies, views and \n bookmarks that a tweet must have \n to be considered a valid target \n below.",
      targetMenu(settings)
    );
  } else if (data === "back_to_settings") {
    await bot.sendMessage(
      chatId,
      "⚙️ Raider Options\nAdjust your group settings:",
      adjustSettingsMenu(settings)
    );
  } else if (data === "back_to_settings") {
    bot.sendMessage(chatId, "Back to main settings menu:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Adjust Settings", callback_data: "adjust_settings" }],
        ],
      },
    });
  }
};
