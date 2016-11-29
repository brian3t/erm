app.models.Offer = Backbone.RelationalModel.extend({
    urlRoot: config.restUrl + 'offer',
    relations: [{
        type: Backbone.HasOne,
        key: 'user',
        relatedModel: 'app.models.User',
        reverseRelation:{
            key:'offer',
            includeInJSON:'id'
        }
    }]
});

app.collections.Offer= Backbone.Collection.extend({
    model: app.models.Offer,
    initialize: function () {
        // var param = {};
        // if (!_.isEmpty(app.cur_user.get('id'))){
        //     param['user_id'] = app.cur_user.get('id');
        // }
        this.url = config.restUrl + 'offer';
        // this.url = config.restUrl + 'offer?' +  $.param(param);
    }
});