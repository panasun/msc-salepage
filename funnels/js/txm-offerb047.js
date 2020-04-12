var TIMEOUT_CHECK_OPTION;
var SELECT_NEXT_SELL;
var OFFER_SELL_DATA;
var DISPLAY_OFFER_STATUS = false;

window.addEventListener('pagehide', function() {
    clearBtnOfferLoading();
});

window.addEventListener('pageshow', function() {
	clearBtnOfferLoading();
});

if (PAGE_MODE == 'sellpage' || PAGE_MODE == 'promote') {
	countOfferSellStatus();
}

$(document).ready(function () {
	if ($('#dialog-option').length == 0) {
		$('body').append('<div id="dialog-option"></div>');
	}

	if ($('#txm_tracking_pagview').length == 0) {
		$('body').append('<button type="button" id="txm_tracking_pagview" class="d-none btn_tracking" tracking_event="PageView" funnel="' + GEN_KEY + '" >Page View</button>');
	}

	if ($('#txm_tracking_pagview').length > 0) {
		$('#txm_tracking_pagview').click();
	}

	if ($('.list-offer-item').length > 0) {
		$('.hover-group .submit-offer').click(function () {
			var el = $(this);
			$('.offer_item_active .submit-offer').attr('disabled', 'disabled');
			$(el).button('loading');

		  	var item_key = $(this).attr("offer");
		  	var _offer = getOfferDetail(item_key);

		  	if (_offer.limit_order > 0) {
			  	countOfferSellStatus(item_key, function (res) {
			  		if (res) {
			  			leadModal(item_key, el);
			  		} else {
			  			$('.offer_item_active .submit-offer').removeAttr('disabled');
			  			$(el).button('reset');
			  		}
			  	});
			} else {
				leadModal(item_key, el);
			}
		});

		checkAllStageOffers();

		if (OFFER_SELL_DATA) {
			DISPLAY_OFFER_STATUS = true;
			getOfferOrder();
		}
	}

	$('#country').on('change', function() {
		var country;
		if (LANG == "th") {
			country = "ไทย";
		}
		else{
			country = "Thailand";
		}
		var val  =  this.value ; 

		if (val != country ) {
			$('#province.provinceselect').hide();
			$('#provinceinput').show();
			$('#amphur.cityselect').hide();
			$('#cityinput').show();
			$('#district.districtselect').hide();
			$('#districtinput').show();
			$('#postcode').val("");

		}else{
			$('#province.provinceselect').show();
			$('#provinceinput').hide();
			$('#amphur.cityselect').show();
			$('#amphur.cityinput').hide();
			$('#district.districtselect').show();
			$('#districtinput').hide();
		}
	});

	// if (typeof OFFER_KEY !== 'undefined') {
	// 	initOfferEvent();
	// }

	$('.offer_item_active').find('.offer-img-content, .offer-title span').unbind('click');
	$('.offer_item_active').find('.offer-img-content, .offer-title span').click(function () {
		$(this).parents('.hover-group').find('.submit-offer').click();
	});

	// if (PAGE_MODE == 'offer' && OFFER_KEY) {
	// 	genSlotUpsell(OFFER_KEY);
	// }

	checkAlertDiscount();
});

$(window).resize(function () {
	ellipsisMultiline();
});

