'use strict';

angular.module('core')
	.directive('accordion', ['$timeout', function ($timeout) {
		return {
			restrict: 'E',
			scope: {
				title: '@',
				description: '@'
			},
			templateUrl: 'modules/core/client/views/accordion.client.view.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: ['$scope', '$state',
			function ($scope, $state) {
					var vm = this;
					vm.isOpen = false;

					vm.toggle = function (event) {
						vm.isOpen = !vm.isOpen;
					}
			}
		]
		};
}]);
