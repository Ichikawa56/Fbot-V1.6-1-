const axios = require("axios");

module.exports = {
  name: "blowjob",
  usePrefix: false,
  usage: "blowjob",
  version: "1.0",
  description: "(Admin Only) Sends a random blowjob image.",
  adminOnly: true,

  execute: async function ({ api, event }) {
    const links = [
      "https://cdni.pornpics.com/1280/7/119/56432932/56432932_084_78be.jpg",
      "https://cdni.pornpics.com/1280/5/88/22820853/22820853_006_0392.jpg",
      "https://cdn2.lemmecheck.com/lmccom/uploads/2022/10/well-rounded-kali-roses-is-craving-the-d-so-she-turns-to-her-stepson-to-shove-his-dick-into-her-creamy-bare-pussy-at-bratty-milf-4-1024x683-300x450.jpg",
      "https://cdni.pornpics.com/460/7/668/93549975/93549975_070_534a.jpg",
      "https://cdni.pornpics.com/460/5/238/82138565/82138565_012_7bcc.jpg"
    ];

    const randomImage = links[Math.floor(Math.random() * links.length)];

    // fallback helper if global.utils.getStreamFromURL is undefined
    const getStreamFromURL = async (url) => {
      const response = await axios({
        method: "GET",
        url,
        responseType: "stream"
      });
      return response.data;
    };

    return api.sendMessage(
      {
        body: "「 Gago sarap ugh 💦🥵 」",
        attachment: await getStreamFromURL(randomImage)
      },
      event.threadID,
      event.messageID
    );
  }
};
