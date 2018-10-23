'use strict';

angular.module('core')
	.controller('AboutController', ['$scope', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$state', 'SearchService', '$mdMedia', 'IssueService', 'GoalService', 'SolutionService', '$timeout', 'Carousel',
		function ($scope, Authentication, $mdSidenav, $rootScope, $mdMenu, $state, SearchService, $mdMedia, IssueService, GoalService, SolutionService, $timeout, Carousel) {
			// This provides Authentication context.
			$scope.authentication = Authentication;
			$scope.$state = $state;
			$scope.$mdMedia = $mdMedia;

			$scope.message = true;

			// Page title config
			$rootScope.titlePrefix = '';
			$rootScope.titleSuffix = ' | UQ Votes - Student democracy app - Powered by NewVote - VOTE NOW';

			// Update title and description
			$scope.title = $rootScope.titlePrefix + 'About Us' + $rootScope.titleSuffix;
			$scope.desc = 'UQvotes is an independent and nonpartisan voting app for the students of the University of Queensland, developed by student volunteers at NewVote, an education nonprofit tech startup based at UQ\'s iLab.';
			$rootScope.headerTitle = 'About Us';

			$scope.toggleMessage = function () {
				$scope.message = !$scope.message;
			};

			$scope.openMenu = function ($mdMenu, ev) {
				$mdMenu.open(ev);
			};

			$scope.results = [];

			$scope.getHyperLink = function (item) {
				return SearchService.getHyperLink(item);
			};

			$scope.searchAll = function (text) {
				$scope.results = SearchService.searchAll(text);
			};

			$scope.getItemTitle = function (item) {
				return SearchService.getItemTitle(item);
			};

			$scope.searchOpen = false;

			$scope.openSearch = function () {
				$scope.searchOpen = !$scope.searchOpen;
			};

		}
	]);
