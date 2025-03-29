const mongoose = require('mongoose');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Notification = require('../../models/notificationModel');
const User = require('../../models/userModel');

// Create notification and send to one or more users
exports.createNotification = catchAsync(async (req, res, next) => {
  const { message, recipients, type } = req.body;

  // Validate required fields
  if (!message || !recipients || recipients.length === 0 || !type) {
    return next(
      new AppError('Message, recipients, and type are required.', 400)
    );
  }

  const sender = req.user; // The user who is sending the notification

  // Find recipient user details
  const users = await User.find({ _id: { $in: recipients } }).select(
    'name role'
  );

  // Check if recipients exist
  if (!users || users.length === 0) {
    return next(new AppError('No valid recipients found.', 404));
  }

  // Create notification objects for each recipient
  const notifications = users.map((user) => ({
    sender: sender._id,
    recipients: [user._id],
    message,
    type,
    isRead: false,
  }));

  // Insert notifications into the database
  await Notification.insertMany(notifications);

  // Prepare the response data to include sender and recipient details
  const notificationResponse = users.map((user) => ({
    senderName: sender.name,
    senderRole: sender.role,
    recipientName: user.name, // Adding recipient name
    recipientRole: user.role, // Adding recipient role
    message,
    type,
    isRead: false,
  }));

  // Respond with the created notifications and recipient info
  res.status(201).json({
    status: 'success',
    message: 'Notifications sent successfully!',
    data: notificationResponse,
  });
});

// Get notifications for a specific user (messages received by the user)
exports.getReceivedNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Get the logged-in user ID

  // Find notifications where the user is a recipient
  const notifications = await Notification.find({ recipients: userId })
    .populate('sender', 'name role') // Populate sender info (name, role)
    .populate('recipients', 'name role') // Populate recipient info (name, role)
    .sort({ createdAt: -1 }); // Sort by most recent

  // Get the count of notifications for the user
  const count = await Notification.countDocuments({ recipients: userId });

  if (!notifications || notifications.length === 0) {
    return next(new AppError('No notifications found for this user.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: `You have ${count} new notifications.`,
    count,
    data: notifications,
  });
});

// Get notifications sent by a specific user
exports.getSentNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Get the logged-in user ID

  // Find notifications where the user is the sender
  const notifications = await Notification.find({ sender: userId })
    .populate('sender', 'name role') // Populate sender info (name, role)
    .populate('recipients', 'name role') // Populate recipient info (name, role)
    .sort({ createdAt: -1 }); // Sort by most recent

  // Get the count of notifications sent by the user
  const count = await Notification.countDocuments({ sender: userId });

  if (!notifications || notifications.length === 0) {
    return next(
      new AppError('No sent notifications found for this user.', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    message: `You have sent ${count} notifications.`,
    count,
    data: notifications,
  });
});

exports.getNotification = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  // Find the notification
  const notification = await Notification.findOne({
    _id: notificationId,
    recipients: userId,
  }).populate('sender', 'name role');

  if (!notification) {
    return next(new AppError('Notification not found or access denied.', 404));
  }

  // Mark as read in the background
  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  res.status(200).json({
    status: 'success',
    data: notification,
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  // Find the notification
  const notification = await Notification.findOne({
    $or: [
      { _id: notificationId, recipients: userId }, // For received notifications
      { _id: notificationId, sender: userId }, // For sent notifications
    ],
  });

  if (!notification) {
    return next(new AppError('Notification not found or access denied.', 404));
  }

  // Delete the notification
  await Notification.deleteOne({ _id: notificationId });

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully!',
  });
});
