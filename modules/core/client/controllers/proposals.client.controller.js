'use strict';

angular.module('core').controller('ProposalsController', ['$scope', '$rootScope', '$state', '$stateParams', 'ProposalService', 'VoteService', 'Authentication', 'proposals', '$location',
  function ($scope, $rootScope, $state, $stateParams, ProposalService, VoteService, Authentication, proposals, $location) {
    var vm = this;
    vm.issueId = $stateParams.issueId;
    vm.proposals = proposals;

    // Title
    vm.title = $rootScope.titlePrefix + 'Proposals' + $rootScope.titleSuffix;
    $rootScope.headerTitle = 'Proposals';

	// Meta tags
	vm.desc = vm.desc = 'A collection of the current proposals being discussed on the UQ Votes platform.';
	vm.image = vm.proposals[0] ? vm.proposals[0].imageUrl : null;
	}
]);
