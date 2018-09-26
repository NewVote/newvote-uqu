'use strict';

angular.module('core')
	.controller('PartiesController', ['$scope', '$rootScope', '$state',
	function ($scope, $rootScope, $state) {
			// Update Title
			$scope.title = $rootScope.titlePrefix + 'Party Profiles' + $rootScope.titleSuffix;
			$scope.desc = 'Learn more about the policies of the different parties at UQ';
			$rootScope.headerTitle = 'Parties';

			var vm = this;
			vm.tiles = [{
				name: 'Momentum',
				description: 'Lorem ipsum dolor sit amet, quando facete luptatum ex eam, ne nam meis viris oratio, solum laoreet mel no. Ut has tantas consul dissentiet, eu vel sumo voluptatibus, an iudico labitur cum.',
				imageUrl: '/modules/core/client/img/placeholder.png'
			},
			{
				name: 'Focus',
				description: 'Lorem ipsum dolor sit amet, quando facete luptatum ex eam, ne nam meis viris oratio, solum laoreet mel no. Ut has tantas consul dissentiet, eu vel sumo voluptatibus, an iudico labitur cum.',
				imageUrl: '/modules/core/client/img/placeholder.png'
			},
			{
				name: 'International Student Assembly',
				description: 'Lorem ipsum dolor sit amet, quando facete luptatum ex eam, ne nam meis viris oratio, solum laoreet mel no. Ut has tantas consul dissentiet, eu vel sumo voluptatibus, an iudico labitur cum.',
				imageUrl: '/modules/core/client/img/placeholder.png'
			},
			{
				name: ' Smokers Rights',
				description: 'Lorem ipsum dolor sit amet, quando facete luptatum ex eam, ne nam meis viris oratio, solum laoreet mel no. Ut has tantas consul dissentiet, eu vel sumo voluptatibus, an iudico labitur cum.',
				imageUrl: '/modules/core/client/img/placeholder.png'
			},
			{
				name: 'Revive',
				description: 'Lorem ipsum dolor sit amet, quando facete luptatum ex eam, ne nam meis viris oratio, solum laoreet mel no. Ut has tantas consul dissentiet, eu vel sumo voluptatibus, an iudico labitur cum.',
				imageUrl: '/modules/core/client/img/placeholder.png'
			}]
	}
]);
