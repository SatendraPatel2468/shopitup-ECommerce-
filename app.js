const epxress = require('express')
const app = epxress()
const errorMiddleware = require('./Middlewares/error')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')


app.use(epxress.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(fileUpload())



//Import all routes
const products = require('./routes/product')
const auth = require('./routes/auth')

app.use('/api/v1', products)
app.use('/api/v1', auth)

//Middleware to handle errors
app.use(errorMiddleware)

module.exports = app