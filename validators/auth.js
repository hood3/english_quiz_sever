// Bring in dependencies
const { check } = require('express-validator');// To use all express-validator functions

// User signup validation
exports.userSignupValidator = [// Check array
    check('name')// To see if name feild is input
        .not() // Make sure feild is not empty
        .isEmpty()// If name is empty send message
        .withMessage('Name is required'),// If empty send message
    check('email')// To see if an email is input
        .isEmail() // To see if is in email address format
        .withMessage('Must be a valid email address'),// Send message if not
    check('password')// To see if password feild is input
        .isLength({ min: 6 })// To make sure password is at least 6 characters long
        .withMessage('Password must be at least 6 characters long')// If not send message
];

//User signin validation
exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

//User forgot their password validation
exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address')
];

//User password reset validation
exports.resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];
