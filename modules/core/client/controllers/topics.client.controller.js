'use strict';

angular.module('core').controller('TopicsController', ['$scope', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$state', 'topics', 'SortService',
	function ($scope, Authentication, $mdSidenav, $rootScope, $mdMenu, $state, topics, SortService) {
		// This provides Authentication context.
		var vm = this;
		vm.topics = topics;
		vm.sortSvc = SortService;
		$scope.authentication = Authentication;

		// Title
		vm.title = $rootScope.titlePrefix + 'Topics' + $rootScope.titleSuffix;
		$rootScope.headerTitle = 'Topics';

		// Meta tags
		vm.desc = 'A collection of the current topics being discussed on the NewVote platform.';
		vm.image = vm.topics[0] ? vm.topics[0].imageUrl : null;

		vm.sort = function (sortData, $event) {
			if ($event) $event.stopPropagation();
			SortService.setSort('topic', sortData.type, sortData.order);
		};
	}
]);
