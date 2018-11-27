'use strict';

angular.module('core')
	.controller('HomeController', ['$scope', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$state', '$stateParams', '$q', '$localStorage', 'SearchService', 'IssueService', 'TopicService', 'uiTourService', '$mdMedia', '$timeout', 'Carousel', 'topics', 'issues',
		function ($scope, Authentication, $mdSidenav, $rootScope, $mdMenu, $state, $stateParams, $q, $localStorage, SearchService, IssueService, TopicService, uiTourService, $mdMedia, $timeout, Carousel, topics, issues) {
			var vm = this;
			vm.topics = topics;
			vm.issues = issues;
			// This provides Authentication context.
			$scope.authentication = Authentication;
			$scope.$state = $state;
			$scope.$mdMedia = $mdMedia;

			//number of slides to show on the carousel
			$scope.slidesToShow = 3;
			$scope.showCarousel = true;

			$scope.searchOpen = false;
			$scope.message = true;

			// Page title config
			$rootScope.titlePrefix = '';
			$rootScope.titleSuffix = ' | UQ NewVote - Student democracy app - Powered by Newvote - VOTE NOW';

			$rootScope.showBackButton = false;

			// Update title and description
			$scope.title = $rootScope.titlePrefix + 'Home' + $rootScope.titleSuffix;
			$scope.desc = 'UQ NewVote is an independent and nonpartisan voting app for the students of the University of Queensland, developed by student volunteers at NewVote, an education nonprofit tech startup based at UQ\'s iLab.';
			$rootScope.headerTitle = 'Home';

			//watch for changes in screen width and catch when screen is gt-md
			$scope.$watch(function () {
				return $scope.$mdMedia('gt-md');
			}, function (gtMd) {
				if(gtMd) {
					//screen is greater than medium (gt-md)
					$scope.slidesToShow = 3;
					Carousel.setOptions({
						slidesToShow: $scope.slidesToShow
					});
					$scope.showCarousel = false;
					$timeout(function () {
						$scope.showCarousel = true;
					});
				} else {
					//screen is less than medium (xs, sm)
					$scope.slidesToShow = 1;
					Carousel.setOptions({
						slidesToShow: $scope.slidesToShow
					});
					$scope.showCarousel = false;
					$timeout(function () {
						$scope.showCarousel = true;
					});
				}
			});

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

			$scope.openSearch = function () {
				$scope.searchOpen = !$scope.searchOpen;
			};
		}
	]);
