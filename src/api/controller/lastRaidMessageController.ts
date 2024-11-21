import RaidMessage from "../../models/messageModel";
import Raid from "../../models/raidModel";

// Define the lastRaidMessage function without TypeScript types
const lastRaidMessage = async (req:any, res:any) => {
  try {
    const lastRaidMessage = await RaidMessage.findOne().sort({ createdAt: -1 });

    if (!lastRaidMessage) {
      res.status(404).json({ message: "No raid message found" });
      return;
    }

    const lastActiveRaid = await Raid.findOne({ status: "active" }).sort({
      createdAt: -1,
    });

    if (!lastActiveRaid) {
      res.status(404).json({ message: "No active raid found" });
      return;
    }

    const { target, smashes } = lastActiveRaid;

    res.json({
      lastRaidMessage,
      lastActiveRaid: { target, smashes },
    });
  } catch (error) {
    console.error("Error fetching last raid message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Export the function using ES module syntax
export { lastRaidMessage };