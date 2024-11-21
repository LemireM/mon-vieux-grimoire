const express = require('express')
const mongoose = require('mongoose');
const app = express()
const port = process.env.PORT || 3000
const book = require('./routes/book')
const auth = require('./routes/auth')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()


app.use(cors())
app.use(express.json())

app.use('/api/books', book)
app.use('/api/auth', auth)


const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME
} = process.env


mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`)
  .then(
    () => console.log('Database connected'),
    (error) => console.log(error));


app.listen(port, () => {
  console.log(`API Mon vieux grimoire: PORT: ${port}`)
})
