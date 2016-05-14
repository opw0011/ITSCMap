var app = angular.module('app',['uiGmapgoogle-maps', 'frapontillo.bootstrap-switch', 'angular-json-editor']).config(function (JSONEditorProvider) {
  // these are set by default, but we set this for demonstration purposes
  JSONEditorProvider.configure({
    defaults: {
      options: {
        iconlib: 'fontawesome4',
        theme: 'bootstrap3'
      }
    }
  })});

app.controller('MainController', ['$scope', '$log', '$http', function($scope, $log, $http) {

  var image_pc = "http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/computers.png";
  var image_mfp='http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/text.png';
  var image_satellite = "http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/text2.png";

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

    $scope.satelliteOptions = {
      visible: true,
      animation: google.maps.Animation.DROP,
      icon: image_satellite
    }


    // process markers array
    $scope.markersArray = inputMarketsArray;
    // append options to each markers
    $scope.markersArray.forEach(function (markerItem, key) {
      // append auto id to each markers
      markerItem.id = key;
      switch (markerItem.service_type) {
        case 'virtual_barn':
          markerItem.options = $scope.virtualBarnOptions;
          break;
        case 'mfp':
          markerItem.options = $scope.MFPOptions;
          break;
        case 'satellite_printer':
          markerItem.options = $scope.satelliteOptions;
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

  // Default loaded value for Json Editor
  $scope.myStartVal = $http.get("data/setting.json"); // load value from http

  // Schema for Json Editor
  $scope.jsonSchema = {
    "title": "Barn Services Markers",
    type: 'array',
    "format": "tabs",
    "uniqueItems": true,
    "items": {
      "title": "Marker",
      "type": "object",
      //"format": "grid",
      properties: {
        //id: {
        //  type: 'integer',
        //  title: 'ID',
        //  required: true,
        //},
        latitude: {
          type: 'number',
          title: 'Latitude',
          required: true,
        },
        longitude: {
          type: 'number',
          title: 'Lonitude',
          required: true,
        },
        title: {
          type: 'string',
          title: 'Marker\'s Title',
          required: true,
          minLength: 1
        },
        image_url: {
          type: 'string',
          title: 'Makers\'s Image',
          required: true,
          minLength: 1
        },
        service_type: {
          type: 'string',
          title: 'Service Type',
          required: true,
          enum: [
            'virtual_barn',
            'mfp',
            'satellite_printer'
          ]
        }
      }
    }
  };

  $scope.onChange = function (data) {
    console.log('Form changed!');
    console.dir(data);
    $scope.newJsonData = data;
  };

  $scope.reloadMap = function () {
    $scope.initMap(angular.copy($scope.newJsonData)); // pass a copy to initMap()
  }

  // save the updated data to json file by calling the php
  $scope.saveMap = function () {
    var r = confirm("Confirm save changes to the server?");
    if (r == true) {
      // TODO: ensure  json data is correct
      var json = $scope.newJsonData
      if(json == null || json == "") {
        alert("ERROR: No Map Data!");
        return;
      }
      updateJson(json);
    }

  }

  function updateJson(json) {
    console.log((json));
    $http({
      url: "Admin.php",
      method: "POST",
      data: json,
      headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).success(function (data, status, headers, config) {
      alert(data);
      $scope.reloadMap(); // reload the map after success update
    }).error(function (data, status, headers, config) {
      alert(data);
    });
  }
}]);