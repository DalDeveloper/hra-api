'use strict';

/**
 * @ngdoc service
 * @name aeadminappApp.dataFactory
 * @description
 * # dataFactory
 * Service in the aeadminappApp.
 */
angular.module('aeadminappApp')
  .service('dataFactory', ['$http', function ($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
            getData: function () {
                return $http({
                    method: 'GET',
                    url: 'https://angular-data-grid.github.io/demo/data.json'
                });
            }
        }
  }]);
