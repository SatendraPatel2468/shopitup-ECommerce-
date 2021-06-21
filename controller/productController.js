const Product = require('../models/product')
const ErrorHandler = require('../Middlewares/error')
const catchAsyncError=require('../Middlewares/catchAsyncError')
const APIFeatures=require('../utils/apiFeatures')

//Create new Product => /api/v1/admin/product/new
exports.newProduct = catchAsyncError ( async (req, res, next) => {
    req.body.user=req.body.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        srccess: true,
        product
    })
})

//Get all products =>/api/v1/products
exports.getProducts = catchAsyncError( async (req, res, next) => {

const resPerPage=4
const productCount=await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(),req.query)
                        .search()
                        .filter()
                        .pagination(resPerPage)

    const products = await apiFeatures.query;
    res.status(200).json({
        success: true,
        count: products.length,
        productCount,
        products
    })
})

//Get single product details =>/api/v1/product/:id
exports.getSingleProduct = catchAsyncError( async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404))
    }

    res.status(200).json({
        success: true,
        product,
    })
})

//Update a product=> /api/v1/admin/product/:id
exports.updateProducts = catchAsyncError( async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404))
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        product
    })
})

//Delete Product => /api/v1/admin/Product/:id
exports.deleteProduct = catchAsyncError( async (req, res, next) => {

    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
        return next(new ErrorHandler('Product not found', 404))
    }
    await product.remove();
    res.status(200).json({
        success: true,
        message: "Product is Deleted"
    })
})
