function getQueryString() {
    var obj = new Object();

    if (window.location.search != '') {
        var params = location.search.substring(1).split('&');

        for (var i = 0; i < params.length; i++) {
            var tmp = params[i].split('=');
            obj[tmp[0]] = tmp[1];
        }
    }

    return obj;
}

DriverCart = function () {
    var CART_KEY = 'Cart' + new Date().getTime();

    var objString = getQueryString();
    if (objString.cartId) {
        CART_KEY = objString.cartId;
    }

    this.CART_KEY = CART_KEY;
    this.addItem = function (item_key, callback, options, params) {
        var cart = this.getCart();
        var offer = this.getOfferDetail(item_key);
        if (offer && validOfferDate(offer)) {

            if (offer.main_item) {
                cart.main_item = offer.reward_id;

                if (cart.item_list.length > 0 && cart.item_list[0].item_key != item_key) {
                    cart.item_list = [];
                }

                if (offer.visibility == 'A' && !getSaleReferrer()) {
                    return false;
                }
            }
            
            var offer_main = this.getOfferDetail(cart.main_item);

            if (!offer_main) {
                this.redirectMain();
                return false;
            }

            var item_data = new Object();
            item_data.item_key = item_key;

            if (typeof options == 'object') {
                item_data.option = options;
            }

            try {
                if (params.sku) {
                    item_data.sku = params.sku;
                }
            } catch (e) {

            }

            if (offer.offer_type == 'bundle') {
                if (params && params.bundle_option && params.bundle_option.length == Object.keys(offer.options).length) {
                    item_data.bundle_option = params.bundle_option;
                } else {
                    return false;
                }
            } else {
                if (offer.options && Object.keys(offer.options).length > 0 && offer.product && Object.keys(offer.product).length > 0 && !item_data.sku) {
                    return false;
                }
            }

            var idx = -1;

            for (var i = 0 in cart.item_list) {
                if (cart.item_list[i].item_key == item_key) {
                    idx = i;
                    break;
                }
            }

            if (idx == -1) {
                cart.item_list.push(item_data);
            } else {
                cart.item_list[idx] = item_data;
            }

            this.saveData(cart);
            this.renderItem();
            if (typeof callback == 'function') {
               callback(); 
            }
        }
    }

    this.removeItem = function (item_key, callback) {
        var cart = this.getCart();

        var idx = -1;

        for (var i = 0 in cart.item_list) {
            if (cart.item_list[i].item_key == item_key) {
                idx = i;
                break;
            }
        }

        if (idx != -1) {
            cart.item_list.splice(idx, 1);

            this.saveData(cart);
            this.renderItem();
            
            if (typeof callback == 'function') {
               callback(); 
            }
        }
    }

    this.getCart = function () {
        var cart = window.localStorage.getItem(CART_KEY);
        var tmp = new Object();
        tmp.main_item = null;
        tmp.item_list = [];
        tmp.real_shipping = 0;
        tmp.shipping = 0;
        tmp.sub_total = 0;
        tmp.grand_total = 0;
        tmp.time = new Date().getTime();
        tmp.promotion_data = new Object();

        if (cart) {
            try {
                cart = JSON.parse(cart);
            } catch (e) {
                cart = tmp;
            }
        } else {
            cart = tmp;
        }

        if (typeof OFFER_KEY !== "undefined") {
            var main_select_offer = this.getOfferDetail(cart.main_item);
            var main_offer = this.getOfferDetail(OFFER_KEY);

            if (!main_select_offer && (!main_offer || !main_offer.main_item)) {
                this.redirectMain();
            }
        }

        return cart;
    }

    this.renderItem = function () {
        // var self = this;
        // var cart = this.getCart();
        // var html = '';
        // var target = $('#cart');
        // var cc_symbol = CURRENCY_SYMBOL[CURRENCY].symbol;

        // if ($(target).length > 0) {            
        //     if (cart.item_list.length > 0) {
        //         var html_cart = '';
                
        //         for (var i = 0 in cart.item_list) {
        //             var offer = self.getOfferDetail(cart.item_list[i].item_key);

        //             if (offer) {
        //                 var offer_price = parseFloat(offer.price);

        //                 if (cart.item_list[i].sku) {
        //                     var sku = cart.item_list[i].sku;

        //                     if (offer.product[sku].price) {
        //                         offer_price = parseFloat(offer.price) + parseFloat(offer.product[sku].price);
        //                     }
        //                 }

        //                 var html_option = '';
        //                 var html_option_product = '';

        //                 if (cart.item_list[i].option && Object.keys(cart.item_list[i].option).length > 0) {
        //                     for (var j = 0 in cart.item_list[i].option) {
        //                         var value_label = cart.item_list[i].option[j];

        //                         for (var k = 0 in offer.options[j].list_option) {
        //                             if (offer.options[j].list_option[k].value == cart.item_list[i].option[j]) {
        //                                 value_label = offer.options[j].list_option[k].label;

        //                                 var value_type = offer.options[j].list_option[k].value_type;
        //                                 var value_price = offer.options[j].list_option[k].value_price;

        //                                 if (value_type == 'product') {
        //                                     offer_price = parseFloat(offer_price) - parseFloat(value_price);

        //                                     if (parseFloat(offer.price) > 0) {
        //                                         html_option_product += '<div class="cart-item">';
        //                                         html_option_product += '  <div class="clearfix">';
        //                                         html_option_product += '      <div class="item-name" title="' + value_label + '">' + value_label + '</div>';
        //                                         html_option_product += '      <div class="item-price text-muted"><span>' + cc_symbol + '</span>' + numberComma(value_price) + '</div>';
        //                                         html_option_product += '  </div>';
        //                                         html_option_product += '</div>';
        //                                     } else {
        //                                         html_cart += '<div class="cart-item">';
        //                                         html_cart += '  <div class="clearfix">';
        //                                         html_cart += '      <div class="item-name" title="' + value_label + '">' + value_label + '</div>';
        //                                         html_cart += '      <div class="item-price text-muted"><span>' + cc_symbol + '</span>' + numberComma(value_price) + '</div>';
        //                                         html_cart += '  </div>';
        //                                         html_cart += '</div>';
        //                                     }
        //                                 } else {
        //                                     html_option += '<li>';
        //                                     html_option += '    <span class="option-label">' + offer.options[j].label + ':</span>';
        //                                     html_option += '    <span class="option-value">' + value_label + '</span>';
        //                                     html_option += '</li>';
        //                                 }
        //                                 break;
        //                             }
        //                         }
        //                     }
        //                 }

        //                 if (offer_price < 0) {
        //                     offer_price = 0;
        //                 }

        //                 html_cart += '<div class="cart-item">';
        //                 html_cart += '  <div class="clearfix">';
        //                 html_cart += '      <div class="item-name" title="' + offer.title + '">' + offer.title + '</div>';
        //                 html_cart += '      <div class="item-price text-muted"><span>' + cc_symbol + '</span>' + numberComma(offer_price) + '</div>';
        //                 html_cart += '  </div>';

        //                 if (html_option != '') {
        //                     html_cart += '<div class="list-item-option">';
        //                     html_cart += '  <ul class="item-option">';
        //                     html_cart +=        html_option;
        //                     html_cart += '  </ul>';
        //                     html_cart += '</div>';
        //                 }
                       
        //                 html_cart += '</div>';
        //                 html_cart += html_option_product;
        //             }
        //         }

        //         $(target).find('.cart-section.section-product .cart-section-content').html(html_cart);
        //     }
        // }

        // var html_summary = '';
        // html_summary += '<div class="cart-item clearfix">';
        // html_summary += '   <div class="item-name">' + DICT['cart']['shipping_price'] + '</div>';
        // html_summary += '   <div class="item-price text-muted">';
        // html_summary += '       <span>' + cc_symbol + '</span>' + numberComma(cart.shipping);
        // html_summary += '   </div>';
        // html_summary += '</div>';

        // if (cart.discount > 0) {
        //     html_summary += '<div class="cart-item clearfix">';
        //     html_summary += '   <div class="item-name">' + DICT['cart']['discount'] + '</div>';
        //     html_summary += '   <div class="item-price text-muted">';
        //     html_summary += '       <span>-' + cc_symbol + '</span>' + numberComma(cart.discount);
        //     html_summary += '   </div>';
        //     html_summary += '</div>';
        // }

        // html_summary += '<div class="cart-item clearfix">';
        // html_summary += '   <div class="item-name summary-label">' + DICT['cart']['grand_total'] + '</div>';
        // html_summary += '   <div class="item-price summary-price">';
        // html_summary += '       <span>' + cc_symbol + '</span>' + numberComma(cart.grand_total);
        // html_summary += '   </div>';
        // html_summary += '</div>';

        // $(target).find('.cart-section.section-summary .cart-section-content').html(html_summary);
    }

    this.clear = function () {
        window.localStorage.removeItem(CART_KEY);
        window.localStorage.removeItem('PromotionData-' + CART_KEY);
    }

    this.saveData = function (data, callback) {
        this.clearOldCart();
        
        var self = this;
        data.sub_total = 0;
        data.shipping = 0;
        data.real_shipping = 0;
        data.discount = 0;

        var main_offer = this.getOfferDetail(data.main_item);
        var country_code = 'th';

        if (data.shipping_address && data.shipping_address.country_id !== undefined) {
            country_code = data.shipping_address.country_id.toLowerCase();
        }

        var postage_key = country_code;

        if (data.shipping_address && data.shipping_address.province_id !== undefined) {
            postage_key = country_code + '_' + data.shipping_address.province_id;
        }

        if (main_offer) {
            if (validOfferDate(main_offer)) {
                if (main_offer.postage[postage_key] !== undefined) {
                    data.shipping = parseFloat(main_offer.postage[postage_key]);
                } else if (main_offer.postage[country_code] !== undefined) {
                    data.shipping = parseFloat(main_offer.postage[country_code]);
                }
            } else {
                this.clear();
                this.redirectMain();
                return false;
            }
        }

        if (isNaN(data.shipping)) {
            data.shipping = 0;
        }

        if (data.shipping < 0) {
            data.shipping = 0;
        }

        data.real_shipping = data.shipping;

        var free_shipping = false;

        for (var i = 0 in data.item_list) {
            var offer = self.getOfferDetail(data.item_list[i].item_key);

            if (offer && validOfferDate(offer)) {
                var offer_price = parseFloat(offer.price);

                if (offer.offer_type == 'bundle') {
                    if (data.item_list[i].bundle_option) {
                        var bundle_option = data.item_list[i].bundle_option;

                        for (var j = 0 in bundle_option) {
                            offer_price = parseFloat(offer_price) + parseFloat(bundle_option[j].value_price);
                        }
                    }
                } else {
                    if (data.item_list[i].sku) {
                        var sku = data.item_list[i].sku;

                        if (offer.product[sku].price) {
                            offer_price = parseFloat(offer_price) + parseFloat(offer.product[sku].price);
                        }
                    }
                }

                data.sub_total += parseFloat(offer_price);

                if (main_offer.ship_type == 'amount') {
                    if (offer.main_item) {
                        data.shipping = 0;
                    }

                    var shipping_price = 0;

                    if (offer.postage[postage_key] !== undefined) {
                        shipping_price = parseFloat(offer.postage[postage_key]);
                    } else if (offer.postage[country_code] !== undefined) {
                        shipping_price = parseFloat(offer.postage[country_code]);
                    }

                    data.shipping += parseFloat(shipping_price);
                }

                if (offer.ship_type == 'all_free') {
                    free_shipping = true;
                }
            }
        }

        if (data.shipping < 0) {
            data.shipping = 0;
        }

        data.real_shipping = data.shipping;

        if (free_shipping) {
            data.shipping = 0;
        }

        if (data.promotion_data.shipping_percent && data.promotion_data.shipping_percent > 0) {
            var discount_shipping = (parseFloat(data.shipping) * parseFloat(data.promotion_data.shipping_percent)) / 100;
            data.shipping = parseFloat(data.shipping) - parseFloat(discount_shipping);
        }

        if (data.shipping < 0) {
            data.shipping = 0;
        }

        data.grand_total = parseFloat(data.sub_total) + parseFloat(data.shipping);

        if (data.promotion_data.product_percent && data.promotion_data.product_percent > 0) {
            data.discount = (parseFloat(data.sub_total) * parseFloat(data.promotion_data.product_percent)) / 100;
        }

        data.grand_total = (parseFloat(data.sub_total) - parseFloat(data.discount)) + parseFloat(data.shipping);

        if (data.grand_total < 0) {
            data.grand_total = 0;
        }
        
        window.localStorage.setItem(CART_KEY, JSON.stringify(data));

        if (typeof callback === 'function') {
            callback();
        }
    }

    this.getOfferDetail = function (item_key) {
        var data;

        for (var i = 0 in OFFER_LIST) {
            if (OFFER_LIST[i].reward_id == item_key) {
                data = OFFER_LIST[i];
                break;
            }
        }

        return data;
    }

    this.redirectMain = function () {
        window.location.href = BASE_PRODUCT_URL + '/' + SLUG_PAGE;
    }

    this.setData = function (key, value, callback) {
        var cart = this.getCart();
        var cart_field = ['main_item', 'item_list', 'real_shipping', 'shipping', 'sub_total', 'grand_total', 'time', 'promotion_data', 'discount'];

        if (cart_field.indexOf(key) == -1) {
            cart[key] = value;
        }

        window.localStorage.setItem(CART_KEY, JSON.stringify(cart));

        if (typeof callback === 'function') {
            callback();
        }
    }

    this.getData = function (key) {
        var cart = this.getCart();
        return cart[key];
    }

    this.clearOldCart = function () {
        var all_storage_key = Object.keys(window.localStorage);
        var all_cart = [];

        for (var i = 0 in all_storage_key) {
            var check_key = all_storage_key[i].substring(0, 6);
            if (check_key == 'Cart') {
                all_cart.push(all_storage_key[i].slice(6));
            }
        }

        all_cart.sort();

        if (all_cart.length > 50) {
            for (var i = 0 in all_cart) {
                if (i >= 50) {
                    window.localStorage.removeItem('Cart' + all_cart[i]);
                }
            }
        }
    }

    this.getCartItem = function (item_key) {
        var cart = this.getCart();
        var data = null;

        for (var i = 0 in cart.item_list) {
            if (cart.item_list[i].item_key == item_key) {
                data = cart.item_list[i];
            }
        }

        return data;
    }

    this.setPromotion = function (data, callback) {
        var cart = this.getCart();

        if (typeof data === 'object' && data !== null) {
            cart.promotion_data = data;
        }

        this.saveData(cart, callback);    
    }

    this.validateCart = function (item_key, mode, callback) {
        var cart = this.getCart();
        var offer_step = getOfferStep();
        var url = '';
        var now_offer = this.getOfferDetail(item_key);

        if (cart.item_list.length > 0) {
            var main_item = this.getOfferDetail(cart.main_item);

            if (!main_item) {
                this.redirectMain();
                return false;
            }

            if (offer_step.length > 0) {
                var idx_cart = 0;

                for (var i = 0 in offer_step) {
                    var step = offer_step[i];
                    idx_cart += 1;

                    if (i == 0) {
                        if (step.key != cart.main_item) {
                            url = BASE_PRODUCT_URL + '/' + SLUG_PAGE + '/' + main_item.slug + '?cartId=' + CART_KEY;
                            
                            if (main_item.jump_main) {
                                var _idx = offer_step.length - 1;

                                offer_step[_idx] = {
                                    key: cart.main_item,
                                    mode: 'up'
                                };

                                url = BASE_PRODUCT_URL + '/' + SLUG_PAGE + '/' + main_item.slug + '?cartId=' + CART_KEY + '&offer=' + offerStepUrl(offer_step);
                                
                            }

                            break;
                        }
                    }
                }

                if (item_key && mode) {
                    if (mode == 'down' && now_offer && now_offer.reward_id == cart.main_item) {
                        this.redirectMain();
                        return false;
                    } else {
                        if (cart.item_list[idx_cart]) {
                            if (mode == 'up' && cart.item_list[idx_cart].item_key != item_key) {
                                cart.item_list.length = idx_cart;
                            } else if (mode == 'down' && cart.item_list[idx_cart].item_key == item_key) {
                                cart.item_list.length = idx_cart;
                            }

                            this.saveData(cart);
                        }
                    }
                }
            } else {
                if (now_offer && !now_offer.main_item) {
                    url = BASE_PRODUCT_URL + '/' + SLUG_PAGE + '/' + main_item.slug + '?cartId=' + CART_KEY;
                }
            }
        }

        if (url != '') {
            window.location.href = url;
            return false;
        }

        if (typeof callback === 'function') {
            callback();
        }
    }

    this.getPromotionData = function () {
        var data = localStorage.getItem('PromotionData-' + CART_KEY);

        if (data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {}
            }
        } else {
            data = {};
        }

        return data;
    }

    this.setPromotionData = function (data) {
        localStorage.setItem('PromotionData-' + CART_KEY, JSON.stringify(data));
    }

    this.refreshCart = function () {
        var cart = this.getCart();
        this.saveData(cart);
    }
}

var DRIVER_CART = new DriverCart();
