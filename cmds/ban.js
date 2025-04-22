const fs = require('fs');
const bannedUsers = require('./bannedUsers.json');
const { getUserInfo, getGroupInfo } = require('./utils'); // Assuming you have a function to get user and group info

module.exports = {
  name: "ban",
  usage: "/ban (mention || userid) r:(reason)",
  version: "1.0",

  execute({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    if (args.length < 2) {
      return api.sendMessage("❌ Please provide a user (mention or userID) and a reason using 'r:'.", threadID, messageID);
    }

    // Extracting the user (mention or userID) and reason
    const userPart = args[0].startsWith('@') ? args[0].substring(1) : args[0]; // Remove '@' for mentions
    const reason = args.slice(1).join(' ').replace(/^r:/, '').trim(); // Extract the reason after 'r:'

    // Check if the userID is a mention or a direct userID
    let userID;
    if (userPart.startsWith('@')) {
      // It's a mention, get the userID
      api.getUserID(userPart, (err, result) => {
        if (err || !result || !result[0]) {
          return api.sendMessage(`❌ User '${userPart}' not found.`, threadID, messageID);
        }
        userID = result[0].userID;
        proceedWithBan();
      });
    } else {
      // It's a direct userID
      userID = userPart;
      proceedWithBan();
    }

    function proceedWithBan() {
      const currentDate = new Date();
      const dateAndTime = currentDate.toLocaleString();

      // Check if the user is already banned in this group
      if (!bannedUsers[threadID]) bannedUsers[threadID] = [];
      const alreadyBanned = bannedUsers[threadID].some(user => user.userID === userID);

      if (alreadyBanned) {
        return api.sendMessage(`🚫 This user is already BANNED in this group since ${dateAndTime}. To unban them, please type\n/unban ${userID}`, threadID, messageID);
      }

      // Add user to banned list
      const bannedUser = {
        userID: userID,
        messengerGroupId: threadID,
        reason: reason,
        bannedBy: senderID,
        dateAndTime: dateAndTime,
      };
      bannedUsers[threadID].push(bannedUser);

      // Save to bannedUsers.json
      fs.writeFileSync('./bannedUsers.json', JSON.stringify(bannedUsers, null, 2));

      // Inform the group about the ban
      api.sendMessage(`✅ ${userID} is now BANNED in ${threadID}! To unban them, please type\n/unban ${userID}`, threadID, messageID);

      // Kick the user from the group
      api.removeUserFromGroup(userID, threadID, () => {
        console.log(`User ${userID} has been banned and kicked from the group.`);
      });
    }
  },
};