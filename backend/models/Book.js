const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const Book = new Schema({
  userId: String,
  title: String,
  author: String,
  imageUrl: String,
  year: Number,
  genre: String,
  ratings: [],
  averageRating: Number
});

module.exports = mongoose.model('Book', Book)