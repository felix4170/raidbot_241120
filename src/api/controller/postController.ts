import { twitterClient } from "../../config/apiConfig";

// Function to get post details for a specific raidLink
const getPostDetails = async (req: any, res: any) => {
  try {
    const { tweetId } = req.params;
    console.log(tweetId, "tweetId");

    if (!tweetId) {
      return res.status(400).json({ message: "Raid link is required." });
    }

    // Fetch post details
    const postDetails = await fetchPostDetailsFromX(tweetId);

    if (!postDetails) {
      return res.status(404).json({ message: "Post details not found." });
    }

    // Send post details to the frontend
    res.status(200).json({
      success: true,
      message: "Post details retrieved successfully.",
      data: postDetails,
    });
  } catch (error: unknown) {
    console.error("Error fetching post details:", error);

    // Check if the error is an instance of Error
    if (error instanceof Error) {
      // Now TypeScript knows `error` is of type `Error`
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching post details.",
        error: error.message, // Safe to access `message` here
      });
    } else {
      // In case the error is not an instance of Error, handle it appropriately
      res.status(500).json({
        success: false,
        message: "An unknown error occurred.",
        error: "Unknown error",
      });
    }
  }
};

// Function to fetch post details from Twitter API
const fetchPostDetailsFromX = async (tweetId: any) => {
  if (!tweetId) {
    throw new Error("Invalid raid link.");
  }

  try {
    const tweet = await twitterClient.v2.get(`tweets/${tweetId}`, {
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

    // Prepare the return object
    const tweetDetails = {
      tweetId: tweetData.id,
      text: tweetData.text,
      createdAt: tweetData.created_at,
      likes: tweetData.public_metrics.like_count,
      retweets: tweetData.public_metrics.retweet_count,
      comments: tweetData.public_metrics.reply_count,
      quoteTweets: tweetData.public_metrics.quote_count,
      user: user
        ? {
            name: user.name,
            username: user.username,
            profileImageUrl: user.profile_image_url,
          }
        : null,
      media: media.map((mediaItem: any) => ({
        type: mediaItem.type,
        url: mediaItem.url || mediaItem.preview_image_url,
      })),
    };

    // Log and return all the tweet details
    console.log(tweetDetails, "Full tweet details");

    return tweetDetails;
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

// Export the function using ES module syntax
export { getPostDetails };
