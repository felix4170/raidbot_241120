import TelegramBot, { Message } from 'node-telegram-bot-api';
import { pinRaid, unpinRaid } from "../controllers/togglePinController";

/**
 * Sets up routes for raid-related commands.
 * @param {TelegramBot} bot - The bot instance.
 */
function setupTogglePinRoutes(bot: TelegramBot) {
  // Command to pin a raid
  bot.onText(/\/pinraid/, async (msg: Message) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;


    if (userId === undefined) {
      throw new Error("userId is undefined");
    }
    

    // Check if the user is an admin
    const isAdmin = await bot
      .getChatMember(chatId, userId)
      .then(
        (member) =>
          member.status === "administrator" || member.status === "creator"
      )
      .catch((error) => {
        console.error("Error checking admin status:", error);
        bot.sendMessage(
          chatId,
          "Error checking admin status. Please try again."
        );
        return false;
      });

    if (!isAdmin) {
      bot.sendMessage(chatId, "Only admins can pin raids.");
      return;
    }

    pinRaid(bot, chatId, userId);
  });

  // Command to unpin a raid
  bot.onText(/\/unpinraid/, async (msg: Message) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (userId === undefined) {
      throw new Error("userId is undefined");
    }
    

    // Check if the user is an admin
    const isAdmin = await bot
      .getChatMember(chatId, userId)
      .then(
        (member) =>
          member.status === "administrator" || member.status === "creator"
      )
      .catch((error) => {
        console.error("Error checking admin status:", error);
        bot.sendMessage(
          chatId,
          "Error checking admin status. Please try again."
        );
        return false;
      });

    if (!isAdmin) {
      bot.sendMessage(chatId, "Only admins can unpin raids.");
      return;
    }

    unpinRaid(bot, chatId, userId);
  });
}

export default setupTogglePinRoutes;
