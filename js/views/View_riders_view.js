app.views.View_riders_view = Backbone.View.extend({
    map: {},
    requests: [],
    request_markers: [],
    cusers: {},
    status: 'idle',
    time_sent: null,
    rider_view: new app.views.RiderView,
    initialize: function () {
        this.render().afterRender();
        $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyBPeYraJ4H0BiuD1IQanQFlY1npx114ZpM&callback=initMap", null);
        this.map = $(this.el).find('#map');
        // $('#map').on('ready', this.query_riders, this);
        this.listenTo(app.cur_rider, 'sync', this.render_children);
    },

    render: function () {
        this.$el.html(this.template($.extend({}, app.cuser.attributes, {commuter_data: app.cuser.commuter_data})));
        return this;
    },
    dom_ready: function () {
        var self = this;
        $('#offer_ride').find('.corner_button').click(function () {
            self.cancel_view_rider();
        });
        $('#offer_ride_btn').click(this.offer_ride);
    },
    afterRender: function () {
    },
    render_children: function () {
        this.$('#rider').html(this.rider_view.render());
    },

    events: {
        "click .logout": "back",
        "click .back_btn": "back",
        "click div.select_address_modal div.clickable": "address_selected",
        "click button#request_ride": "request_ride",
        "click #waiting>button.btn-negative": "cancel_request_ride",
        // "click a.selecting_address>input" : "selecting_address"
        "change input.address": "set_rider_itin",
        "ready #map": "query_riders"
    },
    pickup_location: {},
    dropoff_location: {},

    back: function (event) {
        ratchet_popover_dismiss();
        app.router.navigate('#', {trigger: true, replace: true});
    },


    reverse_geocode_callback: function (results, status, bbview) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                bbview.pickup_location = results[0];
                bbview.$el.find('input[name="' + bbview.address_to_pick + '_address"]').val(bbview.pickup_location.formatted_address);
                map.setZoom(10);
                map.panTo(bbview.pickup_location.geometry.location);
                google.maps.event.clearInstanceListeners(map);
                bbview.status = null;
                bbview.address_to_pick = null;

            } else {
                console.log('No results found');
                return "not found";
            }
        } else {
            console.log('Geocoder failed due to: ' + status);
        }
        var self = this;
        bbview.set_rider_itin(self);
    },
    map_populate_address: function (event) {
        app.utils.misc.geocodeLatLng(event.latLng, geocoder, this.reverse_geocode_callback, this);
    },
    /**
     * Geodecode pickup / dropoff
     * Put markers on map
     * Save pickup and dropoff in app.cuser
     * Set itinerary
     */
    set_rider_itin: function (request) {
        var self = this;
        if (map.pickup_marker && map.pickup_marker.hasOwnProperty('setMap')) {
            map.pickup_marker.setMap(null);
        }
        // map.pickup_marker = new google.maps.Marker({
        //     map: map,
        //     position: {lat: request.pickup_lat, lng: request.pickup_lng},
        //     icon: 'img/map-pin-a.png',
        //     zIndex: 9999
        // });

        if (map.dropoff_marker && map.dropoff_marker.hasOwnProperty('setMap')) {
            map.dropoff_marker.setMap(null);
        }
        // map.dropoff_marker = new google.maps.Marker({
        //     map: map,
        //     position: {lat: request.dropoff_lat, lng: request.dropoff_lng},
        //     icon: 'img/map-pin-b.png',
        //     zIndex: 9999
        // });
        map.setZoom(11);
        self.draw_rider_route(request);

    },
    draw_rider_route: function (request) {
        //draw route when begin and end are present
        if (map.directionsDisplay != null) {
            map.directionsDisplay.setMap(null);
            map.directionsDisplay = null;
        }
        map.directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: false
        });
        map.directionsDisplay.setMap(map);
        var query_string = $.param({});
        var dir_request = {
            origin: request.pickup_lat + ',' + request.pickup_lng,
            destination: request.dropoff_lat + ',' + request.dropoff_lng,
            travelMode: google.maps.TravelMode.DRIVING
        };
        map.direction.route(dir_request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                map.directionsDisplay.setDirections(result);
                map.directionsDisplay.setOptions({markerOptions:{
                    zIndex: 9999,
                    animation: google.maps.Animation.DROP
                }});
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(new google.maps.LatLng(request.pickup_lat, request.dropoff_lng));
                bounds.extend(new google.maps.LatLng(request.dropoff_lat, request.pickup_lng));
                map.fitBounds(bounds);
            }
        });
    },
    clear_rider_route: function () {
        if (map.directionsDisplay != null) {
            map.directionsDisplay.setMap(null);
            map.directionsDisplay = null;
        }
    },
    request_ride: function () {
        $('#waiting').slideDown();
        $('#request_ride').slideUp();
        $('#fade').show();
        //grab pickup loc and dropoff loc
        app.request = new app.models.Request({cuser_id: app.cuser.id});
        //send a request to server
        app.request.set({
            pickup_full_address: app.cuser.pickup_location.full_address,
            pickup_lat: app.cuser.pickup_location.geometry.location.lat(),
            pickup_lng: app.cuser.pickup_location.geometry.location.lng(),

            dropoff_full_address: app.cuser.dropoff_location.full_address,
            dropoff_lat: app.cuser.dropoff_location.geometry.location.lat(),
            dropoff_lng: app.cuser.dropoff_location.geometry.location.lng()
        });
        app.request.save({forceRefresh: true});

        //go into waiting mode
        this.status = 'request_sent';
        this.time_sent = (new Date());

        //todob start listening for callback
    },
    cancel_request_ride: function () {
        $('#waiting').slideUp();
        $('#request_ride').slideToggle();
        $('#fade').toggle();
    },
    query_riders: function () {
        var self = this;
        //pull requests
        $.get(config.restUrl + 'request', null, function (data) {
            self.requests = data;
            for (var i = 0; i < self.requests.length; i++) {
                self.requests[i].pickup_lat = parseFloat(self.requests[i].pickup_lat);
                self.requests[i].pickup_lng = parseFloat(self.requests[i].pickup_lng);
                self.requests[i].dropoff_lat = parseFloat(self.requests[i].dropoff_lat);
                self.requests[i].dropoff_lng = parseFloat(self.requests[i].dropoff_lng);
            }
            self.display_riders();
        });
    },
    /**
     * Process requests from riders
     * Called after this.requests is populated by query_riders()
     */
    display_riders: function () {
        //remove my own request
        this.requests = _.filter(this.requests, function (v) {
            return v.cuser_id !== app.cuser.id
        });
        //calculate distances
        for (var index in this.requests) {
            if (!this.requests.hasOwnProperty(index)) {
                continue;
            }
            var request = this.requests[index];
            request.miles_away = lat_lng_distance(current_pos.latitude, current_pos.longitude, request.pickup_lat, request.pickup_lng);
        }
        //get names and phones
        var cusers = _.map(this.requests, function (value) {
            return value.cuser_id
        });
        var self = this;
        var success = function (response) {
            self.cusers = response;//cusers: {"571317eeb6f15571317eeb6f1a":["Ross Edgar","301-592-1442"],"574f064374406574f06437440b":["Travis",""]}
        };
        $.get(config.restUrl + 'cuser/query', {data: cusers}, success, 'json');
        self = this;
        var infowindow_function = function () {
            infowindow.close();
            infowindow.setPosition(this.position);//copy marker position
            var contentString = '';

            //set current rider
            var cur_cuser_data = self.cusers[this.request.cuser_id];
            app.cur_rider.save({
                id: this.request.cuser_id,
                miles_away: this.request.miles_away,
                name: cur_cuser_data[0],
                phone: cur_cuser_data[1],
                request: this.request
            });
            self.render_children();

            contentString += cur_cuser_data[0] + '<br/>' + cur_cuser_data[1] + '<br/>';
            contentString += _.round(request.miles_away, 1) + ' miles away<br/>';
            contentString += '<button class="showroute" type="button">SHOW ROUTE</button>';
            infowindow.setContent(contentString);
            infowindow.open(map, this);
            var cur_marker = this;
            $('.showroute').click(function (event) {
                self.set_rider_itin(cur_marker.request);
                $('#offer_ride').slideDown();
            });

        };
        //show requests on the map. Make sure it's clickable
        for (var i = 0; i < this.requests.length; i++) {
            var r = this.requests[i];
            var new_marker = new google.maps.Marker({
                position: {lat: parseFloat(r.pickup_lat), lng: parseFloat(r.pickup_lng)},
                map: map,
                icon: {url: '/img/map-pin-16_md.png'},
                zIndex: 800,
                request: r
            });

            google.maps.event.addListener(new_marker, 'click', infowindow_function);
            google.maps.event.addListener(map, 'click', function () {
                infowindow.close();
            });
            this.request_markers.push(new_marker);
        }
        //if it's list view show it differently
    },
    offer_ride: function () {
        $('#waiting').slideDown();
        $('#offer_ride').slideUp();
        $('#fade').show();
        app.offer = new app.models.Offer({cuser_id: app.cuser.id,
        request_cuser:app.cur_rider.id});
        //send a offer to server
        app.offer.save();

        //go into waiting mode
        this.status = 'offer_sent';
        this.time_sent = (new Date());

        //todob start listening for callback
    },
    cancel_offer_ride: function () {
        $('#waiting').slideUp();
        $('#offer_ride').slideToggle();
        $('#fade').toggle();
    },
    cancel_view_rider: function () {
        $('#offer_ride').slideUp();
        this.clear_rider_route();
    }

});
