const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "url",
    usePrefix: false,
    usage: "Detects and downloads videos from TikTok, Instagram, and Facebook",
    version: "1.6",

    execute: async ({ api, event }) => {
        const { threadID, messageID, body } = event;
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const foundUrls = body.match(urlRegex);

        if (!foundUrls) return;

        const videoUrl = foundUrls[0];

        // Check if the URL is from a supported platform
        let platform = "";
        if (videoUrl.includes("tiktok.com")) {
            platform = "🎶 TikTok";
        } else if (videoUrl.includes("instagram.com")) {
            platform = "📷 Instagram";
        } else if (videoUrl.includes("facebook.com")) {
            platform = "📘 Facebook";
        } else {
            return; // Ignore unsupported URLs
        }

        // Send detected URL message
        api.sendMessage(`🔍 **Detected URL:** ${videoUrl}\n👉 Platform: **${platform}**`, threadID, async () => {
            // React to indicate processing
            api.setMessageReaction("⏳", messageID, () => {}, true);

            const apiUrl = `https://apis-rho-nine.vercel.app/download?url=${encodeURIComponent(videoUrl)}`;

            try {
                // Fetch video download link
                const response = await axios.get(apiUrl, {
                    headers: { "User-Agent": "Mozilla/5.0" },
                });

                if (!response.data.success || !response.data.data.download_url) {
                    api.setMessageReaction("❌", messageID, () => {}, true);
                    return api.sendMessage("⚠️ Failed to fetch video.", threadID, messageID);
                }

                const videoDownloadUrl = response.data.data.download_url;
                const filePath = path.join(__dirname, "downloaded_video.mp4");

                // Download the video
                const writer = fs.createWriteStream(filePath);
                const videoResponse = await axios({
                    url: videoDownloadUrl,
                    method: "GET",
                    responseType: "stream",
                    headers: { "User-Agent": "Mozilla/5.0" },
                });

                videoResponse.data.pipe(writer);

                writer.on("finish", async () => {
                    api.setMessageReaction("✅", messageID, () => {}, true);

                    const msg = {
                        body: `🎥 Here is your video from **${platform}**!`,
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
                console.error("❌ Error fetching video:", error);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage(`⚠️ Could not fetch the video. Error: ${error.message}`, threadID, messageID);
            }
        });
    },
};
