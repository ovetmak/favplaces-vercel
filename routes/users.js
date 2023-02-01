const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
 
// ********** Register **********
router.get('/register', users.renderRegister);
router.post('/register', catchAsync (users.register));

// ********** Login **********
router.get('/login', users.loginRender)
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo:true}), users.login)

// ********** Logout ********** 
router.get('/logout', users.logout);

module.exports = router;