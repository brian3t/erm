app.models.Cuser = Backbone.Model.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'cuser',
        localStorage: true,
        username: null,
        password: null
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