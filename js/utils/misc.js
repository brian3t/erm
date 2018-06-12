"use strict";
app.utils.misc = (function () {
    var USSTATES = {
            "AL": "Alabama",
            "AK": "Alaska",
            "AS": "American Samoa",
            "AZ": "Arizona",
            "AR": "Arkansas",
            "CA": "California",
            "CO": "Colorado",
            "CT": "Connecticut",
            "DE": "Delaware",
            "DC": "District Of Columbia",
            "FM": "Federated States Of Micronesia",
            "FL": "Florida",
            "GA": "Georgia",
            "GU": "Guam",
            "HI": "Hawaii",
            "ID": "Idaho",
            "IL": "Illinois",
            "IN": "Indiana",
            "IA": "Iowa",
            "KS": "Kansas",
            "KY": "Kentucky",
            "LA": "Louisiana",
            "ME": "Maine",
            "MH": "Marshall Islands",
            "MD": "Maryland",
            "MA": "Massachusetts",
            "MI": "Michigan",
            "MN": "Minnesota",
            "MS": "Mississippi",
            "MO": "Missouri",
            "MT": "Montana",
            "NE": "Nebraska",
            "NV": "Nevada",
            "NH": "New Hampshire",
            "NJ": "New Jersey",
            "NM": "New Mexico",
            "NY": "New York",
            "NC": "North Carolina",
            "ND": "North Dakota",
            "MP": "Northern Mariana Islands",
            "OH": "Ohio",
            "OK": "Oklahoma",
            "OR": "Oregon",
            "PW": "Palau",
            "PA": "Pennsylvania",
            "PR": "Puerto Rico",
            "RI": "Rhode Island",
            "SC": "South Carolina",
            "SD": "South Dakota",
            "TN": "Tennessee",
            "TX": "Texas",
            "UT": "Utah",
            "VT": "Vermont",
            "VI": "Virgin Islands",
            "VA": "Virginia",
            "WA": "Washington",
            "WV": "West Virginia",
            "WI": "Wisconsin",
            "WY": "Wyoming"
        },
        bindModal = function () {
            // $('.modal-js').each(function () {
            //     $(this).click(function () {
            //         $('#' + $(this).data('target')).addClass("active");
            $('div.modal>header>a').each(function () {
                $(this).click(function () {
                    $(this).parent().parent('div.modal').removeClass("active");
                });
            });
            // });
            //
            // });

        },
        applyInAppBrowser = function (href) {
            if (href == "" || (typeof href == "undefined")) {
                return;
            }
            if ((href.indexOf('.pdf') !== -1) || (href.indexOf('.doc') !== -1)) {
                var ref = window.open('https://docs.google.com/viewer?url=' + href + '&embedded=true', '_blank', 'toolbarposition=top,toolbar=yes');
            }
            else {
                var ref = window.open(href, '_blank', 'toolbarposition=top,toolbar=yes');
            }


        },
        afterBBRender = function () {
            if (isInWeb) {
                $('.cordova-only').hide();
            }
            else {
                $('.non-cordova-only').hide();
            }
        },
        initFb = function () {
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s);
                js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&appId=1503339389930016&version=v1.0";
                try {
                    fjs.parentNode.insertBefore(js, fjs);
                }
                catch (e) {
                    console.log('Facebook sdk error: '.e);
                }
            }(document, 'script', 'facebook-jssdk'));
        }
    ;
    return {
        USSTATES: USSTATES,
        bindModal: bindModal,
        applyInAppBrowser: applyInAppBrowser,
        afterBBRender: afterBBRender,
        initFb: initFb,
        show_message: function (message, callback, title, buttonName) {
            title = title || "default title";
            buttonName = buttonName || 'OK';

            if (navigator.notification && navigator.notification.alert) {

                navigator.notification.alert(
                    message,    // message
                    callback,   // callback
                    title,      // title
                    buttonName  // buttonName
                );

            } else {

                alert(message);
                if (typeof callback === "function") {
                    callback();
                }
            }
        },
        //reverse geocoding
        //bbview : Backbone view to bind to callback
        geocodeLatLng: function geocodeLatLng(latlng, geocoder, callback, bbview) {
            geocoder.geocode({'location': latlng}, function () {
                callback(arguments[0], arguments[1], bbview);
            });
        },
        // Adds a marker to the map and push to the array.
        addMarker: function (location) {
            var marker = new google.maps.Marker({
                position: location,
                map: map
            });
            map.markers.push(marker);
        },

        // Sets the map on all markers in the array.
        setMapOnAll: function (map_var) {
            if (map_var == null) {
                for (var i = 0; i < map.markers.length; i++) {
                    map.markers[i].setMap(null);
                }
            } else {
                for (var i = 0; i < map.markers.length; i++) {
                    map.markers[i].setMap(map);
                }
            }
        },
        // Removes the markers from the map, but keeps them in the array.
        clearMarkers: function () {
            this.setMapOnAll(null);
        },
        // Shows any markers currently in the array.
        showMarkers: function () {
            this.setMapOnAll(map);
        },

// Deletes all markers in the array by removing references to them.
        deleteMarkers: function () {
            this.clearMarkers();
            map.markers = [];
        },
        //delete the marker on what we are about to pick
        delete_marker: function (address_to_pick) {
            var object_name = address_to_pick + '_marker';
            if (typeof map[object_name] == 'object') {
                map[object_name].setMap(null);

                if (map.directionsDisplay != null) {
                    map.directionsDisplay.setMap(null);
                    map.directionsDisplay = null;
                }
            }
        },
        calc_sum_from_array: function (a) {
            if (!_.isArray(a) && !_.isObject(a)) {
                return 0;
            }
            var result = 0;
            _.each(a, function (v) {
                if (typeof v === 'string') {
                    v = v.replace('$', '').replace('.00', '').replace(',', '');
                }
                if (isNumeric(v)) {
                    v = parseFloat(v);
                    result += v;
                }
            });
            return result;
        },
        json_parse: function (s) {
            var result = {};
            try {
                result = JSON.parse(s);
            } catch (e) {
                console.error("3t Error parsing string: " + s + " error: " + e);
            }
            return result;
        }

    }
        ;

}());

