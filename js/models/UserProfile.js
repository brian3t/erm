app.models.UserProfile = Backbone.Model.extend({
        initialize: function () {
        },
        // urlRoot: config.restUrl + '/profile',
        localStorage: true,
        bio: null,
        gravatar_email: null,
        gravatar_id: null,
        location: null,
        name: null,
        public_email: null,
        user_id: null,
        website: null
    }
    // ,
//     {
//     id_commuter: null,
//     enrolled: null,
//     username: null,
//     addresses: {},
//     commuter_data: {},
//     arrive_after: null,
//     hashed_password: null,
//     remember_checkbox: null
//
// }
);