function numberComma(num,decimal) {
	if(typeof(decimal) == "undefined"){
		decimal = 2;
	}
    return parseFloat(num).toFixed(decimal).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function getOfferOrder() {
	if (!getSaleReferrer()) {
		$('.list-offer-item .hover-group[data-role="admin"]').remove();
	}

	$('.loading-container').remove();
	$('.list-offer-item').addClass('active');
	$(window).resize();

	var data = OFFER_SELL_DATA;
	for (var i = 0 in OFFER_LIST) {
		var num = 0;
		var rating = 0;
		var review = 0;
		var limit_order = 0;
		var allow_order = 0;
		var reward_id = OFFER_LIST[i]['reward_id'];

		for (var k = 0 in data) {
			var do_break = false;
			if (k == reward_id) {
				do_break = true;
				limit_order = data[k]['limit'];
				if (limit_order > 0) {
					allow_order = limit_order - data[k]['sell'];
				} else {
					allow_order = data[k]['sell'];
				}

				if (data[k]['sell_total']) {
					num = data[k]['sell_total'];
				}

				if (data[k]['rating']) {
					rating = data[k]['rating'];
				}

				if (data[k]['review']) {
					review = data[k]['review'];
				}
			}

			if (do_break) {
				break;
			}
		}

		if (OFFER_LIST[i]['limit_order'] !== undefined) {
			var str_status = '';
			var cls_status = 'active';

			if (num > 0) {
				if(OFFER_LIST[i]['price'] == 0){
					str_status = DICT['offer']['free_amount'].replace('{1}', numberComma(num, 0));
				} else {
					str_status = DICT['offer']['sell_amount'].replace('{1}', numberComma(num, 0));
				}

				var s = '';

				if (num > 1) {
					s = 's';
				}

				str_status = str_status.replace('{2}', s);

				cls_status += ' no-limit';
			}

			if (str_status != '') {
				$('.hover-group[data-id="' + reward_id + '"]').find('.offer-sell-status').html(str_status);
				$('.hover-group[data-id="' + reward_id + '"]').find('.offer-sell-status').addClass(cls_status);
			}
			
			if(limit_order > 0 && allow_order <= 0){
				if ($('.hover-group[data-id="' + reward_id + '"]').find('.wrap-soldout').length == 0) {
					var html_soldout = '';
					html_soldout += '<div class="wrap-soldout">';
					html_soldout += '	<div class="text-soldout text-price sellpage-header">' + DICT['cart']['sold_out'] + '</div>';
					html_soldout += '</div>';

					$('.hover-group[data-id="' + reward_id + '"]').find('.offer-img').append(html_soldout);
				}

				$('.hover-group[data-id="' + reward_id + '"]').addClass('inactive');
				$('.hover-group[data-id="' + reward_id + '"]').find('.btn').addClass('is_expired_btn').attr('disabled',true);
			}
		}

		var star_active = parseFloat(rating) * 11.25;
		$('.hover-group[data-id="' + reward_id + '"]').find('.stars-active').width(star_active);

		if (review > 0) {
			$('.hover-group[data-id="' + reward_id + '"]').find('.score_label').html('(' + numberComma(review, 0) + ')');
		}

		if (!(validOfferDate(OFFER_LIST[i]))) {
			$('.hover-group[data-id="' + reward_id + '"]').remove();
		}
	}

	$(".btn.submit-offer").not('.is_expired_btn').removeAttr("disabled");
	ellipsisMultiline();
	$(window).resize();
}

function validOfferDate(offer) {
	var status = true;
	var now = new Date($('.element_system_time').attr('data-system-time')).getTime();

	if (offer.start_date && offer.start_date != '0000-00-00 00:00:00') {
		offer.start_date = offer.start_date.split('-').join('/');
		var start_date = new Date(offer.start_date).getTime();

		if (start_date > now) {
			status = false;
		}
	}

	if (offer.expired_date && offer.expired_date != '0000-00-00 00:00:00') {
		offer.expired_date = offer.expired_date.split('-').join('/');
		var expired_date = new Date(offer.expired_date).getTime();

		if (expired_date < now) {
			status = false;
		}
	}

	return status;
}

function checkAllStageOffers(){
	var offer_item = $('.offer_item').find('.hover-group');
	var system_time = new Date($('.element_system_time').attr('data-system-time')).getTime();
	for (var i = 0; i < offer_item.length; i++) {
		var reward_id = $(offer_item[i]).attr('data-id');
		for (var j = 0; j < OFFER_LIST.length; j++) {
			if(reward_id == OFFER_LIST[j]['reward_id']){
				if(OFFER_LIST[j]['expired_date'] && OFFER_LIST[j]['expired_date'] != "0000-00-00 00:00:00"){
					if(OFFER_LIST[j]['expired_date'] && OFFER_LIST[j]['expired_date'] == true){

					} else {
						var product_time = new Date(OFFER_LIST[j]['expired_date']).getTime();
						if(product_time <= system_time){
							$(offer_item[i]).remove();
						} else {
							$(offer_item[i]).removeAttr('data-type');
						}
					}
				}
			}
		}
	}
}

function getOfferDetail(item_key, mode) {
	var data = null;

    for (var i = 0 in OFFER_LIST) {
        if (OFFER_LIST[i].reward_id == item_key) {
            data = OFFER_LIST[i];
            break;
        }
    }

    return data;
}

function selectUpSell(_item_key) {
	var offer = getOfferDetail(_item_key);

	if (offer) {
		var offer_option = checkOfferOption();

		if (offer_option) {
			var params = new Object();
			params.sku = getSelectSKU();

			DRIVER_CART.addItem(_item_key, function () {
				var up_sell = getOfferDetail(offer.up_sell);
				var item_key = null;

				if (up_sell != null) {
					item_key = up_sell.reward_id
				}

				goNextSell(item_key, _item_key, 'up');
			}, offer_option, params);
		} else {
			if ($('#offer_option .has-error').length > 0) {
	    		$('html, body').animate({
			        scrollTop: $('#offer_option .has-error').first().offset().top
			    }, 400);
	    	}
		}
	} else {
		if (PAGE_MODE == 'checkouts') {
			hideDialogOfferOption();
		} else {
			goCheckout();
		}
	}
}

function selectDownSell(_item_key) {
	var offer = getOfferDetail(_item_key);

	if (offer) {
		if (SELECT_NEXT_SELL == 'downsell') {
			checkFormPromotion(offer, function () {
				SELECT_NEXT_SELL = '';
				selectDownSell(_item_key);
			});
		} else {
			var down_sell = getOfferDetail(offer.down_sell);
			var item_key = null;
			if (down_sell != null) {
				item_key = down_sell.reward_id
			}

			goNextSell(item_key, _item_key, 'down');
		}
	} else {
		goCheckout();
	}
}

// function checkFormPromotion(offer, callback) {
// 	if (offer && offer.promotion && offer.promotion_config.length > 0) {
// 		var promotions = offer.promotion_config;
// 		var cart_promotion = DRIVER_CART.getPromotionData();

// 		if (!cart_promotion) {
// 			cart_promotion = {};
// 		}
		
// 		for (var i = 0 in promotions) {
// 			var promotion = promotions[i];

// 			if (promotion.type == 'referrer_friends') {
// 				var valid_promotion = validateFormPromotion(promotion);

// 				if (valid_promotion) {
// 					cart_promotion[promotion.type] = valid_promotion.data;
// 					cart_promotion['raw_data_' + promotion.type] = valid_promotion.raw_data;

// 					if (valid_promotion.data.length > 0) {
// 						importReferrer(valid_promotion.data);
// 					}
// 				}
// 			} else if (promotion.type == 'shipping') {
// 				cart_promotion[promotion.type] = promotion.discount[0];
// 			}
// 		}

// 		DRIVER_CART.setPromotionData(cart_promotion);

// 		checkOfferPromotion('referrer_friends', valid_promotion.data, callback, offer.reward_id);
// 		return false;
// 	} else {
// 		callback();
// 	}
// }

function checkFormPromotion(offer, callback) {
	var promotion = null;

	if (offer && offer.promotion && offer.promotion_config) {
		promotion = offer.promotion_config;

		if (promotion) {
			var valid_promotion = validateFormPromotion(promotion);
			var cart_promotion = DRIVER_CART.getPromotionData();

			if (!cart_promotion) {
				cart_promotion = {};
			}

			cart_promotion[promotion.type] = [];
			cart_promotion['raw_data_' + promotion.type] = [];

			if (valid_promotion) {
				cart_promotion[promotion.type] = valid_promotion.data;
				cart_promotion['raw_data_' + promotion.type] = valid_promotion.raw_data;
			}

			DRIVER_CART.setPromotionData(cart_promotion);
			
			if (valid_promotion) {
				if (promotion.type == 'referrer_friends') {
					if (valid_promotion.data.length > 0) {
						importReferrer(valid_promotion.data);
					}

					checkOfferPromotion(promotion.type, valid_promotion.data, callback, offer.reward_id);
					return false;
				}
			}
		}
	}

	if (typeof callback === 'function') {
		DRIVER_CART.setPromotion({});
        DRIVER_CART.setPromotionData({});
		callback(false);
	}
}

function selectOffer(_item_key) {
	var offer = getOfferDetail(_item_key);
	if (offer) {
		var offer_option = checkOfferOption();
		var params = new Object();
		params.sku = getSelectSKU();

		DRIVER_CART.addItem(_item_key,function(){
			var next_sell = null;
			var item_key = null;

			if (offer.ab_content.length > 0) {
				item_key = offer.reward_id;
			} else {
				if (offer.up_sell) {
					next_sell = getOfferDetail(offer.up_sell);
				} else if (offer.down_sell) {
					next_sell = getOfferDetail(offer.down_sell);
				}

				if (next_sell != null) {
					item_key = next_sell.reward_id
				}
			}

			goNextSell(item_key, _item_key, 'up');
		}, offer_option, params);
	}
}

function goNextSell(item_key, select_key, select_mode) {
	if (item_key) {
		var offer = getOfferDetail(item_key);

		if (offer) {
			if (offer.ab_content.length > 0) {
				if(TXM_AB_COOKIE.checkCookie("txm_ab_"+item_key) != ""){
					window.location.href = BASE_PRODUCT_URL +"/"+SLUG_PAGE+"/"+ TXM_AB_COOKIE.getCookie("txm_ab_"+item_key)
				} else {
					$.ajax({
						url: BASE_API + 'v2/content/ab',
						type: 'GET',
						dataType: 'json',
						data: {
							"funnel_id" : GEN_KEY,
							"reward_id": item_key
						},
						error: function (e) {
							window.location.href = BASE_PRODUCT_URL + "404";
						},
						success: function (res) {
							if (res['status'] == 'success') {
								TXM_AB_COOKIE.setCookie("txm_ab_"+item_key,res['data'],30,"",window.location.pathname);
								window.location.href = BASE_PRODUCT_URL + "/" + SLUG_PAGE + "/" + res['data'] + "?cartId="+DRIVER_CART.CART_KEY;
							} else {
								window.location.href = BASE_PRODUCT_URL + "404";
							}
						}
					});
				}
			} else {
				// var str_offer = '';

				// if (select_key && select_mode) {
				// 	var objQuery = getQueryString();
				// 	var step_offer = getOfferStep();
				// 	var _offer = getOfferDetail(select_key);

				// 	if (_offer && _offer.jump_main && step_offer.length > 0) {
				// 		var idx = step_offer.length - 1;
				// 		step_offer[idx] = {
				// 			key: select_key,
				// 			mode: select_mode
				// 		};
				// 	} else {
				// 		step_offer.push({
				// 			key: select_key,
				// 			mode: select_mode
				// 		});
				// 	}

				// 	str_offer = '&offer=' + offerStepUrl(step_offer);
				// }

				// window.location.href = BASE_PRODUCT_URL +"/"+SLUG_PAGE+"/"+ offer.slug+"?cartId="+DRIVER_CART.CART_KEY + str_offer;

				if (PAGE_MODE == 'checkouts') {
					hideDialogOfferOption(function () {
						renderDialogOfferOption(offer);
						showDialogOfferOption();
					});					
				} else {
					goCheckout();
				}
			}
		}
	}else{
		if (PAGE_MODE == 'checkouts') {
			hideDialogOfferOption();
		} else {
			goCheckout();
		}
	}
}

function getOfferStep() {
	var objQuery = getQueryString();
	var step_offer = [];

	if (objQuery.hasOwnProperty('offer')) {
		objQuery.offer = objQuery.offer.replace(new RegExp('-', 'g'), '=');
		step_offer = Base64.decode(objQuery.offer);

		try {
			step_offer = JSON.parse(step_offer);
		} catch (e) {
			step_offer = [];
		}

		if (!step_offer || step_offer == '') {
			step_offer = [];
		}
	}

	return step_offer;
}

function offerStepUrl(data) {
	data = Base64.encode(JSON.stringify(data));
	data = data.replace(new RegExp('=', 'g'), '-');
	return data;
}

function goCheckout() {
	window.location.href = 'checkouts?cartId='+DRIVER_CART.CART_KEY;
}

TaxiDriverCookieManage = function() {

    this.setCookie = function (cname, cvalue, exdays, domain, path) {
    	if(typeof(domain) == "undefined"){
    		domain = "";
    	}
    	if(typeof(path) == "undefined"){
    		path = window.location.pathname
    	}
    	var expires = "expires=";
    	if(exdays != ""){
        	var d = new Date();
        	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        	expires += d.toUTCString();
    	}
        document.cookie = cname + "=" + cvalue + ";" + expires + ";domain="+ domain +";path="+ path +";";
    }

    this.getCookie = function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    this.checkCookie = function (cname) {
        var ab_slug = this.getCookie(cname);
        if (ab_slug != "") {
        	return true;
        } else {
            return false;
        }
    }
}

var TXM_AB_COOKIE = new TaxiDriverCookieManage();

function leadModal(item_key, btn) {
	var offer = getOfferDetail(item_key);

	if (offer) {
		if (offer.has_option) {
			if (btn) {
				$(btn).button('reset');
			}
			
			$('.offer_item_active .submit-offer').removeAttr('disabled');
			renderDialogOfferOption(offer);
			showDialogOfferOption();
		} else {
			setTimeout(function () {
				DRIVER_CART.addItem(offer.reward_id, function () {
					goCheckout();
				});
			}, 10);
		}
	}
}

function checkOfferOption(hide_error) {
	var options = false;

	if ($('.offer_option').length > 0) {
		$('.offer_option').parents('.custom_form_tm').removeClass('has-error');

		options = new Object();
		var has_error = false;

		$('.offer_option').each(function () {
			var option_type = $(this).attr('data-type');
			var tag_name = $(this)[0].nodeName.toLowerCase();
			var option_value = $(this).val();
			var input_name = $(this).attr('name');

			if (tag_name == 'input' && $(this).attr('type') == 'radio') {
				option_value = $('input[name="' + input_name + '"]:checked').val();
			}

			if (option_value == '' || option_value === null || option_value === undefined) {
				if (!hide_error) {
					$(this).parents('.custom_form_tm').addClass('has-error');
				}

				has_error = true;
			}

			if (option_type) {
				if (!options.hasOwnProperty(option_type)) {
					options[option_type] = option_value;
				}
			}
		});

		if (has_error) {
			options = false;
		}
	} else {
		options = true;
	}

	if (!options && !hide_error) {
		showError(DICT['alert']['please_select_option']);
	}

	return options;
}

function setOfferOption(item_key) {
	var item_data = DRIVER_CART.getCartItem(item_key);

	if (item_data) {
		if (item_data.hasOwnProperty('option')) {
			for (var i = 0 in item_data.option) {
				var el = $('.offer_option[data-type="' + i + '"]');
				var tag_name = $(el)[0].nodeName.toLowerCase();
				var input_type = $(el).attr('type');
				var value = item_data.option[i];

				if (tag_name == 'input' && input_type == 'radio') {
					$('input[type="radio"][data-type="' + i + '"]').filter('[value=' + value + ']').prop('checked', true).trigger('change');
					$('input[type="radio"][data-type="' + i + '"]').filter('[value=' + value + ']').parents('.radio-option.radio-box').addClass('active');
					$('input[type="radio"][data-type="' + i + '"]').filter('[value=' + value + ']').parents('.button-set-item').addClass('active');
				} else {
					$(el).val(value).trigger('change');
				}
			}
		}
	}
}

// function initOfferEvent() {
// 	var offer = getOfferDetail(OFFER_KEY);
// 	var query_str = getQueryString();

// 	if (offer.main_item == true) {
// 		$('body').addClass('offer-main');
// 	} else if (offer.main_item == false) {
// 		$('body').addClass('offer-child');
// 	}

// 	if (offer.main_item && offer.offer_type == 'expired_after_review' && !DRIVER_CART.getData('order_id')) {
// 		window.location.href =  BASE_PRODUCT_URL + '/' + SLUG_PAGE;
// 		return;
// 	}

// 	if (!query_str.cartId && offer.main_item) {
// 		var cart = DRIVER_CART.getCart();
// 		DRIVER_CART.saveData(cart, function () {
// 			window.location.href =  BASE_PRODUCT_URL + '/' + SLUG_PAGE + '/' + offer.slug + '?cartId=' + DRIVER_CART.CART_KEY;
// 		});
// 	} else {
// 		if (offer && offer.has_deal) {
// 			initOfferOptionEvent(OFFER_KEY, '#offer_deal');
// 			setOfferOption(OFFER_KEY);
// 		}

// 		if (offer.promotion && offer.promotion_config) {
// 			var promotion = offer.promotion_config;
// 			renderFormPromotion(promotion);
// 		}
// 	}
// }

function getOfferBundleOption(offer) {
	var bundle_option = [];

	$('#dialog-option.active input[type="radio"].offer_option:checked, #dialog-option.active select.offer_option').each(function (index, elem) {
		var input_name = $(this).attr('name');
		var input_value = $(this).val();

		if (offer.options[input_name]) {
		
			for (var i = 0 in offer.options[input_name].list_option) {
				var _option = offer.options[input_name].list_option[i];
				_option.option_key = input_name;
				
				if (_option.value == input_value) {
					bundle_option.push(_option);
				}
			}
		}
	});

	return bundle_option;
}

function initOfferOptionEvent(item_key, parent) {
	var offer = getOfferDetail(item_key);

	if (offer) {
		if (offer.options && Object.keys(offer.options).length > 0 && (offer.product && Object.keys(offer.product).length > 0 || offer.offer_type == 'bundle')) {
			$('#submit-offer-option, #reward-submit').attr('disabled', 'disabled');

			$(parent).find('.radio-option.radio-box').unbind('click');
			$(parent).find('.radio-option.radio-box').click(function () {
				$(parent).find('.radio-option.radio-box').removeClass('active');
				$(this).parents('.tm-form-group').next().removeClass('disabled');
				$(this).addClass('active');
				$(this).find('input[type="radio"]').prop('checked', true).trigger('change');
			});

			$(parent).find('.button-set-item').unbind('click touchstart');
			$(parent).find('.button-set-item').on('click touchstart', function () {
				$(this).parents('.tm-form-group').find('.button-set-item').removeClass('active');
				$(this).parents('.tm-form-group').next().removeClass('disabled');
				$(this).addClass('active');
				$(this).find('input[type="radio"]').prop('checked', true).trigger('change');
			});

			$(parent).find('.offer_option').unbind('change');
			$(parent).find('.offer_option').change(function () {
				if (offer.limit_order > 0) {
					$('#submit-offer-option, #reward-submit').attr('disabled', 'disabled');
					$('#offer_option .out-of-stock').removeClass('active');
					$('#offer_option .in-stock').removeClass('active');
					$('#offer_option').val('');
				}

				$(this).parents('.tm-form-group').next().removeClass('disabled');

				clearTimeout(TIMEOUT_CHECK_OPTION);
				TIMEOUT_CHECK_OPTION = setTimeout(function () {
					var option = checkOfferOption(true);

					if (option) {
						var option_value = [];
						var sku = '';
						var bundle_option = [];

						if (offer.offer_type == 'bundle') {
							bundle_option = getOfferBundleOption(offer);

							if (bundle_option.length != Object.keys(offer.options).length) {
								bundle_option = [];
							}
						} else {

							for (var i = 0 in option) {
								option_value.push(option[i]);
							}

							for (var i = 0 in offer.product) {
								var product = offer.product[i];

								if (product.option_list.length == option_value.length) {
									var num_match = 0;

									for (var j = 0 in option_value) {
										var idx = product.option_list.indexOf(option_value[j]);

										if (idx != -1) {
											num_match ++;
										}
									}

									if (num_match == product.option_list.length) {
										sku = i;
									}
								}

								if (sku != '') {
									break;
								}
							}
						}

						if (sku != '' || bundle_option.length > 0) {
							$('.select_sku').val(sku);

							if (offer.limit_order > 0) {
								$('#dialog-option .offer-status').html('');

								fetchSKUQty(sku, function (status, data) {
									if (status == 'success') {
										if (data[sku] > 0) {
											$('#dialog-option .offer-status').html('<div class="in-stock active">' + DICT['offer']['in_stock'].replace('{{%Unit%}}', offer.unit) + '</div>');
											$('#offer_option, #dialog-option').find('.stock_value').html(numberComma(data[sku], 0));
											$('.select_sku').val(sku);
											$('#submit-offer-option, #reward-submit').removeAttr('disabled');
											$('#offer_option .in-stock').addClass('active');
										} else {
											$('#offer_option .out-of-stock').addClass('active');
											$('#dialog-option .offer-status').html('<div class="out-of-stock active">' + DICT['offer']['out_of_stock'] + '</div>');
										}
									} else {
										$('#offer_option .out-of-stock').addClass('active');
										$('#dialog-option .offer-status').html('<div class="out-of-stock active">' + DICT['offer']['out_of_stock'] + '</div>');
									}
								}, item_key);
							} else {
								$('#submit-offer-option, #reward-submit').removeAttr('disabled');
							}
						}
					}
				}, 10);
			});
		}
	}
}

function fetchSKUQty(sku, callback, item_key) {
	var data = new Object();

	if (sku) {
		data.sku = sku;
	}

	$.ajax({
		url: BASE_API + 'v2/products/' + GEN_KEY + '/' + item_key,
		type: 'get',
		dataType: 'json',
		data: data,
		error: function (e) {
			if (typeof callback === 'function') {
				callback('error');
			}
		},
		success: function (res) {
			if (typeof callback === 'function') {
				callback(res.status, res.data);
			}
		}
	});
}

function getSelectSKU() {
	return $('.select_sku').val();
}

function renderFormPromotion(promotion) {
	var html = '';
	html += '<fieldset class="promotion-field box-content">';
	html += '	<h4 class="sellpage-header">' + promotion.name + '</h4>';
	html += '	<div class="promotion-desc">' + promotion.description + '</div>';
	html += '	<div id="promotion-form">';

	if (promotion.type == 'referrer_friends') {
		var cart_promotion = DRIVER_CART.getPromotionData();
		var data = [];

		if (cart_promotion && cart_promotion['raw_data_' + promotion.type]) {
			data = cart_promotion['raw_data_' + promotion.type];
		}

		for (var i = 0 in promotion.discount) {
			var num = parseInt(i) + 1;
			var group_data = {
				name: '',
				email: '',
				tel: ''
			};

			if (data[i]) {
				group_data = data[i];
			}

			html += '<div class="group-data">';
			html += '	<div class="tm-form-group">';
			html += '		<div class="group-title">'
			html += '			<i class="fa5-icon">';
			html += '				<i class="far fa-user"></i>';
			html += '			</i>';
			html += '			<span>' + DICT['lead']['friend_no'] + ' ' + num + '</span>';
			html += '		</div>';
			html += '		<div class="custom_form_tm">';
			html += '			<div class="form_group">';
			html += '				<input class="form_input" type="text" data-key="name" value="' + group_data.name + '">';
			html += '				<div class="form_placeholder">';
			html += '					<i class="fas fa-exclamation-triangle icon_input_error" aria-hidden="true"></i>';
			html += '					<span>' + DICT['lead']['name2'] + '</span>';
			html += '				</div>';
			html += '			</div>';
			html += '		</div>';
			html += '	</div>';
			html += '	<div class="tm-form-group">';
			html += '		<div class="tm-form-row clearfix">';
			html += '			<div class="tm-form-column">';
			html += '				<div class="custom_form_tm">';
			html += '					<div class="form_group">';
			html += '						<input class="form_input" type="text" data-key="tel" value="' + group_data.tel + '">';
			html += '						<div class="form_placeholder">';
			html += '							<i class="fas fa-exclamation-triangle icon_input_error" aria-hidden="true"></i>';
			html += '							<span>' + DICT['lead']['phone_no'] + '</span>';
			html += '						</div>';
			html += '					</div>';
			html += '				</div>';
			html += '			</div>';
			html += '			<div class="tm-form-column">';
			html += '				<div class="custom_form_tm">';
			html += '					<div class="form_group">';
			html += '						<input class="form_input" type="text" data-key="email" value="' + group_data.email + '">';
			html += '						<div class="form_placeholder">';
			html += '							<i class="fas fa-exclamation-triangle icon_input_error" aria-hidden="true"></i>';
			html += '							<span>' + DICT['lead']['email'] + '</span>';
			html += '						</div>';
			html += '					</div>';
			html += '				</div>';
			html += '			</div>';
			html += '		</div>';
			html += '	</div>';
			html += '</div>';
		}
	}

	html += '	</div>';
	html += '</fieldset>';

	$('#offer-promotion-container').html(html);
	$('#offer-promotion-container').addClass('active');
	$('#offer-promotion-container').find('fieldset.promotion-field').find('input.form_input').trigger('change');
}

function validateFormPromotion(promotion) {
	var response = {'data': '', 'raw_data': ''};
	var has_error = false;

	$('.box-promotion').find('.has-error').removeClass('has-error');

	if (promotion.type == 'referrer_friends') {
		response.data = [];
		response.raw_data = [];

		// var obj_value = new Object();

		$('.box-promotion.referrer_friends').each(function (index, elem) {
			var obj = {};
			// var obj_valid = true;

			$(elem).find('input.input_referrer_friend').each(function (idx, el) {
				var key = $(el).attr('data-key');
				var value = $.trim($(el).val());

				if ((key == 'name' || key == 'tel') && value == '') {
					has_error = true;
					// obj_valid = false;
					$(el).parents('.custom_form_tm').addClass('has-error');
				}

				if (key == 'email' && value != '' && !validateEmail(value)) {
					has_error = true;
					// obj_valid = false;
					$(el).parents('.custom_form_tm').addClass('has-error');
				}

				obj[key] = value;

				// if (obj_value[key] === undefined) {
				// 	obj_value[key] = [];
				// }

				// if (value != '' && obj_value[key].indexOf(value) != -1) {
				// 	$(el).parents('.custom_form_tm').addClass('has-error');
				// 	has_error = true;
				// }

				// obj_value[key].push(value);
			});

			// if (has_value) {
			// 	for (var i = 0 in obj) {
			// 		if (obj[i] == '' && promotion.require[i]) {
			// 			$(elem).find('input[data-key="' + i + '"]').parents('.custom_form_tm').addClass('has-error');
			// 			has_error = true;
			// 			obj_valid = false;
			// 		}
			// 	} 
			// }

			response.raw_data.push(obj);
			response.data.push(obj);
			// if (has_value && obj_valid) {
			// 	response.data.push(obj);
			// }
		});
	}

	if (has_error) {
		response = false;
	}

	return response;
}

function importReferrer(data) {
	$.ajax({
		url: BASE_API + 'v2/lead/import',
		type : "post",
		dataType : "json",
		data : {
			Command : "",
			funnel_id: GEN_KEY,
			lead_data: data,
			lead_type: 'invite'
		},

		error: function (e) {
			
		},
		success: function (res) {
			
		}
	});
}

function checkOfferPromotion(promotion_type, data, callback, item_key) {
	$.ajax({
		url: BASE_API + 'v2/offer/' + item_key + '/promotion',
		type: 'post',
		dataType: 'json',
		data: {
			funnel_id: GEN_KEY,
			data: JSON.stringify(data)
		},
		error: function (e) {
			if (typeof callback === 'function') {
				callback(false);
			}
		},
		success: function (res) {
			var status = false;

			if (res.status == 'success') {
				status = true;

				if (promotion_type == 'referrer_friends') {
					DRIVER_CART.setPromotion(res.data);
				}
			} else {
				showError(DICT['alert']['try_again_later']);
			}

			if (typeof callback === 'function') {
				callback(status);
			}
		}
	});
}

function renderDialogOfferOption(offer, mode) {
	var title_bar = DICT['offer']['special_promotion'];
	var has_iframe = false;

	if (!offer.main_item || offer.jump_main) {
		title_bar = DICT['lead']['special_offer'];
	}

	if (mode == 'select_option' || mode == 'edit_option') {
		title_bar = DICT['offer']['select_option'];
	}

	if ((!offer.main_item || offer.jump_main) && offer.has_html && mode != 'select_option' && mode != 'edit_option') {
		has_iframe = true;
	}

	var html = '';
	html += '	<div class="wrap-line-touch">';
	html += '		<div class="line-touch">';
	html += '			<div class="line"></div>';
	html += '		</div>';
	html += '	</div>';
	html += '	<div class="inner content-offer-option">';
	html += '		<div class="close">';
	html += '			<i class="fal fa-times"></i>';
	html += '		</div>';
	html += '		<div class="title-bar sellpage-header position-relative">'
	html += '			<span>' + title_bar + '</span>';
	html += '		</div>';

	if (has_iframe) {
		html += '	<div class="dialog-inner-content has-iframe">';
		html += '		<div class="wrap-iframe-content">';
		html += '			<iframe src="' + BASE_PRODUCT_URL + '/' + SLUG_PAGE + '/' + offer.slug + '?cartId=' + DRIVER_CART.CART_KEY + '&v=' + FILE_VERSION + '" id="iframe_inner_page_render" class="iframe-inner-page-render" allowtransparency="true" style="opacity:0;background: #FFFFFF;" frameborder="0" onload="setInitFooterIframe(\'offer\');"></iframe>';
		html += '			<div class="overlay-iframe"></div>';
		html += '		</div>';
		html += '	</div>';
		html += '	<div class="dialog-footer-content d-none">';
		html += '		<div class="text-center wrap-btn clearfix">';
		html += '			<div class="wrap-btn-upsell">';
		html += '				<button type="button" id="submit-offer-option" class="btn btn-driver" autocomplete="off">' + DICT['offer']['upsell'] + '</button>';
		html += '			</div>';
		html += '			<div class="wrap-btn-downsell">';
		html += '				<button type="button" id="btn-downsell" class="btn btn-cancel">' + DICT['offer']['downsell'] + '</button>';
		html += '			</div>';
		html += '		</div>';
		html += '	</div>';
	} else {
		html += '	<div class="dialog-inner-content">';
		html += '		<div class="option-container wrap-select-option box-content">';
		html += '			<div class="option-content">';
		html += '				<div class="offer-content">';
		html += '					<div class="row">';

		var col_detail = 12;

		if (offer.image_url) {
			col_detail = 6;

			html += '					<div class="col-md-6">';
			html += '						<div class="offer-img">';
			html += '							<img src="' + offer.image_url + '">';
			html += '						</div>';
			html += '					</div>';
		}

		html += '						<div class="col-md-' + col_detail + '">';
		html += '							<div class="offer-detail">';
		html += '								<div class="offer-title sellpage-header">' + offer.title + '</div>';
		html += '								<div class="offer-desc">' + offer.description + '</div>';
		html += '								<div class="offer-status"></div>';
		html += '							</div>';
		html += '							<div class="select-option-content">';
		html += '								<div id="offer_option">';
		html += '									<input type="hidden" class="select_sku">';

		var num = 0;

		for (var i = 0 in offer.options) {
			var option_type = i;
			var data = offer.options[i];
			var input_type = data.input_type;
			var list_option = data.list_option;
			var cls_form = '';

			if (Object.keys(offer.options).length > 1 && num != 0 && mode != 'edit_option') {
				cls_form = 'disabled';
			}

			html += '								<div class="tm-form-group ' + cls_form + '">';

			if (input_type == 'select') {
				
				// html += '								<div class="option-title">' + data.label + '</div>';
				html += '								<div class="custom_form_tm select active">';
				html += '									<div class="form_group">';
				html += '										<div class="select-arrow">';
				html += '											<div class="down">';
				html += '												<i class="fal fa-angle-down"></i>';
				html += '											</div>';
				html += '											<div class="up d-none">';
				html += '												<i class="fal fa-angle-up"></i>';
				html += '											</div>';
				html += '										</div>';
				html += '										<select class="form_input offer_option" autocomplete="off" name="' + option_type + '" data-type="' + option_type + '">';
				html += '											<option disabled selected>' + DICT['offer']['please_select'] + '</option>';

				for (var j = 0 in list_option) {
					var val = list_option[j];
					var value_price = '';

					if (val.value_price > 0) {
						value_price = '(' + numberComma(val.value_price) + '-)';
					}

					html += '										<option value="' + val.value + '">' + val.label + value_price + '</option>';
				}

				html += '										</select>';
				html += '										<div class="form_placeholder">';
				html += '											<i class="fas fa-exclamation-triangle icon_input_error"></i>';
				html += '											<span>' + data.label + '</span>';
				html += '										</div>';
				html += '									</div>';
				html += '								</div>';
			} else if (input_type == 'radio' || input_type == 'radio_box') {
				html += '								<div class="custom_form_tm radio">';
				html += '									<div class="option-title">' + data.label + '</div>';

				for (var j = 0 in list_option) {
					var val = list_option[j];
					var value_price = '';
					var cls = '';

					if (val.value_price > 0) {
						value_price = '(' + numberComma(val.value_price) + '-)';
					}

					if (input_type == 'radio_box') {
						cls = 'radio-box';
					}

					html += '								<div class="radio-option ' + cls + '">';
					html += '									<label class="clearfix">';

					if (input_type == 'radio_box') {
						html += '									<div class="radio-content ' + LANG + '">';
						html += '										<input type="radio" name="' + option_type + '" data-type="' + option_type + '" value="' + val.value + '" class="offer_option mgc mgc-primary mgc-lg mgc-circle" autocomplete="off" data-label="' + val.label + '" data-sku-id="' + val.sku_id + '">';
						html += '										<div class="radio-label">' + val.label + value_price + '</div>';

						if (val.value_desc) {
							html += '									<div class="radio-desc">' + val.value_desc + '</div>';
						}

						html += '									</div>';
					} else {
						html += '									<input type="radio" name="' + option_type + '" data-type="' + option_type + '" value="' + val.value + '" class="offer_option mgc mgc-primary mgc-lg mgc-circle" autocomplete="off" data-label="' + val.label + '" data-sku-id="' + val.sku_id + '">';
						html += '									<div class="radio-label">' + val.label + value_price + '</div>';
					}

					html += '									</label>';
					html += '								</div>';
				}

				html += '								</div>';
			} else if (input_type == 'button_set') {
				html += '								<div class="custom_form_tm custom_form_tm_custom button_set">';
				html += '									<div class="option-title">' + data.label + '</div>';
				html += '									<div class="clearfix" style="margin: 0 -7px;">';

				var style = '';
				var attr_style = '';

				if (data.config && Object.keys(data.config).length > 0) {
					if (data.config.min_width) {
						style += 'min-width: ' + data.config.min_width + ';';
					}

					if (data.config.font_size) {
						style += 'font-size: ' + data.config.font_size + ';';
					}

					if (data.config.width) {
						style += 'width: ' + data.config.width + ';';
					}

					if (data.config.max_width) {
						style += 'max-width: ' + data.config.max_width + ';';
					}
				}

				if (style != '') {
					attr_style = 'style="' + style + '"';
				}

				for (var j = 0 in list_option) {
					var val = list_option[j];

					var value_price = '';

					if (val.value_price > 0) {
						value_price = '' + numberComma(val.value_price);
					}

					html += '									<div class="wrap-btn-set-item" ' + attr_style + '>';
					html += '										<div class="button-set-item">';
					html += '											<input type="radio" name="' + option_type + '" data-type="' + option_type + '" value="' + val.value + '" class="offer_option d-none" autocomplete="off" data-sku-id="' + val.sku_id + '" data-label="' + val.label + '">';
					html += '											<div class="icon-selected fa-stack">';
					html += '												<i class="fa5-icon icon-circle">';
					html += '													<i class="fas fa-circle fa-stack-2x"></i>';
					html += '												</i>';
					html += '												<i class="fa5-icon icon-check">';
					html += '													<i class="fas fa-check fa-stack-1x"></i>';
					html += '												</i>';
					html += '											</div>';
					html += '											<div>';
					html += '												<div class="value-name">' + val.label + '</div>';

					if (value_price != '') {
						html += '											<div class="value-price"><span>' + CURRENCY_SYMBOL[CURRENCY].symbol + '</span>' + value_price + '</div>';
					}

					html += '											</div>';
					html += '										</div>';
					html += '									</div>';
				}

				html += '									</div>';
				html += '								</div>';
			}

			html += '								</div>';

			num++;
		}

		html += '								</div>';
		html += '							</div>';
		html += '						</div>';
		html += '					</div>';
		html += '				</div>';
		html += '			</div>';
		html += '		</div>';
		html += '	</div>';
		html += '	<div class="dialog-footer-content">';
		html += '		<div class="text-center wrap-btn clearfix">';

		if ((offer.main_item && !offer.jump_main) || mode == 'select_option' || mode == 'edit_option') {
			html += '		<button class="btn btn-driver" id="submit-offer-option">' + DICT['page']['confirm'] + '</button>';
		} else {
			html += '		<div class="wrap-btn-upsell">';
			html += '			<button type="button" id="submit-offer-option" class="btn btn-driver">' + DICT['offer']['upsell'] + '</button>';
			html += '		</div>';
			html += '		<div class="wrap-btn-downsell">';
			html += '			<button type="button" id="btn-downsell" class="btn btn-cancel">' + DICT['offer']['downsell'] + '</button>';
			html += '		</div>';
		}
		
		html += '		</div>';
		html += '	</div>';
	}

	html += '	</div>';

	$('#dialog-option').html(html);

	if (has_iframe) {
		$('#dialog-option').addClass('fullscreen');
	} else {
		$('#dialog-option').removeClass('fullscreen');
	}

	var el = $('#dialog-option');
	$(el).find('#submit-offer-option').unbind('click');
	$(el).find('#submit-offer-option').click(function () {
		var offer_option = checkOfferOption();
		var btn = $(this);

		if (offer_option) {
			$(btn).button('loading');

			countOfferSellStatus(offer.reward_id, function (res) {

				if (res) {
					if (PAGE_MODE == 'offer') {
					} else if (PAGE_MODE == 'review_offer') {
						$(btn).button('reset');
						submitReviewOffer('check_option');
					} else if (PAGE_MODE == 'sellpage' || PAGE_MODE == 'promote') {
						var params = new Object();
						params.sku = getSelectSKU();

						if (offer.offer_type == 'bundle') {
							params.bundle_option = getOfferBundleOption(offer);
						}

						DRIVER_CART.addItem(offer.reward_id, function () {
							goCheckout();
						}, offer_option, params);
					} else {
						if (mode == 'edit_option') {
							if (offer.main_item) {
								var params = new Object();
								params.sku = getSelectSKU();

								if (offer.offer_type == 'bundle') {
									params.bundle_option = getOfferBundleOption(offer);
								}

								DRIVER_CART.addItem(offer.reward_id, function () {
									hideDialogOfferOption();
									setUpDeliveryInformation('update');
								}, offer_option, params);
							} else {
								$('#checkout-form .checkbox-price[value="' + offer.reward_id + '"]').prop('checked', true).trigger('change');
							}
						} else {
							// if ((offer.has_option) && has_iframe) {
							// 	checkFormPromotion(offer, function () {
							// 		hideDialogOfferOption(function () {
							// 			renderDialogOfferOption(offer, 'select_option');
							// 			showDialogOfferOption();
							// 		});
							// 	});
							// } else if (offer.has_deal) {
							// 	var el_iframe = $('#iframe_inner_page_render').contents().find('.btn-select-offer.active');
							// 	var _option_key = $(el_iframe).attr('data-key');
							// 	var _option_value = $(el_iframe).attr('data-value');
							// 	var _sku = $(el_iframe).attr('data-sku');
							// 	var _offer_option = new Object();
							// 	_offer_option[_option_key] = _option_value;

							// 	var _param = {
							// 		sku: _sku
							// 	};

							// 	checkFormPromotion(offer, function () {
							// 		DRIVER_CART.addItem(offer.reward_id, function () {
							// 			setUpDeliveryInformation('update');
							// 			hideDialogOfferOption();
							// 		}, _offer_option, _param);
							// 	});
							// } else {
							// 	if (has_iframe) {
							// 		checkFormPromotion(offer, function () {
							// 			selectUpSell(offer.reward_id);
							// 			setUpDeliveryInformation('update');
							// 		});
							// 	} else {
							// 		selectUpSell(offer.reward_id);
							// 		setUpDeliveryInformation('update');
							// 	}
							// }
						}
					}
				} else {
					$(btn).button('reset');
				}
			});
		}
	});

	$(el).find('.close').unbind('click');
	$(el).find('.close').click(function () {
		hideDialogOfferOption(function () {
			// if (!offer.main_item && mode != 'edit_option') {
			// 	SELECT_NEXT_SELL = 'downsell';
			// 	selectDownSell(offer.reward_id);
			// }
		});
	});

	// $(el).find('#btn-downsell').click(function () {
	// 	SELECT_NEXT_SELL = 'downsell';
	// 	selectDownSell(offer.reward_id);
	// });

	initEveneLineTouch(function () {
		// if (!offer.main_item && mode != 'edit_option') {
		// 	SELECT_NEXT_SELL = 'downsell';
		// 	selectDownSell(offer.reward_id);
		// }
	});

	initOfferOptionEvent(offer.reward_id, '#offer_option');

	// if (has_iframe) {
	// 	$('#submit-offer-option').removeAttr('disabled');
	// }

	if (mode == 'edit_option') {
		setOfferOption(offer.reward_id);
	}
}

function countOfferSellStatus(item_key, callback) {
	var url = BASE_API + 'v2/products/' + GEN_KEY;

	if (item_key) {
		url += '/' + item_key;
		var _offer = getOfferDetail(item_key);

		if (_offer && _offer.limit_order == 0) {
			if (typeof callback === 'function') {
				callback(true);
			}
			
			return;
		}
	}

	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		error: function (e) {
			if (!item_key) {
				OFFER_SELL_DATA = {};

				if (!DISPLAY_OFFER_STATUS) {
					DISPLAY_OFFER_STATUS = true;
					getOfferOrder();
				}
			}

			if (typeof callback === 'function') {
				callback(false);
			}
		},
		success: function (res) {
			if (item_key) {
				if (res.status == 'success') {
					if (res.data[item_key] && res.data[item_key].limit != 0 && res.data[item_key].sell >= res.data[item_key].limit) {
						showError(DICT['alert']['out_of_stock']);
						callback(false);
					} else {
						if (typeof callback === 'function') {
							callback(true);
						}
					}
				} else {
					showError(DICT['alert']['offer_not_found']);
				}
			} else {
				if (res.status == 'success') {
					OFFER_SELL_DATA = res.data;
				} else {
					OFFER_SELL_DATA = {};
				}

				if (!DISPLAY_OFFER_STATUS) {
					DISPLAY_OFFER_STATUS = true;
					getOfferOrder();
				}
			}
		}
	});
}

