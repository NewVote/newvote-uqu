'use strict';

angular.module('core')
	.directive('majorityList', ['$timeout', function ($timeout) {
		return {
			restrict: 'E',
			scope: {
				issues: '='
			},
			templateUrl: 'modules/core/client/views/majority-list.client.view.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: ['$scope', '$state', '$window', 'SortService', 'Authentication', 'RegionService', 'IssueService', '$mdDialog',
				function ($scope, $state, $window, SortService, Authentication, RegionService, IssueService, $mdDialog) {
					var vm = this;
					vm.sortSvc = SortService;
					vm.regions = [];
					// vm.proposals = [];
					$scope.authentication = Authentication;
					$scope.$state = $state;

					vm.vote = function (proposal, voteType, $event) {
						$event.stopPropagation();
						VoteService.vote(proposal, 'Proposal', voteType)
							.then(function (data) {
								proposal.$get();
							});
					};
					vm.sort = function (sortData, $event) {
						if ($event) $event.stopPropagation();
						SortService.setSort('proposal', sortData.type, sortData.order);
					};

					function getIssues() {
						IssueService.list()
							.then(function (issues) {
								vm.issues = issues;
							}, function (err) {
								console.log('Error getting all issues: ', err);
							});
					}
				}
			]
		};
	}]);
