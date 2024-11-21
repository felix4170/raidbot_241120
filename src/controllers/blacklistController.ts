// controllers/blacklistController.ts

// In-memory blacklist for simplicity; consider using a database for persistence
let blacklist: string[] = [];

/**
 * Adds a user to the blacklist.
 * @param userName - The ID of the user to be blacklisted.
 */
function addUserToBlacklist(userName: string) {
  if (!blacklist.includes(userName)) {
    blacklist.push(userName);
    console.log(`User ${userName} has been blacklisted.`);
  } else {
    console.log(`User ${userName} is already blacklisted.`);
  }
}

/**
 * Removes a user from the blacklist.
 * @param userId - The ID of the user to be removed from the blacklist.
 */
function removeUserFromBlacklist(userName: string) {
  blacklist = blacklist.filter((id) => id !== userName);
  console.log(`User ${userName} has been removed from the blacklist.`);
}

/**
 * Checks if a user is blacklisted.
 * @param userId - The ID of the user to check.
 * @returns True if the user is blacklisted, false otherwise.
 */
function isUserBlacklisted(userName: string) {
  return blacklist.includes(userName);
}

export { addUserToBlacklist, removeUserFromBlacklist, isUserBlacklisted };
