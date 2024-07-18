const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
    
})

// to add another attribute id because we find it difficult to use _id while using different systems like frontend
// so we add another attribute to the schema with name id with value same as that of _id
orderItemSchema.virtual('id').get(function () {
    return this._id ? this._id.toHexString() : null;
});

orderItemSchema.set('toJSON', {
    virtuals: true,
});


exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);
