import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * @typedef {import('mongoose').Document} Document
 * @typedef {Document & {
 *   userId: string;
 *   chatLocked: boolean;
 *   notificationsEnabled: boolean;
 *   raidSettings: {
 *     active: boolean;
 *     presetTags: string[];
 *     raidPinned: boolean;
 *     pinnedMessageId: string | null;
 *   };
 *   mute: boolean;
 *   finderEnabled: boolean;
 *   repostCount: number;
 *   liveStats: boolean;
 *   tweetPreview: boolean;
 *   target: number;
 *   raidDuration: boolean;
 *   raidSummary: boolean;
 *   verificationOnly: boolean;
 *   forwardRaids: boolean;
 * }} IGroupSetting
 */

const groupSettingSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    chatLocked: {
      type: Boolean,
      default: false,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    raidSettings: {
      type: Object,
      default: {
        active: false,
        presetTags: [],
        raidPinned: false,
        pinnedMessageId: null,
      },
    },
    mute: {
      type: Boolean,
      default: false,
    },
    finderEnabled: {
      type: Boolean,
      default: false,
    },
    repostCount: {
      type: Number,
      default: 0,
    },
    liveStats: {
      type: Boolean,
      default: false,
    },
    tweetPreview: {
      type: Boolean,
      default: false,
    },
    target: {
      type: Number,
      default: 100,
    },
    raidDuration: {
      type: Boolean,
      default: false,
    },
    raidSummary: {
      type: Boolean,
      default: false,
    },
    verificationOnly: {
      type: Boolean,
      default: false,
    },
    forwardRaids: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const GroupSetting = model("GroupSetting", groupSettingSchema);

// Export the model
export default GroupSetting;
