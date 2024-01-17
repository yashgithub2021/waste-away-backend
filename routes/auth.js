require('dotenv').config();
const express = require('express')
const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcrypt')
const fetchuser = require('../middleware/getUser')
var jwt = require('jsonwebtoken');
const JWT_TOKEN = process.env.JWT_TOKEN;
const nodemailer = require('nodemailer'); // Import Nodemailer

//Create User
router.post('/createuser', async (req, res) => {
    try {
        const { name, email, password, address } = req.body;

        const exist = await User.findOne({ email });

        if (exist) {
            return res.status(400).json({ message: 'Email Already Exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPass,
            address: address || ''
        });

        const savedUser = await newUser.save();

        //Email confirmation 
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'wasteawayorg@gmail.com',
                pass: 'nzai mqjg utjy uznt'
            }
        });

        const mailOptions = {
            from: '"Waste Away Org 🚮" <wasteawayorg@gmail.com>',
            to: email,
            subject: 'Welcome to Waste Away Org!',
            text: `Dear Customer,
        
Welcome to Waste Away Org! We are excited to have you join our community dedicated to sustainable waste management.
        
As a member, you'll have access to a range of services designed to make waste management easy and environmentally friendly. Feel free to explore our platform, customize your preferences, and take advantage of our eco-friendly solutions.
        
If you have any questions or need assistance, our team is here to help. Thank you for choosing Waste Away Org, and we look forward to serving you.
        
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

        const data = {
            newUser: {
                id: newUser.id
            }
        }
        const jwtData = jwt.sign(data, JWT_TOKEN);
        res.status(201).json({ savedUser, jwtData });
    } catch (error) {
        console.log('Error Creating User: ', error);
        res.status(500).json({ message: 'Unexpected Error' });
    }
});


router.post('/login', async (req, res) => {
    let success = false
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "Email not Registered", success })
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(401).json({ message: "Invalid Password!!" });
        }


        const data = {
            user: {
                id: user.id,
                email: user.email
            }
        }
        const jwtData = jwt.sign(data, JWT_TOKEN);
        success = true

        res.status(200).json({ message: "Login successfull!", jwtData, success })
    } catch (error) {
        console.log('Error loggin in: ', error)
        res.status(500).json({ message: "Unexpected Error!!" })
    }

})

// Get User
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("An Unexpected Error Occured");
    }
});

//Update User Address
router.put('/updateAddress', fetchuser, async (req, res) => {
    try {
        const { address } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        // Update user address in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { address } },
            { new: true, projection: { _id: 1, name: 1, address: 1 } }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user address:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router
