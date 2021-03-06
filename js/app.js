/*
To control the default visible services

Pass different param into the url using the following format:
http://{HOST_BASE_URL}/{FOLDER_NAME}/index.html?v={MARKER_INDEX}
e.g. http://127.0.0.1/itsc-map/index.html?v=0

For multiple markers:
http://{HOST_BASE_URL}/{FOLDER_NAME}/index.html?v={MARKER_INDEX_1}[&v={MARKER_INDEX_N}...]
e.g. http://127.0.0.1/itsc-map/index.html?v=0&v=1&v=3

Notes:
- MARKER_INDEX starts with 0
- If no param is passed, it will shows all by default
*/

var app = angular.module('app', ['uiGmapgoogle-maps', 'frapontillo.bootstrap-switch', 'angular-json-editor', 'cgBusy', 'ngBootbox'])
.config(function (JSONEditorProvider) {
    // these are set by default, but we set this for demonstration purposes
    JSONEditorProvider.configure({
        defaults: {
            options: {
                iconlib: 'fontawesome4',
                theme: 'bootstrap3',
                disable_array_delete_all_rows: true,
                disable_properties: true,
                show_errors: 'always'
            }
        }
    })
})
.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.controller('MainController', function ($rootScope, $scope, $log, $http, $filter,$timeout, $ngBootbox, $location) {
    var MAP_HEIGHT = $(window).height() - 40;
    console.log("Map height: " + MAP_HEIGHT);

    // dynamic update map when resize
    $(window).resize(function(){
        $scope.$apply(function(){
            //do something to update current scope based on the new innerWidth and let angular update the view.
            $scope.setMapHeight($(window).height() - $("#select-marker-bar").height());
        });
    });

    $rootScope.cursorPosition = {
        latitude: 0,
        longitude: 0
    }

    // get json data
    $scope.myPromise = $http.get("data/setting.json")
        .then(function (response) {
            console.log(response.data);
            //var marker_data = response.data.markers;
            $scope.mapJson = angular.copy(response.data); // deep copy
            var options = {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                //scrollwheel: false
            };
            $scope.initMap(response.data, MAP_HEIGHT, options);
        });

    // adjust the display map height
    $scope.setMapHeight = function (height) {
        $("#itsc-map .angular-google-map-container").height(height);
    }

    $scope.initMap = function (inputJson, mapHeight, options) {
        // set map height
        //var mapHeight = 700; // or any other calculated value
        $scope.setMapHeight(mapHeight);
        //$("#itsc-map .angular-google-map-container").height(mapHeight);

        // map events for admin panel, click to select long and lat
        $scope.mapEvent = {
            rightclick: function (mapModel, eventName, originalEventArgs) {
                console.log(originalEventArgs[0].latLng);
                // add a new marker to indicate the cursor clicked position
                $scope.$apply(function () {
                    var e = originalEventArgs[0];
                    var marker = {};
                    marker.id = 99999;
                    marker.coords = {};
                    marker.latitude = e.latLng.lat();
                    marker.longitude = e.latLng.lng();
                    //marker.options = {draggable : true};
                    $scope.markersArray.push(marker);

                    $rootScope.cursorPosition = {latitude: marker.latitude, longitude: marker.longitude};

                });

                $timeout(function() {
                    // anything you want can go here and will safely be run on the next digest.
                    confirmRightClickAddNewMarker();
                })
                //setTimeout(function() { confirmRightClickAddNewMarker(); }, 500);
            }
        };

        function confirmRightClickAddNewMarker() {
            $ngBootbox.confirm('Do you want to add a new marker using current position?')
                .then(function() {
                    // if confirmed
                    $timeout(function() {
                        document.getElementById("btn_new_marker").click();
                    })
                }, function() {
                    console.log('Confirm dismissed!');
            });
        }

        // map starting location
        $scope.map = inputJson.map

        // map options
        $scope.options = options;

        // markers options
        $scope.serviceTypeArray = inputJson.marker_types;
        $scope.markerOptionsArray = [];

        // get the url route params
        var param = $location.search();

        // number stored in this array is the icon index set to visible
        // e.g. [0, 3] -> set icon[0] = icon[3] = visible, others are hidden
        var toggleVisble = [];
        // var optVisible = false;

        console.log(param);
        if(jQuery.isEmptyObject(param)) {
          console.log("no param is passed, all visible");
        }
        else{
          // param is not empty object

          if(param.v != null) {
            if(param.v instanceof Array) {
              // multiple param
              param.v.forEach(function(index) {
                toggleVisble.push(parseInt(index));
              });
            }
            else {
              // single param
              toggleVisble.push(parseInt(param.v));
            }
          }
        }

        // console.log(toggleVisble);

        // set default option and icon for each marker type
        inputJson.marker_types.forEach(function (markerType, index) {
            // console.log(index);
            //console.log("Debug");
            //console.log(markerType);
            var obj = {
                // checkbox default visibility
                visible: false,
                animation: google.maps.Animation.DROP,
                icon: markerType.icon_image_url,
                title: markerType.title
            }
            // if no param is passed, by default show all
            if(toggleVisble.length == 0) {
              obj.visible = true;
            }
            else {
              // toggle the icon stored in array
              toggleVisble.forEach(function(visibleIndex) {
                if(index == visibleIndex) {
                  obj.visible = true;
                  return;
                }
              })
            }

            $scope.markerOptionsArray.push(obj);
            //console.log($scope.markerOptionsArray);
        });
        console.log($scope.markerOptionsArray);

        // process markers array
        $scope.markersArray = inputJson.markers;
        // append options to each markers
        $scope.markersArray.forEach(function (markerItem, key) {
            // append auto id to each markers
            markerItem.id = key;
            var marker_type_title = markerItem.service_type;

            // append marker's icon and service type information to each marker
            //markerItem.options = $scope.markerOptionsArray[marker_type_title];
            var found = $filter('filter')($scope.markerOptionsArray, {title: marker_type_title}, true);
            if (found.length) {
                //console.log(found[0]);
                markerItem.options = found[0];
            }
            else {
                console.log("ERROR: no matched icon found");
            }
        });

        // map windows
        $scope.windowOptions = {
            pixelOffset: {height: -30, width:0},
            visible: false
        };

        // when marker is clicked
        $scope.onClick = function (marker, eventName, model) {
            console.log(model);
            $scope.$apply(function() {
                $scope.selectedMarker = {};
                // update windows content, note that using scope variable has bug
                angular.element( document.querySelector('#window_title') ).text(model.title);
                angular.element( document.querySelector('#window_img') ).attr("src", model.image_url);
                // prevent firefox broken imgage
		if(model.image_url == "")
			angular.element( document.querySelector('#window_img')).css('visibility', 'hidden');
		else
			angular.element( document.querySelector('#window_img')).css('visibility', 'visible');
		//$scope.selectedMarker.title = model.title;
                //$scope.selectedMarker.image_url = model.image_url;
                $scope.selectedMarker.coords = {
                    latitude: model.latitude,
                    longitude: model.longitude
                };
                $scope.windowOptions.visible = true;
            });

        };

        $scope.closeClick = function () {
            console.log("close")
            this.show = false;
        };
    }
});

