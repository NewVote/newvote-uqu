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
				name: 'Student Action',
				description: 'Student Action is a progressive political body of students that believes the union has a responsibility to encourage student political engagement with fundamental issues that affect them.',
				imageUrl: '/modules/core/client/img/parties/student-action.png',
				url: 'https://www.newvote.org.au/student-action'
			},
			{
				name: 'Momentum',
				description: 'Momentum is a team of progressive activists that are focused on issues that concern the wellbeing and safety of students on campus.',
				imageUrl: '/modules/core/client/img/parties/momentum.png',
				url: 'https://www.newvote.org.au/momentum'
			},
			{
				name: 'Focus',
				description: 'Focus is an apolitical party with the core mission of improving upon the quality of life for students on campus.',
				imageUrl: '/modules/core/client/img/parties/focus.png',
				url: 'https://www.newvote.org.au/focus'
			},
			{
				name: ' Smokers Rights',
				description: 'Advocating for the rights of smokers, this party is fighting for the return of smoking to campus at UQ which was banned in July 2018. The party’s platforms are based on issues for smokers.',
				imageUrl: '/modules/core/client/img/placeholder.png',
				url: 'https://www.newvote.org.au/smokers-rights'
			},
			{
				name: 'Team Rocket',
				description: 'Team Rocket is mainly about ensuring no one political party faction gets too much power, providing checks and balances to make sure that neither side of politics tries to do anything too dodgy.',
				imageUrl: '/modules/core/client/img/parties/rocket.jpg',
				url: 'https://www.newvote.org.au/team-rocket'
			},
			{
				name: 'International',
				description: '',
				imageUrl: '/modules/core/client/img/placeholder.png',
				url: 'https://www.newvote.org.au/international'
			},
			{
				name: 'Revive',
				description: '',
				imageUrl: '/modules/core/client/img/parties/revive.png',
				url: 'https://www.newvote.org.au/revive'
			}]
	}
]);
