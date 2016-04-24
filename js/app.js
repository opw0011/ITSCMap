var app = angular.module('app',['uiGmapgoogle-maps']);

app.controller('MainController', ['$scope', function($scope, $log) {
  $scope.greeting = 'Hola!';
  $scope.test = "123";

  var image_pc = "http://itsc.ust.hk//sites/itscprod.sites.ust.hk/files/barn/computers.png"



  $scope.init = function() {
    var mapHeight = 500; // or any other calculated value
    $("#itsc-map .angular-google-map-container").height(mapHeight);

    $scope.map = {
      center: {
        latitude: 22.33562097677705,
        longitude: 114.26574931415553
      },
      zoom: 17
    };

    $scope.options = {
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.marker = {
      id: 0,
      coords: {
        latitude: 22.337916,
        longitude: 114.263373
      },
      options: { draggable: true }
    };

  }

  $scope.init();

}]);