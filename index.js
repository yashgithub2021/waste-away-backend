const express = require('express')
const connectMongo = require('./db')
var cors = require('cors');
connectMongo();
require('dotenv').config();
const app = express()
const port = 4000



app.use(cors())
app.use(express.json())

app.use('/api/order', require('./routes/appointment'))
app.use('/api/auth', require('./routes/auth'))

app.listen(port, () => {
    console.log(`Backend running on port: ${port}`)
})