import GroupSetting from "../../models/groupSetting";

// Function to get group settings for a specific chatId
const getGroupSettingsByChatId = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    console.log("====================================");
    console.log(userId, "chat id found after");
    console.log("====================================");
    const groupSetting = await GroupSetting.findOne({ userId });

    console.log(groupSetting, "groupSettings111111111111111115555555555555");

    if (!groupSetting) {
      console.log("99999999999999999");
      return res.status(404).json({ message: "Group settings not found" });
    }

    console.log("000000000000000000000000");
    res.json(groupSetting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateGroupSettingsByChatId = async (req: any, res: any) => {
  // PATCH to update target for specific chatId
  const { userId } = req.params;
  const { target, repostCount, settings = [], presetTags = [] } = req.body;
  console.log(presetTags, "presettags found ");
  console.log(settings, "settings found");

  try {
    const groupSetting = await GroupSetting.findOne({ userId });

    if (!groupSetting) {
      return res.status(404).json({ message: "Group settings not found" });
    }

    // Define updateData type
    const updateData: {
      mute?: boolean;
      finderEnabled?: boolean;
      chatLocked?: boolean;
      liveStats?: boolean;
      tweetPreview?: boolean;
      raidDuration?: boolean;
      raidSummary?: boolean;
      verificationOnly?: boolean;
      forwardRaids?: boolean;
      target?: number;
      repostCount?: number;
    } = {};

    // Update specific fields based on the received settings from the frontend
    settings.forEach((setting: any) => {
      switch (setting.id) {
        case 1:
          updateData.mute = setting.isChecked;
          break;
        case 2:
          updateData.finderEnabled = setting.isChecked;
          break;
        case 3:
          updateData.chatLocked = setting.isChecked;
          break;
        case 4:
          updateData.liveStats = setting.isChecked;
          break;
        case 5:
          updateData.tweetPreview = setting.isChecked;
          break;
        case 6:
          updateData.raidDuration = setting.isChecked;
          break;
        case 7:
          updateData.raidSummary = setting.isChecked;
          break;
        case 8:
          updateData.verificationOnly = setting.isChecked;
          break;
        case 9:
          updateData.forwardRaids = setting.isChecked;
          break;
        default:
          break;
      }
    });

    // Apply logic here, for example, update target based on certain conditions
    if (typeof target === "number" && target >= 0) {
      updateData.target = target; // Update target value
    }
    if (typeof repostCount === "number" && repostCount >= 0) {
      updateData.repostCount = repostCount;
    }

    // Update presetTags in raidSettings, ensure raidSettings is defined
    if (presetTags && Array.isArray(presetTags)) {
      await GroupSetting.updateOne(
        { userId },
        { $addToSet: { "raidSettings.presetTags": { $each: presetTags } } }
      );
      console.log(presetTags, "presetTags updated");
    }

    // Log the updated presetTags
    console.log(groupSetting.raidSettings.presetTags, "Updated presetTags");
    console.log(groupSetting, "groupSetting");

    // Save the updated group settings back to the database
    // const updatedGroupSetting = await groupSetting.save();
    // Perform the update for other settings
    const updatedGroupSetting = await GroupSetting.updateOne(
      { userId },
      { $set: updateData }
    );

    res.json(updatedGroupSetting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
  // });
};

export { getGroupSettingsByChatId, updateGroupSettingsByChatId };
