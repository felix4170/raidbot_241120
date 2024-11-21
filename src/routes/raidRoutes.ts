import  GroupSetting  from "../models/groupSetting";
import  RaidMessage  from "../models/messageModel";
import  Raid  from "../models/raidModel";
import { startRaid, endRaid } from "../controllers/raidController";
import { generateStartRaidButton } from "../utils/menu";
import axios from "axios";
import { twitterClient } from "../config/apiConfig";
import path from "path";

async function setupRaidRoutes(bot: any) {
  // Command to start a raid on a given X post link
  bot.onText(/\/raid (.+)/, async (msg: any, match: RegExpExecArray | null) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const userId = msg.from?.id;

    // Check if the user is an admin
    const admins = await bot.getChatAdministrators(chatId);
    const isAdmin = admins.some((admin:any) => admin.user.id === userId);

    if (!isAdmin) {
      bot.sendMessage(chatId, "🚫 Only admins can initiate a raid.");
      return; // Stop execution if the user is not an admin
    }

    const raidLink = match ? match[1] : "";
    const settings = await GroupSetting.findOne({ userId });

    // Fetch post details with error handling
    let postDetails;
    try {
      postDetails = await fetchPostDetails(raidLink);
    } catch (error) {
      bot.sendMessage(chatId, "⚠️ Error fetching post details. Please try again later.");
      console.error("Error fetching post details:", error);
      return; // Stop if unable to fetch post details
    }

    // Toggle the chat lock setting
    const updatedSettings = await GroupSetting.findOneAndUpdate(
      { userId },
      { chatLocked: true },
      { new: true }
    );

    const lockStatus = updatedSettings?.chatLocked ? "LOCKED" : "UNLOCKED";

    // Fetch the latest message in this chat with the same `messageId`
    const raidMessageApi = await Raid.findOne({
      chatId: chatId,
    });
    console.log(raidMessageApi, "raid message api");

    const gifUrl =
      raidMessageApi?.gifUrl ||
      "https://utlhopsrlqvkucsbjici.supabase.co/storage/v1/object/public/assets/raid.gif";

    let icon = raidMessageApi?.icon || "🦈";

    // Generate the raid message with post details
    const raidMessage = generateRaidMessage(
      postDetails,
      raidLink,
      lockStatus,
      settings?.target ?? 100, // Provide a default value (e.g., 0) if target is undefined
      icon
    );

    let sentMessage;

    // Send the raid link message based on the tweetPreview setting
    if (settings && settings.tweetPreview === false) {
      sentMessage = bot.sendAnimation(chatId, gifUrl, {
        caption: raidMessage,
        reply_markup: generateStartRaidButton(bot, chatId, raidLink),
        disable_web_page_preview: true,
      });
      console.log(sentMessage, "sentMessage");
    } else {
      // Sending animation with caption and reply_markup when tweetPreview is true
      bot.sendAnimation(chatId, gifUrl, {
        caption: raidMessage,
        reply_markup: generateStartRaidButton(bot, chatId, raidLink),
      });
    }

    // Save the message ID to the database
    const raidMessageData = new RaidMessage({
      chatId: chatId,
      userId: userId,
      messageId: messageId, // Use the actual message ID from the Telegram response
      raidLink: raidLink, // Optionally save the raid link
      gifUrl: gifUrl,
      icon: icon,
      host: [msg.from.first_name], // Save first_name in an array format
      status: "Started",
    });

    console.log(raidMessageData, "raid message data");

    await raidMessageData.save(); // Save the message in the database
  });

  bot.onText(/\/endraid/, (msg: any) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const messageId = msg.message_id;
    endRaid(bot, chatId,messageId,userId);
  });
}

// Generate a formatted raid message with proper markdown escaping
const generateRaidMessage = (
  postDetails: any,
  raidLink: string,
  lockStatus: string,
  targetSmashes: number,
  icon: string
): string => {
  return `
${icon} Sharks sensed prey…${icon}

🔗 *Post Link:* [Click Here](${raidLink})\n
❤️ *Likes:* ${postDetails.likes || 0}
🔄 *Retweets:* ${postDetails.retweets || 0}
💬 *Comments:* ${postDetails.comments || 0}\n
🎯${targetSmashes} SMASHES\n
🔥RAID NOW🔥\n
🔒Chat is ${lockStatus}🔒\n
Powered by FreedomShillingBot\n
`;
};

// Function to fetch post details from Twitter API
const fetchPostDetails = async (raidLink: string) => {
  const postId = extractPostId(raidLink); // Extract post ID from the link

  if (!postId) {
    throw new Error("Invalid raid link.");
  }

  try {
    const tweet = await twitterClient.v2.get(`tweets/${postId}`, {
      // Fields for tweet details
      "tweet.fields": "created_at,public_metrics,entities,attachments",

      // Expansions for associated data (author and media)
      expansions: "author_id,attachments.media_keys",

      // Fields for user details
      "user.fields": "name,username,profile_image_url",

      // Fields for media details
      "media.fields": "media_key,url,preview_image_url,type",
    });

    // Extracting the tweet data, user, and media
    const tweetData = tweet.data; // Contains tweet details
    const includes = tweet.includes; // Contains expanded user and media data

    // Extract user details from 'includes'
    const user = includes.users ? includes.users[0] : null; // Assumes there's only one author
    const media = includes.media || []; // List of media associated with the tweet

    // Output user details
    if (user) {
      console.log("User Details:");
      console.log(`Name: ${user.name}`);
      console.log(`Username: @${user.username}`);
      console.log(`Profile Image URL: ${user.profile_image_url}`);
    }

    // Output tweet details
    console.log("Tweet Details:");
    console.log(`Text: ${tweetData.text}`);
    console.log(`Created At: ${tweetData.created_at}`);
    console.log(`Likes: ${tweetData.public_metrics.like_count}`);
    console.log(`Retweets: ${tweetData.public_metrics.retweet_count}`);
    console.log(`Replies: ${tweetData.public_metrics.reply_count}`);
    console.log(`Quote Tweets: ${tweetData.public_metrics.quote_count}`);

    // Output media details (if any)
    if (media.length > 0) {
      console.log("Media attached to the tweet:");
      media.forEach((mediaItem:any, index:any) => {
        console.log(`Media ${index + 1}:`);
        console.log(`Type: ${mediaItem.type}`);
        console.log(
          `Media URL: ${mediaItem.url || mediaItem.preview_image_url}`
        );
      });
    } else {
      console.log("No media attached to this tweet.");
    }

    return {
      likes: tweetData.public_metrics.like_count,
      retweets: tweetData.public_metrics.retweet_count,
      comments: tweetData.public_metrics.reply_count,
    };
  } catch (error) {
    console.error("Error fetching tweet details:", error);
    
    throw new Error("Could not fetch post details.");
  }
};

// Function to extract post ID from the tweet link
const extractPostId = (raidLink: string): string | null => {
  const regex = /status\/(\d+)/; // Regex to extract tweet ID
  const match = raidLink.match(regex);
  return match ? match[1] : null;
};

export default setupRaidRoutes;
