const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_987654321',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    }
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_jwt_key_change_in_production_123456789',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
