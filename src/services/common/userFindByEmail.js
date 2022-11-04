const User = require("../../models/userModel");

exports.userFindByEmail = async (email)=>{
    return await User.findOne({email});
}