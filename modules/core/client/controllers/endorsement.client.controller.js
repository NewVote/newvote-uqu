'use strict';

angular.module('core').controller('EndorsementController', ['$scope', '$rootScope', '$state', '$stateParams', 'Authentication', '$q', 'endorsement', 'IssueService', 'SolutionService', 'ProposalService', 'EndorsementService', 'UploadService',
	function ($scope, $rootScope, $state, $stateParams, Authentication, $q, endorsement, IssueService, SolutionService, ProposalService, EndorsementService, UploadService) {
		var vm = this;
		vm.endorsement = endorsement;

		// Title
		vm.title = 'Create Endorsement';
		vm.desc = 'Create and submit Endorsement';
		var previousState = '';
		var stateData = null;
		$rootScope.pageTitle = 'Create Endorsement';
		vm.previewData = {};

		if ($stateParams.objectId && $stateParams.objectType) {
			if ($stateParams.objectType === 'issue') {
				IssueService.get($stateParams.objectId).then(function (issue) {
					previousState = 'issues.view';
					vm.endorsement.issues.push(issue);
					stateData = {
						issueId: issue._id
					};
				});
			} else if ($stateParams.objectType === 'solution') {
				SolutionService.get($stateParams.objectId).then(function (solution) {
					previousState = 'solutions.view';
					vm.endorsement.solutions.push(solution);
					stateData = {
						solutionId: solution._id
					};
				});
			} else if ($stateParams.objectType === 'proposal') {
				ProposalService.get($stateParams.objectId).then(function (proposal) {
					previousState = 'proposals.view';
					vm.endorsement.proposals.push(proposal);
					stateData = {
						proposalId: proposal._id
					};
				});
			}
		} else {
			//there was no previous object data so just set previous state to home page
			previousState = 'home';
		}

		if ($state.is('endorsement.edit')) {
			if ($stateParams.objectType === 'issue') {
				previousState = 'issues.view';
				stateData = {
					issueId: $stateParams.previousObjectId
				};
			} else if ($stateParams.objectType === 'solution') {
				previousState = 'solutions.view';
				stateData = {
					solutionId: $stateParams.previousObjectId
				};
			} else if ($stateParams.objectType === 'proposal') {
				previousState = 'proposals.view';
				stateData = {
					proposalId: $stateParams.previousObjectId
				};
			}
		}

		vm.searchIssues = function (query) {
			return IssueService.list({
				search: query
			});
		};

		vm.searchSolutions = function (query) {
			return SolutionService.list({
				search: query
			});
		};

		vm.searchProposals = function (query) {
			return ProposalService.list({
				search: query
			});
		};

		vm.createOrUpdate = function () {
			var promise = $q.resolve();

			if(vm.imageFile) {
				promise = UploadService.upload(vm.imageFile)
					.then(function () {
						vm.endorsement.imageUrl = vm.imageFile.result.secure_url;
					});
			}
			return promise.then(function () {
				return EndorsementService.createOrUpdate(vm.endorsement).then(function (endorsement) {
					$state.go(previousState, stateData);
				});
			});
		};

		vm.delete = function (endorsement) {
			if (!endorsement._id) return;

			EndorsementService.delete(endorsement._id).then(function () {
				$state.go(previousState, stateData);
			});
		};

	}
]);
