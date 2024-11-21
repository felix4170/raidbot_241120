import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * @typedef {import('mongoose').Document} Document
 * @typedef {Document & {
 *   chatId: string;
 *   link: string;
 *   host: string[];
 *   gifUrl?: string;
 *   icon?: string;
 *   startTime: Date;
 *   duration: number;
 *   status: "pending" | "active" | "completed";
 *   participants: { username: string; timestamp: Date }[];
 *   likes: number;
 *   comments: number;
 *   retweets: number;
 *   smashes: number;
 *   target: string;
 *   createdAt: Date;
 *   repostCount: number;
 *   partnerChats: number[];
 * }} IRaid
 */

const raidSchema = new Schema(
  {
    chatId: { type: String, required: true },
    link: { type: String, required: true },
    host: [{ type: String }],
    gifUrl: { type: String },
    icon: { type: String, default: "🦈" },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    participants: [
      {
        username: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    retweets: { type: Number, default: 0 },
    smashes: { type: Number, default: 0 },
    target: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    repostCount: { type: Number, default: 0 },
    partnerChats: [{ type: Number }],
    
  },
  {
    timestamps: true,
  }
);

const Raid = model("Raid", raidSchema);

export default Raid;
