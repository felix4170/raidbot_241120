import express from "express";
import { lastRaidMessage } from "../controller/lastRaidMessageController";

const router = express.Router();

// Define the route and bind it to the `lastRaidMessage` controller function
router.get("/raid-message", lastRaidMessage);

// Export the router using ES module syntax
export default router;
