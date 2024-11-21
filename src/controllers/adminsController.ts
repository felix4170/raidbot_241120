import TelegramBot from "node-telegram-bot-api";

/**
 * Fetches the list of administrators in the group chat.
 * @param {Object} bot - The bot instance.
 * @param {number} chatId - The chat ID.
 */
async function getGroupAdmins(bot:TelegramBot, chatId:any) {
    try {
      const admins = await bot.getChatAdministrators(chatId);
      
      console.log('====================================');
      console.log(admins,"admin lsit");
      console.log('====================================');
      // Map the administrator details
      const adminList = admins.map((admin, index) => {
        const username = admin.user.username ? `@${admin.user.username}` : admin.user.first_name;
        return `${index + 1}. ${username}`;
      }).join("\n");

  
      // Send the admin list to the chat
      const messageContent = `👥 **Group Administrators** 👥\n\n${adminList}`;
      await bot.sendMessage(chatId, messageContent);
    } catch (error) {
      console.error("Error fetching group administrators:", error);
      bot.sendMessage(chatId, "Unable to fetch group administrators at the moment.");
    }
  }
  
  export {getGroupAdmins};