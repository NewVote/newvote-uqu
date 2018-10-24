'use strict';

angular.module('users')
	.directive('passwordValidator', ['PasswordValidator', function (PasswordValidator) {
		return {
			require: 'ngModel',
			link: function (scope, element, attrs, ngModel) {
				ngModel.$validators.requirements = function (password) {
					var status = true;
					ngModel.$setValidity('passwordVerify', false);
					scope.strength = 0;
					if(password) {
						var result = PasswordValidator.getResult(password);
						if(result.requiredTestErrors.length) {
							scope.popoverMsg = PasswordValidator.getPopoverMsg();
							scope.passwordErrors = result.requiredTestErrors;
							ngModel.$setValidity('passwordVerify', false);
							scope.strength = result.requiredTestErrors.length ? 0 : result.optionalTestsPassed;
							status = false;
						} else {
							scope.popoverMsg = '';
							scope.passwordErrors = [];
							status = true;
							ngModel.$setValidity('passwordVerify', true);
							scope.strength = result.requiredTestErrors.length ? 0 : result.optionalTestsPassed;
						}
					}
					return status;
				};
			}
		};
  }]);
