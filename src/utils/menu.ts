import TelegramBot, {
  InlineKeyboardMarkup,
  SendMessageOptions,
} from "node-telegram-bot-api";
import RaidMessage from "../models/messageModel";

// Extract post ID from raid link
const extractPostId = (raidLink: string) => {
  const regex = /status\/(\d+)/; // Regex to extract tweet ID
  const match = raidLink.match(regex);
  return match ? match[1] : null;
};

// Generate start raid button
const generateStartRaidButton = async (
  bot: TelegramBot,
  chatId: any,
  raidLink: string
) => {
  try {
    // Fetch the latest raid message
    const raidMessageApi = await RaidMessage.findOne().sort({ createdAt: -1 });
    const postId = extractPostId(raidLink);

    // Default to a rocket icon if no icon is found
    const icon = raidMessageApi?.icon || "🚀";

    // Create the reply markup with buttons
    const replyMarkup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: `${icon} Raid ${icon}`,
            callback_data: `start_raid_${chatId}`,
          },
        ],
        [
          {
            text: "❌ Close",
            callback_data: `close_${chatId}`,
          },
        ],
      ],
    };

    // Send message with the button
    await bot.sendMessage(chatId, "🔥🔥 Choose an action for Raid 🔥🔥", {
      reply_markup: replyMarkup,
    } as SendMessageOptions);

    return replyMarkup;
  } catch (error) {
    console.error("Error generating start raid button:", error);
    throw error;
  }
};

// Generate documentation button
const documentButton = async (bot: TelegramBot, chatId: any) => {
  try {
    const miniAppUrl = `https://t.me/Felix0707bot/felix_raidbot`;

    // Create the reply markup with buttons
    const replyMarkup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: "Documentation",
            url: miniAppUrl,
          },
        ],
      ],
    };

    return replyMarkup;
  } catch (error) {
    console.error("Error generating documentation button:", error);
    throw error;
  }
};

export { generateStartRaidButton, documentButton };
