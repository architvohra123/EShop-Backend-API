const { Order } = require('../models/order.model');
const { OrderItem } = require('../models/order-item.model');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderList = await Order
    .find()
    .populate('user', 'name email')
    .sort({'dateOrdered': -1});

    if (!orderList) {
        return res.status(500).json({ success: false });
    } 
    res.send(orderList);
});

router.get('/:id', async (req, res) =>{
    const order = await Order
    .findById(req.params.id)
    .populate('user', 'name email')
    .populate({ 
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}
    });

    if(!order){
        return res.send(500).json({ success: false });
    }
    res.send(order);
});

router.post('/', async (req, res) => {
    const orderItemsIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));

    console.log(orderItemsIds);

    let order = new Order({
        orderItems: orderItemsIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        user: req.body.user
    });

    order = await order.save();

    if (!order) {
        return res.status(400).send('the order cannot be created');
    }

    res.send(order);
});

// update an order
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
           status: req.body.status
        },
        { new: true } // without this line the object sent to client is not the updated one but the older one only so by using this we can send the updated one in res.send(category)
    )
    if(!order) {
        res.status(400).json({message: "the order cannot be created"})
    } 
    res.status(200).send(order);
})

//delete an order
router.delete('/:id', (req, res) => {           // by id
    Order.findByIdAndDelete(req.params.id)
    .then(order => {
        if(order){
            return res.status(200).json({success: true, message: 'The order is deleted'})
        }else{
            return res.status(404).json({success: false, message: "Order not found"})
        }
    })
    .catch( (err) => {
        return res.status(400).json({success: false, error: err})
    })
})
module.exports = router;
