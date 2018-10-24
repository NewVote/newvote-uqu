'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;
	owaspPasswordStrengthTest.config({
		allowPassphrases: true,
		maxLength: 128,
		minLength: 6,
		minPhraseLength: 20,
		minOptionalTestsToPass: 3
	})

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Password must be at least 6 characters long.';
        return popoverMsg;
      }
    };
  }
]);
