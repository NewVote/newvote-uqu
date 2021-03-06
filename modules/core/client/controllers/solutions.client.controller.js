'use strict';

angular.module('core')
	.controller('SolutionsController', ['$scope', '$rootScope', '$state', '$stateParams', 'SolutionService', 'VoteService', 'Authentication', 'solutions', '$location',
  function ($scope, $rootScope, $state, $stateParams, SolutionService, VoteService, Authentication, solutions, $location) {
			var vm = this;
			vm.issueId = $stateParams.issueId;
			vm.solutions = solutions;
			$scope.authentication = Authentication;
			// vm.sortParam = 'votes.up-';

			// Title
			vm.title = $rootScope.titlePrefix + 'Solutions' + $rootScope.titleSuffix;
			$rootScope.headerTitle = 'Solutions';

			// Meta tags
			vm.desc = vm.desc = 'A collection of the current solutions being discussed on the UQ NewVote platform.';
			vm.image = vm.solutions[0] ? vm.solutions[0].imageUrl : null;
	}
]);
