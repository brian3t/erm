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
            twitter_id: null,
            company: {name: null},
            profile: {avatar: null}
        },
        getFullName: function () {
            return this.get('first_name') + ' ' + this.get('last_name');
        }
    }
    // ,
//     {
//     hashed_password: null,
//     remember_checkbox: null
//
// }
);

//todob add fields??

app.models.User_collection = Backbone.Collection.extend({
    model: app.models.User,
    initialize: function () {
        this.url = config.restUrl + 'user?' + $.param({'company_id': app.cur_user.get('company').get('id')});
    }
});