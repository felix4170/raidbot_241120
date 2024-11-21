import TelegramBot from "node-telegram-bot-api";
import groupSetting from "../models/groupSetting";

const MUTE_RESPONSE_RATE = 3 * 60 * 1000; // 3 minutes
const MUTE_MESSAGE = "The bot is currently muted, so responses may be limited.";
const LIMITED_ASSISTANCE_MESSAGE =
  "Bot is muted. Limited assistance is available right now.";
const LOCKED_CHAT_MESSAGE =
  "The chat is currently locked. No one can send messages.";
const HELP_MESSAGE =
  "Here's a list of commands you can use: /start, /settings, /mute, /unmute...";

function setupMessageRoutes(bot: TelegramBot) {
  // Type definition for lastResponseTime
  const lastResponseTime: { [key: number]: number } = {};

  // Function to handle muted responses
  const handleMutedResponse = (chatId: number) => {
    const now = Date.now();
    if (
      !lastResponseTime[chatId] ||
      now - lastResponseTime[chatId] > MUTE_RESPONSE_RATE
    ) {
      lastResponseTime[chatId] = now;
      bot.sendMessage(chatId, MUTE_MESSAGE);
    } else {
      bot.sendMessage(chatId, LIMITED_ASSISTANCE_MESSAGE);
    }
  };

  // Function to handle locked chat
  const handleLockedChat = (chatId: number) => {
    bot.sendMessage(chatId, LOCKED_CHAT_MESSAGE);
  };

  // Function to handle the help command
  const handleHelpCommand = (chatId: number) => {
    bot.sendMessage(chatId, HELP_MESSAGE);
  };

  // Function to check if a command is allowed
  const isCommandAllowed = (msg: TelegramBot.Message) => {
    return ["/unmute", "/unlockchat", "/raidsettings"].includes(msg.text || "");
  };

  // Main message handling
  bot.on("message", async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    console.log("dddddddddddddddddddddddddddddddd");

    try {
      // Retrieve current settings
      const settings = await groupSetting.findOne({ chatId });

      if (settings) {
        // Check if the bot is muted
        if (settings.mute) {
          if (!isCommandAllowed(msg)) {
            handleMutedResponse(chatId);
            return; // End processing if muted
          }
        }

        // Check if the chat is locked
        if (settings.chatLocked) {
          if (!isCommandAllowed(msg)) {
            handleLockedChat(chatId);
            return; // Prevent further message processing
          }
        }
      }

      // Ensure msg.text is defined before calling includes
      if (msg.text && msg.text.includes("help")) {
        handleHelpCommand(chatId);
      }

      // Further processing for other messages and commands can go here
    } catch (error) {
      console.error(`Error processing message from chat ${chatId}:`, error);
      bot.sendMessage(
        chatId,
        "An error occurred while processing your request. Please try again later."
      );
    }
  });
}

export default setupMessageRoutes;
