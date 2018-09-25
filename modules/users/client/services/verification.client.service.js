'use strict';

angular.module('users')
	.service('VerificationService', ['$resource', '$stateParams', '$q', '_',
		function ($resource, $stateParams, $q, _) {

            var SendEmail = $resource('api/users/email', {}, {
                send: {
                    method: 'POST'
                }
            });

			var Verification = $resource('api/users/verify', {}, {
				verify: {
					method: 'POST'
				}
            });

            var svc = this;

			svc.sendEmail = function (params) {
				return SendEmail.send(params)
					.$promise;
			};

			svc.verify = function(params) {
				return Verification.verify(params)
					.$promise;
			};
		}
	]);
