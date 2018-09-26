'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	config = require(path.resolve('./config/config')),
	querystring = require('querystring'),
	nodemailer = require('nodemailer'),
	transporter = nodemailer.createTransport(config.mailer.options),
	request = require('request');

/**
 * User middleware
 */
exports.sendVerificationCode = function (req, res) {
	// debugger;
	var user = req.user;
	var email = user.email;
	var pass$ = User.generateRandomPassphrase()

	//send code via sms
	return pass$.then(pass => saveVerificationCode(user, pass))
		.then(pass => sendEmail(user, pass, req))
		.then((data) => {
			console.log('Succesfully sent a verification e-mail: ', data);
			return res.status(200)
				.send({ message: 'success' })
		})
		.catch((err) => {
			console.log('error sending verification email: ', err);
			return res.status(400)
				.send({
					message: 'There was a problem while sending your verification e-mail, please try again later.'
				});
		});
};

function saveVerificationCode(user, code) {
	//get the actual user because we need the salt
	//because we need the salt
	//because we need the salt
	//because we need the salt

	return User.findById(user.id)
		.then((user) => {
			if(!user) {
				throw Error('We could not find the user in the database. Please contact administration.');
			}

			//add hashed code to users model
			user.verificationCode = user.hashVerificationCode(code);

			//update user model
			return user.save()
				.then(() => code);
		});
}

exports.verify = function (req, res) {
	var user = req.user;
	var code = req.body.params;

	console.log(`Trying to verify ${code}`);

	//get the actual user because we need the salt
	User.findById(user.id)
		.then((user) => {
			if(!user) {
				return res.status(400)
					.send({ message: 'We could not find the user in the database. Please contact administration.' });
			}

			//add hashed code to users model
			var verified = user.verify(code);
			if(verified) {
				//update user model
				user.verified = verified;
				user.save(function (err) {
					if(err) {
						console.log('error saving user: ', err);
						return res.status(400)
							.send({
								message: err
							});
					} else {
						return res.json({ 'success': true });
					}
				});
			} else {
				return res.status(400)
					.send({
						message: 'Verification code was incorrect.'
					});
			}
		})
		.catch((err) => {
			console.log('error finding user: ', err);
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		});
};

var buildMessage = function (user, code, req) {
	var messageString = '';
	var url = req.protocol + '://' + req.get('host') + '/verify/' + code;

	messageString += `<h3> Welcome ${user.firstName} </h3>`;
	messageString += `<p>Thank you for joining the NewVote platform, you are almost ready to start having your say!
	To complete your account setup, just click the URL below or copy and paste it into your browser's address bar</p>`;
	messageString += `<p><a href='${url}'>${url}</a></p>`;

	return messageString;
};

var sendEmail = function (user, pass, req) {
	return transporter.sendMail({
		from: process.env.MAILER_FROM,
		to: user.email,
		subject: 'NewVote UQU Verification',
		html: buildMessage(user, pass, req)
	})
}
