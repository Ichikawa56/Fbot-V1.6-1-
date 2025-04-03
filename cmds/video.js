const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "video",
    usePrefix: false,
    usage: "Send a YouTube video by detecting a query or URL",
    version: "1.1",

    execute: async ({ api, event }) => {
        const { threadID, messageID, body } = event;

        if (!body) return;

        try {
            // Set reaction to indicate processing
            api.setMessageReaction("🕥", messageID, () => {}, true);

            // Call the API with the query
            const response = await axios.get(`https://apis-rho-nine.vercel.app/ytsdl?q=${encodeURIComponent(body)}`, {
                headers: { 
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
                }
            });

            if (!response.data || !response.data.download_url) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ No video URL found!", threadID, messageID);
            }

            const { title, download_url } = response.data;
            const filePath = path.join(__dirname, "ytsdl.mp4");

            // Download the video
            const writer = fs.createWriteStream(filePath);
            const videoResponse = await axios({
                url: download_url,
                method: "GET",
                responseType: "stream",
                headers: { 
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
                }
            });

            videoResponse.data.pipe(writer);

            writer.on("finish", async () => {
                api.setMessageReaction("✅", messageID, () => {}, true);

                const msg = {
                    body: `🎥 ${title}\n`,
                    attachment: fs.createReadStream(filePath),
                };

                api.sendMessage(msg, threadID, (err) => {
                    if (err) {
                        console.error("❌ Error sending video:", err);
                        return api.sendMessage("⚠️ Failed to send video.", threadID);
                    }

                    // Delete file after sending
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
                    });
                });
            });

            writer.on("error", (err) => {
                console.error("❌ Error downloading video:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to download video.", threadID, messageID);
            });

        } catch (error) {
            console.error("❌ Error fetching YouTube video:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage(`⚠️ Could not fetch the video. Error: ${error.message}`, threadID, messageID);
        }
    },
};
