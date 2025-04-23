const fs = require('fs');
const bannedUsers = require('../bannedUsers.json'); // adjust path if needed

module.exports = {
  name: "ban",
  usage: "/ban (mention || userID) r:(reason)",
  version: "1.0",

  async execute({ api, event, args }) {
    const { threadID, messageID, senderID, mentions } = event;

    if (args.length < 2 || !args.some(a => a.startsWith("r:"))) {
      return api.sendMessage(
        "❌ Please provide a user (mention or userID) and a reason using `r:`.\n\nExample: `/ban @user r:spamming`",
        threadID,
        messageID
      );
    }

    const mentionKey = Object.keys(mentions)[0];
    const userPart = mentionKey || args[0]; // either mentioned user or direct ID
    const userID = mentionKey || args[0].replace(/[^0-9]/g, ''); // cleaned userID
    const reasonIndex = args.findIndex(arg => arg.startsWith("r:"));
    const reason = args.slice(reasonIndex).join(' ').replace(/^r:/, '').trim();

    if (!userID) {
      return api.sendMessage("❌ Invalid user. Please mention or provide a valid userID.", threadID, messageID);
    }

    const currentDate = new Date().toLocaleString();
    if (!bannedUsers[threadID]) bannedUsers[threadID] = [];

    const alreadyBanned = bannedUsers[threadID].some(u => u.userID === userID);
    if (alreadyBanned) {
      return api.sendMessage(
        `🚫 This user is already BANNED in this group.\nUse \`/unban ${userID}\` to unban them.`,
        threadID,
        messageID
      );
    }

    // Save the ban
    bannedUsers[threadID].push({
      userID,
      messengerGroupId: threadID,
      reason,
      bannedBy: senderID,
      dateAndTime: currentDate
    });

    fs.writeFileSync('./bannedUsers.json', JSON.stringify(bannedUsers, null, 2));

    api.sendMessage(
      `✅ User ${userID} has been BANNED from this group.\nReason: ${reason}`,
      threadID,
      messageID
    );

    // Try to kick user
    api.removeUserFromGroup(userID, threadID, (err) => {
      if (err) {
        console.error(`❌ Failed to kick user ${userID}:`, err);
        return api.sendMessage(
          `⚠️ Couldn't kick the user. Make sure I'm an *admin* in this group.`,
          threadID
        );
      }
      console.log(`✅ Banned and kicked user ${userID}`);
    });
  }
};