'use strict';

angular.module('core').service('SearchService', ['$resource', '$stateParams', '$q', '_', '$location', '$window',
    function ($resource, $stateParams, $q, _, $location, $window) {
		var Topic = $resource('api/topics/');
        var Issue = $resource('api/issues/');
        var Goal = $resource('api/goals/');
        var Solution = $resource('api/solutions/');

        var modelEnum = {
			topic: 0,
            issue: 1,
            goal: 2,
            solution: 3
        };

        var svc = this;

		svc.searchTopics = function(text) {
            return Topic.query({ search: text }).$promise;
        };

        svc.searchIssues = function(text) {
            return Issue.query({ search: text }).$promise;
        };

        svc.searchGoals = function(text) {
            return Goal.query({ search: text }).$promise;
        };

        svc.searchSolutions = function(text) {
            return Solution.query({ search: text }).$promise;
        };

        svc.searchAll = function(text) {
			var topics = svc.searchTopics(text);
            var issues = svc.searchIssues(text);
            var goals = svc.searchGoals(text);
            var solutions = svc.searchSolutions(text);

            return Promise.all([topics, issues, goals, solutions]).then(function(data) {
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

                                case modelEnum.goal:
                                    data[model][item].model = 'Goal';
                                    break;

                                case modelEnum.solution:
                                    data[model][item].model = 'Solution';
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

            // Goals and Solutions
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

                case 'Goal':
                    return getGoalLink(item);

                case 'Solution':
                    return getSolutionLink(item);

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

        function getGoalLink(item) {
            var url = '/goals/' + item._id;
            return getOriginURL() + url;
        }

        function getSolutionLink(item) {
            // Return a url to the parent goal
            var url = '/goals/' + item.goal + '/?solutionId=' + item._id;
            return getOriginURL() + url;
        }

        function getOriginURL() {
            return new $window.URL($location.absUrl()).origin;
        }
    }
]);
