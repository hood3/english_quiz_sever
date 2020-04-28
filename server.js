// Bring in dependencies
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Excute method config to use env variables
const items = require('./routes/api/items');// Items route

const app = express(); // Invoke the express functionalities

// Connect to my MongoDB Atlas database
mongoose // Mongoose is an object document mapper for mapping a schema to mongodb
    .connect(DATABASE, { // My database stored in my env variables
        useNewUrlParser: true, // To keep deprecated warnings from showing up in terminal
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log('DataBase connected'))// If connected, console log in terminal
    .catch(err => console.log('DataBase connection error: ', err));//If error connecting, log in terminal

// Import routes
const authRoutes = require('./routes/auth');

// App middlewares
app.use(morgan('dev'));//Use morgan development flag to get endpoints and info in terminal
app.use(express.json());//To parse json data sent from client to javascript object for server
app.use(cors()); //Use cors to prevent browser error of different origins, allows all origins

// Middleware for requests from client to endpoints
app.use('/api/items', require('./routes/api/items')); //Express use function to pass routes
app.use('/api', authRoutes);

// Listen on port
const port = process.env.PORT || 5000; // Process the port from env file or use port 5000
app.listen(port, () => { // Listen method from express
    console.log(`API is running on port ${port}`);// Console log in terminal
});