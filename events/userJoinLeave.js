const axios = require("axios");

const recentLeaves = new Set(); // for deduplication

module.exports = {
  name: "event",
  async execute({ api, event }) {
    if (!event || typeof event !== "object") {
      console.warn("⚠️ Skipped: event is undefined or not an object");
      return;
    }

    const { threadID, logMessageType, logMessageData } = event;
    if (!logMessageType || !logMessageData) {
      console.warn("⚠️ Skipped: missing logMessageType or logMessageData");
      return;
    }

    // === WELCOME EVENT ===
    if (logMessageType === "log:subscribe") {
      const addedParticipants = logMessageData.addedParticipants;
      if (!addedParticipants || addedParticipants.length === 0) return;

      console.log(`👋 New member(s) joined: ${addedParticipants.length}`);

      const welcomeMessages = [
        "Welcome, {name}.",
        "Hello {name}, enjoy the group!",
        "Nice to meet you, {name}!"
      ];

      for (const participant of addedParticipants) {
        const userID = participant.userFbId || participant.userId;
        if (!userID) {
          console.warn("❌ No user ID found in participant", participant);
          continue;
        }

        console.log("🔍 Getting user info for:", userID);

        api.getUserInfo([userID], (err, ret) => {
          if (err || !ret[userID]) {
            console.warn("⚠️ Failed to get user info:", err || "No user found");
            return;
          }

          const username = ret[userID].name;
          const randomMessage = welcomeMessages[
            Math.floor(Math.random() * welcomeMessages.length)
          ].replace("{name}", username);

          // Avoid race condition
          setImmediate(() => {
            api.sendMessage(randomMessage, threadID);
            console.log(`✅ Welcome message sent to: ${username}`);
          });
        });
      }
    }

    // === LEAVE EVENT ===
    if (logMessageType === "log:unsubscribe") {
      const leftUserID = logMessageData.leftParticipantFbId;
      if (!leftUserID) return;

      const leaveKey = `${leftUserID}:${threadID}`;
      if (recentLeaves.has(leaveKey)) {
        console.log("⚠️ Duplicate leave event ignored:", leaveKey);
        return;
      }

      recentLeaves.add(leaveKey);
      setTimeout(() => recentLeaves.delete(leaveKey), 5000); // Remove after 5s

      console.log(`👋 User left: ${leftUserID}`);

      api.getUserInfo([leftUserID], (err, ret) => {
        if (err || !ret[leftUserID]) return;

        const username = ret[leftUserID].name;

        const leaveMessages = [
          "Fly high {name}, huwag ka nang bumalik please."
        ];

        const randomLeave = leaveMessages[
          Math.floor(Math.random() * leaveMessages.length)
        ].replace("{name}", username);

        api.sendMessage(randomLeave, threadID);
        console.log(`✅ Leave message sent to: ${username}`);
      });
    }
  }
};
