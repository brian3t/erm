app.views.Request_ride_view = Backbone.View.extend({
    map: {},
    initialize: function () {
        this.render().afterRender();
        $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyBPeYraJ4H0BiuD1IQanQFlY1npx114ZpM&callback=initMap", null);
        this.map = $(this.el).find('#map');
    },

    render: function () {
        this.$el.html(this.template($.extend({}, app.cuser.attributes, {commuter_data: app.cuser.commuter_data})));
        return this;
    },
    afterRender: function () {
        console.log('after render');
        //try populating home and work
        var $home_input = $(':input[title="home"]');
        var $work_input = $(':input[title="work"]');
    },

    events: {
        "click .logout": "back",
        "click .back_btn": "back",
        "click div.select_address_modal div.clickable": "address_selected",
        "click button#request_ride": "request_ride",
        "click #waiting>button.btn-negative": "cancel_request_ride",
        // "click a.selecting_address>input" : "selecting_address"
        "change input.address": "set_my_itin"
    },
    pickup_location: {},
    dropoff_location: {},

    back: function (event) {
        ratchet_popover_dismiss();
        app.router.navigate('#', {trigger: true, replace: true});
    },
    address_to_pick: {},
    status: null,
    time_sent: null,
    offer_collection: null,

    //functions
    address_selected: function (event) {
        try {
            map.pickup_marker.setMap(null);
            map.dropoff_marker.setMap(null);
        } catch (e) {
            console.log(e);
        }

        var parent_content = $($(event.target).parents('div.content'));
        var address_to_pick = parent_content.data('address-to-pick');
        if ($(event.target).is(':input')) {
            sel_input = $(event.target);//we're clicking on the input
        } else { //we're clicking on the div
            var sel_input = $(event.target).find(':input');
        }
        //clear markers
        app.utils.misc.delete_marker(address_to_pick);
        if (sel_input.val() == 'Pick from map') {
            this.address_to_pick = address_to_pick;
            this.status = 'waiting_map_picking';
            $('#request_ride').slideUp();
            $('input[name="' + this.address_to_pick + '_address"]').val('Touch on map to select location');

            var self = this;
            google.maps.event.addListener(map, 'click', function (event) {
                self.map_populate_address(event);
            });
        } else {
            $('input[name="' + address_to_pick + '_address"]').val(sel_input.val()).trigger('change');
        }
        $('div.modal').find('header>a').trigger('click');
    },

    selecting_address: function (event) {
        event.preventDefault();
        console.log(event);
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
    set_my_itin: function () {
        var self = this;
        var $pickup_address = $(':input[name="pickup_address"]');
        var $dropoff_address = $(':input[name="dropoff_address"]');
        var geocb_pickup = function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                app.cuser.pickup_location.geometry = results[0].geometry;
                map.setCenter(results[0].geometry.location);
                if (map.pickup_marker && map.pickup_marker.hasOwnProperty('setMap')) {
                    map.pickup_marker.setMap(null);
                }
                map.pickup_marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: 'img/map-pin-17_md.png'
                });
                map.setZoom(11);
                self.draw_route();
            } else {
                console.log("Geocode was not successful for the following reason: " + status);
            }
        };
        if ($pickup_address.val()) {
            app.cuser.pickup_location.full_address = $pickup_address.val();
            geocoder.geocode({'address': $pickup_address.val()}, geocb_pickup);

        }

        var geocb_dropoff = function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                app.cuser.dropoff_location.geometry = results[0].geometry;
                map.setCenter(results[0].geometry.location);
                if (map.dropoff_marker && map.dropoff_marker.hasOwnProperty('setMap')) {
                    map.dropoff_marker.setMap(null);
                }
                map.dropoff_marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: 'img/map-pin-16_md.png'
                });
                map.setZoom(11);
                self.draw_route();
            } else {
                console.log("Geocode was not successful for the following reason: " + status);
            }

        };

        if ($dropoff_address.val()) {
            app.cuser.dropoff_location.full_address = $dropoff_address.val();
            geocoder.geocode({'address': $dropoff_address.val()}, geocb_dropoff);
        }

    },
    draw_route: function () {
        //draw route when begin and end are present
        if (app.cuser.dropoff_location.hasOwnProperty('geometry') && app.cuser.pickup_location.hasOwnProperty('geometry')) {
            if (map.directionsDisplay != null) {
                map.directionsDisplay.setMap(null);
                map.directionsDisplay = null;
            }
            map.directionsDisplay = new google.maps.DirectionsRenderer({
                suppressMarkers: true
            });
            map.directionsDisplay.setMap(map);
            var query_string = $.param({});
            var dir_request = {
                origin: app.cuser.pickup_location.geometry.location.lat() + ',' + app.cuser.pickup_location.geometry.location.lng(),
                destination: app.cuser.dropoff_location.geometry.location.lat() + ',' + app.cuser.dropoff_location.geometry.location.lng(),
                travelMode: google.maps.TravelMode.DRIVING
            };
            map.direction.route(dir_request, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    map.directionsDisplay.setDirections(result);
                    var bounds = new google.maps.LatLngBounds();
                    bounds.extend(app.cuser.pickup_location.geometry.location);
                    bounds.extend(app.cuser.dropoff_location.geometry.location);
                    map.fitBounds(bounds);
                }
            });
            $('#request_ride').slideDown();
        } else {
            $('#request_ride').slideUp();
        }

    },
    /**
     * Request a ride
     * After successful, This view keeps pulling offers from API that matches this ride request
     */
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
        this.set_status('request_sent');
        this.time_sent = (new Date());
    },
    cancel_request_ride: function () {
        $('#waiting').slideUp();
        $('#request_ride').slideToggle();
        $('#fade').toggle();
        this.set_status('idle');
    },
    set_status: function (status) {
        switch (status) {
            case 'request_sent':
            {
                //pulling offers from API
                this.offer_collection = new app.models.OfferCollection();
                var poll_options = {
                    fetchOptions: {
                        data: {request_cuser: app.cuser.id}
                    }
                };
                // this.offer_collection.configure(poll_options);
                this.offer_collection.startFetching();
                break;
            }
            case 'idle':
            {
                if (_.isObject(this.offer_collection))
                    this.offer_collection.stopFetching();
                break;
            }
            default:
                break;
        }
    }

});
