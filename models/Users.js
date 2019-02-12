const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  savedCrypto: {type: Array, required: false, default: ['BTCUSDT']}
})

const User = mongoose.model('User', userSchema);

module.exports = User;
