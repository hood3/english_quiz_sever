// Bring in dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// My Items schema for creating quiz
const ItemSchema = new Schema({
    word:{
       type:String, // This is a string
        required: true // This is a required field
    },
    sentence:{
        type:String, // This is a string
        required:true // This is a required field
    }  ,  
    date:{
        type: Date, // This is a date
        default:Date.now // Generates todays date
    }
});

module.exports = Item = mongoose.model('item', ItemSchema); // Exports the model to be used
