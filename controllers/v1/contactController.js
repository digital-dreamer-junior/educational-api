const Contact = require('../../models/contactModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('../../controllers/v1/handlerFactory');
const nodemailer = require('nodemailer');

exports.createContact = factory.createOne(Contact);

exports.getAllContact = factory.getAll(Contact);

exports.deleteContact = factory.deleteOne(Contact);

exports.getContact = factory.getOne(Contact);

exports.answer = catchAsync(async (req, res, next) => {
  // Find the contact by ID
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    return next(new AppError('No contact found with this ID', 404));
  }

  // Check if the contact has already been answered
  if (contact.status === 'answered') {
    return next(new AppError('This message has already been answered', 400));
  }

  // Create a transporter for sending emails
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.GMAIL_USERNAME,
    to: contact.email, // Using the email from the contact itself
    subject: 'Reply to your message from "Dev Hub"',
    text: req.body.answer,
  };

  // Send email
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      return next(new AppError('Failed to send email', 500));
    } else {
      // Update the contact status to 'answered'
      contact.status = 'answered';
      await contact.save();

      res.status(200).json({
        status: 'success',
        message: 'Email sent successfully',
      });
    }
  });
});
