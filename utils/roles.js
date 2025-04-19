// utils/roles.js
const config = require("../config.json");

module.exports = {
  getRole: (userID) => {
    if (config.botAdmins?.includes(userID)) return "botAdmin";
    if (config.accessAdmins?.includes(userID)) return "accessAdmin";
    return config.userRoles?.[userID] || "user";
  },
  isBotAdmin: (userID) => config.botAdmins?.includes(userID),
  isAccessAdmin: (userID) => config.accessAdmins?.includes(userID),
};
