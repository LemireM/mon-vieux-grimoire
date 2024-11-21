const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const Book = require('../models/Book')
const authMiddleware = require('../middlewares/authentification')

router.get('/', async (req, res) => {    
    const books = await Book.find({}).exec()
    res.json(books)
})

router.get('/bestrating', (req, res) => {
    res.send('books bestrating')
})

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findOne({_id: req.params.id}).exec()
        res.json(book)
    }catch(err){
        res.status(404).end()
    }
})

router.post('/', authMiddleware, (req, res) => {
    res.send('books')
})

router.put('/:id', authMiddleware, (req, res) => {
    res.send('books')
})

router.delete('/:id', authMiddleware, (req, res) => {
    res.send('books')
})

router.put('/:id/rating', authMiddleware, (req, res) => {
    res.send('books')
})

module.exports = router