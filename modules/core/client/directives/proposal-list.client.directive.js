'use strict';

angular.module('core')
	.directive('proposalList', ['$timeout', function ($timeout) {
		return {
			restrict: 'E',
			scope: {
				proposals: '=',
				solutionId: '=',
				issueId: '='
			},
			templateUrl: 'modules/core/client/views/proposals-list.client.view.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: ['$scope', '$state', '$window', 'VoteService', 'SortService', 'Authentication', 'SocialshareService', 'RegionService', 'SolutionService', 'ProposalService', '$mdDialog',
				function ($scope, $state, $window, VoteService, SortService, Authentication, SocialshareService, RegionService, SolutionService, ProposalService, $mdDialog) {
					var vm = this;
					vm.sortSvc = SortService;
					vm.regions = [];
					$scope.authentication = Authentication;
					$scope.$state = $state;
					vm.solution = {};

					vm.$onInit = function () {
						if (vm.solutionId) {
							SolutionService.get(vm.solutionId)
								.then(function (solution) {
									vm.solution = solution;
								});
						}
					};

					vm.vote = function (proposal, voteType, $event) {
						$event.stopPropagation();
						VoteService.vote(proposal, 'Proposal', voteType)
							.then(function (data) {
								proposal.$get();
							});
					};
					vm.sort = function (sortData, $event) {
						if ($event) $event.stopPropagation();
						SortService.setSort('proposal', sortData.type, sortData.order);
					};

					vm.share = function (proposal, provider) {
						SocialshareService.share({
							provider: provider,
							rel_url: '/proposals/' + proposal._id,
							title: proposal.title,
							hashtags: proposal.tags.join()
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

					function getProposals() {
						ProposalService.list({
								solutionId: vm.solutionId ? vm.solutionId : null,
								issueId: vm.issueId ? vm.issueId : null,
								regions: vm.regions ? vm.regions : null
							})
							.then(function (proposals) {
								vm.proposals = proposals;
							}, function (err) {
								console.log('Error getting proposals for solution: ', vm.solutionId, err);
							});
					}

					function confirm(title, text) {
						var confirmDialog = $mdDialog.confirm()
							.title(title)
							.textContent(text)
							.ok('Yes')
							.cancel('No');

						return $mdDialog.show(confirmDialog);
					}

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

					vm.searchRegions = function (query) {
						return RegionService.searchRegions(query);
					};

					vm.updateVotes = function (regions) {
						ProposalService.list({
								solutionId: vm.solutionId ? vm.solutionId : null,
								issueId: vm.issueId ? vm.issueId : null,
								regions: regions
							})
							.then(function (proposals) {
								console.log(proposals);
								vm.proposals = proposals;
							});
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
				}
			]
		};
	}]);
