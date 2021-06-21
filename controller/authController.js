const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler')
const catchAsycnErrors = require('../Middlewares/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto')
const cloudinary = require('cloudinary')

//Register a user => /api/v1/register

exports.registerUser = catchAsycnErrors(async (req, res, next) => {

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: 'scale'
    })

    const { name, email, password } = req.body
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        }
    })
    sendToken(user, 200, res)
})


//Login User =>/api/v1/login
exports.loginUser = catchAsycnErrors(async (req, res, next) => {
    const { email, password } = req.body;

    //check if email and password is enterd by user
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400))
    }

    //finding user in database
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    //check if password is correct or not
    const isPasswordMatched = await user.comparePassword(passowrd);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res)
})

//forgeot password =>/api/v1/password/forget
exports.forgotPassword = catchAsycnErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler('Usr not found with this email', 404));
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    //create password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `your password reset token is as follow:\n\n$${resetUrl}\n\nIf you have not requested this email ,then ignore it`

    try {
        await sendEmail({
            email: user.email,
            subject: `ShopIt Password recovery`,
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to : ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error, message, 500))
    }
})




//Reset password =>/api/v1/password/reset/:token
exports.resetPassword = catchAsycnErrors(async (req, res, next) => {
    //Hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return next(new ErrorHandler(`Password reset token is invalid or has been expired`, 400)
        )
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler(`Password does not match`, 400))
    }
    //setup new password
    user.passowrd = req.body.password

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})


//Get currently logged in user details =>/api/v1/me
exports.getUserProfile = catchAsycnErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})




//Update or change password =>/api/v1/password/update
exports.updatePassword = catchAsycnErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    //check previous user password
    const isMatched = await user.comparePassword(req.body.odlPassword)
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect', 400))
    }

    user.password = req.body.password;
    await user.save();
    sendToken(user, 200, res)
})




//update user profile =>/api/v1/me/update
exports.updateProfile = catchAsycnErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    //update avatar :TODO
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
})


//logout user =>/api/v1/logout
exports.logout = catchAsycnErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: 'logged out'
    })
})




//Admin Route
//Get all users=> /api/v1/admin/users
exports.allUsers = catchAsycnErrors(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})


//Get user details=> /api/v1/admin/user/:id
exports.getUserDetails = catchAsycnErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User doesnot found with id: ${req.params.id}`));

    }

    res.status(200).json({
        success: true,
        user
    })
})




//update user profile =>/api/v1/admin/user/:id
exports.updateUser = catchAsycnErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
})



//Delete user=> /api/v1/admin/user/:id
exports.deleteUser = catchAsycnErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User doesnot found with id: ${req.params.id}`));

    }

    //Remove awatar from cloudinary =TODO

    await user.remove()

    res.status(200).json({
        success: true,
    })
})

