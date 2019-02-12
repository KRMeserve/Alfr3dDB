// dependencies
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/Users.js');
const app = express();
require('dotenv').config();
const db = mongoose.connection;


// port
const PORT = process.env.PORT || 3000;

// Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/' + 'Alfr3d';

// Secret
const SECRET = process.env.SECRET;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

// Errors/Success Messages
db.on('error', (err)=> console.log(err.message + ' is Mongod not running?'));
db.on('connected', ()=> console.log('mongo connected: ', MONGODB_URI));
db.on('disconnected', ()=> console.log('mongo disconnected'));

// Open the connection to mongo
db.on('open', ()=>{});

//Middleware
app.use(express.static('public')); //Can build front-end of this app in public folder.
app.use(express.urlencoded({extended: true})); // populates the req.body with parsed info from forms
app.use(express.json());

//Routes

//create new user
app.post('/users/new', (req, res)=>{
  req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  User.create(req.body, (error, newUser)=>{
    res.send('user created');
  });
});


// Listen
app.listen(PORT, ()=>{
  console.log('listening on port ', PORT);
});
