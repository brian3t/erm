app.models.Request = Backbone.Model.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'request',
        localStorage: false,

        cuser_id: null,
        status: 'pending',
        created_at: null,
        updated_at: null,
        dropoff_full_address: null,
        dropoff_lat: null,
        dropoff_lng: null,
        pickup_full_address: null,
        pickup_lat: null,
        pickup_lng: null

    }
)
;