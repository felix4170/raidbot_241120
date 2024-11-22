// raidController.js
import { twitterClient } from "../config/apiConfig";
import GroupSetting from "../models/groupSetting";
import RaidMessage from "../models/messageModel";
import Raid from "../models/raidModel";
import dotenv from "dotenv";

dotenv.config();
// Store raid progress in a local object
interface RaidProgress {
  raidId: any;
  raidLink: any;
  likes: number;
  comments: number;
  retweets: number;
  smashes: number;
  target: number;
  duration?: NodeJS.Timeout;
  intervalId?: NodeJS.Timeout;
}

const raidProgress: { [chatId: string]: RaidProgress } = {};

// Start a raid with the target link
async function startRaid(
  bot: any,
  chatId: any,
  adminUsername: any,
  query: any,
  userId: any
) {
  // Fetch the group setting for tweet preview
  const settings = await GroupSetting.findOne({ userId });
  // Fetch the last saved message from the database
  const raidMessageApi = await RaidMessage.findOne().sort({ createdAt: -1 }); // Assuming you have a 'createdAt' field to sort by
  let raidLink;
  let messageId;
  let icon;
  if (raidMessageApi) {
    raidLink = raidMessageApi?.raidLink;
    messageId = raidMessageApi?.messageId;
    icon = raidMessageApi?.icon;
  } else {
    console.log("No raid message found");
  }

  if (!settings) return bot.sendMessage(chatId, "Group settings not found.");
  const target = settings?.target || 100; // Default to 100 if not set

  const presetTags =
    settings.raidSettings.presetTags &&
    settings.raidSettings.presetTags.length > 0
      ? settings.raidSettings.presetTags.join(", ")
      : "No Tags";

  // Set default target if it doesn't exist
  if (!settings.target) {
    settings.target = 100; // Set a default target, for example
    await GroupSetting.updateOne({ userId }, { target: settings.target });
  }

  const tweetMetrics = await fetchPostDetails(raidLink);

  // Initialize raid tracking for the chat
  const raid = new Raid({
    chatId,
    link: raidLink,
    host: Array.isArray(raidMessageApi?.host)
      ? raidMessageApi.host
      : raidMessageApi?.host
      ? [raidMessageApi?.host]
      : [],
    startTime: Date.now(),
    duration: 10, // Example duration, modify as needed
    status: "active",
    participants: [],
    likes: tweetMetrics.likes,
    comments: tweetMetrics.comments,
    retweets: tweetMetrics.retweets,
    smashes: 0,
    target, // Set target from group settings
    presetTags: [], // Initialize an empty array
  });

  await raid.save(); // Save the raid to the database
  raidProgress[chatId] = {
    raidId: raid._id, // Store the database ID for easy access
    raidLink,
    likes: tweetMetrics.likes,
    comments: tweetMetrics.comments,
    retweets: tweetMetrics.retweets,
    smashes: 0,
    target,
  };

  console.log("====================================");
  console.log(raidProgress[chatId]);
  console.log("====================================");

  const lockStatus = settings.chatLocked === true ? "LOCKED" : "UNLOCKED";

  // Convert host array to a formatted string with each host separated by commas
  const hosts = raid.host.join(", "); // Join hosts array into a comma-separated string

  // Message to announce the raid
  const raidMessage = `📢 🟢 Live Raid Stats 🟢 \n
📝 Raid Link: ${raidLink}\n
@${hosts}  just started the raid!\n
🎯 Target: ${target}
🏷️ Tags: ${presetTags ? presetTags : "No Tags"}\n
💥 Progress: ${raid.smashes}/${target} ✅\n
🔒Chat is ${lockStatus}🔒
`;

  // Always disable tweet preview
  bot.sendMessage(chatId, raidMessage, {
    disable_web_page_preview: true,
    reply_to_message_id: query.message.message_id,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `🦈 Smash 🦈`, // Shark icon for "Start Raid"
            url: process.env.MiniAppUrl,
          },
        ],
      ],
    },
  });
}

