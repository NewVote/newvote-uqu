'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	validator = require('validator'),
	generatePassword = require('generate-password'),
	owasp = require('owasp-password-strength-test');

owasp.config({
	allowPassphrases: true,
	maxLength: 128,
	minLength: 6,
	minPhraseLength: 20,
	minOptionalTestsToPass: 3
})

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for checking UQ emails
 */
var validateUQEmail = function(email) {
	var regex = /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(uqconnect|uq)\.(edu|net)\.au$/;
	var pass = (email.match(regex) != null) ;
	return pass;
}
/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
	return ((this.provider !== 'local' && !this.updated) || (validator.isEmail(email) && validateUQEmail(email)) || (email == 'rohan.m.richards@gmail.com'));
};


/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: ''
	},
	lastName: {
		type: String,
		trim: true,
		default: ''
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		unique: 'This E-mail is already in use.',
		lowercase: true,
		trim: true,
		default: '',
		validate: [validateLocalStrategyEmail, 'Please use a valid UQ email address'],
		index: true
	},
	postalCode: {
		type: String,
		trim: true
	},
	international: {
		type: Boolean
	},
	country: {
		type: Schema.ObjectId,
		ref: 'Country'
	},
	username: {
		type: String,
	},
    mobileNumber: {
        type: String
    },
    verified : {
        type: Boolean
    },
	gender: {
		type: String
	},
	birthYear: {
		type: String
	},
	income: {
		type: String
	},
	housing: {
		type: String
	},
	party: {
		type: String
	},
	woodfordian: {
		type: String
	},
	terms: {
		type: Boolean
	},
	password: {
		type: String,
		default: ''
	},
	verificationCode: {
		type: String,
		default: '',
		required: function () {
			if(this.isNew){
				return false;
			}
		}
	},
	salt: {
		type: String
	},
	profileImageURL: {
		type: String,
		default: 'modules/users/client/img/profile/default.png'
	},
	provider: {
		type: String
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin', 'endorser']
		}],
		default: ['user'],
		required: 'Please provide at least one role'
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For endorser profiles */
	organisationName: {
		type: String
	},
	organisationWebsite: {
		type: String
	},
	organisationAbn: {
		type: String
	},
	organisationBio: {
		type: String
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
	if (this.password && this.isModified('password')) {
		this.salt = crypto.randomBytes(16)
			.toString('base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Hook a pre validate method to test the local password
 */
UserSchema.pre('validate', function (next) {
	if (this.provider === 'local' && this.password && this.isModified('password')) {
		var result = owasp.test(this.password);
		if (result.requiredTestErrors.length) {
			var error = result.requiredTestErrors.join(' ');
			this.invalidate('password', error);
		}
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, Buffer.from(this.salt, 'base64'), 100000, 64, 'SHA512')
			.toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
	return this.password === this.hashPassword(password);
};

/**
 * Create instance method for hashing a verification code (sent by SMS)
 */
UserSchema.methods.hashVerificationCode = function (code) {
	if (this.salt && code) {
		console.log('hashing code: ', code);
		return crypto.pbkdf2Sync(code.toString(), Buffer.from(this.salt, 'base64'), 100000, 64, 'SHA512')
			.toString('base64');
	} else {
		console.log('salt was not present');
		return code;
	}
};

/**
 * Create instance method for confirming the sms verification code
 */
UserSchema.methods.verify = function (code) {
	return this.verificationCode === this.hashVerificationCode(code);
};

UserSchema.statics.generateVerificationCode = function () {
	return Math.floor(100000 + Math.random() * 900000);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
	var _this = this;
	var possibleUsername = username.toLowerCase() + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function (err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

/**
 * Generates a random passphrase that passes the owasp test.
 * Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
 * NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
 */
UserSchema.statics.generateRandomPassphrase = function () {
	return new Promise(function (resolve, reject) {
		var password = '';
		var repeatingCharacters = new RegExp('(.)\\1{2,}', 'g');

		// iterate until the we have a valid passphrase.
		// NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present.
		while (password.length < 20 || repeatingCharacters.test(password)) {
			// build the random password
			password = generatePassword.generate({
				length: Math.floor(Math.random() * (20)) + 20, // randomize length between 20 and 40 characters
				numbers: true,
				symbols: false,
				uppercase: true,
				excludeSimilarCharacters: true,
			});

			// check if we need to remove any repeating characters.
			password = password.replace(repeatingCharacters, '');
		}

		// Send the rejection back if the passphrase fails to pass the strength test
		if (owasp.test(password)
			.requiredTestErrors.length) {
			reject(new Error('An unexpected problem occured while generating the random passphrase'));
		} else {
			// resolve with the validated passphrase
			resolve(password);
		}
	});
};

mongoose.model('User', UserSchema);
