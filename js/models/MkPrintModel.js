app.models.MkPrint = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'mk-print',
        relations: [{
            type: Backbone.HasOne,
            key: 'company_id',
            relatedModel: 'app.models.Company',
            includeInJSON: 'id'
        }],

        localStorage: false,
        defaults: {
            gross: 0,
            net: 0
        }
    }
);