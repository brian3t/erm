app.views.MarketingView = Backbone.BBFormView.extend({
    tagName: "div",
    id: "marketing_form",
    className: "col-sm-12",
    model: app.models.Marketing,
    events: {
        "change .edit": "update_ajax",
        "change .multi_select": "update_ajax",
        "click button.ef_add_row": "add_row",
        "click button.ef_delete_row": "delete_row"
    },
    set_model(model) {
        this.model = model;
        this.listenTo(this.model.get('mk_radios'), 'change', this.render);
        this.listenTo(this.model.get('mk_radios'), 'update', this.render);
    },
    add_row: function (e) {
        //find out what collection fired this
        let collection_name = $($(e.target).closest('tr')).prev('.edit_form_wrapper').data('collection');
        if (collection_name.length <= 0) {
            return;
        }
        let collection = this.model.get(collection_name);
        let new_model = new collection.model();
        new_model.save({marketing_id: this.model.get('id'), company_id: app.cur_user.get('company_id')}, {
            success: () => {
                collection.push(new_model);
            },
            error: () => {
                new Noty(_.extend({
                        text: 'There was an issue adding a new record. Please try again later or contact our support',
                        type: 'error'
                    },
                    NOTY_OPTS)).show();
            }
        });
    },
    delete_row: function (e) {
        //find out what collection fired this
        let collection_name = $($(e.target).closest('tr')).prev('.edit_form_wrapper').data('collection');
        if (collection_name.length <= 0) {
            return;
        }
        let collection = this.model.get(collection_name);
        //model id to delete
        let model_to_delete = collection.get($(e.target).data('id'));
        // collection.remove(model_to_delete);
        model_to_delete.destroy({
            success: () => {
                new Noty(_.extend({
                    text: 'Record deleted successfully',
                    type: 'success',
                }, NOTY_OPTS)).show();
                $($(e.target).closest('tr')).remove();
            },
            error: () => {
                new Noty(_.extend({
                    text: 'There was an issue removing this record. Please try again later or contact our support',
                    type: 'error',
                }, NOTY_OPTS)).show();
            }
        });
    }
    ,
    initialize: function () {
        this.delegateEvents();
        //this.listenTo(capp.event_bus, 'dp.hide', this.update_ajax);
    }
    ,

    render: function () {
        this.model.calculate_summary();
        let mk_radios = this.model.get('mk_radios').models;
        let mk_radios_gross_sum = 0, mk_radios_net_sum = 0;
        mk_radios.forEach((e) => {
            mk_radios_gross_sum += parseFloat(e.get('gross'));
            mk_radios_net_sum += parseFloat(e.get('net'));
        });
        let mk_televisions = this.model.get('mk_televisions').models;
        let mk_televisions_gross_sum = 0, mk_televisions_net_sum = 0;
        mk_televisions.forEach((e) => {
            mk_televisions_gross_sum += parseFloat(e.get('gross'));
            mk_televisions_net_sum += parseFloat(e.get('net'));
        });
        let mk_internets = this.model.get('mk_internets').models, mk_internets_gross_sum = 0, mk_internets_net_sum = 0;
        mk_internets.forEach((e) => {
            mk_internets_gross_sum += parseFloat(e.get('gross'));
            mk_internets_net_sum += parseFloat(e.get('net'));
        });

        let mk_prints = this.model.get('mk_prints').models, mk_prints_gross_sum = 0, mk_prints_net_sum = 0;
        mk_prints.forEach((e) => {
            mk_prints_gross_sum += parseFloat(e.get('gross'));
            mk_prints_net_sum += parseFloat(e.get('net'));
        });

        let mk_productions = this.model.get('mk_productions').models, mk_productions_gross_sum = 0, mk_productions_net_sum = 0;
        mk_productions.forEach((e) => {
            mk_productions_gross_sum += parseFloat(e.get('gross'));
            mk_productions_net_sum += parseFloat(e.get('net'));
        });

        let mk_miscs = this.model.get('mk_miscs').models, mk_miscs_gross_sum = 0, mk_miscs_net_sum = 0;
        mk_miscs.forEach((e) => {
            mk_miscs_gross_sum += parseFloat(e.get('gross'));
            mk_miscs_net_sum += parseFloat(e.get('net'));
        });

        this.$el.html(this.template(_.extend(this.model.attributes,
            {
                mk_radios_gross_sum: mk_radios_gross_sum, mk_radios_net_sum: mk_radios_net_sum,
                mk_televisions_gross_sum: mk_televisions_gross_sum, mk_televisions_net_sum: mk_televisions_net_sum,
                mk_internets_gross_sum: mk_internets_gross_sum, mk_internets_net_sum: mk_internets_net_sum,
                mk_prints_gross_sum: mk_prints_gross_sum, mk_prints_net_sum: mk_prints_net_sum,
                mk_productions_gross_sum: mk_productions_gross_sum, mk_productions_net_sum: mk_productions_net_sum,
                mk_miscs_gross_sum: mk_miscs_gross_sum, mk_miscs_net_sum: mk_miscs_net_sum,
                model: this.model
            })));
        this.rebind_underscore_val();
        capp.event_bus.trigger('marketing_view_rendered');
        this.after_render();
        this.delegateEvents();
        return this.$el;
    },
    rebind_underscore_val: function () {
        let selects = this.$el.find('select');
        _.each(selects, function (e) {
            $(e).val($(e).attr('val'));//populate selects with underscore printed `value` attr
        }, this);
    },
    after_render: function () {
        let $edit_switch = $('.edit_switch');
        // $edit_switch.bootstrapToggle();
        $('.multi_select').select2();
        b3_autonumeric();
        this.delegateEvents();
        // $(document).on('dp.hide', (e) => {e.preventDefault(); e.stopPropagation(); capp.event_bus.trigger('dp.hide', e); return false;});
    }

});
