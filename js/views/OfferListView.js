/*
 A list of Offers. With search box and list of items on the left
 */
app.views.OfferListView = Backbone.View.extend({
    tagName: 'div',
    className: 'container row panel-body',
    collection: {},
    cur_model_index: 0,//current model that is being selected out of collection
    $action_btns: {},
    $create_btn: {},
    $save_btn: {},
    $reset_btn: {},
    $cancel_btn: {},
    switchery: {},

    initialize: function () {
        this.collection = app.collections.offers;
        this.collection.fetch();
        this.offer_search_list_view = new app.views.OfferSearchListView({collection: this.collection});
        this.offer_form_view = new app.views.OfferView();
        this.listenTo(this.collection, 'update', this.render);
    },
    events: {
        "click a.select_item": "select_item",
        "keyup #offer_search": "filter_item",
        "click button.toggle_create_mode": "toggle_create_item",
        "click button.reset": "reset_form",
        "click button.save": "save_form",
        "click button.delete": "delete_model",
        "change .edit_switch": "toggle_edit_mode"
    },
    toggle_edit_mode: function (e) {
        var $e = $(e.currentTarget);
        var span_text = $e.parentsUntil('div.row').find('span.toggle_state');
        var is_checked = $e.prop('checked');
        var $form = $($e.parentsUntil('.form_wrapper').parent().find('.edit_form_wrapper form.edit'));
        if (is_checked) {
            span_text.text('on');
            $($form.find(':input')).removeAttr('disabled');
            this.$el.find('button.delete').show();
        }
        else {
            span_text.text('off');
            $($form.find(':input')).prop('disabled', true);
            this.$el.find('button.delete').hide();
        }
    },
    toggle_create_item: function () {
        this.$create_btn.toggle();
        this.$save_btn.toggle();
        this.$reset_btn.toggle();
        this.$cancel_btn.toggle();
        this.$el.find('#offer_form_wrapper').toggle();
        this.$el.find('#create_offer').toggle();
        this.reset_form();
    },
    save_form: function (e) {
        e.preventDefault();
        var $form = $(this.$el.find('#create_offer > form'));
        var form_data = flat_array_to_assoc($form.serializeArray());
        var new_offer = new app.models.Offer();
        // new_offer.setOrganizer(app.cur_offer.get('offer'));
        var self = this;
        new_offer.save(form_data, {
            success: function (new_model) {
                self.toggle_create_item();
                self.collection.add(new_model);
            }, error: function (response) {
                app_alert('There is an error saving this offer. Please contact support for more information');
            }
        });
    },
    reset_form: function () {
        this.$el.find('#create_offer > form').trigger('reset');
        $('.multi_select').select2('val', null);
    },
    delete_model: function (e) {
        var self = this;
        app_confirm("Are you sure to delete this offer?", function (response) {
            if (response == true || response == 1) {
                var cur_model = self.collection.at(self.cur_model_index);
                self.collection.remove(cur_model);
                cur_model.destroy();
            }
        });
    },
    filter_item: function (e) {
        this.offer_search_list_view.text_to_filter = e.currentTarget.value.toLowerCase();
        this.offer_search_list_view.render();
        this.offer_search_list_view.after_render();
    },
    select_item: function (e) {
        var $target = $(e.currentTarget);
        this.cur_model_index = $target.data('index');
        this.offer_form_view.model = this.collection.at(this.cur_model_index);
        this.offer_form_view.render();
        this.offer_form_view.after_render();
    }
    ,
    offer_form_view: {},
    offer_search_list_view: {},
    render: function () {
        this.$el.empty();
        //get first offer in collection
        var first_offer = this.collection.first();
        this.$el.html(this.template());
        if (_.isObject(first_offer)) {
            this.cur_model_index = 0;
            this.offer_form_view.model = first_offer;
            $(this.$el.find('#offer_form_wrapper')).html(this.offer_form_view.render());
            this.offer_form_view.after_render();
        }
        this.$el.find('#offer_search_list').html(this.offer_search_list_view.render());
        this.offer_search_list_view.after_render();
        var edit_switch = this.$el.find('.edit_switch');
        this.switchery = new Switchery(edit_switch[0]);
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.$action_btns = $(this.$el.find('.action_buttons'));
        this.$create_btn = this.$action_btns.find('.create');
        this.$save_btn = this.$action_btns.find('.save');
        this.$reset_btn = this.$action_btns.find('.reset');
        this.$cancel_btn = this.$action_btns.find('.cancel');
        this.delegateEvents();
    }
});

app.views.OfferSearchListView = Backbone.View.extend({
    tagName: "table",
    collection: {},
    className: "table table-responsive item_list",
    initialize: function () {
        this.listenTo(this.collection, 'change reset add remove', this.render);
        this.listenTo(this.collection, 'destroy', this.close)
    },
    text_to_filter: '',
    render: function () {
        var self = this;
        var models = this.collection;
        models = models.filter(function (v) {
            if (this.text_to_filter == '') return true;
            var booked_by = v.get('user');
            return true;//todob implement filter here
        });
        this.$el.html(this.template({collection: models}));
        this.delegateEvents();
        return this.el;
    },
    after_render: function () {
        this.delegateEvents();
    }
});
app.views.OfferView = Backbone.View.extend({
    tagName: "div",
    id: "offer_form",
    className: "col-sm-12",
    model: app.models.Offer,
    events: {
        "blur .edit": "update_ajax",
        "change .multi_select": "update_ajax"
    },
    update_ajax: function (e) {
        var target = $(e.target);
        if (e.target.tagName == 'BUTTON' || target.hasClass('file-caption') || target.prop('type') == 'file' || target.prop('readonly') == true) {
            return;
        }
        var is_multi_select = target.hasClass('multi_select') || target.hasClass('select2-search__field') || target.hasClass('select2-selection--multiple');
        var form = target.parents('form');
        var model = form.data('model');//offer
        var new_attr = {};
        new_attr[target.prop('name')] = target.val();
        if (!is_multi_select) {
            target.before('<span class="glyphicon glyphicon-upload"></span>');
        }
        this.model.save(new_attr, {
            patch: true, success: function () {
                target.prevAll('span.glyphicon-upload').remove();
                if (is_multi_select) {
                    return;
                }
                target.before('<span class="glyphicon glyphicon-ok-circle"></span>');
                setTimeout(function () {
                    target.prevAll('span.glyphicon-ok-circle').fadeOut(1400).remove();
                }, 2000);
            }, error: function () {
                target.prevAll('span.glyphicon-upload').remove();
            }
        });
    },
    initialize: function () {
        this.delegateEvents();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        var selects = this.$el.find('select');
        _.each(selects, function (e) {
            $(e).val(this.model.get($(e).prop('name')));
        }, this);
        return this.$el;
    },
    after_render: function () {
        $(this.$el.find('.multi_select')).select2();
        $(this.$el.find('form[data-toggle="validator"]')).validator();
        this.delegateEvents();
    }

});
