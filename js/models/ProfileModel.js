app.models.Profile = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        // urlRoot: config.restUrl + '/profile',
        relations: [{
            type:Backbone.HasOne,
            key: 'user',
            relatedModel: 'app.models.User',
            reverseRelation:{
                key:'profile',
                includeInJSON:'id'
            }
        }],

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