const express = require('express');
const authController = require('../controllers/authController');
const tourController = require('../controllers/tourController');

const router=express.Router();

router.get('/tours',authController.protect,tourController.getAllTours);
router.post('/signup',authController.signup);
router.post('/login', authController.login);

module.exports = router;