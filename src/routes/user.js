const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const {AuthVerifyMiddleware} = require("../middleware/AuthVerifyMiddleware");


router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.get('/profile', AuthVerifyMiddleware, UserController.profile);

router.post('/profile', AuthVerifyMiddleware, UserController.profileUpdate);

router.get('/email-verify/:email/:token', UserController.emailVerify);

router.get('/resend-email/:email', UserController.resendEmail);

router.post('/reset-password', UserController.resetPassword);
router.post('/password-change', UserController.passwordChange);

module.exports = router;