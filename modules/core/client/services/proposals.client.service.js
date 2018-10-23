'use strict';

angular.module('core').service('ProposalService', ['$resource', '$stateParams', '$q', '_',
  function ($resource, $stateParams, $q, _) {
    var Proposal = $resource('api/proposals/:proposalId', { proposalId: '@_id' }, { update: { method: 'PUT' } });

    var svc = this;

    svc.get = function(proposalId) {
      return Proposal.get({ proposalId: proposalId }).$promise;
    };

    svc.list = function(params) {
      return Proposal.query(params).$promise;
    };

    svc.delete = function(proposalId) {
      var proposal = new Proposal({ _id: proposalId });
      return proposal.$remove();
    };

    svc.createOrUpdate = function(proposalObj) {
      var proposal = new Proposal(proposalObj);
      return proposal._id ? proposal.$update() : proposal.$save();
    };
  }
]);
