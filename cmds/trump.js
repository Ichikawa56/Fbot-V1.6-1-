const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  name: "trump",
  description: "Write a comment on Trump's board 🇺🇸",
  usePrefix: false,
  version: "1.0",

  wrapText: async (ctx, text, maxWidth) => {
    if (ctx.measureText(text).width < maxWidth) return [text];
    if (ctx.measureText("W").width > maxWidth) return null;

    const words = text.split(" ");
    const lines = [];
    let line = "";

    while (words.length > 0) {
      let split = false;

      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) {
          words[1] = `${temp.slice(-1)}${words[1]}`;
        } else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }

      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
        line += `${words.shift()} `;
      } else {
        lines.push(line.trim());
        line = "";
      }

      if (words.length === 0) lines.push(line.trim());
    }

    return lines;
  },

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "📝 Please enter the text for Trump's board!",
        threadID,
        messageID
      );
    }

    const text = args.join(" ");
    const templatePath = path.join(__dirname, "..", "trump_board.png"); // 📁 Image in main folder
    const outputPath = path.join(__dirname, "..", `trump_output_${Date.now()}.png`);

    try {
      const baseImage = await loadImage(templatePath);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      let fontSize = 30;
      ctx.font = `400 ${fontSize}px Sans`;
      ctx.fillStyle = "#000";
      ctx.textAlign = "left";

      while (ctx.measureText(text).width > 750) {
        fontSize -= 1;
        ctx.font = `400 ${fontSize}px Sans`;
      }

      const lines = await module.exports.wrapText(ctx, text, 750);
      let y = 165;
      for (const line of lines) {
        ctx.fillText(line, 60, y);
        y += fontSize + 8;
      }

      const finalBuffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, finalBuffer);

      return api.sendMessage(
        { attachment: fs.createReadStream(outputPath) },
        threadID,
        () => fs.unlinkSync(outputPath),
        messageID
      );
    } catch (err) {
      console.error("❌ Error generating image:", err);
      return api.sendMessage(
        "⚠️ Something went wrong while generating the Trump image.",
        threadID,
        messageID
      );
    }
  }
};
