import TelegramBot from "node-telegram-bot-api";
import {
  addUserToBlacklist,
  removeUserFromBlacklist,
  isUserBlacklisted,
} from "../controllers/blacklistController";

function setupBlacklistRoutes(bot:TelegramBot) {
  // Function to blacklist a user by username
  bot.onText(/\/blacklist (@\w+)/, async (msg:any, match:any) => {
    const chatId = msg.chat.id;
    const requesterId = msg.from.id; // User issuing the command
    const username = match[1].replace("@", ""); // Extract username without "@"


    // Check if the requester is an admin
    if (!(await isAdmin(bot, chatId, requesterId))) {
      return bot.sendMessage(chatId, "Only admins can use this command.");
    }

    // Retrieve current admins to prevent blocking them
    const currentAdmins = await getAllAdmins(bot, chatId);
    const isUserAdmin = currentAdmins.some(
      (admin) => admin.username === username
    );

    if (isUserAdmin) {
      return bot.sendMessage(chatId, `Cannot blacklist an admin: @${username}`);
    }

    // Add user to blacklist
    addUserToBlacklist(username);
    bot.sendMessage(chatId, `User @${username} has been blacklisted.`);
  });


// Function to unblacklist a user by username
bot.onText(/\/unblacklist (@\w+)/, async (msg:any, match:any) => {
  const chatId = msg.chat.id;
  const requesterId = msg.from.id; // User issuing the command
  const username = match[1].replace('@', ''); // Extract username without "@"

  // Check if the requester is an admin
  if (!(await isAdmin(bot, chatId, requesterId))) {
    return bot.sendMessage(chatId, "Only admins can use this command.");
  }

  // Check if the user is currently blacklisted
  if (!isUserBlacklisted(username)) {
    return bot.sendMessage(chatId, `User @${username} is not blacklisted.`);
  }

  // Remove user from the blacklist
  removeUserFromBlacklist(username);
  bot.sendMessage(chatId, `User @${username} has been removed from the blacklist.`);
});

}

// Helper function to get all admins in a chat
async function getAllAdmins(bot:TelegramBot, chatId:any) {
  try {
    const admins = await bot.getChatAdministrators(chatId);
    return admins.map((admin:any) => ({
      id: admin.user.id,
      username: admin.user.username || admin.user.first_name,
    }));
  } catch (error) {
    console.error("Error retrieving admins:", error);
    return [];
  }
}

// Helper function to check if a user is an admin
async function isAdmin(bot:TelegramBot, chatId:any, userId:any) {
  try {
    const member = await bot.getChatMember(chatId, userId);
    return member.status === "administrator" || member.status === "creator";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export default setupBlacklistRoutes;
