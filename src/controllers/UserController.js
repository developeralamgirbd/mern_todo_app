const UserService = require('../services/UserService');
const {createToken} = require('../helper/auth');
const sendEmail = require('../helper/sendEmail');
const generateToken = require('../helper/generateToken');
const {updateTokenAndDate} = require('../services/common/updateTokenAndDate');
const {userFindByEmail} = require("../services/common/userFindByEmail");
const validator = require("validator");

exports.register = async (req, res)=>{
	try{
		const user = await UserService.registerService(req.body);
		const token = user.generateConfirmationToken();

		await user.save({ validateBeforeSave: false });

		const expireTime = parseInt(process.env.CONFIRMATION_TOKEN_EXPIRE_TIME);
		await sendEmail(user.email, `Token will expire in ${expireTime} minute`, 'Todo App Account Verify', token, 'email-verify');

		res.status(200).json({
			status: 'success',
			data: user
		})
		
	}catch(err){
		res.status(500).json({
			status: 'fail',
			error: err.message
		})
	}
};

exports.login = async (req, res) => {
	try {
		const {email, userName, mobileNumber, password}  = req.body;

		const user = await UserService.userFind(email, userName, mobileNumber);

		if (!user){
			return res.status(400).json({
				status: 'fail',
				error: 'User not found. Please create an account'
			})
		}

		const isPasswordValid = user.comparePassword(password, user.password);

		if(!isPasswordValid){
			return res.status(400).json({
				status: 'fail',
				error: 'Password is not correct'
			})
		}

		if (!user.verified){
			return res.status(400).json({
				status: 'fail',
				error: 'Your account is not verified. please verify your account'
			})
		}

		if(user.status !== 'active'){
			return res.status(400).json({
				status: 'fail',
				error: 'Your account is not active. please contact Administrator'
			})
		}

		const token = createToken(user);
		user.password = undefined;

		res.cookie('token', token, {
			httpOnly: true,
			// secure: true // only works https
		})

		res.status(200).json({
			status: 'success',
			message: "successfully logged in",
			data: {
				user,
				token
			}
		})
	}catch (error) {
		res.status(500).json({
			status: "fail",
			error: error.message,
		});
	}
};

exports.profile = async (req, res)=>{
	try {
		const User = await UserService.userProfileService(req.auth?.email);

		if (!User){
			res.status(401).json({
				status: 'fail',
				error: 'User not found'
			});
		}

		res.status(200).json({
			status: 'success',
			data: User
		})

	}catch (err) {
		res.status(401).json({
			status: 'fail',
			error: err
		})
	}
};

exports.profileUpdate = async (req, res)=>{
	try {

		const User = await UserService.userProfileUpdateService(req.auth?._id, req);

		if (!User){
			res.status(400).json({
				status: 'fail',
				error: 'Profile not updated'
			})
		}

		res.status(200).json({
			status: 'Profile successfully updated',
			data: User
		})


	}catch (err) {
		res.status(400).json({
			status: 'fail',
			error: err
		});
	}
}

exports.emailVerify = async (req, res)=>{

	/**
	 * 1. check account is exits under the request email
	 * 2. check token is valid under the account
	*/

	const email = req.params.email;
	const token = req.params.token;

	const user = await userFindByEmail(email);

	if (!user){
		return res.status(400).json({
			status: 'fail',
			error: 'User not found. create a account'
		})
	}
	const currentTime = new Date().getMinutes();
	const expireTime = user.confirmationTokenExpire.getMinutes();

	// Checked whether the user is verified
	if (user.verified){
		return res.status(200).json({
			status: 'success',
			message: 'Email verified successfully'
		});
	}

	// Checked whether the request token is equal to the user confirmation Token
	if(token !== user.confirmationToken){
		return res.status(400).json({
			status: 'fail',
			error: 'invalid token',
		})
	}

	// Checked whether current time is greater than or equal to token expiration date
	if (currentTime >= expireTime){
		return res.status(400).json({
			status: 'fail',
			error: 'Email verification link expired',
		})
	}

/*	If the steps above are true than I will
	user.verified = true,
	user.status = 'active',
	user.confirmationToken = ''
*/
	const userEmail = user.email;
	await UserService.userUpdateAfterVerifyEmail(userEmail);

	res.status(200).json({
		status: 'success',
		message: 'Email verified successfully'
	});
}

