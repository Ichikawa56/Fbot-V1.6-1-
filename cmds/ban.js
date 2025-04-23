const fs = require('fs');
const bannedUsers = require('./bannedUsers.json');

module.exports = async function handleJoinEvent({ api, event }) {
  if (event.logMessageType !== 'log:subscribe') return;

  const threadID = event.threadID;
  const addedUsers = event.logMessageData.addedParticipants.map(u => u.userFbId);

  if (!bannedUsers[threadID]) return;

  for (const userID of addedUsers) {
    const bannedUser = bannedUsers[threadID].find(u => u.userID === userID);
    if (bannedUser) {
      const banReason = bannedUser.reason || "No reason given";
      const banDate = bannedUser.dateAndTime || "Unknown date";

      api.sendMessage(
        `🚫 User ${userID} is in the ban list!\nReason: ${banReason}\nDate: ${banDate}\nKicking in 2 seconds...`,
        threadID
      );

      setTimeout(() => {
        api.removeUserFromGroup(userID, threadID, (err) => {
          if (err) {
            console.error(`❌ Failed to kick banned user ${userID}:`, err);
            return api.sendMessage(
              `⚠️ Couldn't kick banned user ${userID}. Please ensure I'm an *admin*!`,
              threadID
            );
          }
          console.log(`✅ Auto-kicked banned user ${userID} from group ${threadID}`);
        });
      }, 2000); // delay in ms (2 seconds)
    }
  }
};