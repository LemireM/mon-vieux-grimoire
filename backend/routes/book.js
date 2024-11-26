const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const Book = require('../models/Book')
const authMiddleware = require('../middlewares/authentification')
const uploader = require('../middlewares/uploader')
const fs = require('fs/promises')


router.get('/', async (req, res) => {    
    const books = await Book.find({}).exec()
    res.json(books)
})

router.get('/bestrating', async (req, res) => {
    const books = await Book.find({}, {}, {limit: 3}).sort({averageRating: -1})
    res.json(books)
})

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findOne({_id: req.params.id}).exec()
        res.json(book)
    }catch(err){
        res.status(404).end()
    }
})

//router.post('/', authMiddleware, (req, res) => {
router.post('/', uploader, async (req, res) => {
    const bookData = JSON.parse(req.body.book)

    const book = new Book({
        ...bookData,
        imageUrl: `http://localhost:4000/${req.file.path}`,
        averageRating: 0,
        ratings: []
    })
    try {
        await book.save()
        res.status(201).json({message: 'OK'})
    }catch(err){
        res.status(500).end()
    }
})

router.put('/:id', uploader, async (req, res) => {
    try {
        const book = await Book.findOne({_id: req.params.id}).exec()       
        if(!book){
            res.status(404).end()    
            return
        }

        let bookData = null

        if(req.file && req.file.path){
            // Il y a une nouvelle image dans la requête
            let imageNameSplit = book.imageUrl.split('/')
            const imageName = imageNameSplit[imageNameSplit.length - 1]
            try {
                await fs.access(`./static/${imageName}`)    
                await fs.unlink(`./static/${imageName}`)
            } catch(err){
                console.log("Le fichier n'existe pas")
            } finally {
                bookData =  {
                    ...JSON.parse(req.body.book),
                    imageUrl: `http://localhost:4000/${req.file.path}`
                }
            }
        } else {
            // Il n'y pas de modification
            bookData = req.body
        }
        await Book.updateOne({_id: req.params.id}, {...bookData})
        res.status(200).json({message: 'OK'})
    }catch(err){
        console.log(err)
        res.status(404).end()
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findOne({_id: req.params.id}).exec()       
        if(!book){
            res.status(404).end()    
            return
        }
        let imageNameSplit = book.imageUrl.split('/')
        const imageName = imageNameSplit[imageNameSplit.length - 1]
        await fs.unlink(`./static/${imageName}`)
        await Book.deleteOne({_id: req.params.id})
        res.status(204).end()
    }catch(err){
        console.log(err)
        res.status(404).end()
    }
})

router.post('/:id/rating', async (req, res) => {
    try {
        let book = await Book.findOne({_id: req.params.id}).exec()       
        if(!book){
            res.status(404).end()    
            return
        }
        const {userId, rating} = req.body        
        const exists = book.ratings.find(rating => rating.userId === userId)
        if(exists){
            res.status(409).json({message: "L'utilisateur a déjà noté ce livre"})
            return
        }
        const sumRating = book.ratings.reduce((acc, {rating}) => acc + rating, 0) + rating // On somme toutes les notes existantes + la note courante
        const averageRating = sumRating / (book.ratings.length + 1)
        book.ratings = [{userId, rating }]
        book.averageRating = averageRating
        await Book.updateOne({_id: req.params.id}, {ratings: [{userId, rating }], averageRating})
        res.status(200).json(book)
    }catch(err){
        console.log(err)
        res.status(404).end()
    }
})

module.exports = router