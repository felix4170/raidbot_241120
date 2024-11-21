// Import necessary modules and classes
import TelegramBot from "node-telegram-bot-api";
import { twitterClient } from "../config/apiConfig";
import { endRaid } from "../controllers/raidController";
import groupSetting from "../models/groupSetting"; // Adjust the import based on how you export from groupSetting.ts
import RaidMessage from "../models/messageModel"; // Adjust as needed
import Raid from "../models/raidModel"; // Adjust as needed
import { generateStartRaidButton } from "../utils/menu";

function setupJointRaidRoutes(bot: TelegramBot) {
  let partnerChats: string[] = []; // Dynamic list of partner chats

  // Helper function to check if a user is an admin
  async function isAdmin(bot: TelegramBot, chatId: any, userId: any) {
    console.log("====================================");
    console.log(userId, "user id ");
    console.log("====================================");
    try {
      const member = await bot.getChatMember(chatId, userId);

      return member.status === "administrator" || member.status === "creator";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  // Helper function to get all admins in a chat
  async function getAllAdmins(bot: TelegramBot, chatId: any) {
    try {
      const admins = await bot.getChatAdministrators(chatId);

      // Extract admin usernames and IDs
      return admins.map((admin: any) => ({
        id: admin.user.id,
        username: admin.user.username
          ? admin.user.username
          : admin.user.first_name || null,
      }));
    } catch (error) {
      console.error("Error retrieving admins:", error);
      return [];
    }
  }

  // Command to set partner chats for raids
  bot.onText(/\/setPartnerChats (.+)/, async (msg: any, match: any) => {
    const chatId = msg.chat.id;

    // Fetch current admins in the chat
    const currentAdmins = await getAllAdmins(bot, chatId);
    console.log("====================================");
    console.log(currentAdmins, "current admins");
    console.log("====================================");

    for (const admin of currentAdmins) {
      // Ensure the user executing this command is an admin
      if (!(await isAdmin(bot, chatId, admin.id))) {
        return bot.sendMessage(chatId, "Only admins can set partner chats.");
      }
    }

    // Split usernames from the command arguments
    const usernames = match[1]
      .split(" ")
      .map((username: any) => username.trim());
    console.log("====================================");
    console.log(usernames, "usernames");
    console.log("====================================");

    // Retrieve chat IDs for each provided username
    partnerChats = [];
    for (const username of usernames) {
      // Check if there is an admin in currentAdmins with the matching username
      const admin = currentAdmins.find(
        (admin: any) => admin.username === username
      );
      console.log("====================================");
      console.log(admin, "admin");
      console.log("====================================");

      if (admin) {
        console.log("====================================");
        console.log("entereed admin");
        console.log("====================================");
        try {
          // Add the admin's ID to partnerChats
          partnerChats.push(admin.username);
          console.log("====================================");
          console.log(admin.id, `added to partnerChats for ${username}`);
          console.log("====================================");
          console.log(partnerChats, "parnterchats");
        } catch (error) {
          console.error(`Error retrieving user ID for ${username}:`, error);
          bot.sendMessage(chatId, `Could not find user ID for @${username}`);
        }
      } else {
        bot.sendMessage(chatId, `@${username} is not an admin in this chat.`);
      }
    }

    // Confirm partner chats have been updated
    bot.sendMessage(
      chatId,
      "Partner chats updated successfully with usernames."
    );
  });

  // Command to start a joint raid
  bot.onText(/\/jointRaid (.+)/, async (msg: any, match: any) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const raidLink = match[1];
    const messageId = msg.message_id;

    // Check if partnerChats is empty
    if (partnerChats.length === 0) {
      return bot.sendMessage(
        chatId,
        "No partner chats set. Please set partners before starting a joint raid."
      );
    } else {
      // Check if the user is an admin
      const admins = await bot.getChatAdministrators(chatId);
      const isAdmin = admins.some((admin) => admin.user.id === userId);

      if (!isAdmin) {
        bot.sendMessage(chatId, "🚫 Only admins can initiate a raid.");
        return; // Stop execution if the user is not an admin
      }

      const raidLink = match[1];
      const settings = await groupSetting.findOne({ userId });

      // Fetch post details with error handling
      let postDetails;
      try {
        postDetails = await fetchPostDetails(raidLink);
      } catch (error) {
        bot.sendMessage(
          chatId,
          "⚠️ Error fetching post details. Please try again later."
        );
        console.error("Error fetching post details:", error);
        return; // Stop if unable to fetch post details
      }

      // Toggle the chat lock setting
      const updatedSettings = await groupSetting.findOneAndUpdate(
        { userId },
        { chatLocked: true },
        { new: true }
      );

      const lockStatus =
        updatedSettings?.chatLocked === true ? "LOCKED" : "UNLOCKED";

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
        settings?.target
      );

      let sentMessage;

      // Assuming generateStartRaidButton returns a Promise<InlineKeyboardMarkup>
      const startRaidButton = await generateStartRaidButton(
        bot,
        chatId,
        raidLink
      );

      // Send the raid link message based on the tweetPreview setting
      if (settings && settings.tweetPreview === false) {
        sentMessage = bot.sendAnimation(chatId, gifUrl, {
          caption: raidMessage,
          reply_markup: startRaidButton, // Use the resolved value here
        });
        console.log(sentMessage, "sentMessage");
      } else {
        // Sending animation with caption and reply_markup when tweetPreview is true
        bot.sendAnimation(chatId, gifUrl, {
          caption: raidMessage,
          reply_markup: startRaidButton, // Use the resolved value here
          // reply_to_message_id: messageId, // Reply to the original message
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
        host: partnerChats,
        status: "Started",
      });

      console.log(raidMessageData, "raid message data");

      await raidMessageData.save(); // Save the message in the database
    }
  });

  // Command to end a joint raid
  bot.onText(/\/endJointRaid/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const messageId = msg.message_id;
    endRaid(bot, chatId, messageId, userId);
  });

  // Generate a formatted raid message with proper markdown escaping
  const generateRaidMessage = (
    postDetails: any,
    raidLink: any,
    lockStatus: any,
    targetSmashes: any
  ) => {
    return `

🦈Sharks sensed prey…🦈

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
  const fetchPostDetails = async (raidLink: any) => {
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
        media.forEach((mediaItem: any, index: any) => {
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
  const extractPostId = (raidLink: any) => {
    const regex = /status\/(\d+)/; // Regex to extract tweet ID
    const match = raidLink.match(regex);
    return match ? match[1] : null;
  };
}

export default setupJointRaidRoutes;
