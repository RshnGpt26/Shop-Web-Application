const express = require('express');
const { check, body } = require('express-validator');
const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid Email ID'),
        body('password', 'Please enter a valid password')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ],
    authController.postLogin,
);

router.post(
    '/signup',
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid Email ID')
        .custom((value, { req }) => {
            // if(value === 'test@test.com') {
            //     throw new Error('This email address is forbidden');
            // }
            // return true;
            return User.findOne({email: value})
            .then(userDoc => {
                if(userDoc) {
                    return Promise.reject(
                        'Email already exists'
                    );
                }
            })
        })
        .normalizeEmail()
        .trim(),
        body('password', 'Please enter a password with only numbers and and at least 5 characters.')
        .isLength({ min: 5 })
        .isAlphanumeric(),
        body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if(value != req.body.password) {
                throw new Error('Passwords should be matched');
            }
            return true;
        })
    ],
    authController.postSignup,
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

module.exports = router;