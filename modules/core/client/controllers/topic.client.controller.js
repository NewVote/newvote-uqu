'use strict';

angular.module('core')
	.controller('TopicController', ['$scope', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$state', '$stateParams', '$location', 'TopicService', '$mdDialog', 'topic', 'issues', 'UploadService', '$q', 'SortService', '$mdConstant',
	function ($scope, Authentication, $mdSidenav, $rootScope, $mdMenu, $state, $stateParams, $location, TopicService, $mdDialog, topic, issues, UploadService, $q, SortService, $mdConstant) {
			var vm = this;
			vm.topic = topic;
			vm.topicId = topic._id;
			vm.issues = issues;
			$scope.$state = $state;
			// This provides Authentication context.
			$scope.authentication = Authentication;
			$scope.prerender = document.getElementById('prerender');

			// Meta tags
			vm.desc = $rootScope.removeHtmlElements(vm.topic.description);
			vm.image = vm.topic.imageUrl;

			// Title
			vm.titleText = '';
			if(vm.topic._id && $state.is('topics.edit')) {
				vm.titleText = 'Edit Topic - ' + vm.topic.name;
				$rootScope.headerTitle = vm.topic.name + ' (editing)';
			} else if($state.is('topics.create')) {
				vm.titleText = 'Add an Topic';
				$rootScope.headerTitle = 'Add Topic';
			} else if($state.is('topics.view')) {
				vm.titleText = vm.topic.name;
				$rootScope.headerTitle = 'Topic';
			}

			vm.title = $rootScope.titlePrefix + vm.titleText + $rootScope.titleSuffix;

			//custom key bindings for selecting tags
			vm.customKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];

			//vm methods
			$scope.toggle = function () {
				$scope.interactions = !$scope.interactions;
			};

			vm.createOrUpdate = function () {
				var promise = $q.resolve();
				if(vm.imageFile) {
					promise = UploadService.upload(vm.imageFile)
						.then(function () {
							// console.log('uploaded file', vm.imageFile);
							vm.topic.imageUrl = vm.imageFile.result.secure_url;
						});
				}
				return promise.then(function () {
					return TopicService.createOrUpdate(vm.topic)
						.then(function (topic) {
							$state.go('topics.view', {
								topicId: topic._id
							});
						});
				});
			};

			vm.delete = function () {
				if(!vm.topic._id) return;
				var confirm = $mdDialog.confirm()
					.title('Are you sure you want to delete this topic?')
					.textContent('This cannot be undone. Please confirm your decision')
					.ok('Yes, I\'m sure')
					.cancel('No');

				$mdDialog.show(confirm)
					.then(function () {
						TopicService.delete(vm.topic._id)
							.then(function () {
								$state.go('topics.list');
							});
					});
			};
	}
]);
