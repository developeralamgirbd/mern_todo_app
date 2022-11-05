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
		 }}, {runValidators: true});
	return updatedUser;
}

exports.userUpdateAfterVerifyEmail = async (email)=>{
	return await User.updateOne({email}, {$set: {verified: true, status: 'active', confirmationToken: ''}});
}

exports.updatePassword = async (_id, hashPassword) => {
	return await User.updateOne({_id}, {$set: {
			password: hashPassword,
			passwordChangedAt: new Date(),
			passwordResetToken: ""
		}, $unset: {password: 1}}, {runValidators: true});
}


