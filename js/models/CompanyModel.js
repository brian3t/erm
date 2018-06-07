app.models.Company = Backbone.RelationalModel.extend({
    urlRoot: config.restUrl + 'company'
});

app.collections.Company = Backbone.Collection.extend({
    model: app.models.Company,
    comparator: function (a) {
        return a.get('name').toLowerCase();
    },
    initialize: function (model, options) {
        var param = {};
        if (!_.isEmpty(app.cur_user.get('company').get('id'))){
            param['company_id'] = app.cur_user.get('company').get('id');
        }
        this.url = config.restUrl + 'company?' +  $.param(param);
    }
});