//extending jQuery
$.fn.info = function () {
    var button = $('<i>').addClass('fa fa-times');
    button.click(function () {
        $(this).parent().slideUp();
    });
    this.prepend(button);
};

////extending jQuery

function array_keys_to_underscore(arr) {
    for (var key in arr) {
        var keyLower = s.underscored(key);
        // if key is not already lower case
        if (keyLower !== key) {
            var temp = arr[key];
            delete arr[key];
            arr[keyLower] = temp;
        }
    }
}

/**
 * Convert jQuery's serializeArray() array into assoc array
 * Also merge input of the same name into array, e.g. union_memberships = Agent & union_memberships = Other
 * becomes union_memberships = [Agent, Other]
 * Also parse money value
 * @param arr
 * @returns assoc array, e.g. {'name': 'John', 'age': 22, 'array': ['a','b'] }
 */
function flat_array_to_assoc(arr) {
    if (!_.isArray(arr)) {
        return {}
    }
    var result = {};
    arr.forEach(function (e) {
        if (_.isObject(e)) {
            e = _.toArray(e);
            var key = e[0];
            if (e.length == 2) // ["first_name", "John"]
            {
                var val = e[1];
                if (typeof val == 'string') {
                    val = val.replace('$', '');
                }
                if (isNumeric(val)) {
                    val = Number(val.replace(/[^0-9\.]+/g, ""));
                    val = parseFloat(val);
                }
                if (!_.has(result, key)) {
                    result[key] = val;
                } else {
                    if (_.isString(result[key])) {
                        result[key] = Array(result[key]);
                    }
                    result[key].push(val);
                }

            }
        }
    });
    return result;
}

function ratchet_popover_dismiss() {
    var popovers = $('.popover');
    $(popovers).removeClass('visible');
    $(popovers).removeClass('active');
    $(popovers).hide();
    $("div.backdrop").remove();
}

function commuter_addr_to_full_addr(ca) {
    var full_addr = [ca.addrStreet1, ca.addrStreet2, ca.addrSuite, ca.addrCity, ca.addrState + ' ' + ca.addrZip].join(',');
    full_addr = start_case(full_addr);
    full_addr = full_addr.replace(/\s+/g, ' ').replace(/,+/g, ',').replace(/,/g, ', ').trim();
    return full_addr;
}

function start_case(s) {
    s = s.toLowerCase().trim();
    return s.replace(/\b(\w)/g, function (match) {
        return (match.toUpperCase());
    });
}

function lat_lng_distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (!unit) {
        unit = 'N';
    }
    if (unit == "K") {
        dist = dist * 1.609344
    }
    if (unit == "N") {
        dist = dist * 0.8684
    }
    return dist;
}

function isNumeric(n) {
    var parsed_string_match_original = false;
    var parsed = parseFloat(n);
    var parsed_string = parsed.toString();//100.5
    //check if parsed_string == n; //here n is 100.50 preg must discard trailing zero after dot
    var parsed_string_int_decimal = parsed_string.split('.');
    if (n === null) {
        return false;
    }
    var n_int_decimal = n.toString().split('.');
    if (parsed_string_int_decimal.length !== n_int_decimal.length) {
        return false;
    }
    if (n_int_decimal[0] !== parsed_string_int_decimal[0]) {
        return false;
    }
    if (parsed_string_int_decimal.length == 2) {
        //remove trailing zero from decimal
        var parsed_decimal = parsed_string_int_decimal[1].replace(/([1-9]+)0+/gi, '$1');
        var n_decimal = n_int_decimal[1].replace(/([1-9]+)0+/gi, '$1');
        if (n_decimal !== parsed_decimal) {
            return false;
        }
    }

    return !isNaN(parsed) && isFinite(parsed);
}

