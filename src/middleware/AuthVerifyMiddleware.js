const {expressjwt} = require('express-jwt');

exports.authVerify = expressjwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"]
})