const Session = require('../../models/sessionModel');
const Section = require('../../models/sectionModel');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../../controllers/v1/handlerFactory');
const path = require('path');
const fs = require('fs');

exports.createSession = catchAsync(async (req, res, next) => {
  const { sectionId } = req.params;

  const section = await Section.findById(sectionId);
  if (!section) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Section not found!' });
  }

  const lastSession = await Session.findOne({ section: sectionId }).sort(
    '-order'
  );
  const newOrder = lastSession ? lastSession.order + 1 : 1;

  const session = await Session.create({
    ...req.body,
    section: sectionId,
    course: section.course,
    order: newOrder,
  });

  res.status(201).json({
    status: 'success',
    data: { session },
  });
});

exports.getSession = factory.getOne(Session);

exports.getAllSessions = factory.getAll(Session);

exports.updateSession = factory.updateOne(Session);

exports.deleteSession = factory.deleteOne(Session);

exports.uploadSessionVideo = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session) {
    return res.status(404).json({ message: 'Session not found! ❌' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No video file uploaded! ❌' });
  }

  session.sessionVideo = `/sessions/videos/${req.file.filename}`;
  await session.save();

  res.status(200).json({
    message: 'Session video uploaded successfully! ✅',
    sessionVideo: session.sessionVideo,
  });
});

exports.deleteSessionVideo = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session) {
    return res.status(404).json({ message: 'Session not found! ❌' });
  }

  if (!session.sessionVideo) {
    return res.status(400).json({ message: 'No video to delete! ❌' });
  }

  // مسیر فایل ویدیویی
  const videoPath = path.join(__dirname, '../../public', session.sessionVideo);

  // حذف فایل از سرور
  fs.unlink(videoPath, async (err) => {
    if (err) {
      console.error('Error deleting video:', err);
      return res.status(500).json({ message: 'Error deleting video! ❌' });
    }

    // حذف مسیر ویدیو از دیتابیس
    session.sessionVideo = undefined;
    await session.save();

    res.status(200).json({
      message: 'Session video deleted successfully! ✅',
    });
  });
});
