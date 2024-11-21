import GroupSetting from "../models/groupSetting";

// Function to set general settings
async function setGeneralSettings(userId: any) {
  let groupSetting = await GroupSetting.findOne({ userId });

  // Define default settings
  const defaultSettings = {
    chatLocked: false,
    notificationsEnabled: true,
    raidSettings: {
      active: false,
      presetTags: [] as string[], // Explicitly define the type as string[]
      raidPinned: false,
      pinnedMessageId: null as string | null, // Explicitly define the type as string | null
    },
    mute: false,
    finderEnabled: false,
    repostCount: 0,
    liveStats: false,
    tweetPreview: false,
    smashes: 0,
    target: 100,
  };

  if (!groupSetting) {
    // Create new settings if not found
    groupSetting = new GroupSetting({ userId, ...defaultSettings });
    console.log(groupSetting, "group setting created");
  } else {
    // If settings exist, you might want to update or merge settings
    Object.assign(groupSetting, defaultSettings); // Optional: you can also merge with existing settings
  }

  await groupSetting.save();
  return "Settings initialized successfully.";
}

// Function to get general settings
async function getGeneralSettings(userId: any) {
  const groupSetting = await GroupSetting.findOne({ userId });
  console.log(groupSetting, "group setting*****************8");

  return groupSetting || "No settings found for this group.";
}

// Function to get or create group settings
const getOrCreateGroupSettings = async (userId: any) => {
  let settings = await GroupSetting.findOne({ userId });

  // If settings do not exist, create default settings
  if (!settings) {
    settings = new GroupSetting({
      userId: userId,
      chatLocked: false,
      notificationsEnabled: true,
      mute: false,
      finderEnabled: false,
      repostCount: 0,
      liveStats: false,
      tweetPreview: false,
      smashes: 0,
      raidSettings: {
        active: false,
        presetTags: [],
      },
    });
    await settings.save(); // Save the new settings to the database
  }

  return settings;
};

export { setGeneralSettings, getGeneralSettings, getOrCreateGroupSettings };
