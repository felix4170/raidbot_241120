# Raid Bot

Raid Bot is a tool designed for managing and coordinating Twitter raids. It offers a variety of commands to set up and customize raids, including setting targets, managing partners, adjusting settings, and viewing leaderboards.

## Table of Contents

- [Getting Started](#getting-started)
- [Commands](#commands)
  - [`/raid`](#raid)
  - [`/raidsettings`](#raidsettings)
  - [`/raid <Twitter post link>`](#raid-twitter-post-link)
  - [`/setPartnerChats <admin1> <admin2>`](#setpartnerchats-admin1-admin2)
  - [`/jointRaid <Twitter post link>`](#jointraid-twitter-post-link)
  - [`/setgif <GIF link>`](#setgif-gif-link)
  - [`/seticon <Icon link>`](#seticon-icon-link)
  - [`/generateRaidSuggestion`](#generateraidsuggestion)
  - [`/lockchat`](#lockchat)
  - [`/unlockchat`](#unlockchat)
  - [`/pinraid`](#pinraid)
  - [`/unpinraid`](#unpinraid)
  - [`/repostraid`](#repostraid)
  - [Leaderboard](#leaderboard)
  - [`/blacklist <user>`](#blacklist-user)
  - [`/unblacklist <user>`](#unblacklist-user)
- [Usage Example](#usage-example)

## Getting Started

1. **Start the Raid Bot**: Use the `/raid` command to activate the bot.
2. **Configure Raid Settings**: Send the `/raidsettings` command to access customizable options, such as preset tags, targets, repost count, and more.

## Commands

### `/raid`

Starts the Raid Bot, activating it to receive further commands.

### `/raidsettings`

Opens the Raid Settings panel with an **Adjust Settings** button. By clicking it, you can:

- Set **Preset Tags** that will appear in all raid messages.
- **Set Targets** to specify the raid's primary focus.
- Adjust **Repost Count** for controlling the number of reposts.
- Configure additional settings as needed.

### `/raid <Twitter post link>`

Begins a raid on the specified Twitter post. Once initiated, a raid message will appear with a **Raid** button.

- **Raid Button**: Opens a prompt to **smash** the code. By smashing, users access a mini-app that displays:
  - **Tweet Details**
  - **Smash It Button**: Initiates the raid progress.

### `/setPartnerChats <admin1> <admin2>`

Sets up partner chats for joint raids. Specify the admins who will coordinate on joint raids.

### `/jointRaid <Twitter post link>`

Starts a joint raid on the provided Twitter post link. Requires partners to be set with `/setPartnerChats`.

### `/setgif <GIF link>`

Sets a custom GIF for the raid.

### `/seticon <Icon link>`

Sets an icon for the raid messages.

### `/generateRaidSuggestion`

Generates and displays raid suggestions to guide users on potential raid targets.

### `/lockchat`

Locks the chat to prevent additional messages during the raid.

### `/unlockchat`

Unlocks the chat, allowing participants to continue messaging.

### `/pinraid`

Pins the current raid message in the chat for visibility.

### `/unpinraid`

Unpins the current raid message.

### `/repostraid`

Reposts the raid message to re-engage participants.

### Leaderboard

The leaderboard is accessible within the mini-app, displaying rankings and performance data of raid participants.

### `/blacklist <user>`

Adds a specified user to the blacklist, preventing them from joining raids.

### `/unblacklist <user>`

Removes a user from the blacklist, allowing them to participate in future raids.

## Usage Example

1. **Start the Raid Bot**: Send `/raid` to activate.
2. **Configure Settings**: Use `/raidsettings`, then click **Adjust Settings** to open the mini-app and set tags, targets, repost count, and other settings.
3. **Start Raid**: Send `/raid <Twitter post link>`. A raid message will appear with a **Raid** button.
4. **Smash It**: Click **Raid**, then follow the **Smash It** prompt to access the mini-app and initiate the raid.
5. **Joint Raid**: Set partners with `/setPartnerChats <admin1> <admin2>`, then start a joint raid using `/jointRaid <Twitter post link>`.
6. **Customize Appearance**: Use `/setgif` and `/seticon` to personalize the raid visuals.
7. **Manage Chat and Raid Message**: Control chat with `/lockchat` and `/unlockchat`, and use `/pinraid` or `/unpinraid` to manage the raid message’s visibility.
8. **Blacklist Management**: Add or remove users from the blacklist with `/blacklist <user>` and `/unblacklist <user>`.

---

Raid Bot provides all the tools necessary to start, manage, and track successful Twitter raids. Customize settings, collaborate with partners, and engage participants easily!
