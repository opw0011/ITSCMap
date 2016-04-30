var app = angular.module('app',['uiGmapgoogle-maps']);

app.controller('MainController', ['$scope', function($scope, $log) {
  $scope.greeting = 'Hola!';
  $scope.test = "123";

  var image_pc = "http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/computers.png"
  var image_mfp='http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/text.png';


  $scope.init = function() {

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

    //// map markers
    //$scope.marker = {
    //  id: 0,
    //  coords: {
    //    latitude: 22.337916,
    //    longitude: 114.263373,
    //  },
    //  options: {
    //    draggable: false,
    //    icon: image_pc,
    //    visible: true,
    //    animation: google.maps.Animation.DROP
    //  }
    //};

    $scope.markersArray = [];

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

    // virtual barn markers
    var marker0 = {
      id: 0,
      latitude: 22.337916,
      longitude: 114.263373,
      title: "Student Lounge - Virtual Barn Workstations",
      image_url:  'http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/vb_lounge.jpg',
      options: $scope.virtualBarnOptions
    }

    var marker1 = {
      id: 1,
      latitude: 22.335534142708,
      longitude: 114.26342786225314,
      title: "LTJ - Virtual Barn Workstations",
      image_url:  'http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/mfp_ltj.jpg',
      options: $scope.virtualBarnOptions
    };
    $scope.markersArray.push(marker0);
    $scope.markersArray.push(marker1);

    // Satellite Printers
    var sMarker0 = {
      id: 2,
      latitude: 22.33632060929741,
      longitude: 114.26344127329821,
      title: "Coffee Shop - MFP",
      image_url:  'http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/mfp_coffeeshop.jpg',
      options: $scope.MFPOptions
    }
    $scope.markersArray.push(sMarker0);


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


    //$scope.title = "Student Lounge - Virtual Barn Workstations";
    //$scope.image_url =  'http://itsc.ust.hk/sites/itscprod.sites.ust.hk/files/barn/vb_lounge.jpg';


    //// param in pop up windows
    //$scope.windowParams = {
    //  title: $scope.title,
    //  image_url: $scope.image_url
    //}
  }

  $scope.init();

}]);