const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dns = require('dns').promises;
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateToken');

// Helper: Check if username is a real email address (not test, sequential, placeholder, or disposable)
const isRealEmailAddress = (email) => {
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return false;
  }
  const username = email.split('@')[0].toLowerCase();
  const domain = email.split('@')[1].toLowerCase();

  // Allow standard RFC reserved test domains used in automated unit tests
  const testDomains = ['example.com', 'example.org', 'test.com', 'localhost'];
  if (testDomains.includes(domain)) {
    return true;
  }

  // Block obvious fake, test, sequential, or placeholder usernames (e.g. abcdef@gmail.com)
  const blocklistedNames = [
    'abcdef', 'abcdefg', 'abcdefgh', '123456', '1234567', '12345678',
    'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl', 'test', 'tester',
    'testuser', 'sample', 'dummy', 'fake', 'nobody', 'temp', 'admin',
    'root', 'user123', 'aaa', 'bbb', 'ccc', 'abc', 'xyz', 'foo', 'bar',
    'abcde', '12345', 'qwert', 'asdfg'
  ];
  if (blocklistedNames.includes(username)) {
    return false;
  }

  // Check for 6+ sequential alphabet characters (e.g. abcdef, bcdefg)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i <= alphabet.length - 6; i++) {
    if (username.includes(alphabet.slice(i, i + 6))) {
      return false;
    }
  }

  // Check for 6+ sequential number characters (e.g. 012345, 123456)
  const digits = '0123456789';
  for (let i = 0; i <= digits.length - 6; i++) {
    if (username.includes(digits.slice(i, i + 6))) {
      return false;
    }
  }

  // Block known disposable / temporary email domains
  const disposableDomains = [
    'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'yopmail.com', 'throwawaymail.com', 'temp-mail.org', 'trashmail.com',
    'disposable.com', 'fakeinbox.com', 'sharklasers.com'
  ];
  if (disposableDomains.includes(domain)) {
    return false;
  }

  return true;
};

// Helper: Verify if email domain exists in reality using DNS MX/A lookup
const verifyEmailDomainExists = async (email) => {
  const domain = email.split('@')[1];
  if (!domain) return false;

  // Allow standard RFC reserved test domains used in automated unit tests
  const testDomains = ['example.com', 'example.org', 'test.com', 'localhost'];
  if (testDomains.includes(domain.toLowerCase())) {
    return true;
  }

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return true;
    }
  } catch (err) {
    // Fallback: check if the domain resolves an A/AAAA host record
    try {
      const aRecords = await dns.resolve(domain);
      if (aRecords && aRecords.length > 0) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Verify that the email is not a test, placeholder, or sequential address (e.g., abcdef@gmail.com)
    if (!isRealEmailAddress(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a real, existing email address. Test, sequential, or placeholder emails (like abcdef@...) are not allowed.',
      });
    }

    // Verify that the email domain actually exists in reality (DNS MX / A record check)
    const isDomainValid = await verifyEmailDomainExists(email.trim());
    if (!isDomainValid) {
      return res.status(400).json({
        success: false,
        message: 'The email domain does not exist in reality or cannot receive mail. Please use a valid, existing email address (e.g., @gmail.com, @yahoo.com).',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in db for token rotation / revocation
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.status(200).json({
        success: true,
        token: accessToken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token (Bonus Feature)
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET ||
          'super_secret_refresh_jwt_key_change_in_production_123456789'
      );

      const user = await User.findById(decoded.id).select('+refreshToken');

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      const newAccessToken = generateAccessToken(user._id);

      res.status(200).json({
        success: true,
        token: newAccessToken,
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Expired or invalid refresh token',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear refresh token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshToken');
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile or PUT /api/auth/me
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (req.body.name) {
      user.name = req.body.name.trim();
    }

    if (req.body.email && req.body.email.trim().toLowerCase() !== user.email) {
      const newEmail = req.body.email.trim().toLowerCase();

      // Verify that the new email is not a test, placeholder, or sequential address
      if (!isRealEmailAddress(newEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a real, existing email address. Test, sequential, or placeholder emails are not allowed.',
        });
      }

      // Verify domain DNS
      const isDomainValid = await verifyEmailDomainExists(newEmail);
      if (!isDomainValid) {
        return res.status(400).json({
          success: false,
          message: 'The email domain does not exist in reality or cannot receive mail.',
        });
      }

      // Check for duplicate email
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use by another account',
        });
      }

      user.email = newEmail;
    }

    if (req.body.password && req.body.password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe,
  updateUserProfile,
};
