import TelegramBot,{  CallbackQuery } from "node-telegram-bot-api";
import {
  endRaid,
  startRaid,
  summaryRaid,
} from "../../controllers/raidController";



async function handleRaidInteractions(bot: TelegramBot, query: CallbackQuery) {
  const msg = query.message;
  const chatId = query.message?.chat.id;
  const data = query.data;
  const userId = query.from.id;

  console.log(data, "data");

  // Split the data to get both chatId and raidLink
  if (data?.startsWith("start_raid_")) {
    // Check if the user who triggered the raid is an admin
    const chatMember = await bot.getChatMember(chatId!, userId);

    if (chatMember.status !== "administrator" && chatMember.status !== "creator") {
      return bot.answerCallbackQuery(query.id, {
        text: "Only admins can start a raid.",
        show_alert: true,
      });
    }

    const adminUsername = chatMember.user.first_name || "an admin"; // Use username if available

    startRaid(bot, chatId!, adminUsername, query, userId); // Pass raidLink to startRaid function
  } else if (data === "end_raid") {
    const chatMember = await bot.getChatMember(chatId!, userId);

    if (chatMember.status !== "administrator" && chatMember.status !== "creator") {
      return bot.answerCallbackQuery(query.id, {
        text: "Only admins can end a raid.",
        show_alert: true,
      });
    }
    endRaid(bot, chatId!, query, userId);
  }

  // Handle the close GIF action
  else if (data?.startsWith("close_")) {
    // Delete the message (GIF message)
    bot.deleteMessage(chatId!, msg!.message_id).catch((err) => {
      console.error("Error deleting GIF message:", err);
    });

    // Notify user that the GIF has been removed (optional)
    bot.answerCallbackQuery(query.id, {
      text: "Message removed!",
      show_alert: false,
    });
  } else if (data?.startsWith("summary_raid_")) {
    summaryRaid(bot, chatId!, query, userId);
  }

}

export { handleRaidInteractions };
