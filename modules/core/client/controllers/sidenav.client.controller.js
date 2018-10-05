'use strict';

angular.module('core')
	.controller('SidenavController', ['$scope', 'Authentication', '$location', '$localStorage', '$window', '$mdSidenav', '$rootScope', '$mdMenu', '$mdMedia', '$state', 'uiTourService', 'SearchService',
	function ($scope, Authentication, $location, $localStorage, $window, $mdSidenav, $rootScope, $mdMenu, $mdMedia, $state, uiTourService, SearchService) {
			// This provides Authentication context.
			var vm = this;
			vm.authentication = Authentication;
			vm.isOpen = true;
			vm.lockLeft = true;
			vm.state = $state;
			vm.results = [];
			vm.mdMedia = $mdMedia;
			vm.searchOpen = false;
			vm.$state = $state;

			vm.backStates = {
				'topics.view': 'topics.list',
				'topics.create': 'topics.list',
				'topics.edit': 'topics.list',
				'issues.view': 'issues.list',
				'issues.create': 'issues.list',
				'issues.edit': 'issues.list',
				'goals.view': 'goals.list',
				'goals.create': 'goals.list',
				'goals.edit': 'goals.list',
				'solutions.view': 'solutions.list',
				'solutions.create': 'solutions.list',
				'solutions.edit': 'solutions.list',
				'endorsements.create': 'home',
				'endorsements.edit': 'home',
				'media.create': 'home',
				'media.edit': 'home',
				'suggestions': 'home',
			}

			vm.isBackState = checkBackState($state.current.name);
			var previousState, previousParams;
			var navStack = [];

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

			//set isBackState and handle the navStack for backwards navigation
			$scope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {
				previousState = fromState;
				previousParams = fromParams;
				if(toParams.back) {
					navStack.pop();
				} else {
					navStack.push({ fromState, fromParams });
				}

				vm.isBackState = checkBackState(toState.name);
			})

			function checkBackState(state) {
				if(vm.backStates[state]) {
					return true;
				} else {
					return false;
				}
			}

			var handleTourStepShow = function () {
				return new Promise((resolve, reject) => {
					let tour = uiTourService.getTourByName('homeTour')
					let step = tour.getCurrentStep();
					if(step.stepId == 'home.step.menu' && !$mdMedia('gt-md')) {
						return vm.toggleSidenav()
							.then(() => resolve())
					} else {
						return resolve();
					}
				})
			}
			// $localStorage.hasEndedTour = false;
			uiTourService.createDetachedTour('homeTour', {
				'backdropZIndex': '10000',
				'onShow': handleTourStepShow
			})

			// set up the main tour
			var homeTour = uiTourService.getTourByName('homeTour')

			if(Authentication.user &&
				(homeTour.getStatus() != homeTour.Status.ON && homeTour.getStatus() != homeTour.Status.WAITING)
				&& (!$localStorage.hasEndedTour)
			) {
				$scope.$on('$viewContentLoaded', function () {
					//Here your view content is fully loaded !!
					vm.onTourReady();
				});
			}

			vm.onTourReady = function (tour) {
				if($state.current.name == 'home') {
					console.log('starting tour');
					homeTour.start();
					homeTour.waitFor('home.step.0');

					console.log('binding to tour')
					homeTour.on('ended', function () {
						console.log('home tour ended')
						$localStorage.hasEndedTour = true;
					})

					homeTour.on('started', function () {
						console.log('home tour started')
					})
				} else if($state.current.name == 'issues.list') {
					console.log(homeTour.getStatus());
					homeTour.startAt('home.step.issues')
				}

			}

			vm.tourNavigateAndWait = function (path, toStepId) {
				if($mdSidenav('left')
					.isOpen) {
					$mdSidenav('left')
						.toggle();
				}
				$state.go(path);
				// console.log(homeTour);
				// homeTour.pause()
				// return Promise.reject();
				return homeTour.waitFor('home.step.issues');
			}

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
					return Promise.resolve();
				} else {
					return $mdSidenav('left')
						.toggle();
				}
			}

			vm.navigateBack = function () {
				// find a safe route to navigate backwards too if there is nothing in the nav stack
				var safeBackState = this.backStates[$state.current.name] ? this.backStates[$state.current.name] : '/';
				//determine whether to use the safestate or a previous state
				var backTo = navStack[navStack.length - 1].fromState.name ? navStack[navStack.length - 1].fromState.name : safeBackState;
				//find any stateparams like id's
				var stateParams = navStack[navStack.length - 1] ? navStack[navStack.length - 1].fromParams : null
				stateParams.back = true;
				$state.go(backTo, stateParams);
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
