'use strict';

angular.module('core')
	.directive('shareButtons', ['$timeout', function ($timeout) {
		return {
			restrict: 'E',
			scope: {
				object: '=',
				reqObject: '=',
				objectType: '=',
				verticalResize: '='
			},
			templateUrl: 'modules/core/client/views/share-buttons.client.view.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: ['$scope', '$window', '$location', '$state', 'SocialshareService', 'SolutionService',
			function ($scope, $window, $location, $state, SocialshareService, SolutionService) {
					var vm = this;
					vm.url = $location.absUrl();

					vm.shareItems = [
						{ name: 'Facebook', id: 'facebook', imageName: 'facebook.svg' },
						{ name: 'Twitter', id: 'twitter', imageName: 'twitter.svg' },
						{ name: 'Google+', id: 'google_plus', imageName: 'google-plus.svg' },
						{ name: 'LinkedIn', id: 'linkedin', imageName: 'linkedin.svg' },
						{ name: 'Reddit', id: 'reddit', imageName: 'reddit.svg' },
						{ name: 'Copy to Clipboard', id: 'clipboard', imageName: 'clipboard.svg' }
        			];

					vm.$onInit = function () {
						if(vm.verticalResize) {
							vm.windowWidth = $window.innerWidth;
							angular.element($window)
								.on('resize', function () {
									vm.windowWidth = $window.innerWidth;
								});
						}
					};

					vm.$onDestroy = function () {
						angular.element($window)
							.off('resize');
					};

					vm.copyToClipboard = function() {

					}

					vm.share = function (provider) {

						if(provider == 'clipboard'){
							return vm.copyToClipboard();
						}

						switch(vm.objectType) {

						case 'topic':
							SocialshareService.share({
								provider: provider,
								rel_url: '/topics/' + vm.object._id,
								title: vm.object.name,
							});
							break;

						case 'issue':
							SocialshareService.share({
								provider: provider,
								rel_url: '/issues/' + vm.object._id,
								title: vm.object.name,
								hashtags: vm.object.topics ? vm.object.topics.join() : ''
							});
							break;

						case 'media':
							SocialshareService.share({
								provider: provider,
								rel_url: '/media/' + vm.object._id,
								title: vm.object.title,
								hashtags: ''
							});
							break;

						case 'solution':
							SocialshareService.share({
								provider: provider,
								rel_url: '/solutions/' + vm.object._id,
								title: vm.object.title,
								hashtags: ''
							});
							break;

						case 'proposal':
							SocialshareService.share({
								provider: provider,
								rel_url: '/proposals/' + vm.object._id,
								title: vm.object.title,
								hashtags: ''
							});
							break;

						default:
							console.log('Unknown object type', vm.objectType);
							break;
						}
					};
			}
		]
		};
}]);
