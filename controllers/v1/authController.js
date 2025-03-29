const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../../models/userModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const banUserModel = require('../../models/ban-phoneModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

// User Signup
exports.signup = catchAsync(async (req, res, next) => {
  const { username, name, email, phone, password, passwordConfirm } = req.body;

  // 1) Check if username, email, or phone already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }, { phone }],
  });

  if (existingUser) {
    return next(new AppError('Username, email, or phone already exists!', 409));
  }

  // 2) Check for banned phones
  const isUserBan = await banUserModel.find({ phone });
  if (isUserBan.length) {
    return next(
      new AppError(
        'This phone number is banned and cannot be used for signup.',
        403
      )
    ); // Error handling for banned phones
  }

  // 3) Create new user
  const countOfUsers = await User.countDocuments();
  const newUser = await User.create({
    username,
    name,
    email,
    phone,
    password,
    passwordConfirm,
    role: countOfUsers > 0 ? 'user' : 'admin', // First user becomes an admin
  });

  // 4) Send token to the user
  createSendToken(newUser, 201, req, res); // Function to create and send JWT token
});

// User Login
exports.login = catchAsync(async (req, res, next) => {
  const { identifier, password } = req.body;

  // Hey, did you forget to provide email/phone and password? 🧐
  if (!identifier || !password) {
    return next(new AppError('Please provide email/phone and password!', 400));
  }

  // Is it email or phone? Let’s figure that out! 🔍
  let user;
  if (identifier.includes('@')) {
    // Ah, it's an email! Let's find this user by email ✉️
    user = await User.findOne({ email: identifier }).select('+password');
  } else {
    // Nope, it's a phone number! Let's find this user by phone 📱
    user = await User.findOne({ phone: identifier }).select('+password');
  }

  // Did we find the user? And is the password correct? Let's hope so! 🤞
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email/phone or password', 401));
  }

  // Everything's good! Send the token and let the user in 🎉
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 🚧 Hold up! Let’s see if this user has the VIP pass 🎫
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          '🚫 Nope! You do not have permission for this action.',
          403
        )
      );
    }

    // 🎉 Woohoo! You’re in the cool club. Go ahead! 🚀
    next();
  };
};

// 🚧 TO-DO: This will take forever to fix... Future me, good luck! 😅
// ⏳ Will fix later: Ain't nobody got time for this right now! 🤯

/*
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});

*/
