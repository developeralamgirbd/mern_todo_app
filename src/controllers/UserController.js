const UserService = require('../services/UserService');
const {createToken} = require('../helper/auth');
const sendEmail = require('../helper/sendEmail');


exports.register = async (req, res)=>{
	try{
		const user = await UserService.registerService(req.body);
		const token = user.generateConfirmationToken();
		
		await user.save({ validateBeforeSave: false });
		const expireTime = user.confirmationTokenExpire.getMinutes() - new Date().getMinutes();
		sendEmail(user.email, `Token will expire in ${expireTime} minute`, 'Todo App Account Verify', token);

		res.status(200).json({
			status: 'success',
			data: user
		})
		
	}catch(err){
		res.status(400).json({
			status: 'fail',
			error: err
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

	const user = await UserService.userFindByEmail(email);

	if (!user){
		return res.status(400).json({
			status: 'fail',
			error: 'User not found. create a account'
		})
	}
	const currentTime = new Date().getMinutes();
	const expireTime = user.confirmationTokenExpire.getMinutes();

	if(token !== user.confirmationToken || currentTime >= expireTime){
		return res.status(400).json({
			status: 'fail',
			error: 'invalid token',
			currentTime,
			expire: user.confirmationTokenExpire.getMinutes()
		})
	}
	/*const verified = user.verified = true;
	const status = user.status = 'active';
	const confirmationToken = user.confirmationToken = undefined;*/

	const userEmail = user.email;
	await UserService.userUpdateAfterVerifyEmail(userEmail);

	res.status(200).json({
		status: 'success',
		message: 'Email verified successfully'
	});
}


/*exports.logout = (req, res)=>{
	req.headers.Authorization = "";
	// res.clearCookie('token', { path: '/login' });
	res.cookie('token', '');
	res.status(200).json({
		message: "Successfully logged out",
		token: req.headers.Authorization
	})
}*/

/*
const logout = () => {
	setAuth({ ...auth, user: null, token: "" });
	localStorage.removeItem("auth");
	navigate("/login");
};*/
