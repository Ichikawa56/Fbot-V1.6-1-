const axios = require("axios");
const fs = require("fs");

module.exports = {
  name: "pakyu",
  usePrefix: false,
  description: "Reacts to a message if the trigger word is mentioned on chat.",

  onStart: async function () {},

  execute: async function ({ api, event }) {
    // This is for prefixed execution, but since usePrefix is false, this won't usually trigger
  },

  onChat: async function ({ api, event }) {
    if (event.body && event.body.toLowerCase() === "fuck you", "pakyu", "fuckyou") {
      return api.sendMessage({
        body: "Fuck you too🖕",
        attachment: fs.createReadStream("fuck.png"),
      }, event.threadID);
    }
  }
};
