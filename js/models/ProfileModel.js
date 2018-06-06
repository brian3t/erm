app.models.Profile = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        // urlRoot: config.restUrl + '/profile',
        localStorage: false,
        bio: null,
        gravatar_email: null,
        gravatar_id: null,
        location: null,
        name: null,
        public_email: null,
        user_id: null,
        website: null
    }
);