// smash raid
async function smashRaid(
  bot: any,
  chatId: any,
  userID: any,
  userName: string,
  messageId: any
) {
  console.log("Entered smashRaid function.");

  const raidProgressData = raidProgress[chatId];

  // Check if there's an active raid for the chat
  if (!raidProgressData) {
    console.error("No active raid data found for chatId:", chatId);
    return bot.answerCallbackQuery(userID, { text: "No active raid found." });
  }

  try {
    // Fetch post details from Twitter API
    const tweetMetrics = await fetchPostDetails(raidProgressData.raidLink);
    console.log("Tweet metrics fetched successfully:", tweetMetrics);

    // Update smash count in the database and raidProgress object
    raidProgressData.smashes += 1;
    const updatedSmashes = raidProgressData.smashes;

    // Update the raid in the database
    await Raid.updateOne(
      { _id: raidProgressData.raidId },
      {
        $inc: { smashes: 1 },
        $push: {
          participants: {
            username: userName,
            timestamp: new Date(), // add a timestamp
          },
        },
      }
    );

    // Send a message with the updated stats
    const smashMessage = `
🟢 Live Raid Stats 🟢\n 
🎉 @${userName} just smashed the raid!\n
💥 Smash Progress: ${updatedSmashes}/${raidProgressData.target} ✅\n
👍 Likes: ${tweetMetrics.likes}
🔁 Retweets: ${tweetMetrics.retweets}
💬 Comments: ${tweetMetrics.comments}
    `;

    const gifUrl =
      "https://utlhopsrlqvkucsbjici.supabase.co/storage/v1/object/public/assets/raid.gif";

    bot.sendAnimation(chatId, gifUrl, {
      caption: smashMessage,
      disable_web_page_preview: false,
      reply_to_message_id: messageId,
    });

    // Notify the user who clicked the button
    bot.answerCallbackQuery(userID, { text: "Raid smashed!" });

    // Set an interval for periodic raid updates, if not already set
    if (!raidProgress[chatId].intervalId) {
      raidProgress[chatId].intervalId = setInterval(() => {
        updateRaidProgress(bot, chatId, messageId, userID);
      }, 60 * 1000); // Every 1 minute
    }
  } catch (error) {
    console.error("Error handling smash raid:", error);
    bot.answerCallbackQuery(userID, { text: "Could not update raid stats." });
  }
}

// update raid progress
async function updateRaidProgress(
  bot: any,
  chatId: any,
  messageId: any,
  userID: any
) {
  const raid = raidProgress[chatId];
  if (!raid) {
    bot.sendMessage(chatId, "Raid not found. Please start a new raid.");
    return;
  }

  // Fetch the latest tweet metrics
  try {
    const tweetMetrics = await fetchPostDetails(raid.raidLink);

    // Update the smashes and tweet metrics in the raidProgress object
    raid.likes = tweetMetrics.likes;
    raid.retweets = tweetMetrics.retweets;
    raid.comments = tweetMetrics.comments;

    // Update the smashes count in GroupSetting
    await GroupSetting.updateOne({ userID }, { smashes: raid.smashes });

    console.log(`Updated raid count in memory for chat ${chatId}`);

    // Update the raid in the database using chatId
    await Raid.findOneAndUpdate(
      { chatId, status: "active" }, // Find the raid using chatId (and assuming the raid is active)
      {
        $inc: { smashes: 1 }, // Increment smashes in the database
        likes: raid.likes, // Update the likes
        retweets: raid.retweets, // Update the retweets
        comments: raid.comments, // Update the comments
      },
      { new: true } // Return the updated document
    );

    // Send an update message with the latest metrics
    const progressMessage = `
    🟢 Raid Updates 🟢\n 
💥 Smash Progress: ${raid.smashes}/${raid.target} ✅\n
👍 Likes: ${raid.likes}
🔁 Retweets: ${raid.retweets}
💬 Comments: ${raid.comments}
    `;

    const gifUrl =
      "https://utlhopsrlqvkucsbjici.supabase.co/storage/v1/object/public/assets/raid.gif";

    bot.sendAnimation(chatId, gifUrl, {
      caption: progressMessage,
      disable_web_page_preview: false,
      reply_to_message_id: messageId,
    });

    // Notify the user who clicked the button
    bot.answerCallbackQuery(userID, { text: "Raid progress updated!" });

    // Check if the target has been reached
    if (raid.smashes >= raid.target) {
      bot.sendMessage(chatId, "🎉 Target reached! Great job, everyone!");
      endRaid(bot, chatId, messageId, userID); // Optionally end the raid when the target is reached
    }
  } catch (error) {
    console.error("Error updating raid progress:", error);
    // bot.answerCallbackQuery(query.id, { text: "Could not update raid stats." });
  }
}

