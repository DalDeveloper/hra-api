'use strict';

/**
 * @ngdoc function
 * @name aeadminappApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the aeadminappApp
 */
angular.module('aeadminappApp')
  .controller('MainCtrl', ['$scope', 'dataFactory',function ($scope, dataFactory) {
   $scope.gridOptions = {
            data: [],
            urlSync: true
        };

        dataFactory.getData().then(function (responseData) {
            $scope.gridOptions.data = responseData.data;
        });
  }]);
