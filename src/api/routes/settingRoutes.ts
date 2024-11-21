import {
  getGroupSettingsByChatId,
  updateGroupSettingsByChatId,
} from "../controller/settingController";
import express from "express";

const router = express.Router();

router.get("/group-settings/:userId", getGroupSettingsByChatId);
router.patch("/group-settings/:userId", updateGroupSettingsByChatId);

// Export the router using ES module syntax
export default router;
