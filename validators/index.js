// Bring in dependencies
const { validationResult } = require('express-validator');// Error results from validators auth

//Validation function callback
exports.runValidation = (req, res, next) => {//Next is call back function to be applied as middleware for routes
    const errors = validationResult(req);
    if (!errors.isEmpty()) {//Grab errors and send back to the client
        return res.status(422).json({
            error: errors.array()[0].msg//Error messages from error array in validators auth
        });
    }
    next();// Callback function to keep nodejs running
};