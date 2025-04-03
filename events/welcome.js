const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "event",
    async execute(api, event) {
        const { logMessageType, logMessageData, threadID } = event;

        try {
            // 🟢 Handle Member Join (Rejoin Supported)
            if (logMessageType === "log:subscribe") {
                const userID = logMessageData.addedParticipants[0].userFbId;

                // Get user info (name, avatar, nickname)
                api.getUserInfo(userID, async (err, data) => {
                    if (err) return console.error("❌ Error fetching user info:", err);

                    const userName = data[userID].name || "New Member";
                    const avatarURL = data[userID].thumbSrc || "https://i.imgur.com/placeholder.png"; // Default avatar
                    const nickname = data[userID].firstName || userName; // Use first name as nickname

                    // 🟢 Generate Welcome Card URL
                    const welcomeCardURL = `https://kaiz-apis.gleeze.com/api/welcomecard?background=https%3A%2F%2Fi.imgur.com%2FiKekhCb.jpeg&text1=${encodeURIComponent(nickname)}&text2=Welcome+${encodeURIComponent(userName)}&text3=Enjoy+your+stay!&avatar=${encodeURIComponent(avatarURL)}`;

                    try {
                        // Fetch the welcome card image
                        const response = await axios.get(welcomeCardURL, { responseType: "stream" });
                        const imagePath = `./welcome_${userID}.png`;
                        const writer = fs.createWriteStream(imagePath);

                        response.data.pipe(writer);
                        writer.on("finish", () => {
                            api.sendMessage({
                                body: `👋 Welcome, ${userName}! 🎉\nEnjoy your stay in the group!`,
                                attachment: fs.createReadStream(imagePath)
                            }, threadID, () => fs.unlinkSync(imagePath));
                        });

                        writer.on("error", (error) => {
                            console.error("❌ Error writing welcome image:", error);
                            api.sendMessage(`👋 Welcome, ${userName}!`, threadID);
                        });

                    } catch (error) {
                        console.error("❌ Error fetching welcome card:", error);
                        api.sendMessage(`👋 Welcome, ${userName}!`, threadID);
                    }
                });
            }

            // 🟢 Handle Member Leave
            if (logMessageType === "log:unsubscribe") {
                const userID = logMessageData.leftParticipantFbId;

                api.getUserInfo(userID, (err, data) => {
                    if (err) return console.error("❌ Error fetching user info:", err);

                    const userName = data[userID].name || "User";
                    api.sendMessage(`😢 ${userName} has left the group.`, threadID);
                });
            }
        } catch (error) {
            console.error("❌ Error in welcome.js:", error);
        }
    }
};
