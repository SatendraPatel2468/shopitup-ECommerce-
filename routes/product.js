const express = require('express')
const router = express.Router()

const { newProduct, getProducts, getSingleProduct, updateProducts, deleteProduct } = require('../controller/productController')
const { isAuthenticatedUser,authorizeRoles } = require('../Middlewares/auth')

//Get all products
router.route('/products').get(isAuthenticatedUser,getProducts)

//Get a single product with id
router.route('/products/:id').get(getSingleProduct)

//Post a product
router.route('/admin/products/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct)

//Update a product and Delete a product9 
router.route('/admin/products/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProducts)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct)


module.exports = router