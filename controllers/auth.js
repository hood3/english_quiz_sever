// Bring in dependencies
const User = require('../models/user'); //Use User schema to create user
const jwt = require('jsonwebtoken'); // to use json web-token
const expressJwt = require('express-jwt');
const _ = require('lodash');//Provides method called extends

//Sendgrid
const sgMail = require('@sendgrid/mail'); //Sendgrid dependency
sgMail.setApiKey(process.env.SENDGRID_API_KEY); //Sendgrid key saved in my env variables

exports.signup = (req, res) => { //Signup route or endpoint
    const { name, email, password } = req.body;//Data available in the request body destructured
    User.findOne({ email }).exec((err, user) => {//Mongoose method to find if email already exsist in database
        if (user) {// Execute method with callback that email exsist
            return res.status(400).json({
                error: 'Email is taken'// Message to client
            });
        }
        //If is new email then generate a sign token with info embedded, and 2nd 
        //argument is the secret and third argument is expiration time
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });
        //Send email to the user to make sure user is using personal email account
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email, // to the users email from request body information
            subject: `Account activation link`,
            html: `<h1>Please use the following link to activate your account</h1>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr />
                <p>Warning this email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>`
        };

        sgMail // for sending emaildata
            .send(emailData)
            .then(sent => {  // Response             
                return res.json({ // Message to user
                    message: `Email has been sent to ${email}. Please follow the instructions to activate your account`
                });
            })
            .catch(err => {// If error send message
                return res.json({
                    message: err.message // Error message
                });
            });
    });
};       

exports.accountActivation = (req, res) => { //Account activation route or endpoint
    const { token } = req.body; // Token thats available from request body
    if (token) {
        // If have token, verify with token and secret key, then use callback function 
        //for token or error 
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
            if (err) {
                console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
                return res.status(401).json({
                    error: 'Expired link. Register again'//Error message sent to client
                });
            }
            // Signup user with info from token
            const { name, email, password } = jwt.decode(token);//Decode token for info
            const user = new User({ name, email, password });//Pass data to create new user
            user.save((err, user) => {//Save new user
                if (err) {//Catch error if error
                    console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
                    return res.status(401).json({//Error message
                        error: 'Error saving user in database. Try to register again'
                    });
                }
                return res.json({//If no error, success message
                    message: 'Registration success. Please sign in.'
                });
            });
        });
    } else {// If endpoint is trying to be reached without token
        return res.json({//Error message
            message: 'Something went wrong. Try again.'
        });
    }
};

exports.signin = (req, res) => { //Signin route or endpoint
    const { email, password } = req.body;//Info from request body

    // Check if the user exist
    User.findOne({ email }).exec((err, user) => { //Mongoose method to find email
        if (err || !user) {// If no email in database
            return res.status(400).json({//Error message
                error: 'User with that email does not exist. Please Register'
            });
        }

        // If has email in database then authenticate
        if (!user.authenticate(password)) {//Authenticate method from controller returns true/false
            return res.status(400).json({//Error message
                error: 'Email and password do not match'
            });
        }

        // Generate a token and send to client, extract id from token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { _id, name, email, role } = user;//Grab and destructure from user
        return res.json({// Send token and user info for signing user in
            token,
            user: { _id, name, email, role }
        });
    });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET // middleware that passes the secret to validate the 
    //user and make the user info available to a request.user IE passes user property to
    //request object
});

// If user forgets their password
exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }, (err, user) => {//Find the user based on email
        if (err || !user) {//If error return response of 400 and send message
            return res.status(400).json({
                error: 'User with that email address does not exist'
            });
        }
        //If no error, generate a token and send in email to user using reset secret 
        const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD, {
            expiresIn: '10m'// 10 minute expiration
        });
        const emailData = {//Email data to send to users email
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset link`,
            html: `<h1>Please use the following link to reset your password</h1>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>`
        };
        //Update user with new token in resetlink    
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {//handle any errors
                console.log('RESET PASSWORD LINK ERROR', err);
                return res.status(400).json({
                    error: 'Database connection error for user password forgot request'
                });
            } else {//If no errors send email
                sgMail
                    .send(emailData)
                    .then(sent => {                        
                        return res.json({
                            message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                        });
                    })
                    .catch(err => {                      
                        return res.json({
                            message: err.message
                        });
                    });
            }
        });
    });
};

// User can reset their password
exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
    if (resetPasswordLink) {//This is token, verify not expired
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded){
            if (err) {//If expired display message
                return res.status(400).json({
                    error: 'Expired link. Try again'
                });
            }
            //Find the user based on resetpassword link
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {//If error display message
                    return res.status(400).json({
                        error: 'Something went wrong. Try again later'
                    });
                }
                //If found user reset values
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''// Set token back to empty
                };

                user = _.extend(user, updatedFields);//Use lodash method to extend user 
                //object with updated fields
                
                user.save((err, result) => {// Save the user to the database
                    if (err) { //If error send message
                        return res.status(400).json({
                            error: 'Error resetting user password'//Message to client
                        });
                    }
                    res.json({// If no error send message
                        message: `Great! Now you can login with your new password`
                    });
                });
            });
        });
    }
};
