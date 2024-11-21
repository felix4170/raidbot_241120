import TelegramBot from "node-telegram-bot-api";
import { Document } from "mongoose";
import RaidMessage from "../models/messageModel";
import Raid from "../models/raidModel";
import GroupSetting from "../models/groupSetting";

/**
 * Pins the last added raid message in the Telegram chat.
 * @param {TelegramBot} bot - The bot instance.
 * @param {number} chatId - The chat ID.
 * @param {number} userId - The user ID.
 */
async function pinRaid(bot: TelegramBot, chatId: any, userId: any) {
  try {
    // Fetch the last added raid message
    const lastRaid = await Raid.findOne().sort({ createdAt: -1 });

    console.log(lastRaid, "last raid");

    if (!lastRaid) {
      bot.sendMessage(chatId, "No raid message found to pin.");
      return;
    }

    // Fetch the last raid message (similar to pinning behavior)
    const raidMessageApi = await RaidMessage.findOne().sort({ createdAt: -1 });

    // Pin the message
    if (raidMessageApi?.messageId) {
      const messageId = parseInt(raidMessageApi.messageId, 10); // Convert the messageId to a number

      if (!isNaN(messageId)) {
        await bot.pinChatMessage(chatId, messageId);
      } else {
        console.error("Invalid messageId, cannot pin message.");
      }
      // Update the nested raidSettings for raidPinned and pinnedMessageId
      await GroupSetting.updateOne(
        { userId },
        {
          $set: {
            "raidSettings.raidPinned": true,
            "raidSettings.pinnedMessageId": raidMessageApi.messageId,
          },
        }
      );

      bot.sendMessage(chatId, "Raid has been pinned to the chat.");
    } else {
      bot.sendMessage(chatId, "No raid message found to pin.");
    }
  } catch (error) {
    console.error("Error pinning raid message:", error);
    bot.sendMessage(
      chatId,
      "Failed to pin the raid message. Please try again."
    );
  }
}

/**
 * Unpins the currently pinned raid message in the Telegram chat.
 * @param {TelegramBot} bot - The bot instance.
 * @param {number} chatId - The chat ID.
 * @param {number} userId - The user ID.
 */
async function unpinRaid(bot: TelegramBot, chatId: any, userId: any) {
  try {
    const settings = await GroupSetting.findOne({ userId });

    if (settings && settings.raidSettings && settings.raidSettings.raidPinned) {
      // Unpin the message using the pinnedMessageId
      const pinnedMessageId = settings.raidSettings.pinnedMessageId;
      if (pinnedMessageId) {
        await bot.unpinChatMessage(chatId, { message_id: pinnedMessageId });

        // Update the nested raidSettings to reflect unpinned status
        await GroupSetting.updateOne(
          { userId },
          {
            $set: {
              "raidSettings.raidPinned": false,
              "raidSettings.pinnedMessageId": null,
            },
          }
        );

        bot.sendMessage(chatId, "Raid has been unpinned from the chat.");
      } else {
        bot.sendMessage(chatId, "No pinned raid message found.");
      }
    } else {
      bot.sendMessage(chatId, "No raid is currently pinned.");
    }
  } catch (error) {
    console.error("Error unpinning raid message:", error);
    bot.sendMessage(
      chatId,
      "Failed to unpin the raid message. Please try again."
    );
  }
}

export { pinRaid, unpinRaid };
