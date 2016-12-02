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
    }],
    general_expense_array: {},
    initialize: function () {
        this.general_expense_array = {
            'Advertising':0,
            'Artist Production':0,
            'Backdrop':0,
            'Barricate': 0,
            'Box Office Staff':0,
            'Building Engineer':0,
            'Catering - Local'
            Chairs
            Clean-Up
            Damages
            Drapes
            Dressing Room Furniture
            Electrician
            Event Supervisor
            Fire Watch
            Flights
            FOH Staff
            Forklift
            GSRS
            Hotel - Local
            House Personal
            Internet & Phones
        Laminates (VIP)
        Lights - Local
        Lights - In House
        Light Tower
        Marquee
        Material Charges
        Medical & Fire
        Misc
        Occupational Licence
        Permits
        Police

        Power
        Private Security
        Production Manager
        Rent Tax
        Rental Van
        Riggers
        Risk Switchboard
        RV Rental (Prod Office)
        Runner & Assistant
        Security & Ushers
        Setup Labor
        Sign Interpreter
        Sound - Local
        Sound - In House
        Spot Light
        Staffing
        Stage
        Stagehands
        Support - Local
        Tech Director
        Ticket Fee
        Ticket Printing
        Ticket Sellers
        Ticket Set-up
        Ticket Takers
        Trades
        Toilets
        Towels
        Town Car
        Utilities
        Venue Tax
        Video
        Video - In House





    };
        this.set('general_expense' , JSON.stringify(this.general_expense_array));
    }
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