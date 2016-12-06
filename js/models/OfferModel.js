app.models.Offer = Backbone.RelationalModel.extend({
    urlRoot: config.restUrl + 'offer',
    relations: [{
        type: Backbone.HasOne,
        key: 'user',
        relatedModel: 'app.models.User',
        reverseRelation: {
            key: 'offer',
            includeInJSON: 'id'
        }
    }],
    general_expense_array: {},
    initialize: function () {
        this.general_expense_array = {
            'Advertising': 0,
            'Artist Production': 0,
            'Backdrop': 0,
            'Barricate': 0,
            'Box Office Staff': 0,
            'Building Engineer': 0,
            'Catering - Local': 0,
            'Chairs': 0,
            'Clean-Up': 0,
            'Damages': 0,
            'Drapes': 0,
            'Dressing Room Furniture': 0,
            'Electrician': 0,
            'EventS upervisor': 0,
            'Fire Watch': 0,
            'Flights': 0,
            'FOHS taff': 0,
            'Forklift': 0,
            'GSRS': 0,
            'Hotel-Local': 0,
            'House Personal': 0,
            'Internet & Phones': 0,
            'Laminates(VIP)': 0,
            'Lights-Local': 0,
            'Lights-InHouse': 0,
            'LightTower': 0,
            'Marquee': 0,
            'Material Charges': 0,
            'Medical & Fire': 0,
            'Misc': 0,
            'Occupational Licence': 0,
            'Permits': 0,
            'Police': 0,
            'Power': 0,
            'Private Security': 0,
            'Production Manager': 0,
            'Rent Tax': 0,
            'Rental Van': 0,
            'Riggers': 0,
            'Risk Switchboard': 0,
            'RV Rental(Prod Office)': 0,
            'Runner & Assistant': 0,
            'Security & Ushers': 0,
            'Setup Labor': 0,
            'Sign Interpreter': 0,
            'Sound - Local': 0,
            'Sound - InHouse': false,
            'Spot Light': 0,
            'Staffing': 0,
            'Stage': 0,
            'Stagehands': 0,
            'Support - Local': 0,
            'Tech Director': 0,
            'Ticket Fee': 0,
            'Ticket Printing': 0,
            'Ticket Sellers': 0,
            'Ticket Set-up': 0,
            'Ticket Takers': 0,
            'Trades': 0,
            'Toilets': 0,
            'Towels': 0,
            'TownCar': 0,
            'Utilities': 0,
            'Venue Tax': 0,
            'Video': 0,
            'Video - InHouse':false
        };
        this.set('general_expense', JSON.stringify(this.general_expense_array));
    }
});

app.collections.Offer = Backbone.Collection.extend({
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