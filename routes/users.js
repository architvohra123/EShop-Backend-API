const {User} = require('../models/user.model');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')

router.get(`/`, async (req, res) =>{
    const userList = await User.find();

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

// to create a user
router.post('/', async(req, res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    console.log(user.passwordHash)
    user = await user.save()

    if(!user){
        return res.status(400).send('the user cannot be created')
    }

    res.send(user)
})

module.exports =router;