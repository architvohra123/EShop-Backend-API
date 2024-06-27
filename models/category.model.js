const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String    // like #000
    }
})

exports.Category = mongoose.model('Category', categorySchema);
