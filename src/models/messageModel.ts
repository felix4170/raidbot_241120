import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Define the interface for TypeScript, if you're using TypeScript with CommonJS
/**
 * @typedef {import('mongoose').Document} Document
 * @typedef {Document & {
 *   chatId: string;
 *   userId?: string;
 *   messageId: string;
 *   raidLink: string;
 *   host?: string[];
 *   gifUrl?: string;
 *   icon?: string;
 *   status?: string;
 * }} IRaidMessage
 */

// Define the schema
const raidMessageSchema = new Schema(
  {
    chatId: { type: String, required: true },
    userId: { type: String },
    messageId: { type: String, required: true },
    raidLink: { type: String, required: true },
    host: [{ type: String }], // Array of strings for multiple hosts
    gifUrl: { type: String },
    icon: { type: String, default: "🦈" },
    status: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create the model
const RaidMessage = model("RaidMessage", raidMessageSchema);

// Export the model
export default RaidMessage;
