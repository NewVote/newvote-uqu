'use strict';

// Setting up route
angular.module('core')
	.config(['$stateProvider', '$urlRouterProvider',
		function ($stateProvider, $urlRouterProvider) {

			// Redirect to 404 when route not found
			$urlRouterProvider.otherwise(function ($injector, $location) {
				$injector.get('$state')
					.transitionTo('not-found', null, {
						location: false
					});
			});

			// Home state routing
			$stateProvider
				.state('home', {
					url: '/',
					templateUrl: 'modules/core/client/views/home.client.view.html',
					controller: 'HomeController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						title: 'UQ NewVote'
					},
					resolve: {
						topics: ['TopicService', function (TopicService) {
							return TopicService.list();
						}],
						issues: ['IssueService', function (IssueService) {
							return IssueService.list();
						}]
					}
				})

				.state('parties', {
					url: '/parties',
					templateUrl: 'modules/core/client/views/parties.client.view.html',
					controller: 'PartiesController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						title: 'Party Profiles'
					}
				})

				.state('thanks', {
					url: '/thanks',
					templateUrl: 'modules/core/client/views/thanks.client.view.html',
					controller: 'ThanksController',
					params: {
						'back': false
					},
					data: {
						title: 'Thank You'
					}
				})

				.state('about-us', {
					url: '/about-us',
					templateUrl: 'modules/core/client/views/about.client.view.html',
					controller: 'AboutController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						title: 'UQ NewVote'
					}
				})

				.state('help', {
					url: '/help',
					templateUrl: 'modules/core/client/views/help.client.view.html',
					controller: 'HelpController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						title: 'UQ NewVote'
					}
				})

				.state('majority-opinions', {
					url: '/majority-opinions',
					templateUrl: 'modules/core/client/views/majority-opinions.client.view.html',
					controller: 'MajorityController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						title: 'Majority'
					},
					resolve: {
						issues: ['IssueService', function (IssueService) {
							return IssueService.list();
						}]
					}
				})

				.state('topics', {
					url: '/topics',
					abstract: true,
					template: '<ui-view/>'

				})
				.state('topics.list', {
					url: '/',
					templateUrl: 'modules/core/client/views/topics.client.view.html',
					controller: 'TopicsController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						title: 'Topics'
					},
					resolve: {
						topics: ['TopicService', function (TopicService) {
							return TopicService.list();
						}]
					}
				})
				.state('topics.create', {
					url: '/create',
					templateUrl: 'modules/core/client/views/edit-topic.client.view.html',
					controller: 'TopicController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						roles: ['admin'],
						title: 'Create Topic'
					},
					resolve: {
						topic: function () {
							return {
								tags: []
							};
						},
						issues: function () {
							return {};
						}
					}
				})
				.state('topics.edit', {
					url: '/:topicId/edit',
					templateUrl: 'modules/core/client/views/edit-topic.client.view.html',
					controller: 'TopicController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						roles: ['admin'],
						title: 'Edit Topic'
					},
					resolve: {
						topic: ['TopicService', '$stateParams', function (TopicService, $stateParams) {
							return TopicService.get($stateParams.topicId);
						}],
						issues: function () {
							return {};
						}
					}
				})
				.state('topics.view', {
					url: '/:topicId',
					controller: 'TopicController',
					controllerAs: 'vm',
					templateUrl: 'modules/core/client/views/topic.client.view.html',
					params: {
						'back': false
					},
					resolve: {
						topic: ['TopicService', '$stateParams', function (TopicService, $stateParams) {
							return TopicService.get($stateParams.topicId);
						}],
						issues: ['IssueService', '$stateParams', function (IssueService, $stateParams) {
							return IssueService.list({
								topicId: $stateParams.topicId
							});
						}]
					}
				})

				.state('issues', {
					url: '/issues',
					abstract: true,
					template: '<ui-view/>'

				})
				.state('issues.list', {
					url: '/',
					templateUrl: 'modules/core/client/views/issues.client.view.html',
					controller: 'IssuesController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						title: 'Issues'
					},
					resolve: {
						issues: ['IssueService', function (IssueService) {
							return IssueService.list();
						}]
					}
				})
				.state('issues.create', {
					url: '/create',
					templateUrl: 'modules/core/client/views/edit-issue.client.view.html',
					controller: 'IssueController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						roles: ['admin'],
						title: 'Create Issue'
					},
					resolve: {
						issue: function () {
							return {
								tags: []
							};
						},
						solutions: function () {
							return {};
						},
						media: function () {
							return [];
						}
					}
				})
				.state('issues.edit', {
					url: '/:issueId/edit',
					templateUrl: 'modules/core/client/views/edit-issue.client.view.html',
					controller: 'IssueController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						roles: ['admin'],
						title: 'Edit Issue'
					},
					resolve: {
						issue: ['IssueService', '$stateParams', function (IssueService, $stateParams) {
							return IssueService.get($stateParams.issueId);
						}],
						solutions: function () {
							return {};
						},
						media: function () {
							return [];
						}
					}
				})
				.state('issues.view', {
					url: '/:issueId',
					controller: 'IssueController',
					controllerAs: 'vm',
					templateUrl: 'modules/core/client/views/issue.client.view.html',
					params: {
						'back': false
					},
					resolve: {
						issue: ['IssueService', '$stateParams', function (IssueService, $stateParams) {
							return IssueService.get($stateParams.issueId);
						}],
						solutions: ['SolutionService', '$stateParams', function (SolutionService, $stateParams) {
							return SolutionService.list({
								issueId: $stateParams.issueId
							});
						}],
						media: ['MediaService', '$stateParams', function (MediaService, $stateParams) {
							return MediaService.list({
								issueId: $stateParams.issueId
							});
						}]
					}
				})

				.state('solutions', {
					url: '/solutions',
					abstract: true,
					template: '<ui-view/>'
				})
				.state('solutions.list', {
					url: '/',
					templateUrl: 'modules/core/client/views/solutions.client.view.html',
					params: {
						'back': false
					},
					data: {
						title: 'UQ NewVote | Solutions'
					},
					controller: 'SolutionsController',
					controllerAs: 'vm',
					resolve: {
						solutions: ['SolutionService', function (SolutionService) {
							return SolutionService.list();
						}]
					}
				})
				.state('solutions.create', {
					url: '/create?:issueId',
					templateUrl: 'modules/core/client/views/edit-solution.client.view.html',
					controller: 'SolutionController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						roles: ['admin'],
						title: 'Create Solution'
					},
					resolve: {
						solution: function () {
							return {
								issues: [],
								tags: []
							};
						},
						proposals: function () {
							return [];
						},
						media: function () {
							return [];
						},
						endorsement: function () {
							return [];
						},
						isSingleProposal: function () {
							return false;
						}
					}
				})
				.state('solutions.edit', {
					url: '/:solutionId/edit',
					templateUrl: 'modules/core/client/views/edit-solution.client.view.html',
					controller: 'SolutionController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					data: {
						roles: ['admin'],
						title: 'Edit Solution'
					},
					resolve: {
						solution: ['SolutionService', '$stateParams', function (SolutionService, $stateParams) {
							return SolutionService.get($stateParams.solutionId);
						}],
						proposals: function () {
							return [];
						},
						media: function () {
							return [];
						},
						isSingleProposal: function () {
							return false;
						},
						endorsement: function () {
							return [];
						}
					}
				})
				.state('solutions.view', {
					url: '/:solutionId',
					templateUrl: 'modules/core/client/views/solution.client.view.html',
					controller: 'SolutionController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					resolve: {
						solution: ['SolutionService', '$stateParams', function (SolutionService, $stateParams) {
							return SolutionService.get($stateParams.solutionId);
						}],
						proposals: ['ProposalService', '$stateParams', function (ProposalService, $stateParams) {
							return ProposalService.list({
								solutionId: $stateParams.solutionId
							});
						}],
						media: ['MediaService', '$stateParams', function (MediaService, $stateParams) {
							return MediaService.list({
								solutionId: $stateParams.solutionId
							});
						}],
						endorsement: ['EndorsementService', '$stateParams', function (EndorsementService, $stateParams) {
							return EndorsementService.list({
								solutionId: $stateParams.solutionId
							});
						}],
						isSingleProposal: function () {
							return false;
						}
					}
				})

				.state('solutions.proposal', {
					url: '/:solutionId/?:proposalId',
					templateUrl: 'modules/core/client/views/solution.client.view.html',
					controller: 'SolutionController',
					controllerAs: 'vm',
					params: {
						'back': false
					},
					resolve: {
						solution: ['SolutionService', '$stateParams', function (SolutionService, $stateParams) {
							return SolutionService.get($stateParams.solutionId);
						}],
						proposals: ['ProposalService', '$stateParams', function (ProposalService, $stateParams) {
							return ProposalService.get($stateParams.proposalId);
						}],
						media: ['MediaService', '$stateParams', function (MediaService, $stateParams) {
							return MediaService.list({
								solutionId: $stateParams.solutionId
							});
						}],
						isSingleProposal: function () {
							return true;
						}
					}
				})

				.state('proposals', {
					url: '/proposals',
					abstract: true,
					template: '<ui-view/>'
				})
				.state('proposals.list', {
					url: '/',
					templateUrl: 'modules/core/client/views/proposals.client.view.html',
					params: {
						'back': false,
						proposalId: null,
						solutionId: null
					},
					data: {
						title: 'UQ NewVote | Proposals'
					},
					controller: 'ProposalsController',
					controllerAs: 'vm',
					resolve: {
						proposals: ['ProposalService', function (ProposalService) {
							return ProposalService.list();
						}]
					}
				})
				.state('proposals.create', {
					url: '/create?:solutionId',
					templateUrl: 'modules/core/client/views/edit-proposal.client.view.html',
					controller: 'ProposalController',
					controllerAs: 'vm',
					params: {
						'back': false,
						proposalId: null,
						solutionId: null
					},
					data: {
						roles: ['admin'],
						title: 'Create Proposal'
					},
					resolve: {
						proposal: function () {
							return {
								solutions: []
							};
						},
						solutions: function () {
							return [];
						},
						media: function () {
							return [];
						},
						endorsement: function () {
							return [];
						},
						isSingleProposal: function () {
							return true;
						}
					}
				})
				.state('proposals.edit', {
					url: '/:proposalId/edit',
					templateUrl: 'modules/core/client/views/edit-proposal.client.view.html',
					controller: 'ProposalController',
					controllerAs: 'vm',
					params: {
						'back': false,
						proposalId: null,
						solutionId: null
					},
					data: {
						roles: ['admin'],
						title: 'Edit Proposal'
					},
					resolve: {
						proposal: ['ProposalService', '$stateParams', function (ProposalService, $stateParams) {
							return ProposalService.get($stateParams.proposalId);
						}],
						solutions: function () {
							return [];
						},
						media: function () {
							return [];
						},
						endorsement: function () {
							return [];
						},
						isSingleProposal: function () {
							return true;
						}
					}
				})
				.state('proposals.view', {
					url: '/:proposalId',
					templateUrl: 'modules/core/client/views/proposal.client.view.html',
					controller: 'ProposalController',
					controllerAs: 'vm',
					params: {
						'back': false,
						'objectId': null,
						'objectType': null,
						'suggestionType': null
					},
					resolve: {
						proposal: ['ProposalService', '$stateParams', function (ProposalService, $stateParams) {
							return ProposalService.get($stateParams.proposalId);
						}],
						solutions: ['SolutionService', '$stateParams', function (SolutionService, $stateParams) {
							return SolutionService.list({
								proposalId: $stateParams.proposalId
							});
						}],
						media: ['MediaService', '$stateParams', function (MediaService, $stateParams) {
							return MediaService.list({
								proposalId: $stateParams.proposalId
							});
						}],
						endorsement: ['EndorsementService', '$stateParams', function (EndorsementService, $stateParams) {
							return EndorsementService.list({
								proposalId: $stateParams.proposalId
							});
						}],
						isSingleProposal: function () {
							return true;
						}
					}
				})

				.state('suggestions', {
					url: '/suggestions',
					templateUrl: 'modules/core/client/views/edit-suggestion.client.view.html',
					controller: 'SuggestionsController',
					controllerAs: 'vm',
					data: {
						roles: ['admin', 'user'],
						title: 'Create Suggestion'
					},
					params: {
						'back': false,
						'objectId': null,
						'objectType': null,
						'suggestionType': null
					},
					resolve: {
						suggestion: function () {
							return {
								issues: [],
								solutions: []
							};
						}
					}
				})

				.state('media', {
					url: '/media',
					abstract: true,
					template: '<ui-view/>'
				})

				.state('media.create', {
					url: '/create',
					templateUrl: 'modules/core/client/views/edit-media.client.view.html',
					controller: 'MediaController',
					controllerAs: 'vm',
					data: {
						roles: ['admin'],
						title: 'Create Media'
					},
					params: {
						'back': false,
						objectId: null,
						objectType: null
					},
					resolve: {
						media: function () {
							return {
								issues: [],
								solutions: [],
								proposals: []
							};
						}
					}
				})
				.state('media.edit', {
					url: '/edit?:mediaId&:previousObjectId&:objectType',
					templateUrl: 'modules/core/client/views/edit-media.client.view.html',
					controller: 'MediaController',
					controllerAs: 'vm',
					data: {
						'back': false,
						roles: ['admin'],
						title: 'Edit Media'
					},
					resolve: {
						media: ['MediaService', '$stateParams', function (MediaService, $stateParams) {
							return MediaService.get($stateParams.mediaId);
						}]
					}
				})

				.state('endorsement', {
					url: '/endorsement',
					abstract: true,
					template: '<ui-view/>'
				})

				.state('endorsement.create', {
					url: '/create',
					templateUrl: 'modules/core/client/views/edit-endorsement.client.view.html',
					controller: 'EndorsementController',
					controllerAs: 'vm',
					data: {
						roles: ['endorser', 'admin'],
						title: 'Create Endorsement'
					},
					params: {
						'back': false,
						objectId: null,
						objectType: null
					},
					resolve: {
						endorsement: function () {
							return {
								issues: [],
								solutions: [],
								proposals: []
							};
						}
					}
				})
				.state('endorsement.edit', {
					url: '/edit?:endorsementId&:previousObjectId&:objectType',
					templateUrl: 'modules/core/client/views/edit-endorsement.client.view.html',
					controller: 'EndorsementController',
					controllerAs: 'vm',
					params: {
						'back': false,
						objectId: null,
						objectType: null
					},
					data: {
						roles: ['admin', 'endorser'],
						title: 'Edit Endorsement'
					},
					resolve: {
						endorsement: ['EndorsementService', '$stateParams', function (EndorsementService, $stateParams) {
							return EndorsementService.get($stateParams.endorsementId);
						}]
					}
				})

				// .state('results', {
				//   url: '/results',
				//   templateUrl: 'modules/core/client/views/results.client.view.html',
				//   data: {
				//     title: 'Results'
				//   }
				// })

				.state('privacy', {
					url: '/privacy',
					templateUrl: 'modules/core/client/views/privacy.client.view.html',
					bindToController: true,
					controllerAs: 'vm',
					controller: ['$scope', '$rootScope', '$state',
						function ($scope, $rootScope, $state) {
							var vm = this;
							// Meta tags
							vm.desc = 'The privacy policy for the UQ NewVote platform.';
							// Title
							vm.titleText = '';
							vm.titleText = 'Privacy Policy';
							$rootScope.headerTitle = 'Privacy Policy';
							vm.title = $rootScope.titlePrefix + vm.titleText + $rootScope.titleSuffix;
						}
					]
				})

				.state('not-found', {
					url: '/not-found',
					templateUrl: 'modules/core/client/views/404.client.view.html',
					data: {
						ignoreState: true
					}
				})
				.state('bad-request', {
					url: '/bad-request',
					templateUrl: 'modules/core/client/views/400.client.view.html',
					data: {
						ignoreState: true
					}
				})
				.state('forbidden', {
					url: '/forbidden',
					templateUrl: 'modules/core/client/views/403.client.view.html',
					data: {
						ignoreState: true
					}
				});
		}
	]);
