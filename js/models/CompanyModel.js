app.models.Company = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'user',
        relatedModel: 'app.models.User',
        reverseRelation:{
            key:'company',
            includeInJSON:'id'
        }
    }]
});

app.collections.Company = Backbone.Collection.extend({
    model: app.models.Company,
    initialize: function () {
        this.url = config.restUrl + 'company';
    }
});