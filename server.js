// dependencies
const bcrypt = require('bcrypt');
const express = require('express');
const request = require('request');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/Users.js');
const app = express();
require('dotenv').config();
const db = mongoose.connection;
// API used to collect data on Crypto Prices: Binance Official API

//Allows cors requests from Alfr3d site, but blocks from other sites
const whitelist = ['https://alfr3d.netlify.com', 'http://www.amarillosky.com']
const corsOptions = {
  origin: (origin, callback) =>{
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

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
app.use(cors(corsOptions)); //middleware to disable CORS and allow my external site to call my db

//Routes

//User login
app.post('/users', (req, res)=>{
  console.log(req.body);
  console.log(req.body.username, 'username');
  console.log(req.body.password, 'password');
  //looks through database for a matching username
  User.findOne({username: req.body.username}, (error, returnedUser)=>{
    console.log(req.body.username);
    console.log(returnedUser);
    //if there is a matching username, encrypts received password and tests against saved encrypted password in database
    if (returnedUser !== null) {
      if (bcrypt.compareSync(req.body.password, returnedUser.password)) {
        res.json('passwords match');
      } else {
        res.json('error');
      }
    } else {
      res.json('user does not exist')
    }
  })
})

//create new user
app.post('/users/new', (req, res)=>{
  //encrypting password
  req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  //creating new user in database with encrypted password
  User.create(req.body, (error, newUser)=>{
    res.json(newUser);
  });
});


//whichever symbol is passed in is parsed from binance and symbol and price returned
app.get('/:sym', (req, res)=>{
  request.get({url: "https://api.binance.com/api/v3/ticker/price"}, (error, response, body)=>{
    if (!error) {
      //Made empty array to contain requested crypto price.
      const requestedCrypto = [];
      //Turned JSON into objects so I can iterate over and find correct info.
      const cryptos = JSON.parse(body);
      //For loop to iterate over data from API.
      for (let i = 0; i < cryptos.length; i++) {
        //for each object, we check the key
        for (key in cryptos[i]) {
          //if the key is 'symbol', then we check to see if the symbol matches the symbol passed in the req.params
          if (key === 'symbol') {
            //If the symbol is the same as the params symbol, we push it into the requestedCrypto array.
            if (cryptos[i].symbol === req.params.sym.toUpperCase()) {
              requestedCrypto.push(cryptos[i])
            }
          }
        }
      };
      return(res.json(requestedCrypto))
    } else {
      res.json(error);
    };
  });
});

// Listen
app.listen(PORT, ()=>{
  console.log('listening on port ', PORT);
});
