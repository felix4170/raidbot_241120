import  GroupSetting  from "../models/groupSetting";
import  RaidMessage  from "../models/messageModel"; // Adjusted import for TypeScript
import  Raid  from "../models/raidModel"; // Adjusted import for TypeScript
import  TelegramBot  from 'node-telegram-bot-api'; // Import the correct Telegram bot type

interface Raid {
  link: string;
  repostCount: number;
  status: string;
  target: string;
  startTime: string;
  duration: number;
  likes: number;
  retweets: number;
  comments: number;
  smashes: number;
  chatId: any;
  createdAt: Date;
}

interface GroupSettingType {
  repostCount: number;
  tweetPreview: boolean;
}

async function repostLatestRaid(bot: TelegramBot, chatId: any, userId: any) {
  try {
    // Fetch the group settings from the database
    const settings = await GroupSetting.findOne({ userId });
    if (!settings) {
      bot.sendMessage(chatId, "Group settings not found.");
      return;
    }

    // Check if the user is an admin
    const isAdmin = await bot
      .getChatMember(chatId, userId)
      .then((member) => member.status === "administrator" || member.status === "creator")
      .catch((error) => {
        console.error("Error checking admin status:", error);
        bot.sendMessage(chatId, "Error checking admin status. Please try again.");
        return false;
      });

    if (!isAdmin) {
      bot.sendMessage(chatId, "Only admins can repost raids.");
      return;
    }

    // Fetch the latest raid from the database
    const latestRaid = await Raid.findOne({ chatId }).sort({ createdAt: -1 });
    if (!latestRaid) {
      bot.sendMessage(chatId, "No active raids found.");
      return;
    }

    console.log("====================================");
    console.log(latestRaid, "latest raid");
    console.log("====================================");

    // Check current repost count against the limit
    if (settings.repostCount <= 0) {
      bot.sendMessage(chatId, "Reposting is disabled.");
      return;
    }

    // Assuming you have a property in the latestRaid to track repost count
    if (latestRaid.repostCount >= settings.repostCount) {
      bot.sendMessage(chatId, "Maximum repost limit reached.");
      return;
    }

    // Update the status of the raid to 'active' if it's not already
    if (latestRaid.status !== "active") {
      latestRaid.status = "active";
      await latestRaid.save();
    }

    latestRaid.repostCount = (latestRaid.repostCount || 0) + 1; // Increment repost count
    await latestRaid.save(); // Save updated repost count

    // Fetch the latest raid message
    const raidMessageApi = await RaidMessage.findOne().sort({ createdAt: -1 });
    const messageContent = `🚀 **Reposting latest raid 🚀\n ${latestRaid.link}\n\n💥 Repost Count: ${latestRaid.repostCount}/${settings.repostCount}✅   \n\n📌 Target: ${latestRaid.target}\n⏰ Start Time: ${latestRaid.startTime}\n⏳ Duration: ${latestRaid.duration} minutes\n📊 Status: ${latestRaid.status}\n\n💬 \n🎯 Likes: ${latestRaid.likes}\n🔁 Retweets: ${latestRaid.retweets}\n💬 Comments: ${latestRaid.comments}\n💥 Smashes: ${latestRaid.smashes}\n\n🔥 Let's make this raid active and reach our target! 🔥`;

    // Send the message with or without the preview based on settings
    if (settings.tweetPreview === false) {
      bot.sendMessage(chatId, messageContent, {
        disable_web_page_preview: true,
        reply_to_message_id: raidMessageApi?.messageId as unknown as number,
      });
    } else {
      bot.sendMessage(chatId, messageContent);
    }
  } catch (error) {
    console.error("Error in repostLatestRaid:", error);
    bot.sendMessage(chatId, "An error occurred while reposting the raid. Please try again.");
  }
}

export { repostLatestRaid };
