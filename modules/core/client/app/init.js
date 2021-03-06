'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName)
	.config(['$locationProvider', '$httpProvider',
	function ($locationProvider, $httpProvider) {
			$locationProvider.html5Mode(true)
				.hashPrefix('!');

			$httpProvider.interceptors.push('authInterceptor');
	}
]);

var app = angular.module(ApplicationConfiguration.applicationModuleName);

app.config(['ngQuillConfigProvider', function (ngQuillConfigProvider) {
	ngQuillConfigProvider.set();
}]);
// debugger;
app.config(['TourConfigProvider', function (TourConfigProvider) {
	TourConfigProvider.enableNavigationInterceptors();
	TourConfigProvider.set('backdrop', true);
	TourConfigProvider.set('useUiRouter', true);
	TourConfigProvider.set('backdropZIndex', '10000');
	TourConfigProvider.set('templateUrl', 'modules/core/client/views/tour-step-template.client.view.html');
}])

app.config(['$mdThemingProvider', function ($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('cyan', {
			'default': '800',
			'hue-1': '500',
			'hue-2': '900',
			'hue-3': 'A700'
		})
		.accentPalette('orange', {
			'default': '700',
			'hue-1': '500',
			'hue-2': '900',
			'hue-3': 'A700'
		})
		.warnPalette('orange')
		.backgroundPalette('grey');
}]);

angular.module(ApplicationConfiguration.applicationModuleName)
	.run(function ($rootScope, $state, Authentication) {
		$rootScope.title = window.title;
		// Check authentication before changing state
		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
			if(toState.data && toState.data.title) {
				// console.log('setting title', toState.data.title);
				$rootScope.pageTitle = toState.data.title;
			}
			if(toState.data && toState.data.roles && toState.data.roles.length > 0) {
				var allowed = false;
				toState.data.roles.forEach(function (role) {
					if(Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
						allowed = true;
						return true;
					}
				});

				if(!allowed) {
					event.preventDefault();
					if(Authentication.user !== undefined && typeof Authentication.user === 'object') {
						$state.go('forbidden');
					} else {
						$state.go('authentication.signin')
							.then(function () {
								storePreviousState(toState, toParams);
							});
					}
				}
			}
		});

		// Record previous state
		$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
			storePreviousState(fromState, fromParams);
		});

		// $rootScope.$on('$viewContentLoaded', function(event) {
		// 	console.log('setting prerender ready: ', event.targetScope.vm)
		// 	window.prerenderReady = true;
		// })

		// Store previous state
		function storePreviousState(state, params) {
			// only store this state if it shouldn't be ignored
			if(!state.data || !state.data.ignoreState) {
				$state.previous = {
					state: state,
					params: params,
					href: $state.href(state, params)
				};
			}
		}
	})
	.run(function ($rootScope, $state, Authentication, $localStorage, $http, VoteService) {
		// console.log('auth object: ', Authentication);
		if(Authentication.user.roles) {
			var pending = $localStorage.pendingVotes ? $localStorage.pendingVotes : [];
			// console.log('pending votes: ', pending);
			for(var i = 0; i < pending.length; i++) {
				var vote = pending[i];
				// console.log('sending vote: ', vote);
				VoteService.vote(vote.object, vote.objectType, vote.voteType);
			}
			delete $localStorage.pendingVotes;
		}
	})
	.filter('htmlToPlaintext', function () {
		return function (text) {
			return text ? String(text)
				.replace(/<[^>]+>/gm, ' ')
				.replace('&nbsp;', ' ') : '';
		};
	});

//Then define the init function for starting up the application
angular.element(document)
	.ready(function () {
		//Fixing facebook bug with redirect
		if(window.location.hash && window.location.hash === '#_=_') {
			if(window.history && history.pushState) {
				window.history.pushState('', document.title, window.location.pathname);
			} else {
				// Prevent scrolling by storing the page's current scroll offset
				var scroll = {
					top: document.body.scrollTop,
					left: document.body.scrollLeft
				};
				window.location.hash = '';
				// Restore the scroll offset, should be flicker free
				document.body.scrollTop = scroll.top;
				document.body.scrollLeft = scroll.left;
			}
		}

		//Then init the app
		angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
	});
