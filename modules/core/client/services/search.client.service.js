'use strict';

angular.module('core').service('SearchService', ['$resource', '$stateParams', '$q', '_', '$location', '$window',
    function ($resource, $stateParams, $q, _, $location, $window) {
		var Topic = $resource('api/topics/');
        var Issue = $resource('api/issues/');
        var Solution = $resource('api/solutions/');
        var Proposal = $resource('api/proposals/');

        var modelEnum = {
			topic: 0,
            issue: 1,
            solution: 2,
            proposal: 3
        };

        var svc = this;

		svc.searchTopics = function(text) {
            return Topic.query({ search: text }).$promise;
        };

        svc.searchIssues = function(text) {
            return Issue.query({ search: text }).$promise;
        };

        svc.searchSolutions = function(text) {
            return Solution.query({ search: text }).$promise;
        };

        svc.searchProposals = function(text) {
            return Proposal.query({ search: text }).$promise;
        };

        svc.searchAll = function(text) {
			var topics = svc.searchTopics(text);
            var issues = svc.searchIssues(text);
            var solutions = svc.searchSolutions(text);
            var proposals = svc.searchProposals(text);

            return Promise.all([topics, issues, solutions, proposals]).then(function(data) {
                var results = [];
                for (var model in data) {
                    for (var item in data[model]) {

                        // Valid objects have numbers as keys
                        if (!isNaN(item)) {

                            switch (parseInt(model)) {
								case modelEnum.topic:
									data[model][item].model = 'Topic';
									break;

                                case modelEnum.issue:
                                    data[model][item].model = 'Issue';
                                    break;

                                case modelEnum.solution:
                                    data[model][item].model = 'Solution';
                                    break;

                                case modelEnum.proposal:
                                    data[model][item].model = 'Proposal';
                                    break;

                            }
                            results.push(data[model][item]);
                        }
                    }
                }
                return results;
            });
        };

        svc.getItemTitle = function(item) {
            // Issues
            if (item.name !== undefined) {
                return item.name;

            // Solutions and Proposals
            } else if (item.title !== undefined) {
                return item.title;
            }
        };

        svc.getHyperLink = function(item) {
            switch (item.model) {
				case 'Topic':
					return getTopicLink(item);

                case 'Issue':
                    return getIssueLink(item);

                case 'Solution':
                    return getSolutionLink(item);

                case 'Proposal':
                    return getProposalLink(item);

            }
        };

		function getTopicLink(item) {
			var url = '/topics/' + item._id;
			return getOriginURL() + url;
		}

        function getIssueLink(item) {
            var url = '/issues/' + item._id;
            return getOriginURL() + url;
        }

        function getSolutionLink(item) {
            var url = '/solutions/' + item._id;
            return getOriginURL() + url;
        }

        function getProposalLink(item) {
            // Return a url to the parent solution
            var url = '/solutions/' + item.solution + '/?proposalId=' + item._id;
            return getOriginURL() + url;
        }

        function getOriginURL() {
            return new $window.URL($location.absUrl()).origin;
        }
    }
]);
