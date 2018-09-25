'use strict';

angular.module('core').controller('SidenavController', ['$scope', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$mdMedia', '$state', 'SearchService',
	function ($scope, Authentication, $mdSidenav, $rootScope, $mdMenu, $mdMedia, $state, SearchService) {
		// This provides Authentication context.
		var vm = this;
		vm.authentication = Authentication;
		vm.isOpen = true;
		vm.lockLeft = true;
		vm.state = $state;
		vm.results = [];
		vm.mdMedia = $mdMedia;

		$rootScope.removeHtmlElements = function (text) {
			if(text != null) {
				//ignore this lint warning we need to test for undefined as well
				return text.replace(/<.*?> ?/g, '');
			} else {
				return '';
			}
		};

		vm.toggleMessage = function () {
			$scope.message = !$scope.message;
		};

		vm.openMenu = function ($mdMenu, ev) {
			$mdMenu.open(ev);
		};

		vm.getHyperLink = function (item) {
			return SearchService.getHyperLink(item);
		};

		vm.searchAll = function (text) {
			$scope.results = SearchService.searchAll(text);
		};

		vm.getItemTitle = function (item) {
			return SearchService.getItemTitle(item);
		};

		vm.searchOpen = false;

		vm.openSearch = function () {
			$scope.searchOpen = !$scope.searchOpen;
		};

		vm.toggleSidenav = function() {
			vm.isOpen = !vm.isOpen;
			if($mdMedia('gt-md')){
				vm.lockLeft = !vm.lockLeft
			}else {
				$mdSidenav('left').toggle();
			}
		}

		vm.tapSidenav = function() {
			if(!$mdMedia('gt-md')){
				vm.toggleSidenav();
			}
		}

		vm.openMenu = function ($mdMenu, ev) {
			$mdMenu.open(ev);
		};
	}
]);
