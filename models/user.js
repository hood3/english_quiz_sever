// Bring in dependencies
const mongoose = require('mongoose');
const crypto = require('crypto'); // Crypto is a nodeJS module for hashing passwords

// My user schema for creating users 
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String, // This is a string
            trim: true, // To remove any white spaces
            required: true, // This is a required field
            max: 32  // Maximum characters
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true, // Makes sure email is unique and not already in database
            lowercase: true // Makes all characters lowercase
        },
        hashed_password: {// hashed password that is saved in the database
            type: String,
            required: true
        },
        salt: String, // Defines how strong the hashing of the password is going to be
        role: { // Added for any future updates such as administrator.
            type: String,
            default: 'subscriber'
        },
        resetPasswordLink: { // If user forgets password I will generate token and save in database
            data: String, // Will save as data later in client
            default: ''
        },       
    },
    { timestamps: true } // Generates a time stamp in my database
);

// Virtual user schema to take password and save it as a hashed and encrypted password 
userSchema
    .virtual('password')// to access the user schema; take the password
    .set(function(password) {
        // Create a temporary variable called _password for this function only
        this._password = password;
        // Generate salt
        this.salt = this.makeSalt();// Invoke makeSalt method
        // EncryptPassword
        this.hashed_password = this.encryptPassword(password);// Invoke encryptPassword method
    })
    .get(function() { // User schema will get the hashed password
        return this._password;
    });
 
userSchema.methods = {
    authenticate: function(plainText) { // Method for comaring the password input to the 
        //hashed password in the database
        return this.encryptPassword(plainText) === this.hashed_password;
    },
 
    encryptPassword: function(password) {
        if (!password) return ''; // If there is no password return empty string
        try { // If there is a password
            return crypto
                .createHmac('sha256', this.salt) // Hashing algorithm sha256
                .update(password)// Method used to push data to later be turned into a hash
                // with the digest method.
                .digest('hex');// Method to represent the the output format
        } catch (err) {
            return '';
        }
    },
 
    makeSalt: function() {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    } // Generates the salt
};
 
module.exports = mongoose.model('User', userSchema); // Exports the model to be used



