const app = require('./app')
const connectDB = require('./config/database')

const cloudinary = require('cloudinary')
const dotenv = require('dotenv')

//Handle Caught exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception')
    process.exit(1)
})


//Setting up config file
dotenv.config({ path: 'backend/config/config.env' })

//Connectiong database
connectDB();

//Setting up cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT ${process.env.PORT} in ${process.env.NODE_ENV} mode`)
})

//Handle Unhandled  Promise rejection
process.on('handledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to unhandled Promise rejection')
    server.close(() => {
        process.exit(1)
    })
})