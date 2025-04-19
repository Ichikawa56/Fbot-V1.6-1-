const axios = require("axios");
const stream = require("stream");
const streamifier = require("streamifier");
const { createWriteStream, createReadStream, unlinkSync } = require("fs");
const { tmpdir } = require("os");
const path = require("path");

module.exports = {
  async getStreamFromURL(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      return streamifier.createReadStream(buffer);
    } catch (error) {
      console.error("❌ Error fetching stream from URL:", error);
      return null;
    }
  },

  async getTempStreamFromURL(url) {
    try {
      const filePath = path.join(tmpdir(), `${Date.now()}.jpg`);
      const writer = createWriteStream(filePath);
      const response = await axios.get(url, { responseType: "stream" });

      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", () => {
          const stream = createReadStream(filePath);
          // Optional: delete the file after 1 min
          setTimeout(() => {
            try {
              unlinkSync(filePath);
            } catch (err) {}
          }, 60 * 1000);
          resolve(stream);
        });
        writer.on("error", reject);
      });
    } catch (error) {
      console.error("❌ Error in getTempStreamFromURL:", error);
      return null;
    }
  }
};
