const notificationService = require("../services/notificationService");
const { sendSuccess } = require("../utils/response");

async function getNotifications(_req, res) {
  const snapshot = await notificationService.getNotificationsSnapshot();
  return sendSuccess(res, "Notifications fetched successfully", snapshot);
}

module.exports = {
  getNotifications,
};