// function genSlotUpsell(item_key) {
// 	var offer = getOfferDetail(item_key);

// 	if (offer) {
// 		var html = '';
// 		var txt_price = DICT['offer']['upsell'];

// 		// if (offer.price > 0) {
// 		// 	txt_price = '<span>' + CURRENCY_SYMBOL[CURRENCY].symbol + '</span>' + numberComma(offer.price, 0);
// 		// } else {
// 		// 	txt_price = DICT['offer']['get_free'];
// 		// }

// 		if (!offer.has_html) {
// 			html += '<div class="upsell-inner clearfix center">';
// 			html += '	<div class="box-upsell">';
// 			html += '		<div class="box-content">';
// 			html += '			<div class="section-img">';
// 			html += '				<img src="https://via.placeholder.com/450x225.png">';
// 			html += '			</div>';
// 			html += '			<div class="section-content">';
// 			html += '				<div class="section-title">';
// 			html += '					<div class="section-btn">';
// 			html += '						<button class="btn btn-offer btn-small has-price btn-select-offer" autocomplete="off">' + txt_price + '</button>';
// 			html += '					</div>';
// 			html += '					<div class="upsell-title sellpage-header">' + offer.title + '</div>';
// 			html += '				</div>';
// 			html += '				<div class="section-desc">' + offer.description + '</div>';
// 			html += '				<div class="section-more-detail">';
// 			html += '				</div>';
// 			html += '			</div>';
// 			html += '			<div class="section-btn-more wrapper_row_view_more">';
// 			html += '				<a class="links-driver" href="javascript:void(0);">';
// 			html += '					<span class="links-driver-text">' + DICT['page']['view_more'] + '<i class="far fa-chevron-down" aria-hidden="true"></i></span>';
// 			html += '				</a>';
// 			html += '			</div>';
// 			html += '		</div>';
// 			html += '	</div>';
// 			html += '</div>';
// 			html += '<div class="wrap-btn-downsell">';
// 			html += '	<button id="btn-downsell" class="btn btn-cancel" type="button" autocomplete="off">' + DICT['offer']['downsell'] + '</button>';
// 			html += '</div>';

