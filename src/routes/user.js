const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const {authVerify} = require("../middleware/AuthVerifyMiddleware");


router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', authVerify, UserController.profile);
router.post('/profile', authVerify, UserController.profileUpdate);
router.get('/email-verify/:email/:token', UserController.emailVerify);
router.get('/resend-email/:email', UserController.resendEmail);

module.exports = router;