/**
 * Check if string is a money string
 * @param v
 * @returns {boolean}
 */
function is_money(v) {
    if (typeof v !== 'string') {
        return false
    }
    return /^\$*([\d,])+(\.*\d{2,})*$/.test(v);//$1,234.5678
}

function parseFloatOr0(v) {
    if (typeof v == "string") {
        v = v.replace('$', '');
    }
    if (is_money(v)) {
        v = v.replace(',', '');
    }
    v = parseFloat(v);
    if (isNaN(v)) {
        v = 0;
    }
    return v;
}

/*
parse Float 2 decimal places. return 0 if not float
 */
function pf2d(v) {
    if (typeof v == "string") {
        v = v.replace('$', '');
    }
    if (is_money(v)) {
        v = v.replace(',', '');
    }
    v = parseFloat(v).toFixed(2);
    if (isNaN(v)) {
        v = 0;
    } else {
        v = parseFloat(v);
    }
    return v;
}

JSON.parse_3t = function (s) {
    var result = {};
    try {
        result = JSON.parse(s);
    } catch (e) {
        console.error("3t Error parsing string: " + s + " error: " + e);
    }
    return result;
}

/**
 * Backbone print options from a collection
 * @param collection_name e.g. venue
 * @param name_column e.g. name
 * @returns {string}
 */
function print_option_fr_collection(collection_name, name_column, id_column = 'id') {
    if (typeof name_column === "undefined" || !name_column) {
        name_column = 'name';
    }
    var result = '<option value=""></option>';
    if (typeof(app.collections[collection_name]) === "undefined") {
        return result;
    }

    _.each(app.collections[collection_name].models, function (a_model) {
        result += '<option value = "' + a_model.get(id_column) + '" >' + a_model.get(name_column) + '</option>';
    });
    return result;
}

/**
 * Extract variables from BB model
 * @param model Backbone.Model
 */
function extract_from_model(model) {
    if (!model instanceof Backbone.Model) {
        return false;
    }
}

/**
 * Bootstrap helper: Closes all modals. Remove fade-in if present.
 */
function bs_close_all_modals() {
    $('.modal, [role="dialog"]').modal('hide');
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open');
}

/**
 * initialize autonumeric for all .money, except those with decimal places override
 */
function b3_autonumeric() {
    var an_options = {currencySymbol: '$', unformatOnSubmit: true};
    $('input.money:not([data-decimalPlacesOverride]), span.money:not([data-decimalPlacesOverride])').each(function (i, v) {
        if (typeof $(v).data('autoNumeric') == 'object') {
            $(v).autoNumeric('reSet');
        } else {
            $(v).autoNumeric('init', an_options);
        }
    });
    $('input[data-decimalPlacesOverride=4]').each(function (i, v) {
        if (typeof $(v).data('autoNumeric') == 'object') {
            $(v).autoNumeric('reSet');
        } else {
            $(v).autoNumeric('init', $.extend(an_options, {decimalPlacesOverride: 4}));
        }
    });
    $('.money').on('focus', function (e) {
        if (this.value == 0 || this.value === '$0.00') {
            $(this).val('');
            this.focus();
            this.select();
            this.setSelectionRange(0, this.value.length);
            var a = 1;
        }
    })
    // var save_aw_est_expense = $('#aw_est_expense').val();
    // if (typeof $('#aw_net_potential').data('autoNumeric') === 'object') {
    //     save_aw_est_expense = $('#aw_est_expense').autoNumeric('get');
    // }
    // $('#aw_est_expense').autoNumeric('destroy');
    // $('#aw_est_expense').autoNumeric('init', {currencySymbol: '$', unformatOnSubmit: true,});
    // $('#aw_est_expense').autoNumeric('set', save_aw_est_expense);
}

Number.prototype.trimNum = function (places, rounding) {
    if (rounding != 'floor' && rounding != 'ceil') {
        rounding = 'round'
    }
    var result, num = this, multiplier = Math.pow(10, places);
    result = Math[rounding](num * multiplier) / multiplier;
    return Number(result);
}

/**
 * Print a select html, select a selected option
 * @private
 */
function b3_print_und_select(name = '', id = name, sel_class = '', options = [], selected_option = null, attributes = {}) {
    let select = `<select id="${id}" name="${name}" class="${sel_class}" value=${selected_option} `;
    let val = '', text = '';

    $.each(attributes, (k, v) => {
        select += ` ${k}=${v} `;
    });
    select+= '>';

    options.forEach(option => {
        if (_.isArray(option)) {
            val = option[0];
            if (option.length == 2) {
                text = option[1];
            } else {
                text = val;
            }
        } else {
            val = option;
            text = option;
        }
        select += `<option value="${val}"`;
        if (val === selected_option){
            // select += ' selected="selected" ';
            select += ' selected ';
        }
        select += `>${text}</option>`;
    })

    select += '</select>';
    return select;
}