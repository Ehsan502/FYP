import Notification from "../models/Notification.js";

export const createNotification = async ({ user, sender, type, text, link, relatedId }) => {
  try {
    const notification = await Notification.create({
      user,
      sender,
      type,
      text,
      link,
      relatedId,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};

export default createNotification;