// End the raid and send final stats
async function endRaid(bot: any, chatId: any, messageId: any, userID: any) {
  try {
    // Find the last active raid for the chat and mark it as completed
    const raid = await Raid.findOneAndUpdate(
      { chatId, status: "active" },
      { status: "completed" },
      { sort: { startTime: -1 }, new: true }
    );

    if (raid) {
      // Stop the periodic update process for this raid
      if (raidProgress[chatId]?.intervalId) {
        clearInterval(raidProgress[chatId].intervalId); // Clear the interval to stop updates
        delete raidProgress[chatId]; // Remove the raid from tracking
      }

      // Fetch the tweetPreview setting from GroupSetting
      const settings = await GroupSetting.findOne({ userID });

      // Construct the message based on the tweetPreview setting
      const endRaidMessage = `Raid on ${raid.link} has ended! \n\nFinal Stats:\n👍 Likes: ${raid.likes} \n💬 Comments: ${raid.comments} \n🔁 Retweets: ${raid.retweets} \n🔥 Total Smashes: ${raid.smashes}`;

      const gifUrl =
        "https://utlhopsrlqvkucsbjici.supabase.co/storage/v1/object/public/assets/raid.gif";

      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: "🦈 Summary 🦈",
              callback_data: `summary_raid_${chatId}`,
            },
          ],
        ],
      };

      // Send the message with or without the preview based on settings
      if (settings && settings.tweetPreview === false) {
        bot.sendAnimation(chatId, gifUrl, {
          caption: endRaidMessage,
          disable_web_page_preview: true, // Disable preview if required
          reply_markup: replyMarkup, // Ensure the keyboard is added here
        });
      } else {
        bot.sendAnimation(chatId, gifUrl, {
          caption: endRaidMessage,
          reply_to_message_id: messageId,
          reply_markup: replyMarkup, // Ensure the keyboard is added here as well
        });
      }

      // Update raid stats in the database
      await Raid.findByIdAndUpdate(raid._id, {
        likes: raid.likes,
        comments: raid.comments,
        retweets: raid.retweets,
        smashes: raid.smashes,
      });
    } else {
      bot.sendMessage(chatId, "No active raid to end.");
    }
  } catch (error) {
    console.error("Error ending the raid:", error);
    bot.sendMessage(chatId, "An error occurred while ending the raid.");
  }
}

async function summaryRaid(bot: any, chatId: any, query: any, userID: any) {
  const settings = await GroupSetting.findOne({ userID });
  const raid = await Raid.findOne(
    { chatId, status: "completed" },
    {},
    { sort: { startTime: -1 } }
  );

  if (raid) {
    const participantSummary = raid.participants
      .map((participant) => `- ${participant.username}`)
      .join("\n");

    const summaryMessage = `📊 Raid Engagement Summary 📊\n
Raid Link: ${raid.link}\n
Total Smashes: ${raid.smashes}\n
Participants:\n${participantSummary}`;

    bot.sendMessage(chatId, summaryMessage, {
      disable_web_page_preview: !settings?.tweetPreview, // Set to true if tweetPreview is false
      reply_to_message_id: query.message.message_id,
    });
  } else {
    bot.sendMessage(chatId, "No completed raids found.");
  }
}

// fetch post details
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

const extractPostId = (raidLink: string) => {
  const regex = /status\/(\d+)/; // Regex to extract tweet ID
  const match = raidLink.match(regex);
  return match ? match[1] : null;
};

export { startRaid, endRaid, updateRaidProgress, smashRaid, summaryRaid };
