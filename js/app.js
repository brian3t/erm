const IS_DEBUG = true;
const CLEAR_LOCAL_STORAGE = true;
const IS_LOCAL = (document.URL.indexOf('local') !== -1);
const IS_DEV = (document.URL.indexOf('theeverestapp') !== -1);
var app = {views: {}, models: {}, routers: {}, utils: {}, adapters: {}, collections: {}};
var current_pos = {};
var config = {
    restUrl: "https://api.entertainmentdirectmetrics.com/v1/",
    apiUrl: 'https://api.entertainmentdirectmetrics.com/'
};
var is_validator_initializing = false;
if (IS_LOCAL) {
    config.restUrl = 'https://api.ermapi/v1/';
    config.apiUrl = 'https://api.ermapi/'
}
if (IS_DEV) {
    config.restUrl = 'http://api.theeverestapp.com/v1/';
    config.apiUrl = 'http://api.theeverestapp.com/'
}
var backboneInit = function () {
    var login_params = {};
    app.utils.templates.load(["NavbarView", "HomeView", "MyAccountSettingView", "AccountSettingView", "DashboardView",
        "ContactView", "UserListView", "UserSearchListView", "UserView",
        "VenuesView", "VenueListView", "VenueSearchListView", "VenueView",
        "CompaniesView", "CompanyListView", "CompanySearchListView", "CompanyView",
        "SettlementsView", "SettlementListView", "SettlementSearchListView", "SettlementView",
        "OffersView", "OfferListView", "OfferSearchListView", "OfferView"], function () {
        app.router = new app.routers.AppRouter();
        Backbone.history.stop();

        // login again, using cookie
        var login_string = document.cookie.match(/loginstring=(.*)/);
        if (_.isArray(login_string) && login_string.length === 2) {
            login_string = login_string[1];
            login_params = $.deparam(login_string);
            if (typeof login_params === 'object' && login_params.hasOwnProperty('login-form')) {
                login_params = login_params["login-form"];
                $.post(config.restUrl + 'user/login', login_string, function (resp) {
                    if (resp.status === 'ok') {
                        app.cur_user.set({id: resp.id, username: login_params.login, password: login_params.password});
                        // app.cur_profile.set(resp.profile);
                        var jqxhr = app.cur_user.fetch({
                            success: function () {
                                app.prepare_collections();
                                app.navbar_view = new app.views.NavbarView({model: app.cur_user});
                                if (!Backbone.History.started) {
                                    Backbone.history.start();
                                }
                            }
                        });

                    } else {
                        if (!Backbone.History.started) {
                            Backbone.history.start();
                        }
                        app.router.navigate('#', {trigger: true});
                    }
                }, 'json');
            } else {
                if (!Backbone.History.started) {
                    Backbone.history.start();
                }
                app.router.navigate('#', {trigger: true});
            }
        }
        else {
            if (!Backbone.History.started) {
                Backbone.history.start();
            }
            app.router.navigate('#', {trigger: true});
        }

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
$.extend(app, {
    /**
     * Called when login is successful
     */
    prepare_collections: function () {
        /** @var app.models.User app.cur_user **/
        var company_id = app.cur_user.get('company').get('id');
        /** @var Backbone.Model company **/
        var company_param = {belong_company_id: company_id};
        app.collections.companies = new app.collections.Company();
        app.collections.companies.url = config.restUrl + 'company?' + $.param(company_param);
        app.collections.companies.fetch();
        app.collections.offers = new app.collections.Offer();
        app.collections.offers.url = config.restUrl + 'offer?' + $.param(company_param);
        app.collections.offers.fetch();
        app.collections.settlements = new app.collections.Settlement();
        app.collections.settlements.url = config.restUrl + 'settlement?' + $.param(company_param);
        app.collections.settlements.fetch();
        app.collections.agents = new app.collections.User_collection();
        app.collections.agents.url = config.restUrl + 'user?' + $.param($.extend({'line_of_business': 'Agency'}, company_param));//param here to get agents only
        app.collections.agents.fetch();
        app.collections.promoters = new app.collections.Company();
        app.collections.promoters.url = config.restUrl + 'company?' + $.param($.extend({'line_of_business': 'Promotion'}, company_param));//param here to get promoters only
        app.collections.promoters.fetch();
        app.collections.agencies = new app.collections.Company();
        app.collections.agencies.url = config.restUrl + 'company?' + $.param($.extend({'line_of_business': 'Agency'}, company_param));//param here to get promoters only
        app.collections.agencies.fetch();
        app.collections.venues = new app.collections.Venue_collection();
        app.collections.venues.url = config.restUrl + 'venue?' + $.param(company_param);
        app.collections.venues.fetch();
        app.collections.artists = new app.collections.User_collection();
        app.collections.artists.url = config.restUrl + 'user?' + $.param($.extend({'line_of_business': ['Artist', 'Talent']}, company_param));//param here to get agents only
        app.collections.artists.fetch();
        app.collections.ticketing_companies = new app.collections.Company();
        app.collections.ticketing_companies.url = config.restUrl + 'company?' + $.param($.extend({'line_of_business': 'Ticketing'}, company_param));//param here to get ticketing only
        app.collections.ticketing_companies.fetch();
        app.collections.ticketing_companies.sort();
    }
});
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

        // if (document.createEvent) {
        //     document.dispatchEvent(event);
        // } else {
        //     document.fireEvent("on" + event.eventType, event);
        // }
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
