const User = require("../../models/userModel");

exports.updateTokenAndDate = async (email, data)=>{
      const user = await User.updateOne({email}, {$set: data});
      return user;
}