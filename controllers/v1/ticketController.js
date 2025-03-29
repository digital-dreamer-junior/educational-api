const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../../controllers/v1/handlerFactory');
const APIFeatures = require('../../utils/apiFeatures');
const Ticket = require('../../models/ticketModel');

exports.createTicket = catchAsync(async (req, res, next) => {
  const { title, category, userMessage } = req.body;

  // 2. Check if the user provided all required fields
  if (!title || !category || !userMessage) {
    return next(
      new AppError('Please provide title, category, and user message.', 400)
    );
  }

  // 3. Create the new ticket
  const newTicket = await Ticket.create({
    user: req.user._id, // Get user ID from the logged-in user
    title,
    category,
    userMessage,
  });

  // 4. Return the created ticket
  res.status(201).json({
    status: 'success',
    data: newTicket,
  });
});

exports.getTicketById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id; // Get user ID from token
  const userRole = req.user.role; // Get user role

  let ticket;

  if (userRole === 'admin') {
    // Admin can access any ticket
    ticket = await Ticket.findById(id);
  } else {
    // User can only access their own tickets
    ticket = await Ticket.findOne({ _id: id, user: userId });
  }

  if (!ticket) {
    return next(
      new AppError(
        'Ticket not found or you do not have access to this ticket.',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data: ticket,
  });
});

exports.getUserTickets = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  let filter = { user: userId }; // Filter based on userId

  // Use APIFeatures to handle filtering, sorting, pagination, etc.
  const features = new APIFeatures(Ticket.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tickets = await features.query;

  if (tickets.length === 0) {
    return next(new AppError('You have not created any tickets yet.', 404));
  }

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: tickets,
  });
});

exports.respondToTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { adminResponse } = req.body;

  // 1. Ensure adminResponse is provided
  if (!adminResponse) {
    return next(new AppError('Please provide a response message.', 400));
  }

  // 2. Find the ticket and ensure it's not already responded to
  const ticket = await Ticket.findById(id);

  if (!ticket) {
    return next(new AppError('Ticket not found.', 404));
  }

  // Ensure the user is an admin
  if (req.user.role !== 'admin') {
    return next(
      new AppError('You are not authorized to respond to this ticket.', 403)
    );
  }

  // 3. Update the ticket with the admin's response
  ticket.adminResponse = adminResponse;
  ticket.admin = req.user._id; // Assign the admin to the ticket
  ticket.status = 'answered'; // Change the status to 'answered'

  await ticket.save();

  // 4. Return the updated ticket
  res.status(200).json({
    status: 'success',
    data: ticket,
  });
});

exports.getAllTickets = factory.getAll(Ticket);
