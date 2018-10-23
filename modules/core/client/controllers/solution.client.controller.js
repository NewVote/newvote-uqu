'use strict';

angular.module('core')
	.controller('SolutionController', ['$scope', 'Authentication', '$mdSidenav', '$rootScope', '$mdMenu', '$state', '$stateParams', '$location', '$anchorScroll', 'SolutionService', 'IssueService', 'ProposalService', 'RegionService', '$q', '$mdDialog', 'VoteService', 'VOTE_TYPES', 'solution', 'proposals', 'endorsement', 'media', 'UploadService', 'SortService', 'isSingleProposal', '$mdConstant',
	function ($scope, Authentication, $mdSidenav, $rootScope, $mdMenu, $state, $stateParams, $location, $anchorScroll, SolutionService, IssueService, ProposalService, RegionService, $q, $mdDialog, VoteService, VOTE_TYPES, solution, proposals, endorsement, media, UploadService, SortService, isSingleProposal, $mdConstant) {
			// This provides Authentication context.
			var vm = this;
			vm.solution = solution;
			vm.newProposal = {};
			vm.proposals = Array.isArray(proposals) ? proposals : [proposals];
			vm.sortSvc = SortService;
			vm.isSingleProposal = isSingleProposal;
			vm.endorsement = endorsement;
			vm.media = media;
			vm.regions = [];
			$scope.$state = $state;
			$scope.toggle = function () {
				$scope.interactions = !$scope.interactions;
			};
			$scope.scrollTo = function (id) {
				$location.hash(id);
				$anchorScroll();
			};

			vm.chartLabels = ['Against', 'For'];
			vm.chartOptions = {
				elements: {
					arc: {
						borderWidth: 0
					}
				},
				responsive: true,
				legend: {
					display: false
				}
			};

			vm.chartColors = [{
					backgroundColor: 'rgba(255,0,0,0.8)',
					pointBackgroundColor: 'rgba(255,0,0,0.5)',
					pointHoverBackgroundColor: 'rgba(255,0,0,0.6)',
					borderColor: 'rgba(255,0,0,0.6)',
					pointBorderColor: 'rgba(255,0,0,0.6)',
					pointHoverBorderColor: 'rgba(255,0,0,0.6)'
			},
				{
					backgroundColor: 'rgba(0,255,0,0.8)',
					pointBackgroundColor: 'rgba(0,255,0,0.5)',
					pointHoverBackgroundColor: 'rgba(77,83,96,1)',
					borderColor: 'rgba(77,83,96,1)',
					pointBorderColor: '#fff',
					pointHoverBorderColor: 'rgba(77,83,96,0.8)'
			}
		];

			// Meta tags
			vm.desc = $rootScope.removeHtmlElements(vm.solution.description);
			vm.image = vm.solution.imageUrl;
			if($state.is('solutions.proposal')) {
				vm.desc = 'Proposed proposal for the solution "' + vm.solution.title + '": ' + vm.proposals[0].title;
			}

			vm.customKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];

			$scope.authentication = Authentication;
			$scope.prerender = document.getElementById('prerender');

			if($stateParams.issueId) {
				IssueService.get($stateParams.issueId)
					.then(function (issue) {
						vm.solution.issues.push(issue);
					});
			}

			// Title
			vm.titleText = '';
			if(vm.solution._id && $state.is('solutions.edit')) {
				vm.titleText = 'Edit Solution - ' + vm.solution.title;
				$rootScope.headerTitle = vm.solution.title + ' (editing)';
			} else if($state.is('solutions.create')) {
				vm.titleText = 'Add a Solution';
				$rootScope.headerTitle = 'Add Solution';
			} else if($state.is('solutions.view')) {
				vm.titleText = solution.title;
				$rootScope.headerTitle = 'Solution';
			} else if($state.is('solutions.proposal')) {
				vm.titleText = solution.title + ' | Proposed Proposal';
				$rootScope.headerTitle = 'Proposed Proposal';
			}
			vm.title = $rootScope.titlePrefix + vm.titleText + $rootScope.titleSuffix;

			vm.searchRegions = function (query) {
				return RegionService.searchRegions(query);
			};

			vm.updateVotes = function (regions) {
				// console.log(vm.solution);
				SolutionService.get($stateParams.solutionId, vm.regions)
					.then(function (solution) {
						vm.solution = solution;
					});
				ProposalService.list({
						solutionId: vm.solution._id,
						regions: regions
					})
					.then(function (proposals) {
						vm.proposals = proposals;
					});
			};

			function getProposals() {
				ProposalService.list({
						solutionId: $stateParams.solutionId
					})
					.then(function (proposals) {
						vm.proposals = proposals;
					}, function (err) {
						console.log('Error getting proposals for solution', $stateParams.solutionId, err);
					});
			}

			vm.createOrUpdate = function () {
				var promise = $q.resolve();
				if(vm.imageFile) {
					promise = UploadService.upload(vm.imageFile)
						.then(function () {
							console.log('uploaded file', vm.imageFile);
							vm.solution.imageUrl = vm.imageFile.result.secure_url;
						});
				}
				return promise.then(function () {
					return SolutionService.createOrUpdate(vm.solution)
						.then(function (solution) {
							$state.go('solutions.view', {
								solutionId: solution._id
							});
						});
				});
			};

			vm.delete = function () {
				if(!vm.solution._id) return;

				confirm('Are you sure you want to delete this solution?',
						'This cannot be undone. Please confirm your decision')
					.then(function () {
						SolutionService.delete(vm.solution._id)
							.then(function () {
								$state.go('solutions.list');
							});
					});
			};

			vm.showCreateProposal = function () {
				vm.creatingProposal = !vm.creatingProposal;
			};

			vm.createProposal = function () {
				vm.newProposal.solution = $stateParams.solutionId;
				ProposalService.createOrUpdate(vm.newProposal)
					.then(function () {
						getProposals();
						vm.creatingProposal = false;
						vm.newProposal = {};
					});
			};

			vm.searchIssues = function (query) {
				return IssueService.list({
					search: query
				});
			};

			vm.deleteProposal = function (proposal) {
				confirm('Are you sure you want to delete this proposal?', 'This cannot be undone.')
					.then(function () {
						ProposalService.delete(proposal._id)
							.then(function () {
								getProposals();
							});
					});
			};

			vm.voteProposal = function (proposal, voteType, $event) {
				$event.stopPropagation();
				VoteService.vote(proposal, 'Proposal', voteType)
					.then(function (data) {
						proposal.$get();
					});
			};

			vm.vote = function (voteType) {
				VoteService.vote(vm.solution, 'Solution', voteType)
					.then(function (data) {
						vm.solution.$get();
					});
			};

			vm.sort = function (sortData, $event) {
				if($event) $event.stopPropagation();
				// console.log('sorting by: ', sortData.type, sortData.order);
				SortService.setSort('proposal', sortData.type, sortData.order);
			};

			function confirm(title, text) {
				var confirmDialog = $mdDialog.confirm()
					.title(title)
					.textContent(text)
					.ok('Yes')
					.cancel('No');

				return $mdDialog.show(confirmDialog);
			}

			angular.element(document)
				.find('script[src="https://pol.is/embed.js"]')
				.remove();
			var el = angular.element('<script>')
				.attr('src', 'https://pol.is/embed.js');
			angular.element(document)
				.find('body')
				.append(el);
	}
]);
