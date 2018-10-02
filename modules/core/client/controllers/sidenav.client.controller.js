'use strict';

angular.module('core')
	.controller('SidenavController', ['$scope', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$mdMedia', '$state', 'SearchService',
	function ($scope, Authentication, $mdSidenav, $rootScope, $mdMenu, $mdMedia, $state, SearchService) {
			// This provides Authentication context.
			var vm = this;
			vm.authentication = Authentication;
			vm.isOpen = true;
			vm.lockLeft = true;
			vm.state = $state;
			vm.results = [];
			vm.mdMedia = $mdMedia;
			vm.searchOpen = false;

			$rootScope.showBackButton = true;

			// Page title config
			$rootScope.titlePrefix = '';
			$rootScope.titleSuffix = ' | UQVotes - Powered by NewVote';

			// Update title and description
			$scope.title = $rootScope.titlePrefix + '' + $rootScope.titleSuffix;
			$scope.desc = 'NewVote is a dedicated online platform aimed at providing' +
			' balanced, unbiased information on the current federal political issues' +
			' and solutions in Australia. This information is maintained by an in de' +
			'pendent panel and is presented in a simplified and organised manner. It' +
			' also allows people to vote on the solutions, making people\'s opinion ' +
			'available to the decision makers.';

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

			vm.openSearch = function () {
				$scope.searchOpen = !$scope.searchOpen;
			};

			vm.toggleSidenav = function () {
				vm.isOpen = !vm.isOpen;
				if($mdMedia('gt-md')) {
					vm.lockLeft = !vm.lockLeft
				} else {
					$mdSidenav('left')
						.toggle();
				}
			}

			vm.navigateBack = function() {

			}

			vm.tapSidenav = function () {
				if(!$mdMedia('gt-md')) {
					vm.toggleSidenav();
				}
			}

			vm.openMenu = function ($mdMenu, ev) {
				$mdMenu.open(ev);
			};
	}
]);
