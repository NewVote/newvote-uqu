'use strict';

angular.module('core').controller('SuggestionsController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'Authentication', '$q', 'SuggestionsService', 'SearchService', 'suggestion',
	function ($scope, $rootScope, $state, $stateParams, $location, Authentication, $q, SuggestionsService, SearchService, suggestion) {
		var vm = this;
		vm.suggestion = suggestion;
		vm.suggestion.type = $stateParams.suggestionType;
		vm.objectType = $stateParams.objectType;
		vm.objectId = $stateParams.objectId;
		vm.results = [];

		vm.newItem = {
			model: 'New',
			title: 'Create a new suggestion'
		}

		vm.searchAll = function (text) {
			vm.results = SearchService.searchAll(text);
			vm.results.then(items => {
				items.unshift(vm.newItem);
			})
		};

		vm.getItemTitle = function (item) {
			return SearchService.getItemTitle(item);
		};

		vm.setSelectedItem = function(item) {
			console.log('setting new selected item: ', item)
			if(item.model === 'New') {
				vm.suggestion.type = 'new';
				vm.suggestion.title = '';
				vm.suggestion.description = '';
			}else {
				vm.suggestion.type = 'edit';
				vm.suggestion.parent = item;
				vm.suggestion.parentType = item.model;
				vm.suggestion.title = item.title ? item.title : item.name;
				vm.suggestion.description = item.description;
			}
		}

		vm.create = function () {
			debugger;
			console.log(vm.suggestion);
			var promise = $q.resolve();

			return promise.then(function () {
				return SuggestionsService.createOrUpdate(vm.suggestion).then(function (suggestion) {
					$state.go('thanks', {});
				});
			});
		};
	}
]);
