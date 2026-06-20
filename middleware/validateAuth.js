import validator from 'validator';
import xss from 'xss';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const validateLoginInput = (req, res, next) => {
  const errors = [];

  let { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    email = email.trim().toLowerCase();
    if (email.length > 254) {
      errors.push('Email address is too long');
    }
    if (!EMAIL_REGEX.test(email)) {
      errors.push('Please provide a valid email address');
    }
    req.body.email = xss(email);
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (password.length > 128) {
      errors.push('Password is too long');
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({ message: errors.join('. ') });
  }

  next();
};
