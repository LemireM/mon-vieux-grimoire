const Book = require('../models/Book')
const fs = require('fs/promises')
const {compressImage} = require('../utils/utils')


const getAll = async (req, res) => {
    try {
        const books = await Book.find({}).exec()
        res.json(books)   
    } catch(err){
        res.status(500).json({message: "Erreur serveur"})
    }    
} 

const getBestRating = async (req, res) => {
    try {
        const books = await Book.find({}, {}, {limit: 3}).sort({averageRating: -1})
        res.json(books)
    } catch(err){
        res.status(500).json({message: "Erreur serveur"})
    }
}

const getById = async (req, res) => {  
    try {
        const book = await Book.findOne({_id: req.params.id}).exec()
        if(!book){
            res.status(404).json({message: 'Livre inexistant'})
            return
        }
        res.json(book)
    } catch(err){
        res.status(500).json({message: "Erreur serveur"})
    }
}

const create = async (req, res) => {
    try {
        const bookData = JSON.parse(req.body.book)


        const fileDest = await compressImage(req.file)

        const book = new Book({
            ...bookData,
            imageUrl: `http://${req.hostname}:${process.env.PORT}/static/resized/${fileDest}`,
            averageRating: 0,
            ratings: []
        })  
        await book.save()
        res.status(201).json({message: 'OK'})
    } catch(err){
        res.status(500).json({message: 'Livre non ajouté'})
    }
}

const update = async (req, res) => {
    try {
        const book = await Book.findOne({_id: req.params.id}).exec()       
        if(!book){
            res.status(404).end()    
            return
        }

        if(book.userId !== req.userId){
            res.status(403).json({message: 'Utilisateur non autorisé'})
            return
        }

        let bookData = null

        if(req.file && req.file.path){
            // Il y a une nouvelle image dans la requête
            let imageNameSplit = book.imageUrl.split('/')
            const imageName = imageNameSplit[imageNameSplit.length - 1]
            const fileDest = await compressImage(req.file)
            try {
                await fs.access(`./static/resized/${imageName}`)    
                await fs.unlink(`./static/resized/${imageName}`)                
            } catch(err){
                console.log("Le fichier n'existe pas")
            } finally {
                bookData =  {
                    ...JSON.parse(req.body.book),
                    imageUrl: `http://${req.hostname}:${process.env.PORT}/static/resized/${fileDest}`
                }
            }
        } else {
            // Il n'y pas de modification d'image
            bookData = req.body
        }
        await Book.updateOne({_id: req.params.id}, {...bookData})
        res.status(200).json({message: 'OK'})
    }catch(err){
        console.log(err)
        res.status(404).json({message: 'Livre non modifé'})
    }
}

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findOne({_id: req.params.id}).exec()       
        if(!book){
            res.status(404).end()    
            return
        }

        if(book.userId !== req.userId){
            res.status(403).json({message: 'Utilisateur non autorisé'})
            return
        }

        let imageNameSplit = book.imageUrl.split('/')
        const imageName = imageNameSplit[imageNameSplit.length - 1]
        await fs.unlink(`./static/${imageName}`)
        await Book.deleteOne({_id: req.params.id})
        res.status(204).end() // Jamais de contenu pour le code 204 propre à une suppression de ressource
    }catch(err){
        console.log(err)
        res.status(404).json({message: 'Livre non supprimé'})
    }
}

const addRating = async (req, res) => {
    try {
        let book = await Book.findOne({_id: req.params.id}).exec()       
        if(!book){
            res.status(404).end()    
            return
        }
        const {userId, rating} = req.body        
        /**
         * On doit vérifier que le userId de la requête correspond bien
         * au userId de l'authentification. Sinon, on pourrait envoyer des notes avec un utilisateur inconnu
         */        
        if(userId !== req.userId){
            res.status(403).json({message: "L'utilsateur de la requête n'est pas autorisé à noter ce livre"})
            return
        }
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
        res.status(404).json({message: 'Note non ajoutée'})
    }
}

module.exports = {
    getAll, getBestRating, getById, create, update, deleteBook, addRating
}
