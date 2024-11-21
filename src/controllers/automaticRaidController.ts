import TelegramBot from "node-telegram-bot-api";
import { twitterBearer } from "../config/apiConfig";

/**
 * Generate raid suggestions based on recent popular tweets.
 * @param {Object} bot - The bot instance.
 * @param {number} chatId - The chat ID.
 */
async function generateRaidSuggestions(bot:TelegramBot, chatId:any) {
  try {
    // Define keywords or hashtags to approximate trending topics
    const keywords = ["#trending", "#popular", "#viral"]; // Customize based on interest

    let topTweets = [];
    for (const keyword of keywords) {
      // Fetch recent tweets containing the keyword
      const tweetResponse = await twitterBearer.v2.get('tweets/search/recent', {
        query: keyword,
        'tweet.fields': 'public_metrics,text,id', // Include the tweet ID
        max_results: 10,
      });

      console.log('====================================');
      console.log(tweetResponse,"tweet reesponse&&&&&&&&&&&&&&&&&&&&&&&&7777");
      console.log('====================================');

      // Filter and select tweets based on engagement (likes + retweets)
      const tweets = tweetResponse.data;
      const popularTweets = tweets
        .map((tweet:any) => ({
          text: tweet.text,
          engagement: tweet.public_metrics.like_count + tweet.public_metrics.retweet_count,
          id: tweet.id // Store the tweet ID
        }))
        .sort((a:any, b:any) => b.engagement - a.engagement)
        .slice(0, 1); // Select the top tweet for each keyword

      topTweets.push(...popularTweets);
    }

    // Generate the suggestion message
    const suggestions = topTweets
      .map((tweet, index) => 
        `🔹 Suggestion ${index + 1}:\n` +
        `📜 Tweet: ${tweet.text}\n` +
        `💬 Engagements : ${tweet.engagement} \n` +
        `➡️ (https://twitter.com/i/web/status/${tweet.id}) to start a raid!`
      )
      .join("\n\n");

    // Send suggestions to the chat
    const messageContent = `✨Automatic Raid Suggestions✨\n\n${suggestions}\n\n` +
      `🗨️ *Use this command /raid link to start a new raid !`;
    
    await bot.sendMessage(chatId, messageContent);
  } catch (error) {
    console.error("Error generating raid suggestions:", error);
    await bot.sendMessage(chatId, "Unable to fetch raid suggestions at the moment.");
  }
}


export   {
  generateRaidSuggestions,
};
