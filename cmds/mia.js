const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");
const path = require("path");

module.exports = {
  name: "mia",
  description: "Put a custom comment on Mia's board.",
  usePrefix: true,

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = text.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
          else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
          line += `${words.shift()} `;
        else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  execute: async function ({ api, event, args }) {
    const pathImg = path.join(__dirname, "..", "cache", "mia.png");
    const text = args.join(" ");
    if (!text) {
      return api.sendMessage(
        "Enter the content of the comment on the board.",
        event.threadID,
        event.messageID
      );
    }

    const getImage = (
      await axios.get("https://imgur.com/iXbcwYy.png", {
        responseType: "arraybuffer",
      })
    ).data;

    fs.ensureDirSync(path.dirname(pathImg));
    fs.writeFileSync(pathImg, Buffer.from(getImage, "utf-8"));

    const baseImage = await loadImage(pathImg);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.font = "400 20px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "start";

    let fontSize = 250;
    while (ctx.measureText(text).width > 2600) {
      fontSize--;
      ctx.font = `400 ${fontSize}px Arial, sans-serif`;
    }

    const lines = await this.wrapText(ctx, text, 600);
    ctx.fillText(lines.join("\n"), 50, 120);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    return api.sendMessage(
      { attachment: fs.createReadStream(pathImg) },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
