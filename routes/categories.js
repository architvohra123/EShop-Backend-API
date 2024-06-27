const {Category} = require('../models/category.model');
const express = require('express');
const router = express.Router();

// get all categories
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})

// to get a particular category
router.get('/:id', async(req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category) {
        res.status(500).json({message: "The category with given ID was not found."})
    } 
    res.status(200).send(category);
})


// create a category
router.post('/', async(req, res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save()

    if(!category){
        return res.status(400).send('the category cannot be created')
    }

    res.send(category)
})

// update a category
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        { new: true } // without this line the object sent to client is not the updated one but the older one only so by using this we can send the updated one in res.send(category)
    )
    if(!category) {
        res.status(400).json({message: "the category cannot be created"})
    } 
    res.status(200).send(category);
})

// delete a particular category
// api/v1/categories/<id>
router.delete('/:id', (req, res) => {           // by id
    Category.findByIdAndRemove(req.params.id)
    .then(category => {
        if(category){
            return res.status(200).json({success: true, message: 'the category is deleted'})
        }else{
            return res.status(404).json({success: false, message: "Category not found"})
        }
    })
    .catch( (err) => {
        return res.status(400).json({success: false, error: err})
    })
})

module.exports =router;