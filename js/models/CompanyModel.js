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