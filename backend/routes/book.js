const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/authentification')
const uploader = require('../middlewares/uploader')

const {
    getAll,
    getBestRating,
    getById,
    create,
    update,
    deleteBook,
    addRating
} = require('../controllers/book')


router.get('/', getAll)

router.get('/bestrating', getBestRating)

router.get('/:id', getById)

router.post('/', authMiddleware, uploader, create) // L'ordre des middleware a une importance.

router.put('/:id', authMiddleware, uploader, update)

router.delete('/:id', authMiddleware, deleteBook)

router.post('/:id/rating', authMiddleware, addRating)

module.exports = router