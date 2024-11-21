import TelegramBot from "node-telegram-bot-api";
import RaidMessage from "../models/messageModel";
import Raid from "../models/raidModel";

async function setupCustomMediaRoutes(bot:TelegramBot) {
  // Command to initiate the custom media setting process
  bot.onText(/\/setgif/, async (msg:any) => {
    const chatId = msg.chat.id;

    // Send prompt message instructing the user to reply with a GIF or video
    const promptMessage = await bot.sendMessage(
      chatId,
      "Please reply to this message with a GIF or video to set it as the custom media for raids."
    );

    // Listen for replies to the prompt message with media
    bot.onReplyToMessage(chatId, promptMessage.message_id, async (replyMsg:any) => {

      // Check if the reply contains a GIF or video
      let fileId; 
      if (replyMsg.animation) {  // Check for GIF
        fileId = replyMsg.animation.file_id;
      } else if (replyMsg.video) {  // Check for video
        fileId = replyMsg.video.file_id;
      } else {
        // If the reply does not contain a GIF or video, notify the user
        return bot.sendMessage(chatId, "Please reply with a GIF or video to set it as custom media.");
      }

      // Store the custom media file_id in the database for this chat
      try {
        const updateResponse = await Raid.updateOne(
          { chatId },
          { $set: { gifUrl: fileId } },
          { upsert: true } // Creates a new entry if it doesn't exist
        );
        console.log("Database update response:", updateResponse);

        if (updateResponse.modifiedCount > 0 || updateResponse.upsertedCount > 0) {
          bot.sendMessage(chatId, `Gif Updated!`);
        } else {
          bot.sendMessage(chatId, "Failed to set custom media. Please try again.");
        }
      } catch (error) {
        console.error("Error storing custom media in database:", error);
        bot.sendMessage(chatId, "Error saving custom media. Please contact support.");
      }
    });
  });

  bot.onText(/\/seticon/, async (msg:any) => {
    const chatId = msg.chat.id;
    console.log(`Received /seticon command in chat ID: ${chatId}`);
  
    // Send prompt message instructing the user to reply with an icon
    const promptMessage = await bot.sendMessage(
      chatId,
      "Please reply to this message with an icon (e.g., 🦈) to set it as the icon for raids."
    );
    console.log(`Prompt message sent with ID: ${promptMessage.message_id}`);
  
    // Listen for replies to the prompt message with text
    bot.onReplyToMessage(chatId, promptMessage.message_id, async (replyMsg:any) => {
      console.log(`Received reply to /seticon prompt in chat ID: ${chatId}`);
      console.log("Reply message details:", replyMsg);
  
      // Check if the reply contains text (assuming it's the icon)
      let icon;
      if (replyMsg.text) {  // Check for text icon
        icon = replyMsg.text;
        console.log(`Icon received: ${icon}`);
      } else {
        // If the reply does not contain text, notify the user
        console.log("Reply did not contain text for an icon.");
        return bot.sendMessage(chatId, "Please reply with a text-based icon (e.g., 🦈).");
      }
  
      // Store the custom icon in the database for this chat
      try {
        const updateResponse = await Raid.updateOne(
          { chatId },
          { $set: { "icon": icon } },
          { upsert: true } // Creates a new entry if it doesn't exist
        );

         await RaidMessage.updateOne(
          { chatId },
          { $set: { "icon": icon } },
          { upsert: true } // Creates a new entry if it doesn't exist
        );
  
        if (updateResponse.modifiedCount > 0 || updateResponse.upsertedCount > 0) {
          bot.sendMessage(chatId, `Icon updated to ${icon}!`);
          console.log("Custom icon stored in database successfully.");
        } else {
          bot.sendMessage(chatId, "Failed to set custom icon. Please try again.");
          console.log("Custom icon not stored. No documents were modified or inserted.");
        }
      } catch (error) {
        console.error("Error storing custom icon in database:", error);
        bot.sendMessage(chatId, "Error saving custom icon. Please contact support.");
      }
    });
  });
  
}



export default setupCustomMediaRoutes 
