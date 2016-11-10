const IS_DEBUG = true;
const CLEAR_LOCAL_STORAGE = true;
const IS_LOCAL = (document.URL.indexOf('local') !== -1);
var app = {views: {}, models: {}, routers: {}, utils: {}, adapters: {}};
var current_pos = {};
var config = {
    restUrl: "https://api.entertainmentdirectmetrics.com/v1/",
    apiUrl: 'https://api.entertainmentdirectmetrics.com/'
};
if (IS_LOCAL) {
    config.restUrl = 'https://api.ermlocal/v1/';
    config.apiUrl = 'https://api.ermlocal/'
}
var backboneInit = function () {

    app.utils.templates.load(["NavbarView", "HomeView", "MyAccountSettingView", "AccountSettingView", "DashboardView", "ContactView", "UserListView", "UserSearchListView", "UserView"], function () {
        app.router = new app.routers.AppRouter();
        Backbone.history.stop();
        Backbone.history.start();
    });
    $.ajaxSetup({cache: true});
    $(document).ajaxStart(function () {
        $("#loading").show();
    });
    $(document).ajaxStop(function () {
        $("#loading").hide();
    });
    isInWeb = (typeof isInWeb !== "boolean" ? "true" : isInWeb);

};
var capp = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        window.addEventListener('orientationchange', doOnOrientationChange);
        // Initial execution if needed
        doOnOrientationChange();

// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
        var onSuccess = function (position) {
            console.log('Latitude: ' + position.coords.latitude + '\n' +
                'Longitude: ' + position.coords.longitude + '\n' +
                'Altitude: ' + position.coords.altitude + '\n' +
                'Accuracy: ' + position.coords.accuracy + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                'Heading: ' + position.coords.heading + '\n' +
                'Speed: ' + position.coords.speed + '\n' +
                'Timestamp: ' + position.timestamp + '\n');
            current_pos = position.coords;
        };

// onError Callback receives a PositionError object
//
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }

        // navigator.geolocation.getCurrentPosition(onSuccess, onError);
        capp.receivedEvent('deviceready');
    },
    position: {stateCode: ""},
    receivedEvent: function (id) {
        console.log('Received Event: ' + id);
        backboneInit();
        // StatusBar.hide();
        $('body').height($('body').height() + 20);
    },
    event_bus: _({}).extend(Backbone.Events),
    gMaps: {
        api_key: 'AIzaSyC1RpnsU0y0yPoQSg1G_GyvmBmO5i1UH5E',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyC1RpnsU0y0yPoQSg1G_GyvmBmO5i1UH5E'
    },
    onGeolocationSuccess: function (position) {
        capp.position = position;
        console.log('position: ' + capp.position);
        var lat = parseFloat(position.coords.latitude);
        var lng = parseFloat(position.coords.longitude);
        $.getJSON(capp.gMaps.url + '&latlng=' + lat + ',' + lng + '&result_type=administrative_area_level_1', function (data) {
            if (data.status == "OK") {
                if (data.results != {}) {
                    capp.position.stateCode = data.results[0].address_components[0].short_name;
                    capp.event_bus.trigger('iGotLocation');
                }
            }
        });
    },
    onGeoLocationError: function onError(error) {
        console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    }


};
if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
    isInWeb = false;
    capp.initialize();
}
else {
    isInWeb = true;
    $(document).ready(function () {
        backboneInit();
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("deviceready", true, true);
        } else {
            event = document.createEventObject();
            event.eventType = "deviceready";
        }

        event.eventName = "deviceready";

        if (document.createEvent) {
            document.dispatchEvent(event);
        } else {
            document.fireEvent("on" + event.eventType, event);
        }
    });
    capp.initialize();
}

if (IS_DEBUG && CLEAR_LOCAL_STORAGE) {
    localStorage.clear();
}

Backbone.LocalStorage.setPrefix('capo');

app_alert = function (message, alertCallback, title, buttonName) {
    if (buttonName === null) {
        buttonName = "OK"
    }
    if (isInWeb) {
        alert(message);
        if (_.isFunction(alertCallback)) {
            alertCallback();
        }
    } else {
        navigator.notification.alert(message, alertCallback, title, buttonName);
    }
};

function doOnOrientationChange() {
    switch (window.orientation) {
        case -90:
        case 90:
            // console.log('landscape');
            $('body').addClass('landscape');
            break;
        default:
            // console.log(window.orientation);
            // console.log('portrait');
            $('body').removeClass('landscape');
            break;
    }
}
app_confirm = function (message, callback, title) {
    if (isInWeb) {
        var response = confirm(message);
        callback(response);

    } else {
        if (app.is_notification_active) {
            return true;
        }
        app.is_notification_active = true;
        navigator.notification.confirm(message, callback, title, ["Yes", "No"]);
    }
};
