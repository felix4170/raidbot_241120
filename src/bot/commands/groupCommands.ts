// bot/commands/groupCommands.js
import TelegramBot from "node-telegram-bot-api";
import Raid from "../../models/raidModel";
import dotenv from "dotenv";
import { getGeneralSettings } from "../../controllers/groupSettingController";
import {
  adjustSettingsMenu,
  generateSettingsHeader,
} from "../../utils/adjustSettingMenu";

dotenv.config();

const handleRaidSettingsCommand = async (
  bot: TelegramBot,
  chatId: any,
  chatType: string,
  userId: any
) => {
  // Fetch the latest raid for the specified chatId
  const lastRaid = await Raid.findOne({ chatId }).sort({ createdAt: -1 });

  // Use default values if there is no raid data available
  const smashes = lastRaid?.smashes || 0;

  const settings = await getGeneralSettings(userId);
  const header = generateSettingsHeader(settings, smashes);

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "⚙️Adjust Settings",
          url: process.env.MiniAppUrl,
        },
      ],
    ],
  };

  // const keyboard = chatType === 'private'
  //   ? {
  //     // Web App button for private chat
  //     inline_keyboard: [
  //       [
  //         {
  //           text: "⚙️Adjust Settings",
  //           web_app: { url: miniAppUrl }
  //         }
  //       ]
  //     ]
  //   }
  //   : {
  //     // Regular URL button for group chat
  //     inline_keyboard: [
  //       [
  //         {
  //           text: "⚙️Adjust Settings",
  //           url: miniAppUrl
  //         }
  //       ]
  //     ]
  //   };

  // // Send a message with the Web App button
  bot.sendMessage(chatId, `${header}`, {
    reply_markup: keyboard,
  });
};
export { handleRaidSettingsCommand };
