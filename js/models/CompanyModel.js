app.models.Company = Backbone.RelationalModel.extend({
    urlRoot: config.restUrl + 'company',
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
    comparator: 'name',
    initialize: function (model, options) {
        var param = {};
        if (!_.isEmpty(app.cur_user.get('company').get('id'))){
            param['company_id'] = app.cur_user.get('company').get('id');
        }
        this.url = config.restUrl + 'company?' +  $.param(param);
    }
});