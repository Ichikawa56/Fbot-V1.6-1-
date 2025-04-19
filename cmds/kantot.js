const fs = require("fs");
let Jimp = require("jimp");
Jimp = typeof Jimp.read === "function" ? Jimp : Jimp.default;


module.exports = {
    name: "kantot",
    usePrefix: false,
    description: "(Admin only) If the user mentions someone, the bot will send an image of both of them fucking.",
    version: "1.0",
    requiredRole: ["botAdmin", "accessAdmin"],

    execute: async function ({ api, event, args }) {
        const mention = Object.keys(event.mentions);
        if (mention.length === 0) {
            return api.sendMessage("Please mention someone", event.threadID);
        }

        const senderID = event.senderID;
        const targetID = mention.length === 1 ? mention[0] : mention[1];
        const partnerID = mention.length === 1 ? senderID : mention[0];

        try {
            const imagePath = await createImage(partnerID, targetID);
            api.sendMessage({
                body: "「 Lakasan mo daddy 🥵💦 」",
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));
        } catch (err) {
            console.error("❌ Error generating image:", err);
            api.sendMessage("Failed to generate image 😢", event.threadID);
        }
    }
};

async function createImage(one, two) {
    const avatarOne = await Jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    const avatarTwo = await Jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

    avatarOne.circle();
    avatarTwo.circle();

    const baseImage = await Jimp.read("https://cartoonporn.tv/wp-content/uploads/2017/07/Amanee.jpg");
    baseImage.resize(1080, 1350)
        .composite(avatarOne.resize(200, 200), 77, 164)
        .composite(avatarTwo.resize(235, 235), 500, 170);

    const outputPath = `temp_${Date.now()}.png`;
    await baseImage.writeAsync(outputPath);
    return outputPath;
}
