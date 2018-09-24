'use strict';

angular.module('core').service('TagService', ['$resource', '$stateParams', '$q', '_',
  function ($resource, $stateParams, $q, _) {
    var Tag = $resource('api/tags/:tagId', { tagId: '@_id' }, { update: { method: 'PUT' } });

    var svc = this;

    svc.get = function(tagId) {
      return Tag.get({ tagId: tagId }).$promise;
    };

    svc.list = function(params) {
      return Tag.query(params).$promise;
    };

    svc.delete = function(tagId) {
      var tag = new Tag({ _id: tagId });
      return tag.$remove();
    };

    svc.createOrUpdate = function(tagObj) {
      var tag = new Tag(tagObj);
      return tag._id ? tag.$update() : tag.$save();
    };

    svc.searchTags = function(query) {
      return svc.list({ search: query });
    };
  }
]);
