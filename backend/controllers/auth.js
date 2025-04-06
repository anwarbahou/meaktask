const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists with email:', email);
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    console.log('Creating new user with email:', email);
    const user = await User.create({
      name,
      email,
      password
    });
    console.log('User created successfully with ID:', user._id);

    // Create and send token
    console.log('Generating JWT token');
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error details:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('Validation error:', messages);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    console.log('Server error during registration');
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    console.log('Checking password match');
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create and send token
    console.log('Login successful for user:', user._id);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Helper function to get token and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  try {
    console.log('Creating JWT with user ID:', user._id);
    const token = user.getSignedJwtToken();
    console.log('JWT created successfully');

    res.status(statusCode).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Error creating JWT:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authentication token'
    });
  }
}; 