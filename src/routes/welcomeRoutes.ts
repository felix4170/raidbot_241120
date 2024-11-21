import TelegramBot from "node-telegram-bot-api";
import { setGeneralSettings } from "../controllers/groupSettingController";
import GroupSetting from "../models/groupSetting";
import { documentButton } from "../utils/menu";

// Type the msg object using Telegram Bot API typings
interface TelegramMessage {
  chat: {
    id: number;
  };
  from?: {
    id: number;
  };
}

async function setupWelcomeRoutes(bot: TelegramBot) {
  // Command to initialize or retrieve settings
  bot.onText(/\/start/, async (msg: TelegramMessage) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    console.log("Received chat ID:", userId);

    try {
      const existingSettings = await GroupSetting.findOne({ userId });

      if (!existingSettings) {
        await setGeneralSettings(userId);
      }
    } catch (error) {
      console.error(
        `Error fetching or setting group settings for chatId ${userId}:`,
        error
      );
    }

    const gifUrl =
      "https://utlhopsrlqvkucsbjici.supabase.co/storage/v1/object/public/assets/raid.gif";

    // Updated message with instructions on how to use the bot
    const featuresMessage = `
🤖 **How to use @felix_raidbot**:

1️⃣ Add @felix_raidbot to your Telegram group 📲.
2️⃣ Promote to admin 🔑. Permissions as suggested.
3️⃣ Type /raidsettings and click "Adjust Settings" 🛠️.
4️⃣ Do "Onboarding" to get basic information 📖.
5️⃣ Hit "Verify" button on top right & follow guide ✅.
6️⃣ Start first raid with **/raid** followed by the Twitter link 🚀.

🆘 **Need help?** Contact a team member or check the Setup Guide 📖 below for more details.
`;

    const miniAppUrl = `https://t.me/Felix0707bot/felix_raidbot`;

    bot.sendAnimation(chatId, gifUrl, {
      caption: featuresMessage,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Documentation`, // Use icon dynamically
              url: miniAppUrl, // Correct structure for web app
            },
          ],
        ],
      },
    });
  });
}

export default setupWelcomeRoutes;
