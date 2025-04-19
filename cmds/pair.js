const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "pair",
  description: "Pair two random people in the thread 💞",
  usePrefix: true,
  execute: async ({ api, event }) => {
    const { threadID, senderID, messageID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const { participantIDs } = threadInfo;

    const botID = api.getCurrentUserID();
    const listUserID = participantIDs.filter(id => id !== botID && id !== senderID);

    if (listUserID.length === 0) {
      return api.sendMessage("❌ No one to pair with!", threadID, messageID);
    }

    const randomID = listUserID[Math.floor(Math.random() * listUserID.length)];
    const nameSender = (await api.getUserInfo(senderID))[senderID].name;
    const namePair = (await api.getUserInfo(randomID))[randomID].name;

    const lovePercent = Math.floor(Math.random() * 101);
    const mentions = [
      { id: senderID, tag: nameSender },
      { id: randomID, tag: namePair }
    ];

    const cachePath = path.join(__dirname, "..", "cache");
    fs.ensureDirSync(cachePath);

    const gifUrl = "https://i.ibb.co/wC2JJBb/trai-tim-lap-lanh.gif";
    const gifPath = path.join(cachePath, "love.gif");

    let gifStream = null;
    try {
      const gifBuffer = (await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 5000 })).data;
      fs.writeFileSync(gifPath, Buffer.from(gifBuffer, "utf-8"));
      gifStream = fs.createReadStream(gifPath);
    } catch (err) {
      console.error("⚠️ Could not fetch gif:", err.message);
    }

    const message = {
      body: `🥰 Successful pairing! 💌 Wishing you two endless love 💕\n❤️ Compatibility: ${lovePercent}%\n${nameSender} 💓 ${namePair}`,
      mentions,
      attachment: gifStream ? [gifStream] : []
    };

    return api.sendMessage(message, threadID, messageID);
  }
};
