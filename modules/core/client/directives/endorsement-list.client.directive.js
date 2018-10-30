'use strict';

angular.module('core')
	.directive('endorsementList', ['$timeout', function ($timeout) {
		return {
			restrict: 'E',
			scope: {
				objectId: '=',
				objectType: '='
			},
			templateUrl: 'modules/core/client/views/endorsement-list.client.view.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: ['$scope', '$state', '$mdDialog', 'Authentication', 'EndorsementService',
			function ($scope, $state, $mdDialog, Authentication, EndorsementService) {
					var vm = this;
					$scope.authentication = Authentication;
					vm.edorsements = [];

					vm.$onInit = function () {
						var query = {
							issue: { 'issueId': vm.objectId },
							solution: { 'solutionId': vm.objectId },
							proposal: { 'proposalId': vm.objectId },
						}

						console.log(query[vm.objectType])

						EndorsementService.list(query[vm.objectType])
							.then(endorsements => {
								vm.endorsements = endorsements;
							});
					}

					vm.delete = function (endorsement) {
						if(!endorsement._id) return;
						var confirm = $mdDialog.confirm()
							.title('Are you sure you want to delete this endorsement?')
							.textContent('This cannot be undone. Please confirm your decision')
							.ok('Yes, I\'m sure')
							.cancel('No');

						$mdDialog.show(confirm)
							.then(function () {
								EndorsementService.delete(endorsement._id)
									.then(function () {
										if($state.is('issues.view')) {
											$state.go('issues.view', {
												issueId: vm.objectId
											}, {
												reload: true
											});
										} else if($state.is('solutions.view')) {
											$state.go('issues.view', {
												solutionId: vm.objectId
											});
										} else if($state.is('proposals.view')) {
											$state.go('proposals.view', {
												proposalId: vm.objectId
											});
										}

									});
							});
					};
			}
		]
		};
}]);
