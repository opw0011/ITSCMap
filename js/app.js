var app = angular.module('app',['uiGmapgoogle-maps', 'frapontillo.bootstrap-switch', 'angular-json-editor']);

app.controller('MainController', ['$scope', '$log', '$http', function($scope, $log, $http) {

  var image_pc = "http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/computers.png"
  var image_mfp='http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/text.png';

  // get json data
  $http.get("data/setting.json")
      .then(function(response) {
        console.log(response.data);
        $scope.mapJson = angular.copy(response.data); // deep copy
        $scope.initMap(response.data);
      });

  $scope.initMap = function(inputMarketsArray) {

    // set map height
    var mapHeight = 700; // or any other calculated value
    $("#itsc-map .angular-google-map-container").height(mapHeight);

    // map starting location
    $scope.map = {
      center: {
        latitude: 22.33562097677705,
        longitude: 114.26574931415553
      },
      zoom: 17
    };

    // map options
    $scope.options = {
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // markers options
    $scope.virtualBarnOptions = {
      visible: true,
      animation: google.maps.Animation.DROP,
      icon: image_pc
    }

    $scope.MFPOptions = {
      visible: true,
      animation: google.maps.Animation.DROP,
      icon: image_mfp
    }


    // process markers array
    $scope.markersArray = inputMarketsArray;
    // append options to each markers
    $scope.markersArray.forEach(function (markerItem) {
      switch (markerItem.service_type) {
        case 'virtual_barn':
          markerItem.options = $scope.virtualBarnOptions;
          break;
        case 'mfp':
          markerItem.options = $scope.MFPOptions;
          break;
      }
    });

    // map windows
    $scope.windowOptions = {
        visible: false
    };

    // when marker is clicked
    $scope.onClick = function(marker, eventName, model) {
      console.log(model);
      //model.window_show = !model.window_show;
      $scope.title = model.title;
      $scope.image_url = model.image_url;
    };

    $scope.closeClick = function() {
        $scope.windowOptions.visible = false;
    };

    $scope.toggleMarkerVisible = function(type) {
      console.log("toggle visibility of type " + type);
      switch (type) {
        case 0:
          $scope.virtualBarnOptions.visible = !$scope.virtualBarnOptions.visible;
          break;
        case 1:
          $scope.MFPOptions.visible = !$scope.MFPOptions.visible;
          break;
        default:
          alert("ERROR");
      }
    }
  }
}]);

app.controller('AdminController', ['$scope', '$log', '$http', function($scope, $log, $http) {

  $scope.updateJson = function(json) {
    $http.post("/path/to/api/", json).success(function(data){
      //Callback function here.
      //"data" is the response from the server.
      alert(data);
    });
  }

  $scope.mySchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Item Name',
        required: true,
        minLength: 1
      },
      age: {
        type: 'integer',
        title: 'Age',
        required: true,
        min: 0
      }
    }
  };

  $scope.myStartVal = {
    age: 20
  };

  $scope.onChange = function (data) {
    console.log('Form changed!');
    console.dir(data);
  };
}]);