// 			$('#upsell-container').html(html);
// 		}

// 		try {
// 			$('#upsell-container #btn-downsell').unbind('click');
// 			$('#upsell-container #btn-downsell').click(function () {
// 				window.parent.$('#btn-downsell').click();
// 			});

// 			$('#upsell-container .btn-select-offer').unbind('click');
// 			$('#upsell-container .btn-select-offer').click(function () {
// 				// $('#upsell-container .btn-select-offer').attr('disabled', 'disabled');
// 				// $('#upsell-container #btn-downsell').attr('disabled', 'disabled');
// 				$('#upsell-container .btn-select-offer').removeClass('active');
// 				$(this).addClass('active');
// 				$(this).button('loading');
// 				window.parent.$('#submit-offer-option').click();
// 			});

// 			$('#upsell-container .btn-view-more').unbind('click');
// 			$('#upsell-container .btn-view-more').click(function () {
// 				console.log('click!!!');
// 				var el = $(this).parents('.box-content');

// 				if ($(el).hasClass('open')) {
// 					$(el).removeClass('open');
// 				} else {
// 					$(el).addClass('open');
// 				}
// 			});
// 		} catch (e) {}
// 	}
// }

function ellipsisMultiline() {
	if ($('.hover-group .offer-title span').length > 0) {
		$('.hover-group .offer-title span').dotdotdot({height:42});
	}

	if ($('.block-upsell .upsell-title').length > 0) {
		$('.block-upsell .upsell-title').dotdotdot({height:50});
	}
}

function clearBtnOfferLoading() {
	var elem = document.getElementsByClassName('submit-offer');
	var len = elem.length;

	for (var i = 0; i < len; i++) {
		var btn = elem[i];

		if (btn.hasAttribute('disabled')) {
			btn.removeAttribute('disabled');
		}

		if (btn.classList.contains('btn-loading')) {
			var text = btn.dataset.originalText;

			if (text) {
				btn.innerHTML = text;
			}
		}
	}
}

function checkAlertDiscount() {
	var is_alert = window.localStorage.getItem('DISCOUNT_EXPIRED');

	if (is_alert == 'T') {
		showError(DICT['alert']['discount_expired']);
		window.localStorage.removeItem('DISCOUNT_EXPIRED');
	}
}
