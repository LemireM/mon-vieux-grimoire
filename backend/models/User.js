const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const User = new Schema({
  email: {type: String, unique: true},
  password: String,  
});

module.exports = mongoose.model('User', User)