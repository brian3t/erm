app.models.User = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'user',
        relations: [{
            type: Backbone.HasOne,
            key: 'company',
            relatedModel: app.models.Company,
            reverseRelation: {
                key: 'user',
                includeInJSON: 'id'
            }
        }, {
            type: Backbone.HasOne,
            key: 'profile',
            relatedModel: 'app.models.Profile',
            reverseRelation: {
                key: 'user',
                includeInJSON: 'id'
            }
        }],
        localStorage: false,
        username: null,
        password: null,
        // company: {name: null},
        // profile: {avatar: null},
        defaults: {
            company: {name: null},
            profile: {avatar: null}
        }
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