const express = require('express');
const router = express.Router();

const Item = require('../../models/Item');

router.get('/', (req, res) => {//Get endpoint to retrieve items from database
    Item.find()//Method to find item
    .sort({date:-1})//Sorts items
    .then(items => res.json(items));//Returns items as json object
});

router.post('/', (req, res) => {//Post endpoint to save items to my database
    newItem = new Item({        
        word:req.body.word,  //Saves word to database
        sentence:req.body.sentence    //Saves sentence to database  
    });    
    newItem.save()//Saves all items as json
    .then(item => res.json(item));        
});

module.exports = router;