'use strict';

angular.module('core').controller('MajorityController', ['$scope', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$state', 'issues', 'SortService',
	function ($scope, Authentication, $mdSidenav, $rootScope, $mdMenu, $state, issues, SortService) {
		// This provides Authentication context.
		var vm = this;
		vm.issues = issues;
		vm.sortSvc = SortService;
		$scope.authentication = Authentication;

		$rootScope.showBackButton = false;

		// Title
		vm.title = $rootScope.titlePrefix + 'Majority' + $rootScope.titleSuffix;
		$rootScope.headerTitle = 'Majority';

		// Meta tags
		vm.desc = 'A collection of the current majority opinions.';
		vm.image = vm.issues[0] ? vm.issues[0].imageUrl : null;

		vm.sort = function (sortData, $event) {
			if ($event) $event.stopPropagation();
			SortService.setSort('topic', sortData.type, sortData.order);
		};
	}
]);
