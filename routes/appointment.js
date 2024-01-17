const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const router = express.Router()
const fetchuser = require('../middleware/getUser')
const nodemailer = require('nodemailer'); // Import Nodemailer

//Get All Orders
router.get('/fetchOrder', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id
        const orders = await Order.find({ user: userId });
        res.status(201).send(orders)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Unexpected Error")
    }
})

//Get single Order by Id
router.get('/orderById/:id', fetchuser, async (req, res) => {
    try {
        let success = false
        const orderId = req.params.id
        const userId = req.user.id
        if (!orderId) {
            success = false
            return res.status(400).json({ message: "Order Id is required", success })
        }
        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            success = false
            return res.status(404).json({ message: "Order not found!" })
        }
        success = true

        res.status(201).send({ order, success })
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Unexpected Error")
    }
})

// Create a new order
router.post('/placeorder', fetchuser, async (req, res) => {
    try {
        let success = false
        const { address, date, time, status } = req.body; // Include status in the request body
        const userId = req.user.id; // Assuming you have user authentication in place
        const email = req.user.email

        if (!address) {
            success = false
            return res.status(400).json({ message: "Address is required", success })
        }
        if (!date) {
            success = false
            return res.status(400).json({ message: "Date is required", success })
        }
        if (!time) {
            success = false
            return res.status(400).json({ message: "Time is required", success })
        }
        // Create a new order with the user's ID, address, and the provided status
        const newOrder = new Order({
            user: req.user.id,
            address,
            date,
            time,
            status: status || 'pending', // Default to "pending" if status is not provided
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        //transporter service
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'wasteawayorg@gmail.com',
                pass: 'nzai mqjg utjy uznt'
            }
        });

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const mailOptions = {
            from: '"Waste Away Org 🚮" <wasteawayorg@gmail.com>',
            to: email,
            subject: 'New Order Placed',
            text: `Dear Customer,

    Thank you for choosing Waste Away Org for your waste management needs. We are delighted to inform you that a new order has been successfully placed. Here are the details:

    - Order Placed On: ${today}
    - Pickup Address: ${address}
    - Pickup Date: ${date}
    - Pickup Time: ${time}
    - Status: ${status || 'Pending'}

    If you have any questions or need further assistance, please feel free to contact us. We appreciate your business and look forward to serving you.

    Best Regards,
    Waste Away Org 🚮`
        };



        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });


        success = true
        res.status(201).json({ savedOrder, success, email });
    } catch (error) {
        console.error('Error booking order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Update Order Status
router.put('/updateStatus/:id', fetchuser, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const newOrder = {}
        if (status) {
            newOrder.status = status
        }
        // Find the order by its ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order status
        updatedOrder = await Order.findByIdAndUpdate(orderId, { $set: newOrder }, { new: true })

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router