exports.resendEmail = async (req, res)=>{
	try {
		const email = req.params.email;
		const user = await userFindByEmail(email);

		if (email !== user.email){
			return res.status(400).json({
				status: 'fail',
				message: 'User not found'
			});
		}
		if (user.verified){
			return res.status(400).json({
				status: 'fail',
				message: 'Email already verified'
			});
		}

		const token = generateToken;
		const expireTime = parseInt(process.env.CONFIRMATION_TOKEN_EXPIRE_TIME);
		let date = new Date();
		date.setMinutes( date.getMinutes() + expireTime);

		const data = {
			confirmationToken: token,
			confirmationTokenExpire: date
		}

		await updateTokenAndDate(user.email, data);

		await sendEmail(user.email, `Token will expire in ${expireTime} minute`, 'Todo App Account Verify', token, 'email-verify');

		res.status(200).json({
			status: 'success',
			message: 'Verification link send'
		});

	}catch (err){
		res.status(500).json({
			status: 'fail',
			error: err
		});
	}

}

exports.resetPassword = async (req, res)=>{
	try {
		const email = req.body.email;

		const user = await userFindByEmail(email);

		if (!user){
			return res.status(400).json({
				status: 'fail',
				error: 'User not found'
			})
		}

		const token = await generateToken;
		const expireTime = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRE_TIME);
		let date = new Date();
		date.setMinutes( date.getMinutes() + expireTime);

		const data = {
			passwordResetToken: token,
			passwordResetExpires: date
		}

		await updateTokenAndDate(user.email, data);

		await sendEmail(user.email, `Password reset token will expire in ${process.env.PASSWORD_RESET_TOKEN_EXPIRE_TIME}`,'Password Reset', token, 'password-change');

		res.status(200).json({
			status: 'success',
			message: 'Password reset link send'
		})

	}catch (error) {
		res.status(500).json({
			status: 'fail',
			error
		});
	}
}

exports.newPasswordCreate = async (req, res)=>{
	try {
		const email = req.params.email;
		const token = req.params.token;

		res.status(200).json({
			status: 'Success',
			email,
			token
		})

	}catch (error) {
		res.status(500).json({
			status: 'fail',
			error
		});
	}
}

exports.updatePassword = async (req, res)=>{
	try {
		const email = req.body.email;
		const token = req.body.token;
		const password = req.body.password;
		const confirmPassword = req.body.confirmPassword;


		const user = await userFindByEmail(email)

		if (!user){
			return res.status(400).json({
				status: 'fail',
				error: 'User not found'
			});
		}
		const isValidate = validator.isStrongPassword(password, {
			minLength: 8,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
			minLowercase: 1
		})
		if (!isValidate){
			return res.status(400).json({
				status: 'fail',
				error: "Password is not strong, please provide a strong password"
			});
		}
		if (password !== confirmPassword){
			return res.status(400).json({
				status: 'fail',
				error: "Password doesn't match"
			});
		}
		if (token !== user.passwordResetToken){
			return res.status(400).json({
				status: 'fail',
				error: 'Invalid token'
			});
		}
		const currentTime = new Date();
		const expireTime = user.passwordResetExpires;

		// Checked whether current time is greater than or equal to token expiration date
		if (currentTime.getTime() >= expireTime){
			return res.status(400).json({
				status: 'fail',
				error: 'Token expired',
			})
		}
		const hashPassword = user.hashPassword(password);

		await UserService.updatePassword(user._id, hashPassword);

		res.status(200).json({
			status: 'success',
			message: 'Password changed successfully'
		});

	}catch (error) {
		res.status(500).json({
			status: 'fail',
			error
		});
	}
}
