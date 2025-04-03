module.exports = {
    name: "event",
    async execute(api, event) {
        if (event.logMessageType === "log:subscribe") {
            const botID = api.getCurrentUserID();
            const threadID = event.threadID;
            const addedUsers = event.logMessageData.addedParticipants.map(user => user.userFbId);

            // Check if the bot was added to the group
            if (addedUsers.includes(botID)) {
                const botNickname = "🤖 ChatBot"; // Change this to your preferred nickname

                try {
                    await api.changeNickname(botNickname, threadID, botID);
                    console.log(`✅ Nickname changed in new group: ${threadID}`);
                } catch (error) {
                    console.error("❌ Error changing nickname:", error);
                }
            }
        }
    },
};
