const User = require('../models/userModel');

exports.registerService = async(userData)=>{
	const user = await User.create(userData);
	return user;
};

exports.userFind = async (email, userName, mobileNumber)=>{

	const isUserFind = await User.findOne( { $or: [ { email}, {userName}, {mobileNumber } ] } );
	return isUserFind;
};

exports.userProfileService = async (email)=>{
	const user = await User.findOne({email}, {_id:0, password: 0});
	return user;
}

exports.userProfileUpdateService = async (_id, Request)=>{
	 const updatedUser = await User.updateOne({_id}, {$set: {
			 email: Request.body.email,
			 firstName: Request.body.firstName,
			 lastName: Request.body.lastName,
			 password: Request.body.password
		 }}, {runValidators: true});
	return updatedUser;
}

exports.userFindByEmail = async (email)=>{
	return await User.findOne({email}, {email: 1, confirmationToken: 1, confirmationTokenExpire: 1, _id:0})
}