app.controller('AdminController', function ($rootScope, $scope, $log, $http) {

    var MAP_HEIGHT = 700;

    // Default loaded value for Json Editor
    $scope.myStartVal = $http.get("data/setting.json"); // load value from http
    //console.log("Start value")
    //console.log($scope.myStartVal);

    // Schema for Json Editor
    $scope.jsonSchema = {
        title: "ITSC Services Markers",
        type: 'object',
        uniqueItems: true,
        properties: { // object properties
            markers: {
                title: 'Markers Information',
                type: 'array',
                format: 'tabs',
                options: {hidden: false},
                "items": {
                    "title": "Marker",
                    "type": "object",
                    "headerTemplate": "[{{ i1 }}] {{ self.title }}",
                    properties: {
                        latitude: {
                            type: 'number',
                            title: 'Latitude',
                            required: true,
                        },
                        longitude: {
                            type: 'number',
                            title: 'Longitude',
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
                            title: 'Makers\'s Image (image url)',
                            required: true,
                            //minLength: 1
                        },
                        service_type: {
                            type: 'string',
                            title: 'Service Type',
                            required: true,
                            default: "None",
                            //enum: [
                            //  'virtual_barn',
                            //  'mfp',
                            //  'satellite_printer'
                            //]
                            watch: {
                                arr: "marker_types"
                            },
                            enumSource: [
                                {
                                    "source": ["None"]
                                },
                                {
                                    "source": "arr",
                                    "title": "{{item.title}}",
                                    "value": "{{item.title}}"
                                }
                            ]
                        }
                    }
                }
            },
            marker_types: {
                title: 'Marker Types',
                id: "marker_types_array",
                type: 'array',
                format: 'tabs',
                options: {hidden: true},
                items: {
                    title: "Service Type",
                    type: "object",
                    "headerTemplate": "[{{ i1 }}] {{ self.title }}",
                    properties: {
                        title: {
                            type: 'string',
                            title: 'Service\'s Title',
                            required: true,
                            minLength: 1
                        },
                        icon_image_url: {
                            type: 'string',
                            title: 'Service\'s Image (image url)',
                            required: true
                        }
                    }
                }
            },
            map: {  // map initial location
                title: 'Map Initial Location',
                type: 'object',
                options: {hidden: true},
                properties: {
                    center: {
                        title: 'Location',
                        type: 'object',
                        format: "grid",
                        properties: {
                            latitude: {
                                type: 'number',
                                title: 'Latitude',
                                required: true
                            },
                            longitude: {
                                type: 'number',
                                title: 'Longitude',
                                required: true
                            }
                        }
                    },
                    zoom: {
                        type: 'integer',
                        title: 'Zoom',
                        required: true
                    }
                }
            },

        } // end properties
    };

    $scope.onChange = function (data) {
        console.log('Form changed!');
        console.dir(data);
        $rootScope.newJsonData = data;
    };

    $rootScope.reloadMap = function () {
        var options = {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            //scrollwheel: false
        };
        $scope.initMap(angular.copy($rootScope.newJsonData), MAP_HEIGHT, options); // pass a copy to initMap()
    }

    // in the nav bar, switch between markers, marker types and map initial location
    $scope.onMenuSelect = function (type) {
        console.log("Select Tab: " + type);
        $scope.activeTab = type;
        var arr = new Array(true, true, true);
        if (type >= 0 && type <= 2) {
            arr[type] = false;
        }
        else {
            arr[0] = arr[1] = arr[2] = false;
        }
        console.log(arr);
        $scope.jsonSchema.properties.markers.options.hidden = arr[0];
        $scope.jsonSchema.properties.marker_types.options.hidden = arr[1];
        $scope.jsonSchema.properties.map.options.hidden = arr[2];
    }

    //$rootScope.updateNewMarkerLatLon = function () {
    //
    //}
});

