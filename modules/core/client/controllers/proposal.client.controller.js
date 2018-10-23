'use strict';

angular.module('core').controller('ProposalController', ['$scope', '$window', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$state', '$stateParams', 'SolutionService', 'ProposalService', '$q', '$mdDialog', 'VoteService', 'VOTE_TYPES', 'proposal', 'solutions', 'endorsement', 'media', 'UploadService', 'SortService', 'isSingleProposal', '$mdConstant',
	function ($scope, $window, Authentication, $mdSidenav, $rootScope, $mdMenu, $state, $stateParams, SolutionService, ProposalService, $q, $mdDialog, VoteService, VOTE_TYPES, proposal, solutions, endorsement, media, UploadService, SortService, isSingleProposal, $mdConstant) {
		// This provides Authentication context.
		var vm = this;
		vm.proposal = proposal;
		vm.solutions = solutions;
		vm.endorsement = endorsement;
		vm.media = media;
		vm.isSingleProposal = isSingleProposal;

		// Meta tags
		vm.desc = $rootScope.removeHtmlElements(vm.proposal.description);
		vm.image = vm.proposal.imageUrl;

		$scope.$on('$viewContentLoaded', function(event) {
			console.log('view loaded proposal: ' + vm.proposal.title);
			$window.prerenderReady = true;
			console.log('prerender set to ready');
		})


		if ($state.is('solutions.proposal')) {
			vm.desc = 'Proposed proposal for the proposal "' + vm.proposal.title + '": ' + vm.proposals[0].title;
		}

		vm.customKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];

		$scope.authentication = Authentication;
		$scope.prerender = document.getElementById('prerender');

		if ($stateParams.solutionId) {
			vm.proposal.solutions = [];
			SolutionService.get($stateParams.solutionId).then(function (solution) {
				vm.proposal.solutions.push(solution);
			});
		}

		// Title
		vm.titleText = '';
		if (vm.proposal._id && $state.is('proposals.edit')) {
			vm.titleText = 'Edit Proposal - ' + vm.proposal.title;
			$rootScope.headerTitle = vm.proposal.title + ' (editing)';
		} else if ($state.is('proposals.create')) {
			vm.titleText = 'Add a Proposal';
			$rootScope.headerTitle = 'Add Proposal';
		} else if($state.is('proposals.view')) {
			vm.titleText = vm.proposal.title;
			$rootScope.headerTitle = 'Proposal';
		}
		vm.title = $rootScope.titlePrefix + vm.titleText + $rootScope.titleSuffix;

		vm.createOrUpdate = function () {
			var promise = $q.resolve();
			if (vm.imageFile) {
				promise = UploadService.upload(vm.imageFile).then(function () {
					// console.log('uploaded file', vm.imageFile);
					vm.proposal.imageUrl = vm.imageFile.result.secure_url;
				});
			}
			return promise.then(function () {
				return ProposalService.createOrUpdate(vm.proposal).then(function (proposal) {
					if($stateParams.solutionId){
						$state.go('solutions.view', {
							solutionId: $stateParams.solutionId
						});
					}else {
						$state.go('proposals.list');
					}
				});
			});
		};

		vm.delete = function () {
			if (!vm.proposal._id) return;

			confirm('Are you sure you want to delete this proposal?',
				'This cannot be undone. Please confirm your decision').then(function () {
				ProposalService.delete(vm.proposal._id).then(function () {
					$state.go('solutions.view', {
						solutionId: $stateParams.solutionId
					});
				});
			});
		};

		vm.searchSolutions = function (query) {
			return SolutionService.list({
				search: query
			});
		};

		function confirm(title, text) {
			var confirmDialog = $mdDialog.confirm()
				.title(title)
				.textContent(text)
				.ok('Yes')
				.cancel('No');

			return $mdDialog.show(confirmDialog);
		}
	}
]);
