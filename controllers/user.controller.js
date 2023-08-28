const {User} = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

//get all users
const getUsers = async (req, res) => {
    const userList = await User.find().select('name, phone, email')

    if (!userList) {
        return res.status(400).json({ success: false, message: 'users not found' })
    }

    return res.send(userList)
}

//get user by ID
const getUser = async (req, res) => {
    const {id} = req.params;

    if(!id) return res.status(400).json({ success: false, message: 'user does not exist' });

    try {
        const user = await User.findById(id).select('-passwordHash');

        if (!user) {
             return res.status(404).json({
                 message: 'User with given ID was not found',
             })
        }

        return res.send(user)
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
        })
    }
    
}

//get count of users
const getCount = async (req, res) => {
    try {
        const userCount = await User.countDocuments()

        if (!userCount) res.status(500).json({success: false})   

        res.status(200).json({count: userCount});
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
        })
    }
   
}

//create a new user on the database
const createUser = async (req, res) => {
    const{name, email, password, phone, isAdmin, street, apartment, zip, city, country } = req.body; 

    if(!req.body) return res.status(400).json({success: false, message: 'user could not be created'});

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        let user = new User({
            name,
            email,
            passwordHash,
            phone,
            isAdmin,
            street,
            apartment,
            zip,
            city,
            country,
        })

        user = await user.save()

        if (!user) return res.status(400).send('the user cannot be created!')

       return res.status(201).json(user)
    } catch (error) {
         return res.status(500).json({
             error: error.message,
             success: false,
         });
    }
    
}


//use to login the user and generate jwt
const login = async (req, res) => {
    const {email, password} = req.body;
    const secret = process.env.TOKEN_SECRET;
    
    if(!email || !secret) return res.status(400).send('invalid request');
    
    
    try {
        
        //check user with email
        const user = await User.findOne({ email })
        //return return error if user was not found
        if(!user)  return  res.status(404).send('user not found');
        //compare password and hashed password on the DB
        const comparePassword = await bcrypt.compare(
            password,
            user.passwordHash
        )
        //if password does not match return error
        if(!comparePassword) return res.status(403).send('wrong credentials');

        //create jwt token 
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
            },
            secret,
            { expiresIn: '1d' }

        )

        return res.status(200).send({user: user.email, token: token});
    } catch (error) {
         return res.status(500).json({
             error: error.message,
             success: false,
         })
    }
}

//delete user by ID
const deleteUser =  async (req, res) => {
    const {id} = req.params;
   
    if (!id)
        return res
            .status(400)
            .json({ message: 'check the id!'});

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'invalid id!' })
    }

    try {
        const deletedUser = await User.findByIdAndRemove(id);
        if(!deletedUser) return res
            .status(404)
            .json({ success: false, message: 'the user cannot be deleted!' });

        return res.status(200).json({success: true, message: 'the user has been deleted.'});
    } catch (error) {
         res.status(500).json({
             error: error.message,
             success: false,
         })
    }
}


module.exports = {
    getUsers,
    getUser,
    getCount,
    createUser,
    login,
    deleteUser
}