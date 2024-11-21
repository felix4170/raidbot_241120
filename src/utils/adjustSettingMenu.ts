// bot/utils.js
const adjustSettingsMenu = (settings:any) => {
  return {
    reply_markup: {
      inline_keyboard: [
 
        [
          {
            text: `🎯 Targets `,
            callback_data: "open_target_menu",
          },
        ],
        [
          {
            text: `🔒 Chat Lock ${settings.chatLocked ? "(✅)" : "(❌)"}`,
            callback_data: "toggle_lock",
          },
          {
            text: `🔇 Mute Chat ${settings.mute ? "(✅)" : "(❌)"}`,
            callback_data: "toggle_mute",
          },
        ],

        [
          {
            text: `🔔 Notifications  ${
              settings.notificationsEnabled ? "(✅)" : "(❌)"
            }`,
            callback_data: "toggle_notifications",
          },
        ],
        [
          {
            text: `🔍  Finder  ${settings.finderEnabled ? "(✅)" : "(❌)"}`,
            callback_data: "toggle_finder",
          },
        ],
        [
          {
            text: `📊 Live Stats  ${settings.liveStats ? "(✅)" : "(❌)"}`,
            callback_data: "toggle_live_stats",
          },
        ],
        [
          {
            text: `🔎 Tweet Preview  ${
              settings.tweetPreview ? "(✅)" : "(❌)"
            }`,
            callback_data: "toggle_tweet_preview",
          },
        ],
      ],
    },
  };
};

const generateSettingsHeader = (settings:any,smashes:any) => {
  const tags =
    settings.raidSettings && settings.raidSettings.presetTags
      ? settings.raidSettings.presetTags.join(" ")
      : "None";

  return `
 🎯 Group Settings 🎯

 ➡   Smashes: ${smashes}

 ⚙️  Repost count: ${settings.repostCount}
 🔒  Chat Locked:  ${settings.chatLocked ? "ON" : "OFF"}
 🔔  Notifications:  ${settings.notificationsEnabled ? "ON" : "OFF"}
 🔇  Mute:  ${settings.mute ? "ON" : "OFF"}
 🔍  Finder:  ${settings.finderEnabled ? "ON" : "OFF"}
 📊  Live Stats:  ${settings.liveStats ? "ON" : "OFF"}
 🔎  Tweet Preview:  ${settings.tweetPreview ? "ON" : "OFF"}


`;
};

const targetMenu = (settings:any) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Likes (20)", callback_data: "increase_target" },
        ],
        [
          { text: "Likes (20)", callback_data: "increase_target" },
        ],
        [
          { text: "Likes (20)", callback_data: "increase_target" },
        ],
        [
          { text: "Likes (20)", callback_data: "increase_target" },
        ],
        [
          { text: "Likes (20)", callback_data: "increase_target" },
        ],
        [
          { text: "Likes (20)", callback_data: "increase_target" },
        ],
        [
          { text: "Back", callback_data: "increase_target" },
        ],
       
      ],
    },
  };
};

export  { adjustSettingsMenu, generateSettingsHeader, targetMenu };

