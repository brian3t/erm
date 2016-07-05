var map;
var markers = [];
var geocoder;
var infowindow;

function getIcon(iconType) {
    var i = parseInt(iconType);
    var iconExtension = ".gif";
    var iconWidth = 20;
    var iconHeight = 20;
    var iconWidth2 = 10;
    var iconHeight2 = 20;
    var iconImageURL = "img/markerpnr.png";
    var shadowPath = "img/markerpnr.png";
    if (!map.ICONS[i]) {
        /*
         if(i==3) { iconImageURL = basePath + "images/markersigalert.png"; }
         else if(i==7) { iconImageURL = basePath + "images/incident7.gif"; }
         else if(i==8) { iconImageURL = basePath + "images/incident8.gif"; }
         else if(i==11) { iconImageURL = basePath + "images/markerincident.png"; }
         else if(i==98) { iconImageURL = basePath + "images/markercms.png"; }
         else if(i==99) { iconImageURL = basePath + "images/markercamera.png"; }
         */
        var iconImage = new google.maps.MarkerImage(iconImageURL,
            new google.maps.Size(iconWidth, iconHeight),
            new google.maps.Point(0, 0),
            new google.maps.Point(iconWidth2, iconHeight2)
        );
        var iconShape = {
            coord: [1, 1, 1, 32, 32, 32, 32, 1],
            type: 'poly'
        };
        map.ICONS[i] = {
            icon: iconImage,
            shape: iconShape
        };
    }
    return map.ICONS[i];
}


function createMarker(latlng, html, iconType, layer) {
    var tmpIcon = getIcon(iconType);
    var contentString = html;
    var marker = new google.maps.Marker({
        layer: layer,
        position: latlng,
        icon: tmpIcon.icon,
        shadow: tmpIcon.shadow,
        zIndex: Math.round(latlng.lat() * -100000) << 5
    });
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.close();
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
    });
    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });
    return marker;
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        // center: {lat: 32.824170, lng: -117.155443},
        center: {lat: 33.497311, lng: -117.135075},
        zoom: 10,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }]
    });
    map.IMAGES = ['cameran', 'cms', 'incident_minor', 'incident_moderate', 'incident_major', 'incident_cleared', 'info', 'counter', 'construction', 'closure', 'cameras', 'camerae', 'cameraw'];
    map.ICONS = [];
    map.markers = [];

    // mgrParkandride = new MarkerManager(map);

    geocoder = new google.maps.Geocoder;
    infowindow = new google.maps.InfoWindow;
    map.direction = new google.maps.DirectionsService();
    map.directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });
    map.directionsDisplay.setMap(map);

    var home_address = app.cuser.addresses.filter(function (v) {
        return v.addrType == "HOME";
    });
    if (typeof home_address == 'object' && home_address.length > 0) {
        home_address = home_address[0];
        app.cuser.home_address.full_address = commuter_addr_to_full_addr(home_address);
        $(':input[title="home"]').val(app.cuser.home_address.full_address).prop('value', app.cuser.home_address.full_address);
        geocoder.geocode({'address': app.cuser.home_address.full_address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    app.cuser.home_address.geometry = results[0].geometry;
                } else {
                    console.log("Geocode was not successful for the following reason: " + status);
                }
            }
        );
    }

    var work_address = app.cuser.addresses.filter(function (v) {
        return v.addrType == "WORK";
    });
    if (typeof work_address == 'object' && work_address.length > 0) {
        work_address = work_address[0];
        app.cuser.work_address.full_address = commuter_addr_to_full_addr(work_address);
        $(':input[title="work"]').val(app.cuser.work_address.full_address).prop('value', app.cuser.work_address.full_address);
        geocoder.geocode({'address': app.cuser.work_address.full_address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    app.cuser.work_address.geometry = results[0].geometry;
                } else {
                    console.log("Geocode was not successful for the following reason: " + status);
                }
            }
        );
    }

    if (current_pos.longitude) {
        app.utils.misc.geocodeLatLng({
            lat: parseFloat(current_pos.latitude),
            lng: parseFloat(current_pos.longitude)
        }, geocoder, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    current_pos.location = results[0];
                    $('input[name="pickup_address"]').val(current_pos.location.formatted_address).trigger('change');
                    if (app.cuser.work_address.geometry) {
                        var dist_to_work = lat_lng_distance(current_pos.latitude, current_pos.longitude, app.cuser.work_address.geometry.location.lat(), app.cuser.work_address.geometry.location.lng());
                    }
                    if (app.cuser.home_address.geometry) {
                        var dist_to_home = lat_lng_distance(current_pos.latitude, current_pos.longitude, app.cuser.home_address.geometry.location.lat(), app.cuser.home_address.geometry.location.lng());
                    }
                    if ($.isNumeric(dist_to_home) && !$.isNumeric(dist_to_work)) {
                        $('input[name="dropoff_address"]').val(app.cuser.home_address.full_address).trigger('change');
                    } else if (!$.isNumeric(dist_to_home) && $.isNumeric(dist_to_work)) {
                        $('input[name="dropoff_address"]').val(app.cuser.work_address.full_address).trigger('change');
                    } else                     if ($.isNumeric(dist_to_home) && $.isNumeric(dist_to_work)) {
                        if (dist_to_home < dist_to_work){
                            $('input[name="dropoff_address"]').val(app.cuser.home_address.full_address).trigger('change');
                        }
                        else {
                            $('input[name="dropoff_address"]').val(app.cuser.work_address.full_address).trigger('change');
                        }
                    }

                    } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
        
        //show I'm here
        map.markers.you_are_here = new google.maps.Marker({
            position: {lat:current_pos.latitude, lng: current_pos.longitude},
            map: map,
            icon: {url:'/img/you_are_here.png', size:new google.maps.Size(26,31)},
            zIndex: 1000
        });
        map.setCenter({lat:current_pos.latitude, lng: current_pos.longitude});
    }

    $('#map').trigger('ready');
    $('.gm-bundled-control-on-bottom').prepend($('#current_pos_wrapper'));
    $('#get_curr_pos').click(function () {
        if (!current_pos.longitude) {
            return;
        }
        map.setCenter({lat:current_pos.latitude, lng: current_pos.longitude});
    });
}

