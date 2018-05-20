app.models.MkRadio = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        // urlRoot: config.restUrl + '/profile',
        relations: [{
            type:Backbone.HasOne,
            key: 'marketing',
            relatedModel: 'app.models.Marketing',
            reverseRelation:{
                key:'mk_radios',
                includeInJSON:'id'
            }
        }],

        localStorage: false,
    }
);