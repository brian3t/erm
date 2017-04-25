"use strict";
app.models.Offer = Backbone.RelationalModel.extend({
    urlRoot: config.restUrl + 'offer',
    relations: [{
        type: Backbone.HasOne,
        key: 'user',
        autoFetch: true,
        relatedModel: 'app.models.User',
        reverseRelation: {
            key: 'offer',
            includeInJSON: 'id'
        }
    }
    , {
        type: Backbone.HasOne,
        key: 'artist',
        relatedModel: 'app.models.User',
        reverseRelation: {
            key: 'offer_as_artist',
            includeInJSON: false
        }
    }
    ],
    venue: {},
    after_sync: function () {
        this.populate_artist();
        this.populate_venue();
    },
    populate_artist: function () {
        if (_.isNull(this.get('artist_id')))
            return;
        if (typeof(app.collections.artists) !== 'object' || app.collections.artists.length === 0){
            var self = this;
            this.listenToOnce(app.collections.artists, 'sync', function () {
                self.set('artist', app.collections.artists.get(self.get('artist_id')));
            })
        } else {
            this.artist = app.collections.artists.get(this.get('artist_id'));
        }
    },
    populate_venue: function () {
        if (_.isNull(this.get('venue_id')))
            return;
        if (typeof(app.collections.venues) !== 'object' || app.collections.venues.length === 0){
            var self = this;
            this.listenToOnce(app.collections.venues, 'sync', function () {
                self.set('venue', app.collections.venues.get(self.get('venue_id')));
            })
        } else {
            this.venue = app.collections.venues.get(this.get('venue_id'));
        }
    },
    get_general_expense:function () {
        var gen_exp = this.get('general_expense');
      if (gen_exp === '{}'){
          this.reset_array_field();
          return JSON.stringify(this.general_expense_array);
      }  else {
          return gen_exp;
      }
    },
    get_production_expense:function () {
        var prod_exp = this.get('production_expense');
        if (prod_exp === '{}'){
            this.reset_array_field();
            return JSON.stringify(this.production_expense_array);
        }  else {
            return prod_exp;
        }
    },
    general_expense_array: {},
    production_expense_array: {},
    variable_expense_array: {},

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
            'Video - InHouse': false
        };
        this.production_expense_array = {
            'Tour Bus': 0,
            'Tour Catering': 0,
            'Tour Hotel': 0,
            'Tour Labor': 0,
            'Tour Manager': 0,
            'Tour Misc': 0,
            'Tour Production': 0,
            'Tour Sound-Staging': 0,
            'Tour Startup-End Cost': 0,
            'Tour Support': 0,
            'Tour Travel': 0,
            'Tour Trucking': 0
        };
        this.variable_expense_array = {
            'rental_note': '',
            'rental_flat_rate': 0,
            'rental_per_ticket_dollar': 0,
            'rental_per_ticket_percent': 0,
            'rental_min': 0,
            'rental_max': 0
        };
        this.after_sync();
        this.listenTo(this, 'sync', this.after_sync);
    },
    reset_array_field: function () {
        if (_.isEmpty(this.get('production_expense'))) {
            this.save('production_expense', JSON.stringify(this.production_expense_array));
        }
        if (_.isEmpty(this.get('general_expense'))) {
            this.save('general_expense', JSON.stringify(this.general_expense_array));
        }
        if (_.isEmpty(this.get('variable_expense'))) {
            this.save('variable_expense', JSON.stringify((this.variable_expense_array)));
        }
    },
    defaults: {
        venue: {}
    }
});

app.collections.Offer = Backbone.Collection.extend({
    model: app.models.Offer,
    url : config.restUrl + 'offer',
    comparator: function (a) {
        return a.get('event_id').toLowerCase();
    },
    initialize: function (event) {
        // var param = {};
        // if (!_.isEmpty(app.cur_user.get('id'))){
        //     param['user_id'] = app.cur_user.get('id');
        // }
        // this.url = config.restUrl + 'offer?' +  $.param(param);
    },
    fetch: function (options) {
        //Call Backbone's fetch
        var result = Backbone.Collection.prototype.fetch.call(this, options);

        this.forEach(function (model, i) {
            model.reset_array_field();
        });
        return result;
    }
});