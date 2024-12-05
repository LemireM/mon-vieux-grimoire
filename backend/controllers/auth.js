const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');


const User = require('../models/User');

const login = async (req, res) => {
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

        const token = jwt.sign({ _id: found._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.json({userId: found._id, token})
        return
    }
}

const signup = async (req, res) => {
    try {
        const {email, password} = req.body
        const schema = new passwordValidator();
        schema.is().min(8)                                    // Minimum length 8
            .is().max(100)                                  // Maximum length 100
            .has().uppercase()                              // Must have uppercase letters
            .has().lowercase()                              // Must have lowercase letters

        if(!schema.validate(password)){
            res.status(422).json({message: 'Mot de passe invalide'})
            return
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            email, password: hashedPassword
        })

        res.status(201).json({message: 'User created'})
    } catch(err){
        if(err.code === 11000){
            res.status(409).json({message: 'User already found'})
            return
        }
        res.status(500).json({message: 'Error'})
    }
    
}

module.exports = {
    login, signup
}