const {expressjwt} = require('express-jwt');

exports.AuthVerifyMiddleware = expressjwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"]
})