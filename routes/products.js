const {Product} = require('../models/product.model');
const {Category} = require('../models/category.model');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-')
      cb(null, fileName + '-' + Date.now())
    }
  })
  
  const uploadOptions = multer({ storage: storage })

// api/v1/products:id                   -> req.params.id
// api/v1/products?categories=32,47     -> req.query.categories

router.get(`/`, async (req, res) =>{


    // example: localhost:3000/api/v1/products?categories=2342342,234234
    const filter = {};
    if(req.query.categories){
        const filter = {category: req.query.categories.split(',')};
    }
    const productList = await Product.find(filter).select('name image _id'); // will return only name and image and will exclude the pre defined attribute _id

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
        res.status(500).json({message: "The category with given ID was not found."})
    }
    res.status(200).send(product)
})

router.post(`/`, uploadOptions.single('image'), async (req, res) =>{

    //first check validation for valid product details  
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category!')

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save();
    if(!product){
        return res.status(500).send('The product cannot be created')
    }
    res.send(product);

    // product.save().then((createdProduct)=> {
    //     res.status(201).json(createdProduct)
    // }).catch((err)=>{
    //     res.status(500).json({
    //         error: err,
    //         success: false
    //     })
    // })
})

router.put('/:id', async (req, res) => {

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    }

    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category!')

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true } // without this line the object sent to client is not the updated one but the older one only so by using this we can send the updated one in res.send(product)
    )
    if(!product) {
        res.status(500).json({message: "the product cannot be updated"})
    } 
    res.status(200).send(product);
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
    .then(product => {
        if(product){
            return res.status(200).json({success: true, message: 'the product is deleted'})
        }else{
            return res.status(404).json({success: false, message: "Product not found"})
        }
    })
    .catch( (err) => {
        return res.status(400).json({success: false, error: err})
    })

})

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments((count) =>  count)
    if(!productCount){
        res.status(500).json({success: false})
    }
    res.send({
        productCount: productCount
    });
})

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({isFeatured: true}).limit(+count); // +count converts string coutn to integer count
    if(!products){
        res.status(500).json({success: false})
    }
    res.send(products);
})

module.exports =router;