app.controller('SaveJsonBtnController', function ($rootScope, $scope, $http, $timeout, $window) {
    $scope.showErrorMsg = false;

    // save the updated data to json file by calling the php
    $scope.saveMap = function () {
        //var r = confirm("Confirm save changes to the server?");
        // TODO: ensure  json data is correct
        var error = $scope.editor.validate()
        if(error.length) {
            $scope.showErrorMsg = true;
            alert("Error! Data is not saved.");
            return;
        }

        var json = $rootScope.newJsonData
        if (json == null || json == "") {
            alert("ERROR: No Map Data!");
            return;
        }
        updateJson(json);

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
            $rootScope.reloadMap(); // reload the map after success update
        }).error(function (data, status, headers, config) {
            alert(data);
        });
    }

    // copy the right-click added marker to json editor
    $scope.addNewMarker = function () {
        console.log("Right Click create new marker");
        var new_marker = $rootScope.cursorPosition;
        if (new_marker == null || new_marker == "") {
            console.log("ERROR: null new marker");
            alert("Please right click on the map to locate the marker");
            return;
        }
        var json = $scope.editor.getValue();
        json.markers.push(new_marker);
        $scope.editor.setValue(json);
        //console.log($scope.editor.getValue());

        // go to the new marker

        $timeout(function() {
            angular.element('#nav_json_editor > li > a').first().click()
            angular.element('div[data-schemapath="root.markers"] > div > div.tabs.list-group > a > span').last().trigger( "click" );
            $window.scrollTo(0, 0);
        }, 100);

    }
});
