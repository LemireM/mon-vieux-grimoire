const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose')
const User = require('../models/User')

router.post('/login', async (req, res) => {
    const {email, password} = req.body
    const found = await User.findOne({email})

    if(!found){
        res.status(404).json({message: 'User not found'})
        return
    }

    if(found){
        const passwordMatched = await bcrypt.compare(password, found.password)

        if(!passwordMatched){
            res.status(401).json({message: "Invalid credentials"})
            return
        }

        const token = jwt.sign({ _id: found._id }, process.env.JWT_SECRET);
        res.json({userId: found._id, token})
        return
    }
})

router.post('/signup', async (req, res) => {
    const {email, password} = req.body
    const found = await User.findOne({email})
    if(found){
        res.status(409).json({message: 'User already found'})
        return
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
        email, password: hashedPassword
    })

    res.status(201).json({message: 'User created'})
})



module.exports = router