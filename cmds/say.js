const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "say",
    usePrefix: false,
    usage: "say <text>",
    version: "1.0",

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        if (args.length === 0) {
            return api.sendMessage("⚠️ Please provide text to convert to speech.\nUsage: say <text>", threadID, messageID);
        }

        const text = args.join(" ");
        const apiUrl = `https://apis-rho-nine.vercel.app/tts?text=${encodeURIComponent(text)}`;
        const filePath = path.join(__dirname, "tts.mp3");

        try {
            // Indicate processing with reaction
            api.setMessageReaction("🕥", messageID, () => {}, true);

            // Fetch TTS audio from API
            const response = await axios({
                url: apiUrl,
                method: "GET",
                responseType: "stream",
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            // Save audio file
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on("finish", async () => {
                api.setMessageReaction("✅", messageID, () => {}, true);

                const msg = {
                    body: `🗣️ Saying: "${text}"`,
                    attachment: fs.createReadStream(filePath),
                };

                api.sendMessage(msg, threadID, (err) => {
                    if (err) {
                        console.error("❌ Error sending audio:", err);
                        return api.sendMessage("⚠️ Failed to send the audio.", threadID);
                    }

                    // Delete file after sending
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
                    });
                });
            });

            writer.on("error", (err) => {
                console.error("❌ Error downloading TTS:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to process TTS audio.", threadID, messageID);
            });

        } catch (error) {
            console.error("❌ Error fetching TTS:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage(`⚠️ Could not fetch TTS audio. Error: ${error.message}`, threadID, messageID);
        }
    },
};
