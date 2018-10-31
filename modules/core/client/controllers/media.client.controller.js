'use strict';

angular.module('core')
	.controller('MediaController', ['$scope', '$rootScope', '$state', '$stateParams', 'Authentication', '$q', 'media', 'IssueService', 'SolutionService', 'ProposalService', 'MediaService', 'UploadService',
		function ($scope, $rootScope, $state, $stateParams, Authentication, $q, media, IssueService, SolutionService, ProposalService, MediaService, UploadService) {
			var vm = this;
			vm.media = media;

			// Title
			vm.title = 'Create Media';
			vm.desc = 'Create and submit Media';
			var previousState = '';
			var stateData = null;
			$rootScope.pageTitle = 'Create Media';
			vm.previewData = {};
			vm.manualImage = '';
			vm.authentication = Authentication;

			if ($stateParams.objectId && $stateParams.objectType) {
				if ($stateParams.objectType === 'issue') {
					IssueService.get($stateParams.objectId)
						.then(function (issue) {
							previousState = 'issues.view';
							vm.media.issues.push(issue);
							stateData = {
								issueId: issue._id
							};
						});
				} else if ($stateParams.objectType === 'solution') {
					SolutionService.get($stateParams.objectId)
						.then(function (solution) {
							previousState = 'solutions.view';
							vm.media.solutions.push(solution);
							stateData = {
								solutionId: solution._id
							};
						});
				} else if ($stateParams.objectType === 'proposal') {
					ProposalService.get($stateParams.objectId)
						.then(function (proposal) {
							previousState = 'proposals.view';
							vm.media.proposals.push(proposal);
							stateData = {
								proposalId: proposal._id
							};
						});
				}
			} else {
				//there was no previous object data so just set previous state to home page
				previousState = 'home';
			}

			if ($state.is('media.edit')) {
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

			// http://www.abc.net.au/news/2015-05-07/e-health-programs-should-be-used-to-tackle-mental-health-issues/6450972
			vm.getMeta = function () {
				console.log('scraping meta for url: ', vm.media.url);
				MediaService.getMeta(vm.media.url)
					.$promise.then(function (meta) {
						//check if there is already manually entered data
						//set it from the scrape if not
						if(!vm.media.title) vm.media.title = meta.title;
						if(!vm.media.description) vm.media.description = meta.description;
						if(!vm.media.image) vm.media.image = meta.image;
						vm.media.imageOnly = false;
						console.log('finished scrape');
					}, function (err) {
						console.log('was an error scraping');
						if (/\.(jpe?g|png|gif|bmp)$/i.test(vm.media.url)) {
							if(!vm.media.image) vm.media.image = vm.media.url;
							vm.media.imageOnly = true;
						}
					});
			};

			vm.resetData = function() {
				MediaService.getMeta(vm.media.url)
					.$promise.then(function (meta) {
						vm.media.title = meta.title;
						vm.media.description = meta.description;
						vm.media.image = meta.image;
						vm.media.imageOnly = false;
					}, function (err) {
						console.log('was an error scraping');
						if (/\.(jpe?g|png|gif|bmp)$/i.test(vm.media.url)) {
							vm.media.image = vm.media.url;
							vm.media.imageOnly = true;
						}
					});
			}

			vm.isSecure = function(url) {
				return !/^https/.test(url);
			}

			if (vm.media.url) {
				vm.getMeta();
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
				if (vm.manualImage) {
					promise = UploadService.upload(vm.manualImage).then(function () {
						// console.log('uploaded file', vm.imageFile);
						vm.media.image = vm.manualImage.result.secure_url;
					});
				}
				return promise.then(function () {
					return MediaService.createOrUpdate(vm.media)
						.then(function (media) {
							$state.go(previousState, stateData);
						});
				});
			};

			vm.delete = function (media) {
				if (!media._id) return;

				MediaService.delete(media._id)
					.then(function () {
						$state.go(previousState, stateData);
					});
			};

		}
	]);
