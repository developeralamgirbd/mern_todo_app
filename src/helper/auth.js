const jwt = require('jsonwebtoken');

exports.createToken = (user)=>{
    const payload = {
        '_id': user._id,
        'email': user.email,
        'phone': user.mobileNumber,
        'userName': user.userName,
    };

    return jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: '1h'
    });
}