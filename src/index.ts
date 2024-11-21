import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import connectDB from "./config/database";
import setupGroupRoutes from "./routes/groupSettingRoutes";
import setupWelcomeRoutes from "./routes/welcomeRoutes";
import setupChatRoutes from "./routes/toggleChatRoutes";
import setupMessageRoutes from "./routes/messageRoutes";
import setupToggleMuteRoutes from "./routes/toggleMuteRoutes";
import setupRaidRoutes from "./routes/raidRoutes";
import { handleRaidInteractions } from "./bot/callbacks/raidInteractions";
import setupTogglePinRoutes from "./routes/togglePinRoutes";
import setupRepostRaidRoutes from "./routes/repostRaidRoutes";
import setupAutomaticRaidRoutes from "./routes/automaticRaidRoutes";
import { generateRaidSuggestions } from "./controllers/automaticRaidController";
import setupJointRaidRoutes from "./routes/jointRaidRoutes";
import setupAdminsRoutes from "./routes/adminsRoutes";
import setupBlacklistRoutes from "./routes/blacklistRoutes";
import settingRoutes from "./api/routes/settingRoutes";
import postRoutes from "./api/routes/postRoutes";
import lastRaidMessageRoutes from "./api/routes/lastRaidMessageRoutes";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import setupCustomMediaRoutes from "./routes/customMediaRoutes";
import Raid from "./models/raidModel";
import { isUserBlacklisted } from "./controllers/blacklistController";
import { smashRaid } from "./controllers/raidController";

// Express app setup
const app = express();
app.use(bodyParser.json()); // Add this to parse incoming JSON data
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "https://shilling-bot.vercel.app/",
    methods: "GET,POST,PUT,DELETE", // Allowed methods (customize as needed),
    credentials: true,
  })
);

// Middleware to parse URL-encoded form data (for forms or multipart requests)
app.use(express.urlencoded({ extended: true }));

const token: string = process.env.BOT_TOKEN || ""; // Assuming BOT_TOKEN is in your environment variables
const bot = new TelegramBot(token, { polling: true });

// Connect to MongoDB
connectDB();

// Setup routes
setupWelcomeRoutes(bot);
setupGroupRoutes(bot);
setupChatRoutes(bot);
setupMessageRoutes(bot);
setupToggleMuteRoutes(bot);
setupRaidRoutes(bot);
setupTogglePinRoutes(bot);
setupRepostRaidRoutes(bot);
setupAutomaticRaidRoutes(bot);
setupJointRaidRoutes(bot);
setupAdminsRoutes(bot);
setupBlacklistRoutes(bot);
setupCustomMediaRoutes(bot);

// Callback handlers
bot.on("callback_query", (query) => {
  console.log(query.data, "query data");
  handleRaidInteractions(bot, query);
});

// API routes
app.use("/api", settingRoutes);
app.use("/api/last", lastRaidMessageRoutes);
app.use("/api/post", postRoutes);

app.post("/getLeaderboard/:chatId", async (req, res) => {
  const { chatId } = req.params;

  console.log(chatId, "chat id");

  try {
    // Fetch administrators
    const admins = await bot.getChatAdministrators(chatId);
    const adminList = admins
      .map((admin, index) => {
        const username = admin.user.username
          ? `@${admin.user.username}`
          : admin.user.first_name;
        return `${index + 1}. ${username}`;
      })
      .join("\n");

    // Fetch all raids from the database
    const raids = await Raid.find({});

    // Define date filters using startTime
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Helper function to calculate leaderboard data
    const calculateLeaderboard = (filteredRaids: any[]) => {
      const raidData: { [host: string]: any } = {};

      filteredRaids.forEach((raid) => {
        const host = raid.host;
        if (!raidData[host]) {
          raidData[host] = {
            raidCount: 0,
            totalEngagement: 0,
            raidParticipation: 0,
            lastParticipation: raid.startTime,
          };
        }
        raidData[host].raidCount += 1;
        raidData[host].totalEngagement += raid.engagement || 0;
        raidData[host].raidParticipation += raid.participants?.length || 0;
        if (
          new Date(raid.startTime) > new Date(raidData[host].lastParticipation)
        ) {
          raidData[host].lastParticipation = raid.startTime;
        }
      });

      // Convert raidData into an array of tracked users
      const trackedUsers = Object.keys(raidData).map((host) => ({
        username: host,
        raidCount: raidData[host].raidCount,
        raidParticipation: raidData[host].raidParticipation,
        totalEngagement: raidData[host].totalEngagement,
        lastParticipation: raidData[host].lastParticipation,
      }));

      // Filter out blacklisted users
      const filteredUsers = trackedUsers.filter(
        (user) => !isUserBlacklisted(user.username)
      );

      // Prepare leaderboard categories
      const topHosts = filteredUsers
        .sort((a, b) => b.raidCount - a.raidCount)
        .slice(0, 3)
        .map((user, index) => ({
          rank: index + 1,
          username: user.username,
          raidCount: user.raidCount,
        }));

      const mostEngaged = filteredUsers
        .sort((a, b) => b.totalEngagement - a.totalEngagement)
        .slice(0, 3)
        .map((user, index) => ({
          rank: index + 1,
          username: user.username,
          engagement: user.totalEngagement,
        }));

      const mostFrequentParticipants = filteredUsers
        .sort((a, b) => b.raidParticipation - a.raidParticipation)
        .slice(0, 3)
        .map((user, index) => ({
          rank: index + 1,
          username: user.username,
          participationCount: user.raidParticipation,
        }));

      return { topHosts, mostEngaged, mostFrequentParticipants };
    };

    // Filter raids for each time period and calculate leaderboard data using startTime
    const todayRaids = raids.filter(
      (raid) => new Date(raid.startTime) >= startOfToday
    );
    const monthRaids = raids.filter(
      (raid) => new Date(raid.startTime) >= startOfMonth
    );
    const allTimeRaids = raids; // No filtering for all time

    const leaderboardToday = calculateLeaderboard(todayRaids);
    const leaderboardMonth = calculateLeaderboard(monthRaids);
    const leaderboardAllTime = calculateLeaderboard(allTimeRaids);

    console.log(leaderboardAllTime, "leaderboard all time");

    // Send leaderboard data to the frontend
    res.json({
      admins: adminList,
      today: leaderboardToday,
      thisMonth: leaderboardMonth,
      allTime: leaderboardAllTime,
    });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res
      .status(500)
      .json({ error: "Unable to fetch leaderboard data at the moment." });
  }
});

// Endpoint to start the Smash Raid
app.post("/api/smashRaid/:chatId", (req, res) => {
  const { chatId } = req.params;
  const { messageId, userID, userName } = req.body;

  console.log(messageId, "messageId", userID, "userID", userName, "userName");

  if (!chatId) {
    return res
      .status(400)
      .json({ success: false, message: "Chat ID is required" });
  }

  // Trigger your smashRaid function
  smashRaid(bot, chatId, userID, userName, messageId)
    .then(() => {
      res.json({ success: true, message: "Raid started successfully!" });
    })
    .catch((error) => {
      console.error("Error starting raid:", error);
      res.status(500).json({ success: false, message: "Failed to start raid" });
    });
});

console.log("Bot is running...");

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
