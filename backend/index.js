const express = require('express')
const mongoose = require('mongoose');
const app = express()
const port = process.env.PORT || 4000
const book = require('./routes/book')
const auth = require('./routes/auth')
const cors = require('cors')
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit')

dotenv.config()


app.use(cors())
app.use(express.json())
const limiter = rateLimit({
	windowMs: 30 * 60 * 1000, // 15 minutes
	limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})
app.use(limiter)

app.use('/static', express.static('static'));
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
