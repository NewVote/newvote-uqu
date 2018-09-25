'use strict';

angular.module('core').service('TopicService', ['$resource', '$stateParams', '$q', '_',
  function ($resource, $stateParams, $q, _) {
    var Topic = $resource('api/topics/:topicId', { topicId: '@_id' }, { update: { method: 'PUT' } });

    var svc = this;

    svc.get = function(topicId) {
      return Topic.get({ topicId: topicId }).$promise;
    };

    svc.list = function(params) {
      return Topic.query(params).$promise;
    };

    svc.delete = function(topicId) {
      var topic = new Topic({ _id: topicId });
      return topic.$remove();
    };

    svc.createOrUpdate = function(topicObj) {
      var topic = new Topic(topicObj);
      return topic._id ? topic.$update() : topic.$save();
    };

    svc.searchTopics = function(query) {
      return svc.list({ search: query });
    };
  }
]);
