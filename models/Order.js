const mongoose = require('mongoose');


const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    orderdate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'pending'
    }
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order// Export the model
