// Bring in dependencies
const express = require('express'); // To be able to use router function from express
const router = express.Router(); // Use express router

//Import controller, these are route endpoints
const {
    signup,
    accountActivation,
    signin,
    forgotPassword,
    resetPassword     
} = require('../controllers/auth');

//Import validators
const {
    userSignupValidator,// To check for any errors, if no errors controllers methods can execute
    userSigninValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../validators/auth');
const { runValidation } = require('../validators');// Middleware

// User endpoints
router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation);
router.post('/signin', userSigninValidator, runValidation, signin);

// Forgot password reset endpoints
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);

module.exports = router;