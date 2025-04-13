const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userValidationRules = () => {
  return [
    body('name')
      .isLength({ min: 20, max: 60 })
      .withMessage('Name must be between 20 and 60 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8, max: 16 })
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must be 8-16 characters and contain at least one uppercase letter and one special character'),
    body('address')
      .isLength({ max: 400 })
      .withMessage('Address must not exceed 400 characters'),
  ];
};

const storeValidationRules = () => {
  return [
    body('name')
      .isLength({ min: 20, max: 60 })
      .withMessage('Store name must be between 20 and 60 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('address')
      .isLength({ max: 400 })
      .withMessage('Address must not exceed 400 characters'),
  ];
};

const ratingValidationRules = () => {
  return [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
  ];
};

module.exports = {
  validate,
  userValidationRules,
  storeValidationRules,
  ratingValidationRules,
}; 