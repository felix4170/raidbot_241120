import  GroupSetting  from "../models/groupSetting";

// Function to lock chat
async function lockChat(chatId: any, userId: any){
  let groupSetting = await GroupSetting.findOne({ userId });

  if (!groupSetting) {
    groupSetting = new GroupSetting({ userId, chatLocked: true });
  } else {
    groupSetting.chatLocked = true;
  }

  await groupSetting.save();
  return "Chat is now locked.";
}

// Function to unlock chat
async function unlockChat(chatId: any, userId: any) {
  const groupSetting = await GroupSetting.findOne({ userId });

  if (groupSetting) {
    groupSetting.chatLocked = false;
    await groupSetting.save();
    return "Chat is now unlocked.";
  }

  return "No settings found for this group.";
}

export {
  lockChat,
  unlockChat,
};
