var IS_MOBILE = false;
var IS_TABLET = false;
var process_scroll_nav = false;
var process_scroll_offer = false;
var screenWidth = $(window).width();
var screenHeight = window.innerHeight;
var lastScrollTop = 0;
var VIEW_MORE_COMMENT = true;
var INTERVAL_RESIZE;
var COUNT_INTERVAL_RESIZE = 0;
var BACKUP_DIFF_Y;
var DIALOG_HEIGHT;
var DO_TOUCH_LINE = false;
var BACKUP_TITLE_NAV;
var TIMEOUT_RESIZE_UI_UPDATE;
var TIMEOUT_ON_SCROLL;
var IS_SCROLLING = false;
var START_TOUCH_DIALOG;
var TIMEOUT_HIDE_ALERT_PROMOTION;
var ACCEPT_COOKIE = 0;
var FBIOS = false;
var INTERVAL_GET_COOKIE;
var IntervalCheckLeadUUID;
var AFFILIATE_CODE = '';

if (navigator.userAgent.match(/(FBIOS)/)) {
    FBIOS = true;
}

try {
    if (window.self !== window.top) {
        FBIOS = true;
    }
} catch (e) {}

$( document ).ready(function() {
    AFFILIATE_CODE = getAffiliateCode();
    
    // initLocalStorageIframe();
    
    if (!$("body").hasClass("nav_not_overlay")) {
        process_scroll_nav = true;
    }
    if ($('#right_column .list-offer-item').length > 0) {
        process_scroll_offer = true;
    }
    if ($('#wrap_banner .swiper-container').length > 0) {
        swiper = new Swiper('.swiper-container', {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: false,
            freeMode: false,
            freeModeMomentumRatio: 0.5,
            freeModeMomentumVelocityRatio: 0.5,
            pagination: {
                el:'.swiper-pagination',
                type:'bullets'
            },
            autoplay: {
                delay: 10000 ,
                disableOnInteraction:false
            }
        });
        swiper.on('init', function (new_translate) {
        
        });
        swiper.on('imagesReady', function (new_translate) {

        });
        swiper.on('setTranslate', function (new_translate) {

        });
        swiper.on('transitionStart', function () {
        });
        swiper.on('transitionEnd', function () {
        
        });
        swiper.init();

        if ($('#wrap_banner .swiper-container').length == 1) {
            $("#wrap_banner .swiper-pagination").hide();
        }
    }

    $('.goto_promotion').unbind('click');
    $('.goto_promotion').click(function () {
        document.getElementById("right_column").scrollIntoView();
    });

    $('.goto_offer').unbind('click');
    $('.goto_offer').click(function () {
        var offer_key = $(this).attr("data-offer");
        leadModal(offer_key);
    });

    $( window ).scroll(function(eventData) {
        IS_SCROLLING = true;
        onScrollPage();
        hidePromotionAction();
        clearTimeout(TIMEOUT_ON_SCROLL);
        TIMEOUT_ON_SCROLL = setTimeout(function(){
            IS_SCROLLING = false;
        }, 1000);
    });



    $("#footer .order_number").keypress(function(e) {
        if(e.which == 13) {
            trackOrder('l');
        }
    });
    $("#footer_r .order_number").keypress(function(e) {
        if(e.which == 13) {
            trackOrder('r');
        }
    });

    if($('#wrapper_recently_reviews').length > 0){
        var review_html = '';
        review_html +=  '<div class="wrapper_customer_reviews box-content" style="display:inline-block;margin-top:20px;width:100%;">';
        review_html +=  '<div class="wrapper_customer_reviews_more wrapper_row_view_more" style="display:none;">';
        review_html +=  '<a class="links-driver" href="javascript:getReviewMore(this);"><span class="links-driver-text">'+DICT['page']['view_review_more']+'<i class="far fa-chevron-down"></i></span><span class="links-driver-loader"><i class="fal fa-spinner-third fa-spin"></i></span></a>';
        review_html +=  '</div>';
        review_html +=  '</div>';
        $('#wrapper_recently_reviews').html(review_html);
        getReviews("",5);
    }
    
    $('.btn_back').on('click',function(){
        if($('#lead_form_pannel').hasClass('active')){
            if(ALL_LIST_LEAD_DATA.length == 0){
                window.location.href = window.location.origin;
            } else if (getSaleReferrer() && ALL_LIST_LEAD_DATA.length > 0 && LEAD_FORM_PROCESS == "CREATE"){
                renderListLead();
                $('#secondary_nav').find('.nav_title').text(BACKUP_TITLE_NAV);
            } else if (getSaleReferrer() && $.isEmptyObject(CURRENT_LEAD_DATA)){
                showError("กรุณาเลือกที่อยู่สำหรับจัดส่ง");
                return;
            } else {
                $('#lead_form_pannel').removeClass('active').addClass('hide');
                $('body').removeClass('froce_overflow_hidden');
                if(typeof(BACKUP_TITLE_NAV) != "undefined"){
                   $('#secondary_nav').find('.nav_title').html(BACKUP_TITLE_NAV);
                }
                if (getSaleReferrer() && !$.isEmptyObject(CURRENT_LEAD_DATA)) {
                    setFormLead(CURRENT_LEAD_DATA);
                }
            }
        }else if(document.referrer != ""){
            window.history.back();
        } else {
            window.location.href = window.location.origin;
        }
    });

    setUpdateTimeServer();
    $(window).resize();
    initSocialChatEvent();

    if (PAGE_MODE != 'offer') {
        clearInterval(INTERVAL_RESIZE);
        INTERVAL_RESIZE = setInterval(function () {
            COUNT_INTERVAL_RESIZE++;
            if (!$('#dialog-option').hasClass('active') && !$('body').hasClass('alert_promotion_action')) {
                if (!IS_SCROLLING) {
                    doResize();
                }
            }
            if (COUNT_INTERVAL_RESIZE > 30) {
                clearInterval(INTERVAL_RESIZE);
            }
        }, 1000);
    }

    if (PAGE_MODE == 'promote') {
        $('#btn_buy_now, .swiper-slide').click(function () {
            if (DISPLAY_OFFER_STATUS) {
                var _offer_key = $(this).attr('data-key');
                var _offer = getOfferDetail(_offer_key)
                var can_buy = false;

                if (OFFER_SELL_DATA[_offer_key].limit > 0) { 
                    if (OFFER_SELL_DATA[_offer_key].sell < OFFER_SELL_DATA[_offer_key].limit) {
                        can_buy = true;
                    }
                } else {
                    can_buy = true;
                }
               
                if (_offer) {
                    if (can_buy) {
                        leadModal(_offer_key);
                    } else {
                        showError(DICT['offer']['out_of_stock'], DICT['offer']['sorry']);
                    }
                }
            }
        });
    }

    if(PAGE_MODE == "sellpage"){
        var target_element = $('#footer_page').find('.menu_link[data-path="'+window.location.pathname+'"]');
        if($(target_element).length > 0){
            $(target_element).click();
        }
    }

    $(document).on('click','#alert_promotion_action,#alert_promotion_element',function(){
        hidePromotionAction();
    });

    // initCookiePolicy();

    genSaleReferrerBubble();
    var check_lead_uuid = decodeURI(TXM_AB_COOKIE.getCookie("LeadManageUUID"));
    var split_check = check_lead_uuid.split("|");
    if(check_lead_uuid == "" || split_check.length != 2 || (split_check.length == 2 && split_check[1] != "1")){
        $('head').append('<script src="//'+BASE_MANAGER_LEAD_URL+'/getcookie.js"></script>');
        IntervalCheckLeadUUID = setInterval(setLeadUUID, 1000);
    } else {
        LeadManageUUID = split_check[0]
        loadLeadLocalStorage();
    }
});

function setLeadUUID(){
    if(typeof(LeadManageUUID) != "undefined" && LeadManageUUID != null && LeadManageUUID != ""){
        clearInterval(IntervalCheckLeadUUID);
        TXM_AB_COOKIE.setCookie("LeadManageUUID",LeadManageUUID,365,"","/");
        LeadManageUUID = decodeURI(LeadManageUUID).split("|");
        LeadManageUUID = LeadManageUUID[0];
        loadLeadLocalStorage();
    }
}

function loadLeadLocalStorage(){
    // console.log("loadLeadLocalStorage");
    if (typeof PAGE_MODE !== 'undefined') {
        if ((PAGE_MODE == 'offer' || PAGE_MODE == 'checkouts') && typeof initFormLead === 'function') {

            if(getSaleReferrer()){
                window.localStorage.removeItem("Lead");
                ACCEPT_COOKIE = 1;
                window.localStorage.setItem("cookieAccept", 1);
                iframeLocalstorageReady();
            } else {
                $.ajax({
                    url: BASE_API + 'v2/localstorage/lead/' + LeadManageUUID,
                    type: 'GET',
                    dataType: 'json',
                    error: function (e) {
                        
                    },
                    success: function (res) {
                        if (res['status'] == 'success') {
                            window.localStorage.setItem("Lead", JSON.stringify(res['data']['lead_list']));
                            if(res['data']['lead_list'].length > 0){
                                ACCEPT_COOKIE = 1;
                                window.localStorage.setItem("cookieAccept", 1);
                            }
                            iframeLocalstorageReady();
                        }
                    }
                });
            }
        }
    }
}

$(window).resize(function() {
    updateUI();
    onScrollPage();
    updateAcceptPolicyUI();
    updateSizeBtnChat();
});

function doResize() {
    $(window).resize();
}

function getReviewMore(element){
    $(element).find('.links-driver-text').hide();
    $(element).find('.links-driver-loader').show();
    var last_request = $('.wrapper_customer_reviews').attr('data-last-request');
    getReviews(last_request,5);
    setTimeout(function(){
        $(element).find('.links-driver-text').show();
        $(element).find('.links-driver-loader').hide();
    }, 1000);
}

function updateSizeBtnChat(){
    var screen_width = $(window).width();
    
    $('.element_menu_bar_bottom:last-child').attr('style','');
    $('.element_menu_bar_bottom .btn-capsule-bottom-nav').attr('style','');
    if(screen_width < 768){
        var btn_first = $('.element_menu_bar_bottom:first-child').width();
        var margin = 14;
        var check_btn = btn_first + margin;
        var style_width = 'calc(100% - '+check_btn+'px)';

        if ($('.social-chat-container').hasClass('standalone')) {
            style_width = '100%';
        }   

        $('.element_menu_bar_bottom:last-child').attr('style','width:' + style_width + ';');
        if($('.element_menu_bar_bottom:last-child').height() != $('.element_menu_bar_bottom:first-child').height()){
            var font_size = $('.element_menu_bar_bottom .btn-capsule-bottom-nav').css('font-size');
            font_size = font_size.replace("px","");
            font_size = font_size - 2;
            $('.element_menu_bar_bottom .btn-capsule-bottom-nav').attr('style','font-size: '+font_size+'px');
            $('.element_menu_bar_bottom:last-child').attr('style','');
        }
    }
}

function updateUI() {
    screenWidth = $(window).width();
    screenHeight = window.innerHeight;
    var review_move_content = false;

    if (screenWidth < 570) {
        IS_MOBILE = true;
        $("body").addClass("mobile");
        review_move_content = true;
    } else {
        IS_MOBILE = false;
        $("body").removeClass("mobile");
        review_move_content = false;
    }
    if (screenWidth < 768) {
        IS_TABLET = true;
        $("body").addClass("column_1");
        review_move_content = true;
    } else {
        IS_TABLET = false;
        $("body").removeClass("column_1");
        review_move_content = false;
    }
    onScrollPage();

    if (!STATUS_VIEW_ALL_CONTENT && (IS_MOBILE || IS_TABLET) && $(".read_more_content").length > 0) {
        var MAX_CONTENT_HEIGHT = ($(".read_more_content").offset().top-$("#page_template").offset().top)+50;
        $("#group_read_more").css("max-height",MAX_CONTENT_HEIGHT+"px");

        $("#group_read_more").addClass("hide_some_content");
    } else {
        $("#group_read_more").removeClass("hide_some_content");
        $("#group_read_more").css("max-height","none");
    }

    if(review_move_content){
        if ($('#wrapper_recently_reviews_right .wrapper_customer_reviews').length == 0) {
            var review_box = $('.wrapper_customer_reviews').clone();
            $(review_box).appendTo('#wrapper_recently_reviews_right');
            $('#wrapper_recently_reviews .wrapper_customer_reviews').remove();
        }
    }else {
        if ($('#wrapper_recently_reviews .wrapper_customer_reviews').length == 0) {
            var review_box = $('.wrapper_customer_reviews').clone();
            $(review_box).appendTo('#wrapper_recently_reviews');
            $('#wrapper_recently_reviews_right .wrapper_customer_reviews').remove();
        }
    }

    $('#footer_page').find('.column_link').css('height','auto');
    if(!IS_MOBILE){
        var all_footer_column = $('#footer_page').find('.column_link');
        var max_height_column = 0;
        for (var i = 1; i <= all_footer_column.length; i++) {
            if($(all_footer_column[i]).height() > max_height_column){
                max_height_column = $(all_footer_column[i-1]).height();
            }
            if(IS_TABLET && i%2 == 0){
                $(all_footer_column[i-2]).css('height',max_height_column);
                $(all_footer_column[i-1]).css('height',max_height_column);
                max_height_column = 0;
            }
        }
        if(!IS_TABLET){
            $('#footer_page').find('.column_link').css('height',max_height_column);
        }
    }

    if(COUNT_INTERVAL_RESIZE == 0){
        $('#main_content').attr('style','');
        var main_content_height = $('#main_content').outerHeight() || 0;
        var footer_height = $('#footer_page').outerHeight() || 0;
        var nav_sec_height = $('#secondary_nav').outerHeight() || 0;
        var CookiePokicyBarHeight = $('#cookie_policy_box').outerHeight() || 0;

        if((footer_height+main_content_height+CookiePokicyBarHeight) < screenHeight){
            $('#main_content').css('min-height',screenHeight - (footer_height + CookiePokicyBarHeight));
        }
    }

    // if($('#dialog-option.active.fullscreen').find('.wrap-iframe-content').length > 0){
    //     $("#iframe_inner_page_render").css('height',$('#dialog-option').outerHeight() - ($('#dialog-option').find('.title-bar').outerHeight() + $('#dialog-option').find('.wrap-line-touch').outerHeight()));
    // }

    if ($('#dialog-option.active').length > 0) {
        actionMouseMove(0, 'resize');
    }

    if ($('.social-chat-container').hasClass('active')) {
        var h = 0;

        if ($('#cookie_policy_box').length > 0) {
            h = $('#cookie_policy_box').outerHeight();
        }

        var target_h = 109 + h;
        $('.social-chat-container').find('.social-chat-frame').css({
            'height': 'calc(100% - ' + target_h + 'px)'
        });
    }

    setSizeSocialChat();

    // hide nav brand title
    var wrap_nav_menu = "#wrap_sellpage_nav";
    var nav_children = $(wrap_nav_menu).children();
    var nav_width = $(wrap_nav_menu).width();
    var children_width = 40;
    for (var i = 0; i < nav_children.length; i++) {
        children_width += $(nav_children[i]).outerWidth();
    }
    if(children_width > nav_width){
        $('#wrap_sellpage_nav').find('.title_page').hide();
    } else {
        $('#wrap_sellpage_nav').find('.title_page').show();
    }
}

function updateAcceptPolicyUI(){
    if($("body.has_accpect").length > 0){
        var h = $("#cookie_policy_box").outerHeight();
        $("body").css("padding-top",h+"px");
        $("#secondary_nav").css("margin-top",h+"px");
        if($('.wrap_lead_form_pannel.active').length > 0){
            $('.wrap_lead_form_pannel.active').css('top',h+"px");
        }
    }
}
function showAllContent() {
    STATUS_VIEW_ALL_CONTENT = true;
    $("#group_read_more").removeClass("hide_some_content");
    $("#group_read_more").css("max-height","none");
}

function resetWrapContentMove(targetWrapContentMove) {
    $(targetWrapContentMove).css("position","relative");
    $(targetWrapContentMove).css("top","auto");
    $(targetWrapContentMove).css("bottom","auto");
    $(targetWrapContentMove).css("right","auto");
    $(targetWrapContentMove).css("max-width","none");
}

function resetWrapOfferMove(targetWrapOfferMove) {
    $(targetWrapOfferMove).css("position","relative");
    $(targetWrapOfferMove).css("top","auto");
    $(targetWrapOfferMove).css("bottom","auto");
    $(targetWrapOfferMove).css("left","auto");
}

function onScrollPage() {
    var scrollPos = $(document).scrollTop();

    if (process_scroll_nav) {
        if ($(window).scrollTop() == 0) {
            if ($("#wrap_nav").hasClass("show_bar")) {
                $("#wrap_nav").removeClass("show_bar");
                //$("#wrap_nav .bg_nav").fadeOut(100);
                $("#brand_logo .s_move").hide();
                $("#brand_logo .s_top").show();
            }
        } else {
            if (!$("#wrap_nav").hasClass("show_bar")) {
                $("#wrap_nav").addClass("show_bar");
                $("#brand_logo .s_top").hide();
                //$("#wrap_nav .bg_nav").fadeIn(100);
                $("#brand_logo .s_move").show();
            }
        }
        var percent = scrollPos/200;
        if (percent > 1) {
            percent = 1;
        }
        $("#wrap_nav .bg_nav").css("opacity",percent);
        $("#wrap_nav .bg_nav").show();
    }
    if (process_scroll_offer) {
        if ($('#right_column').height() > 0) {
            var st = window.pageYOffset || document.documentElement.scrollTop; 
            var direction = "";
            if (st > lastScrollTop){
              direction = "down";
            } else {
              direction = "up";
            }
            lastScrollTop = st <= 0 ? 0 : st;
            //console.log("direction : "+direction);

            var targetMainContent = $('#main_content');
            var targetWrapOfferMove = $('#right_column');
            var targetWrapContentMove = $('#left_column');
            var targetOffer = $('#right_column .list-offer-item');
            var targetContent = $('#left_column');
            var targetNev = $('#main_nav');
            var targetFooter = $('#footer_page');
            var spacePadding = 20;
            var CookiePokicyBarHeight = $('#cookie_policy_box').outerHeight() || 0;

            if ($("body").hasClass("column_1")) {
                //console.log("DO Case1");
                resetWrapOfferMove(targetWrapOfferMove);
                resetWrapContentMove(targetWrapContentMove);
            } else {
                if (parseInt($(targetWrapOfferMove).innerHeight()+$(targetNev).innerHeight()+CookiePokicyBarHeight+spacePadding) < parseInt(screenHeight)) {
                    if (parseInt(scrollPos+spacePadding+$(targetNev).innerHeight()) > parseInt($(targetContent).offset().top)) {
                        //console.log("DO Case2");

                        var diff = 0; 
                        if ($(targetFooter).length == 1 && parseInt(scrollPos+$(targetWrapOfferMove).innerHeight()+CookiePokicyBarHeight+(spacePadding*2)) > parseInt($(targetFooter).offset().top)) {
                            diff = (scrollPos+$(targetWrapOfferMove).innerHeight()+CookiePokicyBarHeight+(spacePadding*2))-($(targetFooter).offset().top);
                        }
                        resetWrapContentMove(targetWrapContentMove);

                        $(targetWrapOfferMove).css("position","fixed");
                        $(targetWrapOfferMove).css("top",($(targetNev).innerHeight()+CookiePokicyBarHeight+(spacePadding-diff))+"px");
                        $(targetWrapOfferMove).css("bottom","auto");
                        $(targetWrapOfferMove).css("left",($(targetContent).offset().left+$(targetContent).innerWidth())+"px");
                    } else {
                        //console.log("DO Case3");

                        resetWrapOfferMove(targetWrapOfferMove);
                        resetWrapContentMove(targetWrapContentMove);
                    }
                } else {
                    //console.log("Case41 : "+scrollPos+" : "+($(targetContent).offset().top)+" : "+($(targetWrapOfferMove).offset().top));
                    if ((direction == "down" && parseInt(scrollPos+screenHeight) > parseInt($(targetContent).offset().top+$(targetWrapOfferMove).innerHeight()+spacePadding)) || (direction == "up" && parseInt($(targetContent).offset().top) < parseInt($(targetWrapOfferMove).offset().top))) {
                        //console.log("Case42");
                        if (parseInt(scrollPos+screenHeight) > parseInt($(targetContent).offset().top+$(targetContent).innerHeight()+spacePadding)) {
                            //console.log("Case43");
                            if ($(targetFooter).length == 1 && scrollPos+screenHeight > $(targetFooter).offset().top) {
                                resetWrapContentMove(targetWrapContentMove);

                                //var diff = (scrollPos+screenHeight)-$(targetFooter).offset().top;
                                $(targetWrapOfferMove).css("position","absolute");
                                $(targetWrapOfferMove).css("top","auto");
                                $(targetWrapOfferMove).css("bottom",0);
                                $(targetWrapOfferMove).css("left",($(targetContent).innerWidth())+"px");
                            } else {
                                //console.log("DO Case45");

                                resetWrapContentMove(targetWrapContentMove);
                            }
                        } else {
                            if (direction == "up") {
                                //console.log("Case8 : "+parseInt(scrollPos)+" : "+parseInt($(targetWrapOfferMove).offset().top-spacePadding));

                                if (parseInt(scrollPos) > Math.ceil($(targetWrapOfferMove).offset().top-spacePadding)) {
                                    if ($(targetWrapOfferMove).css("position") == "fixed") {
                                        var top = $(targetWrapOfferMove).offset().top-$(targetWrapContentMove).offset().top;

                                        resetWrapContentMove(targetWrapContentMove);

                                        //console.log("DO Case82 : ");
                                        $(targetWrapOfferMove).css("position","absolute");
                                        $(targetWrapOfferMove).css("top",top);
                                        $(targetWrapOfferMove).css("bottom","auto");
                                        $(targetWrapOfferMove).css("left",($(targetContent).innerWidth())+"px");
                                    }
                                } else {
                                    var diff = 0; 
                                    if ($(targetFooter).length == 1 && parseInt(scrollPos+$(targetWrapOfferMove).innerHeight()+CookiePokicyBarHeight+(spacePadding*2)) > parseInt($(targetFooter).offset().top)) {
                                        diff = (scrollPos+$(targetWrapOfferMove).innerHeight()+CookiePokicyBarHeight+(spacePadding*2))-($(targetFooter).offset().top);
                                    }
                                    //console.log("DO Case83 : "+($(targetNev).innerHeight()+CookiePokicyBarHeight+(spacePadding-diff)));

                                    resetWrapContentMove(targetWrapContentMove);

                                    $(targetWrapOfferMove).css("position","fixed");
                                    $(targetWrapOfferMove).css("top",($(targetNev).innerHeight()+CookiePokicyBarHeight+(spacePadding-diff))+"px");
                                    $(targetWrapOfferMove).css("bottom","auto");
                                    $(targetWrapOfferMove).css("left",($(targetContent).offset().left+$(targetContent).innerWidth())+"px");
                                }
                            } else {
                                if (direction == "down") {
                                    var val1 = parseInt(scrollPos+screenHeight);
                                    var val2 = Math.ceil($(targetWrapOfferMove).offset().top+$(targetWrapOfferMove).innerHeight()+spacePadding);
                                    //console.log("Case5 : "+val1+" : "+val2);
                            
                                    if (val1 < val2) {
                                        if ($(targetWrapOfferMove).css("position") == "fixed") {
                                            if (Math.abs(val1-val2) > 2) {
                                                var top = $(targetWrapOfferMove).offset().top-$(targetWrapContentMove).offset().top;

                                                resetWrapContentMove(targetWrapContentMove);

                                                //console.log("DO Case52 : ");
                                                $(targetWrapOfferMove).css("position","absolute");
                                                $(targetWrapOfferMove).css("top",top);
                                                $(targetWrapOfferMove).css("bottom","auto");
                                                $(targetWrapOfferMove).css("left",($(targetContent).innerWidth())+"px");
                                            }
                                        }
                                    } else {
                                        resetWrapContentMove(targetWrapContentMove);

                                        //console.log("DO Case53");


                                        $(targetWrapOfferMove).css("position","fixed");
                                        $(targetWrapOfferMove).css("top","auto");
                                        $(targetWrapOfferMove).css("bottom",spacePadding+"px");
                                        $(targetWrapOfferMove).css("left",($(targetContent).offset().left+$(targetContent).innerWidth())+"px");
                                    }

                                }
                            }
                        }
                    } else {
                        
                        if (parseInt($(targetWrapOfferMove).innerHeight()) > parseInt($(targetContent).innerHeight()) && parseInt(scrollPos+screenHeight) > parseInt($(targetOffer).offset().top+$(targetContent).innerHeight()+spacePadding)) {
                            //console.log("DO Case6");
                            resetWrapContentMove(targetWrapContentMove);

                            $(targetWrapContentMove).css("position","fixed");
                            $(targetWrapContentMove).css("top","auto");
                            $(targetWrapContentMove).css("bottom",spacePadding+"px");
                            $(targetWrapContentMove).css("right",(screenWidth - $(targetWrapOfferMove).offset().left)+"px");
                            $(targetWrapContentMove).css("max-width", $(targetMainContent).innerWidth()-$(targetWrapOfferMove).innerWidth());
                        } else {
                            resetWrapOfferMove(targetWrapOfferMove);
                            resetWrapContentMove(targetWrapContentMove);
                            
                            //console.log("DO Case7");
                        }
                    }
                }
            }
        }
    }

    checkContackButton();
    setSaleReferrerBubble();
}

function checkContackButton() {
    var is_open = false;

    if ($('.dropdown-social-chat').hasClass('show') || $('.social-chat-container').hasClass('active')) {
        is_open = true;
    }

    if ($('.social-chat-container').length > 0 && !is_open) {
        var check = $('#sellpage_nav').offset().top - $(window).scrollTop() + $('#sellpage_nav').height();
        var open_chat = '';

        if (check > 0) {
            if ($('.social-chat-container').hasClass('active')) {
                open_chat = 'dropdown';
                hideChatTool();
            }

            $('.social-chat-container').removeClass('visible');
        } else {
            if ($('.dropdown-social-chat').hasClass('show')) {
                open_chat = 'button';
                hideDropdownSocialChat();
            }

            $('.social-chat-container').addClass('visible');
        }

        if (open_chat == 'dropdown') {
            openDropdownSocialChat();
        } else if (open_chat == 'button') {
            openChatTool();
        }
    }
    updateSizeBtnChat();
}

function trackOrder(p){
    var target;
    if (p == 'l') {
        target = $("#footer .order_number");
        var order_number = $(target).val();
    }else{
        target = $("#footer_r .order_number");
        var order_number = $(target).val();
    }
    
    $(target).parent().parent().removeClass("has-error");
    if (order_number == "") {
        $(target).parent().parent().addClass("has-error");
        return;
    }else{
        var url = "/tracking?o="+order_number;
        window.location = url;
    }
}

function getReviews(last_request,limit) {
    if (!VIEW_MORE_COMMENT) {
        return;
    }

    VIEW_MORE_COMMENT = false;
    var url = BASE_API + 'v2/review?page_id=' + GEN_KEY;
    url += "&limit=" + limit;
    if (last_request != "") {
        url += "&last=" + last_request;
    }

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        error: function(e) {
            VIEW_MORE_COMMENT = true;
            $('#wrapper_recently_reviews').html("");
        },
        success: function(res) {
            VIEW_MORE_COMMENT = true;
            if (res['status'] == 'success') {
                if(res['data']['total_rating'] == 0){
                    $('#wrapper_recently_reviews').html("");
                } else {
                    genReview(res['data'], last_request, limit);
                }
            } else {
                // showError(res);
                $('#wrapper_recently_reviews').html("");
            }
        }
    });
}

function genReview(data, last_request, limit) {
    var review_list = data.review_list;
    var html = "";
    if (last_request == "") {

        var sum_score = 0;
        var num_review = data['total_rating'];
        var sum_group = data.sum_rating;
        for (var x in sum_group) {
            var value = x.split("_");
            sum_score += sum_group[x] * value[1];
        }
        var score_avg = Math.round((sum_score / num_review) * 10) / 10;

        html += '<div id="wrap_review" class="clearfix" style="margin: 0 auto;">' +
            '<div id="review_summary" class="review_summary clearfix" style="margin-bottom:30px;">' +
            '<div class="head_section sellpage-content-header" style="margin-top:10px;">' + DICT["page"]['ratings'] + '</div>' +
            '<div id="body_review_summary">' +
            '<div class="wrap_avg_val"><span class="avg_val">' + score_avg + '</span><span class="max_val">/5</span></div>' +
            '<span class="score big">' +
            '<div class="score-wrap" style="width:' + (5 * 33.75) + 'px;">' +
            '<span class="stars-active" style="width:' + (score_avg * 33.75) + 'px;">' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '</span>' +
            '<span class="stars-inactive">' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '</span>' +
            '</div>' +
            '</span>' +
            '</div>' +
            '<div id="stat_review_summary">' +
            '<table>';
        for (var i = 5; i >= 1; i--) {
            var score_value = sum_group["score_" + i] || 0
            html += '<tr>' +
                '<td class="col1">' +
                '<span class="score">' +
                '<div class="score-wrap" style="width:' + (5 * 13.5) + 'px;">' +
                '<span class="stars-active" style="width:' + (i * 13.5) + 'px;">' +
                '<i class="fas fa-star" aria-hidden="true"></i>' +
                '<i class="fas fa-star" aria-hidden="true"></i>' +
                '<i class="fas fa-star" aria-hidden="true"></i>' +
                '<i class="fas fa-star" aria-hidden="true"></i>' +
                '<i class="fas fa-star" aria-hidden="true"></i>' +
                '</span>' +
                '<span class="stars-inactive">' +
                '<i class="fal fa-star" aria-hidden="true"></i>' +
                '<i class="fal fa-star" aria-hidden="true"></i>' +
                '<i class="fal fa-star" aria-hidden="true"></i>' +
                '<i class="fal fa-star" aria-hidden="true"></i>' +
                '<i class="fal fa-star" aria-hidden="true"></i>' +
                '</span>' +
                '</div>' +
                '</span>' +
                '</td>' +
                '<td class="col2">' +
                '<div class="bg_progress">' +
                '<div class="status_progress" style="width:' + ((score_value / num_review) * 100) + '%;"></div>' +
                '</div>' +
                '</td>' +
                '<td class="col3">' + score_value + '</td>' +
                '</tr>';
        }
        html += '</table>' +
            '</div>' +
            '</div>';
    }

    for (var i = 0; i < review_list.length; i++) {

        var review_data = review_list[i]
        var txt_verify = "";
        var avartar_url = "";
        if (review_data['customer']['image_url'] != null && typeof(review_data['customer']['image_url']) != "undefined" && review_data['customer']['image_url'] != "") {
            txt_verify = '&nbsp;<span class="txt_verify"><i class="fas fa-check-circle"></i>&nbsp;' + DICT["page"]['verify_purchase'] + '</span>';
            avartar_url = '<img class="avatar" src="' + review_data['customer']['image_url'] + '" />';
        } else {
            if (review_data['customer']['social_provider'] == "facebook") {
                avartar_url = '<img class="avatar" src="https://graph.facebook.com/' + review_data['customer']['social_id'] + '/picture?width=300&height=300" />';
            } else {
                var temp_name = review_data['customer']['name'].match(/[a-zA-Zก-ฮ]/)
                avartar_url = '<div class="avatar_name" style="background-color:' + randomAvartarName() + '">' + temp_name[0] + '</div>';
            }
        }

        html += '<div class="slot_review clearfix">' +
            '<table style="table-layout: fixed;width:100%;"><tr><td width="70">' +
            '<div>' +
            avartar_url +
            '</div>' +
            '</td><td>' +
            '<div style="position:relative;">' +
            '<div>' +
            '<div>' +
            '<span class="name">' + review_data['customer']['name'] + '</span> ' + txt_verify + '</div>' +
            '<div><span class="score">' +
            '<div class="score-wrap" style="width:' + (5 * 13.5) + 'px;">' +
            '<span class="stars-active" style="width:' + (review_data['rating'] * 13.5) + 'px;">' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '<i class="fas fa-star" aria-hidden="true"></i>' +
            '</span>' +
            '<span class="stars-inactive">' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '<i class="fal fa-star" aria-hidden="true"></i>' +
            '</span>' +
            '</div>' +
            '</span>' +
            relativeDate(review_data['created_date']) +
            '</div></div>' +
            '<span class="msg">' + review_data['message'] + '</span>' +
            '</div>' +
            '</td>' +
            '</tr></table>' +
            '</div>';
    }

    if (last_request == "") {
        html += '</div>';
        $('.wrapper_customer_reviews').prepend(html);
    } else {
        $(html).hide().appendTo("#wrap_review").fadeIn(400,function(){
            $(window).resize();
        });
    }

    $('.wrapper_customer_reviews').attr('data-last-request', data['last_request']);
    
    if($('#wrapper_recently_reviews').length > 0){
        $('#wrap_review').attr('style','width:100%;background-color:#fff;padding:20px 30px;');
    }

    if(data['review_list'].length < limit || data['last_request'] == ""){
        VIEW_MORE_COMMENT = false;
        $('.wrapper_customer_reviews_more').hide();
    } else {
        setTimeout(function(){
            $('.wrapper_customer_reviews_more').show();
        }, 400);
    }
}

function genNoReview() {
    // $('.wrapper_customer_reviews').html("No Data");
}

function randomAvartarName() {
    var rancOlor = Math.floor(Math.random() * 16777215).toString(16)
    if (rancOlor.length != 6) {
        randomAvartarName()
    }
    return '#' + rancOlor;
}

function relativeDate(_date) {
    if (_date === undefined || _date == "") {
        return "";
    }
    var delta = deltaDate(_date);
    var minute = 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7,
        month = day * 30,
        year = month * 12;

    var response;
    if (delta < 0) {
        return '<span class="relative-date">' + jsFormatDatetime(_date).replace("{clock}", " ") + '</span>';
    }
    if (delta < 60) {
        response = replaceTextWithDict('common_just_now');
    } else if (delta < 2 * minute) {
        response = replaceTextWithDict("common_last_minute", 1);
    } else if (delta < hour) {
        response = replaceTextWithDict("common_last_minute", Math.floor(delta / minute), "s");
    } else if (Math.floor(delta / hour) == 1) {
        response = replaceTextWithDict("common_last_hour", 1);
    } else if (delta < day) {
        response = replaceTextWithDict("common_last_hour", Math.floor(delta / hour), "s");
    } else if (delta < day * 2) {
        response = replaceTextWithDict("common_yesterday");
    // } else if (Math.floor(delta / week) == 1) {
    //     response = replaceTextWithDict("common_week", 1);
    } else if (delta < month) {
        // var tmp_date = Math.floor(delta / day);
        // if (tmp_date % 7 == 0) {
        //     response = replaceTextWithDict("common_week", Math.floor(tmp_date / 7), "s");
        // } else {
            response = replaceTextWithDict("common_last_day", Math.floor(delta / day), "s");
        // }
    } else if (Math.floor(delta / month) == 1) {
        response = replaceTextWithDict("common_last_month", 1);
    } else if (delta < year) {
        response = replaceTextWithDict("common_last_month", Math.floor(delta / month), "s");
    } else if (Math.floor(delta / year) == 1) {
        response = replaceTextWithDict("common_last_year", 1);
    } else if (delta / year > 1) {
        response = replaceTextWithDict("common_last_year", Math.floor(delta / year), "s");
    } else {
        response = jsFormatDatetime(_date).replace("{clock}", " ");
    }
    response = '<span class="relative-date" title="' + removeQuote(jsFormatDatetime(_date)).replace("{clock}", " ") + '">' + response + '</span>';
    return response;
}

function jsFormatDatetime(datetime_data,days,mode,start_day) {
    var r1 = datetime_data.split(' ');
    var r2 = r1[0].split('-');
    var have_time = false;
    if(r1[1]){
        var r3 = r1[1].split(':');
        have_time = true;
    }

    var month_mode = "";
    if(mode == "timestamp"){
        month_mode = "_full";
    }
    var check_start_date = false;
    if(start_day === true){
        check_start_date = true;
    }

    var monthTH = [];
    monthTH["01"] = DICT['page']['month_1'+month_mode];
    monthTH["02"] = DICT['page']['month_2'+month_mode];
    monthTH["03"] = DICT['page']['month_3'+month_mode];
    monthTH["04"] = DICT['page']['month_4'+month_mode];
    monthTH["05"] = DICT['page']['month_5'+month_mode];
    monthTH["06"] = DICT['page']['month_6'+month_mode];
    monthTH["07"] = DICT['page']['month_7'+month_mode];
    monthTH["08"] = DICT['page']['month_8'+month_mode];
    monthTH["09"] = DICT['page']['month_9'+month_mode];
    monthTH["10"] = DICT['page']['month_10'+month_mode];
    monthTH["11"] = DICT['page']['month_11'+month_mode];
    monthTH["12"] = DICT['page']['month_12'+month_mode];

    var daysTH = [];
    daysTH["00"] = DICT['page']['days_7'];
    daysTH["01"] = DICT['page']['days_1'];
    daysTH["02"] = DICT['page']['days_2'];
    daysTH["03"] = DICT['page']['days_3'];
    daysTH["04"] = DICT['page']['days_4'];
    daysTH["05"] = DICT['page']['days_5'];
    daysTH["06"] = DICT['page']['days_6'];

    var day = r2[2];
    if (/^0(\d+)$/.test(day)) {
        day = day.slice(-1)
    }
    var date_string = "";

    if(mode == "timestamp"){
        if (LANG == "th") {
            date_string =  daysTH[days] + ' ' + day + ' ' + monthTH[r2[1]];
            if(!check_start_date){
                date_string += ' ' + (parseInt(r2[0]) + 543);
            }
        } else {
            date_string =  daysTH[days] + ' ' + day + ' ' + monthTH[r2[1]];
            if(!check_start_date){
                date_string += ', ' + parseInt(r2[0]);
            }
        }
    } else {
        if (LANG == "th") {
            date_string =  day + ' ' + monthTH[r2[1]] + ' ' + (parseInt(r2[0]) + 543);
        } else {
            date_string =  monthTH[r2[1]] + ' ' + day + ', ' + parseInt(r2[0]);
        }
    }

    if(have_time){
        date_string += '{clock}' + r3[0] + ':' + r3[1];
    }

    return date_string;
}

function deltaDate(start) {
    start = start.replace(/\-/g, '/');
    end = $('.element_system_time').attr('data-system-time');
    return Math.round((+new Date(end) - +new Date(start)) / 1000);
}

function removeQuote(str) {
    if (str === undefined) {
        return "";
    }
    str = str.split('\'').join("");
    str = str.split('\"').join("");
    return str;
}

function setUpdateTimeServer(){
    var interval = 60000;
    setInterval(function(){
        var temp_time = new Date($('.element_system_time').attr('data-system-time')).getTime() + interval;
        $('.element_system_time').attr('data-system-time',new Date(temp_time));
    }, interval);
}

function replaceTextWithDict(){
    var args_num = arguments.length;
    var message = "";
    if (typeof DICT['page'][arguments[0]] !== 'undefined') {
        message = DICT['page'][arguments[0]];
        if (args_num > 1) {
            for (var i = 0; i < args_num; i++) {
                if (i == 0) {
                    continue;
                }
                message = message.replace("{" + i + "}", arguments[i]);
            }
        }
    }
    message = message.replace(/{[0-9]+}/gm, "");
    return message;
}

/* Shared Local storage */

function saveLocalStorage(key,data,callback){
    // const iframe = document.getElementById('iframe-local-storage');
    // iframe.contentWindow.postMessage({
    //     action: 'save',
    //     key: key,
    //     value: data,
    //     callback:callback,
    //     init_mode: init_mode
    // },'*');

    if(key == "Lead" && getSaleReferrer()){
        key = "LeadSale";
    }
    
    window.localStorage.setItem(key, JSON.stringify(data));
    if (typeof callback === 'function') {
        callback(data);
    }
}

function returnLocalStorage(data){
    ACCEPT_COOKIE = data;
}

function getLocalStorage(key,callback){
    // console.log("getLocalStorage");
    // const iframe = document.getElementById('iframe-local-storage');
    // iframe.contentWindow.postMessage({
    //     action: 'get',
    //     key: key,
    //     callback:callback
    // },'*');

    if(key == "Lead" && getSaleReferrer()){
        key = "LeadSale";
    }

    var data = JSON.parse(window.localStorage.getItem(key));
    if (typeof callback === 'function') {
        // console.log('callback doimg');
        callback(data);
    }
}

window.addEventListener("message", messageHandler, false);

function messageHandler(event) {
    const { action, key, value } = event.data;

    if (action == 'setLineData') {
        if (typeof setLineData === 'function') {
            setLineData(value);
        }
    }
}

// function initLocalStorageIframe(){
//     var html = '<iframe id="iframe-local-storage" style="display:none;" src="//'+BASE_MANAGER_LEAD_URL+'/manager" onload="iframeLocalstorageReady();"></iframe>';
//     $("body").append(html);
// }

function iframeLocalstorageReady() {
    // console.log("iframeLocalstorageReady");
    if (typeof PAGE_MODE !== 'undefined') {
        if ((PAGE_MODE == 'offer' || PAGE_MODE == 'checkouts') && typeof initFormLead === 'function') {
            if($('#lead-form-information').length > 0){
                initCustomerInformation();
            } else {
                initFormLead();
            }
        }
    }
}
/* ---- Location Handle ----*/

function callbackGetAddr(data){
    console.log('callbackGetAddr',data);
}

function initGeolocation(callback){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            handlePosition(position,callback);
        },function(error) {
            console.log('error',error);
            if (error.code == error.PERMISSION_DENIED){
                getmanualIP(callback);
            }
        });
    }
}

function handlePosition(position,callback) {
    getaddress(position.coords.latitude,position.coords.longitude,callback);
}

function getmanualIP(callback){

    $.ajax({
        url: BASE_API + 'v2/lead/location',
        type : "get",
        dataType : "json",
        error: function (e) {
        },
        success: function (res) {
            if (res.data != null) {
                if (res.data.latitude != null && res.data.longitude != null) {
                    getaddress(res.data.latitude,res.data.longitude,callback)
                }
            }
                
        }
    });
}

function getaddress(lat,lon,callback){
    var apikey = "AIzaSyAjJ--H3TAq9h8Nk7riX4Y4DVboBv0a0zQ";
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?language='+LANG+'&latlng='+lat+','+lon+'&key='+apikey+'',
        type : "post",
        dataType : "json",
        error: function (e) {
        },
        success: function (res) {
            var addr_data = parserAddress(res);
            callback(addr_data);
        }
    });
}


function parserAddress(data){
    var res = null;
    if (data.status == "OK") {
        if (data.results.length > 0) {
            res = {};
            var obj = data.results[0];
            for (var i = 0; i < obj.address_components.length; i++) {
                var addr_component = obj.address_components[i];
                var types = addr_component.types;
                if (types.indexOf("postal_code") != -1) {
                    res.postal_code = addr_component.long_name;
                }else if (types.indexOf("country") != -1) {
                    res.country = addr_component.long_name;
                }else if (types.indexOf("administrative_area_level_1") != -1) {
                    res.province = addr_component.long_name;
                }else if (types.indexOf("sublocality_level_1") != -1) {
                    var v = addr_component.long_name;
                    v = v.replace("เขต ","เขต");
                    v = v.replace("Khet  ","");
                    v = v.replace("Amphoe ","");
                    res.district = v;
                }else if (types.indexOf("sublocality_level_2") != -1) {
                    var v = addr_component.long_name;
                    v = v.replace("แขวง ","");
                    v = v.replace("Khwaeng ","");
                    res.subdistrict = v;
                }
            }
        }
    }
    if (res != null) {
        if (res.province) {
            var province = [res.province];
            var filteredArray = filterAddr(res.province,'province');
            if (filteredArray.length > 0) {
                res.province_id = filteredArray[0].id;
            }
        }
        if (res.district) {
            var filteredArray = filterAddr(res.district,'amphur');
            if (filteredArray.length > 0) {
                res.amphur_id = filteredArray[0].id;
            }
        }
        if (res.subdistrict) {
            var filteredArray = filterAddr(res.district,'district');
            if (filteredArray.length > 0) {
                res.district_id = filteredArray[0].id;
            }
        }
        
    }
    return res;
}


function filterAddr(v,k){
    // var f = [v];
    // var filteredArray = country_data[k].filter(function(itm){
    //     return f.indexOf(itm.nm) > -1;
    // });
    // return filteredArray;
    return [];
}
/* ---- End - Location Handle ----*/

var TIMEOUT_READY_CHAT;
var TIMEOUT_READY_CHAT2;

function initSocialChatEvent() {
    $('.social-chat-frame input[name="contact_no"]').inputFilter(function(value) {
        return /^\d*$/.test(value);
    });

    if ($('.social-chat-container').length > 0) {
        var el = $('.social-chat-container');
        // $(el).find('.btn-social-chat').unbind('click');
        $(el).find('.btn-social-chat').click(function () {
            $(el).removeClass('ready');
            $(el).removeClass('done');

            $(el).find('.item-fade').removeClass('ready');

            if ($(el).hasClass('active')) {
                $(el).removeClass('active');
                $(el).find('.chat-body, .chat-header').removeClass('tel');
                checkContackButton();
            } else {
                if (ENABLE_FB_PIXEL == "T") {
                    fbq('trackCustom', 'Page-inbox');
                }
                openChatTool();
            }
        });

        $(el).find('.chat-chanel-item > div.d-table').unbind('click');
        $(el).find('.chat-chanel-item > div.d-table').click(function () {
            var chanel = $(this).parents('.chat-chanel-item').attr('data-chanel');
            var target = '';

            if (chanel == 'line' || chanel == 'fb_messenger') {
                target = $(this).parents('.chat-chanel-item').attr('data-target');
            }

            if (target != '') {
                if (chanel == 'fb_messenger' && AFFILIATE_CODE != '') {
                    target = target + '?ref=' + AFFILIATE_CODE;
                }

                window.open(target, '_blank');
            }
        });

        $(el).find('.chat-body').unbind('scroll');
        $(el).find('.chat-body').scroll(function () {
            if ($(el).hasClass('active') && !$(el).find('.chat-body').hasClass('tel')) {
                var scrollTop = $(el).find('.chat-body').scrollTop() + 70;
                var header_content_height = $(el).find('.chat-header-content').height();
                var target_height = $(el).find('.chat-header').outerHeight() - parseInt(header_content_height);
                var diff = scrollTop - target_height;
                var y = 0
                var opacity = 1;
                
                if (diff > 0) {
                    y = diff * -1;
                    opacity = ((parseInt(diff) * 100) / parseInt($(el).find('.chat-header').outerHeight())) / 100;
                    opacity = 0.6 - opacity;
                }

                $(el).find('.chat-header-content').css({
                    'transform': 'translateY(' + y + 'px)',
                    'opacity': opacity
                });
            }
        });

        $(el).find('.btn-submit-contact').unbind('click');
        $(el).find('.btn-submit-contact').click(function () {
            sendEmailContact('btn', $(this));
        });

        $(el).find('.btn-close-chat').unbind('click');
        $(el).find('.btn-close-chat').click(function () {
            if ($(el).hasClass('active')) {
                hideChatTool();
            }
        });
    }

    if ($('.dropdown-social-chat').length > 0) {
        var el_dropdown = $('.dropdown-social-chat');

        // $('#btn_nav_contact').unbind('click');
        $('#btn_nav_contact').click(function () {

            $(el_dropdown).removeClass('ready');
            $(el_dropdown).removeClass('done');
            $(el_dropdown).find('.item-fade').removeClass('ready');

            if ($('.dropdown-contact-container').hasClass('show')) {
                hideDropdownSocialChat();
            } else {
                if (ENABLE_FB_PIXEL == "T") {
                    fbq('trackCustom', 'Page-inbox');
                }
                openDropdownSocialChat();

                var wh = $(window).height();
                var offset_top = $('.dropdown-social-chat').offset().top - $(window).scrollTop();

                if (offset_top >= wh / 2) {
                    $('html, body').animate({
                        scrollTop: $('#btn_nav_contact').offset().top
                    }, 100);
                }
            }
        });

        $(el_dropdown).find('.chat-chanel-item > div.d-table').unbind('click');
        $(el_dropdown).find('.chat-chanel-item > div.d-table').click(function () {
            var chanel = $(this).parents('.chat-chanel-item').attr('data-chanel');
            var target = '';

            if (chanel == 'line' || chanel == 'fb_messenger') {
                target = $(this).parents('.chat-chanel-item').attr('data-target');
            }

            if (target != '') {
                if (chanel == 'fb_messenger' && AFFILIATE_CODE != '') {
                    target = target + '?ref=' + AFFILIATE_CODE;
                }

                window.open(target, '_blank');
            }
        });

        $(el_dropdown).find('.btn-submit-contact').unbind('click');
        $(el_dropdown).find('.btn-submit-contact').click(function () {
            sendEmailContact('dropdown', $(this));
        });

        $(el_dropdown).find('.btn-close-chat').unbind('click');
        $(el_dropdown).find('.btn-close-chat').click(function () {
            if ($(el_dropdown).hasClass('show')) {
                hideDropdownSocialChat();
            }
        });
    }

    $(document).click(function (e) {
        if ($('.dropdown-social-chat').hasClass('show') && 
            !$(e.target).hasClass('dropdown-social-chat') && 
            $(e.target).parents('.dropdown-social-chat').length == 0 && 
            $(e.target).attr('id') != 'btn_nav_contact' && 
            $(e.target).parents('#btn_nav_contact').length == 0 && 
            !$(e.target).hasClass('icon-submit-contact') 
        ) {
            hideDropdownSocialChat();
        }

        if ($('.social-chat-container').hasClass('active') && 
            !$(e.target).hasClass('social-chat-frame') && 
            $(e.target).parents('.social-chat-frame').length == 0 && 
            !$(e.target).hasClass('btn-social-chat') && 
            $(e.target).parents('.btn-social-chat').length == 0 && 
            !$(e.target).hasClass('icon-submit-contact') 
        ) {
            hideChatTool();
        }
    });
}

function openDropdownSocialChat() {
    var el_dropdown = $('.dropdown-social-chat');
    $('.dropdown-contact-container, .dropdown-social-chat').addClass('show');
    $(el_dropdown).find('.chat-chanel-item[data-chanel="tel"]').removeClass('show-input-name');
    $(el_dropdown).find('.social-chat-frame').removeClass('show-response');
    $(el_dropdown).find('.form-response').html('');
    $(el_dropdown).find('.chat-header-inner[data-content="response"]').html('');

    clearTimeout(TIMEOUT_READY_CHAT);

    TIMEOUT_READY_CHAT = setTimeout(function () {
        $(el_dropdown).addClass('ready');
        $(el_dropdown).find('.item-fade').addClass('ready');

        clearTimeout(TIMEOUT_READY_CHAT2);
        TIMEOUT_READY_CHAT2 = setTimeout(function () {
            $(el_dropdown).addClass('done');
        }, 200);
    }, 120);

    setPositionDropdownChat();
    checkContackButton();
}

function hideDropdownSocialChat() {
    $('.dropdown-contact-container, .dropdown-social-chat').removeClass('show');
    
    var el = $('.dropdown-social-chat');
    $(el).find('.has-error').removeClass('has-error');
    $(el).find('.chat-body, .chat-header').removeClass('tel');
    $(el).find('.form_input').val('');
    $(el).removeAttr('style');
    $(el).find('.social-chat-frame').removeAttr('style');
    $(el).removeClass('ready');
    $(el).removeClass('done');
    checkContackButton();
}

function setSizeSocialChat() {
    var el = '';
    var css = '';
    var h = '';

    if ($('.social-chat-container').hasClass('active')) {
        el = $('.social-chat-container');
        css = 'min-height';
    } else if ($('.dropdown-contact-container').hasClass('show')) {
        el = $('.dropdown-contact-container');
    }

    if (el != '') {
        h = $(el).find('.chat-header').outerHeight();

        $(el).find('.chat-chanel-item').each(function (index, elem) {
            if ($(elem).is(':visible')) {
                h += $(elem).outerHeight() + 16;
            }
        });

        h -= 38;

        if (css == 'min-height') {
            $(el).find('.social-chat-frame').css({
                maxHeight: h + 'px'
            });
        }
    }

    return h;
}

function setPositionDropdownChat() {
    var scrollTop = $(window).scrollTop();
    var offsetTop = $('#sellpage_nav').offset().top;
    var diff = offsetTop - scrollTop;
    var placement = 'bottom-end';

    var h = setSizeSocialChat();
    $('.dropdown-social-chat').find('.social-chat-frame').css({
        'height': h + 'px',
        'minHeight': h + 'px',
    });

    if (diff > $('.dropdown-social-chat .social-chat-frame').height()) {
        placement = 'top-end';

        var top = ($('.dropdown-social-chat').outerHeight() + 22) * -1;

        $('.dropdown-social-chat').css({
            'transform': 'translate3d(0px, ' + top + 'px, 0px)'
        });
    } else {
        $('.dropdown-social-chat').removeAttr('style');
    }

    $('.dropdown-social-chat').attr('x-placement', placement);    
}

function initEveneLineTouch(callback) {
    $('#dialog-option .wrap-line-touch, #dialog-option .title-bar').unbind('mousedown touchstart');
    $('#dialog-option .wrap-line-touch, #dialog-option .title-bar').on('mousedown touchstart',function(event){
        $('#dialog-option').removeClass('animate-height');
        var targetY = 0;
        var scrollPos = $(document).scrollTop();

        if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length >= 1) {
            targetY = event.originalEvent.touches[0].clientY;
        } else {
            targetY = event.clientY;
        }

        BACKUP_DIFF_Y = ($('#dialog-option.active').offset().top-scrollPos)-targetY;
        DO_TOUCH_LINE = true;
        $('#dialog-option').addClass('dragging');

        if ($(this).hasClass('wrap-line-touch')) {
            START_TOUCH_DIALOG = new Date().getTime();
        }

        event.preventDefault();
        doDragLineTouch(callback);
    });
}

function doDragLineTouch(callback) {
    $('body').unbind('mousemove touchmove');
    $('body').on('mousemove touchmove',function(event){

        if (!START_TOUCH_DIALOG) {
            START_TOUCH_DIALOG = new Date().getTime();
        }

        event.preventDefault();
        handleMouseMove(event);
    });

    $(window).unbind('mouseup touchend');
    $(window).on('mouseup touchend',function(event){
        DO_TOUCH_LINE = false;
        $('#dialog-option').removeClass('dragging');

        if (!isMobileDevice()) {
            event.preventDefault();
        }

        $('body').unbind('mousemove touchmove');
        $('body').unbind('mouseup touchend');

        var dialog_height = $('#dialog-option').height();
        // var window_height = window.innerHeight;
        // var percent_height = (parseInt(dialog_height) * 100) / parseInt(window_height);

        $('#dialog-option').addClass('animate-height');

        var hide_dialog = false;

        if (dialog_height < 120) {
            hide_dialog = true;
        }

        var now = new Date().getTime();

        if (START_TOUCH_DIALOG && now - START_TOUCH_DIALOG < 200) {
            hide_dialog = true;
        }

        if (hide_dialog) {
            hideDialogOfferOption(callback);
        } else {
            if (DIALOG_HEIGHT) {
                $('#dialog-option').height(DIALOG_HEIGHT);
                setDimOpacity(DIALOG_HEIGHT);
            }
        }

        setTimeout(function () {
            $('#dialog-option').removeClass('animate-height');
        }, 200);

        BACKUP_DIFF_Y = null;
        DIALOG_HEIGHT = null;
        START_TOUCH_DIALOG = null;
    });
}

function handleMouseMove(event) {
    if (event) {
        var targetY = 0;

        if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length >= 1) {
            targetY = event.originalEvent.touches[0].clientY;
        } else {
            targetY = event.clientY;
        }

        actionMouseMove(targetY);
    }
}

function actionMouseMove(target_y, mode){
    var window_height = window.innerHeight;
    var dialog_height = window_height - target_y - BACKUP_DIFF_Y;
    var max_height = window_height;

    if (!FBIOS) {
        max_height = parseInt(max_height) - 10;
        dialog_height = parseInt(dialog_height) - 10;
    }

    var el = $('#dialog-option.active');
    var bar_height = $(el).find('.title-bar').outerHeight();
    var line_height = $(el).find('.wrap-line-touch').height();
    var footer_height = $(el).find('.dialog-footer-content').height() || 0;

    if (FBIOS) {
        line_height = 0;
    }

    if(target_y == 0 && $(el).hasClass('fullscreen')){
        var inner_height = max_height - bar_height - line_height - footer_height;
        $('#dialog-option.active').height(max_height);
        $('#dialog-option.active').find('.dialog-inner-content').height(inner_height);
        setDimOpacity(max_height);
        return;
    }

    if (dialog_height > window_height) {
        dialog_height = window_height;
    }

    var content_height = 0;

    if ($(el).find('.dialog-inner-content')[0].scrollHeight > $(el).find('.dialog-inner-content').height() && !$(el).find('.dialog-inner-content').hasClass('has-iframe')) {
        content_height = $(el).find('.dialog-inner-content')[0].scrollHeight || 0;
    } else {
        if ($(el).find('.dialog-inner-content').hasClass('has-iframe')) {
            content_height = max_height - bar_height - line_height - footer_height;
        } else {
            content_height = $(el).find('.dialog-inner-content').height();
        }
    }

    if ($(el).find('.dialog-footer-content').length > 0) {
        content_height = parseInt(content_height) + parseInt(footer_height);
    }
    content_height = parseInt(content_height) + parseInt(bar_height) + parseInt(line_height);
    DIALOG_HEIGHT = content_height;

    if (dialog_height > content_height ) {
        if(!$(el).hasClass('fullscreen')){
            dialog_height = content_height;
        }
    } else {
        if ($(el).hasClass('fullscreen')) {
            DIALOG_HEIGHT = max_height;
        } else {
            if (content_height > max_height) {
                DIALOG_HEIGHT = max_height;
            } else {
                DIALOG_HEIGHT = content_height;
            }
        }
    }

    if (dialog_height <= max_height && DO_TOUCH_LINE || mode == 'resize') {
        $(el).height(dialog_height);
        setDimOpacity();
    }
}


function setDimOpacity(h) {
    var dialog_height = $('#dialog-option').height();

    if (h) {
        dialog_height = h;
    }

    var percent_height = (parseInt(dialog_height) * 100) / window.innerHeight;
    var opacity = parseInt(percent_height) / 120;
    $('.dim').css('opacity', opacity);
}

function showDialogOfferOption() {
    DIALOG_HEIGHT = null;
    BACKUP_DIFF_Y = null;
    
    $('#dialog-option').removeAttr('style');
    $('#dialog-option').addClass('active');

    $('body .dim').remove();
    $('body').append('<div class="dim"></div>');
    $('html').addClass('no-scroll');

    $('.dim').unbind('click');
    $('.dim').click(function () {
        hideDialogOfferOption();
    });

    var h = $('#dialog-option.active').height();
    $('#dialog-option.active').height(h);

    if (FBIOS) {
        $('#dialog-option').addClass('fb_ios');
    } else {
        $('#dialog-option').removeClass('fb_ios');
    }

    setDimOpacity();
    actionMouseMove(0, 'resize');

    setTimeout(function () {
        $(window).resize();
    }, 200);
}

var TIMEOUT_HIDE_DIALOG_OPTION;
function hideDialogOfferOption(callback) {
    $('#dialog-option').removeClass('active fullscreen');
    $('html').removeClass('no-scroll');
    $('body .dim').remove();
    $('.select_sku').val('');
    $('#dialog-option').removeClass('fb_ios');
    
    if (typeof callback == 'function') {
        clearTimeout(TIMEOUT_HIDE_DIALOG_OPTION);
        TIMEOUT_HIDE_DIALOG_OPTION = setTimeout(function () {
            callback();
        }, 200);
    }
}
var DISPLAY_THX_PAGE = false;
function renderFooterContent(footer_ele,url,custom_header){

    $('body .dim').remove();

    var html = '';
    html += '   <div class="wrap-line-touch">';
    html += '       <div class="line-touch">';
    html += '           <div class="line"></div>';
    html += '       </div>';
    html += '   </div>';
    html += '   <div class="inner">';
    html += '       <div class="close">';
    html += '           <i class="fal fa-times"></i>';
    html += '       </div>';
    html += '       <div class="title-bar sellpage-header position-relative">';
    var header_txt = "";
    if (custom_header == undefined) {
        header_txt = $(footer_ele).text();
    }else{
        header_txt = custom_header;
    }
    html += '           <span>' + header_txt + '</span>';
    html += '       </div>';
    html += '       <div class="dialog-inner-content has-iframe">';
    if (url == '/tracking') {
        var querystring_param = "";
        if (DISPLAY_THX_PAGE == false) {
            DISPLAY_THX_PAGE = true;
            querystring_param = window.location.search || "";
            if(querystring_param != ""){
                querystring_param += "&";
            } else {
                querystring_param += "?";
            }
            querystring_param += "v="+new Date().getTime();
            window.history.replaceState({}, document.title, "/");
        }
        
        html += '   <div class="wrap-iframe-content">';
        html += '       <iframe id="iframe_inner_page_render" allowtransparency="true" style="opacity:0;background: #e9ebee;" frameborder="0" onload="setInitFooterIframe();" class="iframe-inner-page-render" src="'+BASE_PRODUCT_URL+"/static"+url+querystring_param+'"></iframe>';
        html += '       <div class="overlay-iframe"></div>';
        html += '   </div>';
    }else{
        //ajax get page content
        html += '   <div class="inner-content scroll-content">';
        html += '   </div>';

    }
    html += '   </div>';
    html += '   </div>';
    
    $('#dialog-option').addClass('fullscreen');
    $('#dialog-option').html(html);

    var el = $('#dialog-option');
    $(el).find('.close').unbind('click');
    $(el).find('.close').click(function () {
        hideDialogOfferOption();
    });

    initEveneLineTouch();
    showDialogOfferOption();
    actionMouseMove(0);

    if (url != '/tracking') {
        getPageContent(url).then(function(r){
            var h = window.innerHeight;

            if (!FBIOS) {
                h = parseInt(h) - 10;
            }

            $("#dialog-option .inner-content").html(r);
            $('#dialog-option').css('max-height', h);
            // if (url == "/cookie_policy") {
            //     initCookiePolicyValue();
            // }

            setDimOpacity();
        });
    }

}

async function getPageContent(mode) {
    mode = mode.replace("/","");
    var html = "";
    try {
        res = await ajaxPageContent(mode);
        if (res.status == "success") {
            html = res.data.content_html;
        }
        
    } catch(err) {
    }
    return html;

}

function ajaxPageContent(mode) { 
  return $.ajax({
    url: BASE_API + 'v2/html_content',
    data : {
        funnel_id: GEN_KEY,
        file_name: mode
    },
    type: 'GET'
  });
}

function setInitFooterIframe(){
    var ifram_content = $("#iframe_inner_page_render").contents();
    $(ifram_content).find("body").addClass("iframe_render_page");
    // $(ifram_content).find("html").css('background-color','#fff');
    // $("#iframe_inner_page_render").css('height',$('#dialog-option').outerHeight() - ($('#dialog-option').find('.title-bar').outerHeight() + $('#dialog-option').find('.wrap-line-touch').outerHeight()));
    setTimeout(function(){
        $("#iframe_inner_page_render").css('opacity',1);
    }, 100);
}

var cookie_initial_data = [
    {"k":"cookieSelector.googleAnalytics.accepted","v":1,"ele":"#ga_accepted"},
    {"k":"cookieSelector.lead.accepted","v":1,"ele":"#lead_accepted"}
];

function initCookiePolicy(){
    // console.log("initCookiePolicy");
    var local_storage = window.localStorage;
    for (var i = 0; i < cookie_initial_data.length; i++) {
        var obj = cookie_initial_data[i];
        var k = obj['k'];
        var v_init = obj['v'];
        var v = local_storage.getItem(k);
        if (v == undefined) {
            v = v_init;
            saveLocalStorage(k, v_init);
        }

        // if (k == "cookieAccept" && v == 0) {
        //     showPolicyAccepct();
        // }
    }
    $(window).resize();
}

// function showPolicyAccepct(){
//     $("body").addClass("has_accpect");
//     var html = `<div id="cookie_policy_box">
//                     <div class="detail">`+DICT['page']['cookie_accept_alert1']+` <a class="link" href="javascript:showCookiePolicyPage();">`+DICT['page']['cookie_accept_alert2']+`</a></div> <a class="btn btn-driver accept_btn" href="javascript:acceptCookiePolicy();">`+DICT['page']['cookie_accept_alert3']+`</a>
//                 </div>`;
//     $("#cookie_policy_box").remove();
//     $("body").append(html);
// }

// function showCookiePolicyPage(){
//     renderFooterContent(null,"/cookie_policy",DICT['page']['cookie_accept_header']);
// }

// function initCookiePolicyValue(){
//     var local_storage = window.localStorage;
//     for (var i = 0; i < cookie_initial_data.length; i++) {
//         var obj = cookie_initial_data[i];
//         var obj = cookie_initial_data[i];
//         var k = obj['k'];
//         var v = local_storage.getItem(k);
//         var ele = obj.ele;
//         if (ele != "") {
//             if (v == 1) {
//                 $(ele).find("input").attr("checked","checked");
//             }
//         }
//     }

//     $(".wrap_cookie_settings .wrap_switch").unbind("click");
//     $(".wrap_cookie_settings .wrap_switch").click(function(){
//         var k = $(this).attr("k");
//         if($(this).find("input").is(':checked')){
//             $(this).find("input").prop('checked', false);
//             window.localStorage.setItem(k, 0);
//         }else{
//             $(this).find("input").prop('checked', true);
//             window.localStorage.setItem(k, 1);
//         }
//         acceptCookiePolicy();
//     });
// }

// function acceptCookiePolicy(){
//     saveLocalStorage('cookieAccept', 1);
//     $("#cookie_policy_box").remove();
//     $("body").removeClass("has_accpect");
//     $("body").css("padding-top","0px");
//     $("#secondary_nav").css("margin-top","0px");
//     if($('.wrap_lead_form_pannel.active').length > 0){
//         $('.wrap_lead_form_pannel.active').css('top',"0px");
//     }
//     $('#allowCookiePolicy').attr('checked',true);
//     $(window).resize();
// }

function sendEmailContact(mode, btn) {
    var el;

    if (mode == 'btn') {
        el = $('.social-chat-container');
    } else if (mode == 'dropdown') {
        el = $('.dropdown-social-chat');
    } else {
        return false;
    }

    $(el).find('.has-error').removeClass('has-error');

    var fullname = $.trim($(el).find('input[name="contact_fullname"]').val());
    var contact_no = $.trim($(el).find('input[name="contact_no"]').val());
    var has_error = false;

    if (!contact_no || contact_no == '' || !$.isNumeric(contact_no)) {
        $(el).find('input[name="contact_no"]').parents('.custom_form_tm').addClass('has-error');
        return false;
    }

    $(el).find('input').attr('disabled', 'disabled');
    $(el).find('.btn-submit-contact ').parents('.form_addon_btn').addClass('disabled');
    $(btn).button('loading');

    $.ajax({
        url: BASE_API + 'v2/contact/tel',
        type: 'post',
        dataType: 'json',
        data: {
            page_id: GEN_KEY,
            fullname: fullname,
            contact_no: contact_no
        },
        error: function (e) {
            $(btn).button('reset');
            $(el).find('input').removeAttr('disabled');
            $(el).find('.btn-submit-contact ').parents('.form_addon_btn').removeClass('disabled');
            showContactReponse(el, 'error');
        },
        success: function (res) {
            $(btn).button('reset');
            $(el).find('input').removeAttr('disabled');
            $(el).find('.btn-submit-contact ').parents('.form_addon_btn').removeClass('disabled');

            if (res.status == 'success') {
                $(el).find('.form_input').val('');
                showContactReponse(el, 'success');
            } else {
                showContactReponse(el, 'error');
            }
        }
    });
}

function showContactReponse(el, mode) {
    var icon = '';
    var title = '';
    var desc = '';

    if (mode == 'error') {
        icon = 'fal fa-exclamation-triangle';
        title = DICT['alert']['error'];
        desc = DICT['alert']['try_again_later'];
    } else {
        icon = 'fad fa-user-headset';
        title = DICT['page']['thank_you_contact']
        desc = DICT['alert']['contact_soon'];
    }

    var html = '';
    html += '<div class="res-icon ' + mode + '">';
    html += '   <i class="' + icon + '"></i>';
    html += '</div>';
    html += '<div class="res-message">' + desc + '</div>';
    
    $(el).find('.chat-header-inner[data-content="response"]').html('<div class="chat-headline sellpage-header">' + title + '</div>');
    $(el).find('.social-chat-frame').addClass('show-response');
    $(el).find('.form-response').html(html);
    setSizeSocialChat();
}

function renderItemListHTMLfromIbject(cart_item_data,mode){

    var item_list = cart_item_data.item_list;
    var response = {};
    var hide_payment_method = false;
    var default_price_decimal = 2;
    if(CURRENCY == "thb"){
        default_price_decimal = 0;
    }
    var item_list_value = {};
    var str_html = "";
    var shipping_key = "shipping";
    var grand_total_key = "grand_total";
    var real_shipping_key = 'real_shipping';

    if(mode == "tracking"){
        shipping_key = "shipping_fee";
        grand_total_key = "price";
        real_shipping_key = 'original_shipping';
    }

    var cc_symbol = CURRENCY_SYMBOL[CURRENCY]['symbol'];

    for (var i = 0; i < item_list.length; i++) {
        if(mode == "tracking"){
            var offer_data = item_list[i];
        } else {
            var offer_data = getOfferDetail(item_list[i].item_key);
        }
        var offer_price = offer_data['price'];
        var offer_title = offer_data['title'];
        var option_special = false;
        var option_html = "";
        var edit_html = '';

        if(item_list[i]['option_detail']){
            var option_detail = item_list[i]['option_detail'];
            var new_option = {};
            for (var j = 0; j < option_detail.length; j++) {
                new_option[option_detail[j]['key']] = option_detail[j]['value_key'];
            }
            item_list[i]['option'] = new_option;
        }
        var item_key = "";
        if(mode == "tracking"){
            item_key = item_list[i].reward_id;
        } else {
            item_key = item_list[i].item_key;
        }
        if(item_list[i]['option']){
            option_html += '<ul style="font-size:14px;padding:0px;margin:0;list-style:none;">';
            var item_option = item_list[i]['option'];
            var sku_key = item_list[i]['sku'];
            for ( x in item_option){
                for (var j = 0; j < OFFER_LIST.length; j++) {
                    if(item_key == OFFER_LIST[j]['reward_id']){
                        if(OFFER_LIST[j]['options'][x]){
                            var option_value = OFFER_LIST[j]['options'][x]['list_option'];
                            offer_price = offer_data['price'];
                            
                            for (var k = 0; k < option_value.length; k++) {
                                if(option_value[k]['value'] == item_option[x]){
                                    option_html += '<li>' + OFFER_LIST[j]['options'][x]['label'] + ':<span style="color:#888;margin-left:10px;">' + option_value[k]['label'] +'</span></li>';
                                    if (offer_data.offer_type == 'bundle') {
                                        if (item_list[i].bundle_option) {
                                            for (var l = 0 in item_list[i].bundle_option) {
                                                offer_price = parseFloat(offer_price) + parseFloat(item_list[i].bundle_option[l].value_price);
                                            }
                                        }
                                    } else {
                                        offer_price = parseFloat(offer_price) + parseFloat(OFFER_LIST[j]['product'][sku_key]['price']);
                                    }
                                }
                            }
                        }
                    }
                }
                if(x == "product"){
                    option_special = true;
                    option_html = "";
                }
            }
            option_html += '</ul>';
            if(mode != "tracking"){
                edit_html += ' <a class="edit_offer" data-id="' + offer_data.reward_id + '">' + DICT['offer']['edit'] + '</a>';
            }
        }

        var is_discount = false;

        if (offer_data.offer_type == 'discount_price' || offer_data.offer_type == 'discount_percent') {
            is_discount = true;
        }

        if (offer_price < 0 && is_discount) {
            offer_price = offer_price * -1;
        }

        if (offer_price > 0) {
            offer_price = CURRENCY_SYMBOL[CURRENCY]['symbol'] + numberComma(offer_price,default_price_decimal);

            if (is_discount) {
                offer_price = '- ' + offer_price;
            }
        } else {
            offer_price = DICT['offer']['free'];
        }

        var cls = '';

        if (!offer_data.main_item && mode != 'tracking') {
            cls = 'd-none';
        }

        var html_main_item = '';
        html_main_item += '<td>';
        html_main_item += ' <div class="wrap_item_product">';
        html_main_item += '     <div class="item_icon">';
        if(offer_data['image_url']){
            html_main_item += '     <img src="'+offer_data['image_url']+'"/>';
        } else {
            if (offer_data['offer_type'] == 'discount_price' || offer_data['offer_type'] == 'discount_percent') {
                html_main_item += '     <i class="fad fa-gift"></i>';

                if (offer_data['description']) {
                    option_html += '<div style="color:#999;font-size:14px;">' + offer_data['description'] + '</div>';
                }
            } else {
                html_main_item += '     <i class="fad fa-box-alt"></i>';
            }
        }
        html_main_item += '     </div>';
        html_main_item += '     <div>' + offer_title + '</div>';
        html_main_item += '     <div class="item_option">' + option_html + '</div>';

        if (edit_html != '') {
            html_main_item += ' <div class="wrap-btn-manage">' + edit_html + '</div>';
        }

        html_main_item += ' </div>';
        html_main_item += '</td>';
        html_main_item += '<td style="text-align:right;" width="115" class="item_price">' + offer_price + '</td>';

        str_html += '<tr class="row-main-item ' + cls + '">' + html_main_item + '</tr>';

        if (mode == 'update') {
            if (offer_data.main_item) {
                $('.item_option').html(option_html);
                $('.item_price').html(offer_price);
            } else if (offer_data.has_option) {
                $('.box-upsell[data-key="' + offer_data.reward_id + '"] .offer-price').html(offer_price);
                $('.box-upsell[data-key="' + offer_data.reward_id + '"] .section-option').html(option_html);
            }
        }

        if (offer_data.interval != "once_time") {
            hide_payment_method = true;
        }

        if (offer_data.offer_type == 'bundle') {
            item_list_value[item_key] = [];

            for (var j = 0 in item_list[i].bundle_option) {
                var bundle = item_list[i].bundle_option[j];
                item_list_value[item_key].push({
                    option_key: bundle.option_key,
                    value_id: bundle.value_id,
                    qty: 1
                });
            }
        } else {
            if (item_list[i].sku) {
                item_list_value[item_key] = {};
                item_list_value[item_key][item_list[i].sku] = 1;
            } else {
                item_list_value[item_key] = 1;
            }
        }

        if(option_special && mode != 'tracking'){
            str_html += '<tr>';
            str_html += '   <td>';
            str_html += '       <div>' + offer_data['title'] + '</div>';
            str_html += '   </td>';
            str_html += '   <td style="text-align:right;">' + CURRENCY_SYMBOL[CURRENCY]['symbol'] + numberComma(offer_data['price'],default_price_decimal) + '</td>';
            str_html += '</tr>';
        }
    }

    if (mode != 'tracking') {
        var all_upsell = getSelectUpsell();
        var main_offer = getOfferDetail(DRIVER_CART.getData('main_item'));
        var referrer_friends = null;

        if (main_offer) {
            if (main_offer.promotion_config.type == 'referrer_friends') {
                referrer_friends = main_offer.promotion_config;
            }

            if (all_upsell.length > 0 || (main_offer && referrer_friends)) {
                var upsell_header = DICT['lead']['special_offer'];
                var upsell_title = DICT['offer']['special_offer_title'];

                if (main_offer.offer_type == 'discount_price' || main_offer.offer_type == 'discount_percent') {
                    upsell_header = DICT['offer']['please_select_offer'];
                    upsell_title = DICT['offer']['combined_discount'];
                }

                if (main_offer) {
                    if (main_offer.upsell_header) {
                        upsell_header = main_offer.upsell_header;
                    }

                    if (main_offer.upsell_title) {
                        upsell_title = main_offer.upsell_title;
                    }
                }

                str_html += '<tr>';
                str_html += '   <td colspan="2" class="p-0">';
                str_html += '       <div class="collapse show mb-0 block-upsell">';
                str_html += '           <div class="arrow"></div>';
                str_html += '           <div class="block-upsell-header">';
                str_html += '               <div class="sellpage-content-header"><i class="fa5-icon icon_error"><i class="fas fa-exclamation-triangle"></i></i>' + upsell_header + '</div>';
                str_html += '               <div class="upsell-subline legend-subline">' + upsell_title + '</div>';
                str_html += '           </div>';
                str_html += '           <div class="block-upsell-container">';
                str_html += '               <div class="shadow left"></div>';
                str_html += '               <div class="upsell-list">';
                str_html += '                   <div class="upsell-inner clearfix">';

                if (all_upsell.length > 0) {
                    for (var i = 0 in all_upsell) {
                        var upsell = all_upsell[i];
                        var img_url = '';

                        if (upsell.image_url) {
                            img_url = upsell.image_url;                    
                        } else {
                            img_url = BASE_FRONT_URL + 'images/default-product.png';
                        }

                        str_html += '               <div class="box-upsell" data-key="' + upsell.reward_id + '">';
                        str_html += '                   <div class="box-content">';
                        str_html += '                       <div class="section-img">';
                        str_html += '                           <img src="' + img_url + '" class="img-fluid">';
                        str_html += '                       </div>';
                        str_html += '                       <div class="section-content d-flex flex-column">';
                        str_html += '                           <div class="section-title">';
                        str_html += '                               <span class="upsell-title" title="' + upsell.title + '">' + upsell.title + '</span>';
                        str_html += '                           </div>';
                        str_html += '                           <div class="section-option"></div>';
                        str_html += '                           <div class="section-price d-flex align-items-center">';

                        if (upsell.price > 0) {
                            str_html += '                           <div class="offer-price text-price">+<span>' + CURRENCY_SYMBOL[CURRENCY].symbol + '</span>' + numberComma(upsell.price, 0) + '</div>';
                        } else {
                            str_html += '                           <div class="offer-price text-price">' + DICT['offer']['free'] + '</div>';
                        }

                        if (parseInt(upsell.full_price) > 0) {
                            str_html += '                           <div class="offer-discount-price"><span>' + CURRENCY_SYMBOL[CURRENCY].symbol + '</span>' + numberComma(upsell.full_price, 0) + '</div>';
                        }

                        var checked = '';
                        var cls_input = '';

                        if (main_offer.upsell_mode == 'single') {
                            cls_input = 'input-radio';
                        }

                        if (DRIVER_CART.getCartItem(upsell.reward_id)) {
                            checked = 'checked';
                        }

                        str_html += '                           </div>';
                        str_html += '                           <div class="section-btn mt-auto">';
                        str_html += '                               <button type="button" class="btn btn-offer btn-small has-price btn-select-offer sellpage-header" autocomplete="off">';
                        str_html += '                                   <label><input class="mgc mgc-primary checkbox-price ' + cls_input + '" type="checkbox" name="select-upsell" value="' + upsell.reward_id + '" ' + checked + ' autocomplete="off">' + DICT['offer']['upsell'] + '</label>';
                        str_html += '                               </button>';
                        str_html += '                           </div>';
                        str_html += '                       </div>';
                        str_html += '                   </div>';
                        str_html += '               </div>';

                        if (main_offer.upsell_mode == 'single' && i != all_upsell.length -1) {
                            str_html += '           <div class="box-upsell box-or">';
                            str_html += '               <div class="d-flex align-items-center justify-content-center">';
                            str_html += '                   <div class="text-or">' + DICT['lead']['common_or'] + '</div>';
                            str_html += '               </div>';
                            str_html += '           </div>';
                        }
                    }
                }

                if (referrer_friends) {
                    var cart_promotion = DRIVER_CART.getPromotionData();
                    var friend_name = '';
                    var friend_tel = '';
                    var friend_email = '';
                    var checked_promotion = '';

                    if (cart_promotion.referrer_friends && cart_promotion.referrer_friends.length > 0) {
                        friend_name = cart_promotion.referrer_friends[0].name;
                        friend_tel = cart_promotion.referrer_friends[0].tel;
                        friend_email = cart_promotion.referrer_friends[0].email;
                        checked_promotion = 'checked';
                    }

                    if (all_upsell.length > 0 && main_offer.upsell_mode == 'single') {
                        str_html += '               <div class="box-upsell box-or">';
                        str_html += '                   <div class="d-flex align-items-center justify-content-center">';
                        str_html += '                       <div class="text-or invisible">' + DICT['lead']['common_or'] + '</div>';
                        str_html += '                   </div>';
                        str_html += '               </div>';
                    }

                    str_html += '                   <div class="box-upsell">';
                    str_html += '                       <div class="box-content box-promotion referrer_friends">';
                    str_html += '                           <div class="section-content d-flex flex-column">';
                    str_html += '                               <div class="section-title">';
                    str_html += '                                   <span title="' + referrer_friends.discount[0].title + '">' + referrer_friends.discount[0].desc + '</span>';
                    str_html += '                               </div>';
                    str_html += '                               <div class="section-body">';
                    str_html += '                                   <div class="tm-form-group">';
                    str_html += '                                       <div class="custom_form_tm">';
                    str_html += '                                           <div class="form_group">';
                    str_html += '                                               <input type="text" autocomplete="off" class="form_input input_referrer_friend is-required" data-key="name" value="' + friend_name + '">';
                    str_html += '                                               <div class="form_placeholder"><i class="fas fa-exclamation-triangle icon_input_error" aria-hidden="true"></i> <span>' + DICT['offer']['friend_name'] + '</span></div>';
                    str_html += '                                           </div>';
                    str_html += '                                       </div>';
                    str_html += '                                   </div>';
                    str_html += '                                   <div class="tm-form-group">';
                    str_html += '                                       <div class="custom_form_tm">';
                    str_html += '                                           <div class="form_group">';
                    str_html += '                                               <input type="text" autocomplete="off" class="form_input input_referrer_friend is-required" data-key="tel" value="' + friend_tel + '">';
                    str_html += '                                               <div class="form_placeholder"><i class="fas fa-exclamation-triangle icon_input_error" aria-hidden="true"></i> <span>' + DICT['lead']['phone_no'] + '</span></div>';
                    str_html += '                                           </div>';
                    str_html += '                                       </div>';
                    str_html += '                                   </div>';
                    str_html += '                                   <div class="tm-form-group">';
                    str_html += '                                       <div class="custom_form_tm">';
                    str_html += '                                           <div class="form_group">';
                    str_html += '                                               <input type="text" autocomplete="off" class="form_input input_referrer_friend" data-key="email" value="' + friend_email + '">';
                    str_html += '                                               <div class="form_placeholder"><i class="fas fa-exclamation-triangle icon_input_error" aria-hidden="true"> </i><span>' + DICT['lead']['email'] + DICT['lead']['lead_form_not_require'] + '</span></div>';
                    str_html += '                                           </div>';
                    str_html += '                                       </div>';
                    str_html += '                                   </div>';
                    str_html += '                               </div>';
                    str_html += '                               <div class="section-btn mt-auto">';
                    str_html += '                                   <button type="button" class="btn btn-offer btn-small has-price sellpage-header" autocomplete="off">';
                    str_html += '                                       <label><input class="mgc mgc-primary checkbox-promotion" type="checkbox" name="select-promotion" autocomplete="off" ' + checked_promotion + '>' + DICT['offer']['upsell'] + '</label>';
                    str_html += '                                   </button>';
                    str_html += '                               </div>';
                    str_html += '                           </div>';
                    str_html += '                       </div>';
                    str_html += '                   </div>';
                }

                str_html += '                   </div>';
                str_html += '               </div>';
                str_html += '               <div class="shadow right"></div>';
                str_html += '           </div>';
                str_html += '       </div>';
                str_html += '   </td>';
                str_html += '</tr>';
            }
        }
    }

    if(cart_item_data.promotion){
        var refer_friend = cart_item_data.promotion.referrer_friends || [];
        if (refer_friend.length > 0) {
            $('#checkout-form').find('input[name=referFriends]').val(JSON.stringify(refer_friend));
        }
    }

    if (hide_payment_method) {
        $('.wrap_payment_method_source .card').not('[payment_method="card"]').hide();
        $('.wrap_payment_method_source .card[payment_method="card"]').click();
    }

    if (typeof(cart_item_data[shipping_key]) != "undefined") {
        var shipping_price = CURRENCY_SYMBOL[CURRENCY]['symbol'] + numberComma(cart_item_data[shipping_key],default_price_decimal);
        var real_shipping = cart_item_data[real_shipping_key];

        if (cart_item_data[shipping_key] == 0) {
            shipping_price = DICT['offer']['free'];
        }

        if (real_shipping > 0 && real_shipping != cart_item_data[shipping_key]) {
            var total_shipping = cc_symbol + cart_item_data[shipping_key];

            if (cart_item_data[shipping_key] == 0) {
                total_shipping = DICT['offer']['free'];
            }

            shipping_price = '<span class="real_shipping">' + cc_symbol + real_shipping + '</span><span class="total_shipping">' + total_shipping + '</span>';
        } else if (real_shipping == 0 &&  cart_item_data[shipping_key] == 0) {
            shipping_price = DICT['offer']['free'];
        }

        str_html += '<tr>';
        str_html += '   <td>';
        str_html += '       <div class="wrap_item_product">';
        str_html += '           <div class="item_icon" style="font-size:30px;">';
        str_html += '               <i class="fad fa-shipping-fast"></i>';
        str_html += '           </div>';

        var shipping_date = DICT.cart.shipping_price_subline;
        var data_display_date = "";
        var obj_date_1,obj_date_2;
        var repalce_str = false;

        if(typeof(cart_item_data.shipping_date_display) != "undefined"){
            var temp_timestamp = cart_item_data.shipping_date_display;
            temp_timestamp = temp_timestamp.split("|:|");
            if(temp_timestamp.length == 2){
                obj_date_1 = convertReciveItem(null,null,temp_timestamp[0]);
                obj_date_2 = convertReciveItem(null,null,temp_timestamp[1]);
                repalce_str = true;
            } else {
                shipping_date = cart_item_data.shipping_date_display;
            }
        } else {
            var min_date = 5;
            var max_date = 8;
            if(cart_item_data.shipping_address && typeof(cart_item_data.shipping_address.province_id) != "undefined" && cart_item_data.shipping_address.province_id == 1){
                var min_date = 4;
                var max_date = 7;
            }
            obj_date_1 = convertReciveItem(min_date);
            obj_date_2 = convertReciveItem(max_date);
            repalce_str = true;
        }

        if(repalce_str){
            shipping_date = shipping_date.replace("{1}",obj_date_1.display);
            shipping_date = shipping_date.replace("{2}",obj_date_2.display);
            data_display_date = obj_date_1.source + "|:|" + obj_date_2.source;
        }
        
        shipping_date = '<span id="display_shipping_date_order" style="display:block;font-size:14px;color:#999;" data-display-date="'+data_display_date+'">'+shipping_date+'</span>';
        
        str_html += '           <div>' + DICT.cart.shipping_price_title + shipping_date+'</div>';
        str_html += '       </div>';
        str_html += '   </td>';
        str_html += '   <td style="text-align:right;" width="115" class="checkout-shipping-price">' + shipping_price + '</td>';
        str_html += '</tr>';

        if (mode == 'update') {
            $('.checkout-shipping-price').html(shipping_price);
        }
    }

    var html_discount = '';

    if (typeof(cart_item_data['discount']) != "undefined" && cart_item_data['discount'] > 0) {
        var discount_price = CURRENCY_SYMBOL[CURRENCY]['symbol'] + numberComma(cart_item_data['discount'],default_price_decimal);
        html_discount += '<td>';
        html_discount += '    <div class="wrap_item_product">';
        html_discount += '        <div class="item_icon" style="font-size:30px;">';
        html_discount += '            <i class="fad fa-badge-dollar"></i>';
        html_discount += '        </div>';
        html_discount += '        <div>' + DICT.cart.discount + '</div>';
        html_discount += '    </div>';
        html_discount += '</td>';
        html_discount += '<td style="text-align:right;" width="115" class="checkout-discount-price">' + discount_price + '</td>';
    }

    str_html += '<tr class="row-discount">' + html_discount + '</tr>';

    if (mode == 'update') {
        $('.row-discount').html(html_discount);
    }

    if (getSaleReferrer()) {
        str_html += '<tr>';
        str_html += '   <td>';
        str_html += '       <div class="wrap_item_product">';
        str_html += '           <div class="item_icon" style="font-size:30px;">';
        str_html += '               <i class="fad fa-badge-percent"></i>';
        str_html += '           </div>';
        str_html += '           <div>' + DICT['offer']['your_commission'] + '</div>';
        str_html += '       </div>';
        str_html += '   </td>';
        str_html += '   <td></td>';
        str_html += '</tr>';
    }

    var total_price = CURRENCY_SYMBOL[CURRENCY]['symbol'] + numberComma(cart_item_data[grand_total_key],default_price_decimal);
    str_html += '<tr style="line-height:40px;">';
    str_html += '   <td style="font-weight:bold;text-align:right;vertical-align:bottom;">'+DICT.cart.grand_total+'</td>';
    str_html += '   <td style="font-size:18px;font-weight:bold;text-align:right;vertical-align:bottom;" width="115" class="checkout-total-price">' + total_price + '</td>';
    str_html += '</tr>';

    if (mode == 'update') {
        $('.checkout-total-price').html(total_price);
    }

    response.html = str_html;
    response.item_list_value = item_list_value;

    return response;
}

function getSelectUpsell(_item_key, arr, mode) {
    var item_key = '';
    var offer = null;

    if (!arr) {
        var arr = [];
    }

    if (!_item_key) {
        item_key = DRIVER_CART.getData('main_item');
    } else {
        item_key = _item_key;
    }

    offer = getOfferDetail(item_key);

    if (mode == 'select') {
        if (validOfferDate(offer)) {
            arr.push(offer);
        }
    }

    if (offer && offer.up_sell) {
        var upsell = getOfferDetail(offer.up_sell);

        if (upsell) {
            if (validOfferDate(upsell)) {
                arr.push(upsell);
            }

            if (upsell.up_sell) {
                return getSelectUpsell(upsell.up_sell, arr, 'select');
            }
        }
    }

    return arr;
}

function convertReciveItem(days,mode,timestamp,star_date){

    var current_time = $('.element_system_time').attr('data-system-time');
    if(timestamp != null && typeof(timestamp) != "undefined" ){
        current_time = parseInt(timestamp);
    } else {
        current_time = new Date(current_time).getTime() + (60 * 60 * 24 * days * 1000);
    }
    var _current_time = new Date(current_time);
    var days = new Date(current_time).getDay();
    days = days.toString().padStart(2, '0');
    _current_time = _current_time.getFullYear().toString() + "-" + (_current_time.getMonth()+1).toString().padStart(2, '0') + "-" + _current_time.getDate().toString().padStart(2, '0');
    var temp = jsFormatDatetime(_current_time,days,mode,star_date);
    temp = temp.split(" ");
    var obj_time = {};
    obj_time.source = current_time;
    if(mode != "timestamp"){
        temp.pop();
    }
    obj_time.display = temp.join(" ");
    return obj_time;
}

function showPromotionAction(){

    if($('#alert_promotion_action').length == 0){
        var element = '<div id="alert_promotion_action"></div>';
        $(element).insertAfter($('#right_column'));
    }

    var element_alert = '<div id="alert_promotion_element"><img src="https://cdn.taximail.com/funnels/images/alert_promotion.png" /></div>';
    if($('body').hasClass('column_1')){
        element_alert = '<div id="alert_promotion_element"><img src="https://cdn.taximail.com/funnels/images/alert_promotion_mobile.png" /></div>';
    }
    
    $('#alert_promotion_element').remove();
    $('#right_column').append(element_alert);

    if($('body').hasClass('column_1')){
        window.location.href = '#alert_promotion_element';
    } else {
        window.location.href = '#sellpage_nav';
    }

    setTimeout(function(){

        $('body').addClass('alert_promotion_action');

        setTimeout(function(){
            $('#alert_promotion_action,#alert_promotion_element').addClass('fade_element');
        }, 100);

        clearTimeout(TIMEOUT_HIDE_ALERT_PROMOTION);
        TIMEOUT_HIDE_ALERT_PROMOTION = setTimeout(function(){
            hidePromotionAction();
        }, 3000);
    }, 200);
}

function hidePromotionAction(){
    if($('body').hasClass('alert_promotion_action')){
        clearTimeout(TIMEOUT_HIDE_ALERT_PROMOTION);
        $('#alert_promotion_action,#alert_promotion_element').removeClass('fade_element');
        setTimeout(function(){
            $('body').removeClass('alert_promotion_action');
        }, 400);
    }
}

function hideChatTool() {
    var el = $('.social-chat-container');

    $(el).removeClass('ready');
    $(el).removeClass('done');
    $(el).find('.item-fade').removeClass('ready');
    $(el).removeClass('active');
    $(el).find('.chat-body, .chat-header').removeClass('tel');
    checkContackButton();
}

function openChatContact(){
    hideDialogOfferOption();
    setTimeout(function(){
        $('.btn-social-chat').find('.btn').click();
    },200);

    checkContackButton();
}

function openChatTool() {
    var el = $('.social-chat-container');
    $(el).removeClass('ready');
    $(el).removeClass('done');
    $(el).find('.item-fade').removeClass('ready');

    $(el).addClass('active');
    $(el).find('.form_input').val('');
    $(el).find('.has-error').removeClass('has-error');
    $(el).find('.chat-tel-response').html('');
    $(el).find('.chat-chanel-item[data-chanel="tel"]').removeClass('show-input-name');
    $(el).find('.social-chat-frame').removeClass('show-response');
    $(el).find('.form-response').html('');
    $(el).find('.chat-header-inner[data-content="response"]').html('');

    setSizeSocialChat();
    $(window).resize();

    clearTimeout(TIMEOUT_READY_CHAT);

    TIMEOUT_READY_CHAT = setTimeout(function () {
        $(el).addClass('ready');
        $(el).find('.item-fade').addClass('ready');

        clearTimeout(TIMEOUT_READY_CHAT2);
        TIMEOUT_READY_CHAT2 = setTimeout(function () {
            $(el).addClass('done');
        }, 200);
    }, 120);

    checkContackButton();
}

function getSaleReferrer() {
    var tmp = window.localStorage.getItem("DSVSaleReferer");
    var data = null;

    if (tmp) {
        try {
            data = Base64.decode(tmp);
            data = JSON.parse(data);
        } catch (e) {}
    }

    return data;
}

function genSaleReferrerBubble() {
    var data = getSaleReferrer();

    if (PAGE_MODE != 'tracking') {
        if (data) {
            if ($('#sale-referrer').length == 0) {
                var html = '';
                html += '<div id="sale-referrer">';
                html += '   <div class="dropup">'
                html += '       <div class="d-flex align-items-center justify-content-center btn-inner dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
                html += '           <div class="sale-icon">';
                html += '               <i class="fad fa-user-tie"></i>';
                html += '           </div>';
                html += '           <div class="sale-name">' + data.name + '</div>'; 
                html += '       </div>';
                html += '       <div class="dropdown-menu dropdown-menu-right">';
                if(PAGE_MODE == "checkouts"){
                    html += '           <a href="javascript:adminClearLeadCustomer();" class="dropdown-item">เคลียข้อมูลลูกค้า</a>';
                }
                html += '           <a href="javascript:adminLogout();" class="dropdown-item">ออกจากระบบ</a>';
                html += '       </div>';
                html += '   </div>';
                html += '</div>';
                $('body').append(html);
            }
        } else {
            if ($('#sale-referrer').length > 0) {
                $('#sale-referrer').remove();
            }
        }
    }
}

function setSaleReferrerBubble() {
    if ($('#sale-referrer').length > 0) {
        if ($('.social-chat-container.visible').length > 0 || $('.social-chat-container.standalone').length > 0) {
            if ($('.social-chat-container.standalone').length > 0) {
                $('#sale-referrer').addClass('right-20');
            } else {
                $('#sale-referrer').removeClass('right-20');
            }
            
            $('#sale-referrer').removeClass('buttom-14');
        } else {
            if ($('.btn-social-chat.btn-desktop').length > 0) {
                $('#sale-referrer').addClass('right-20');
                $('#sale-referrer').addClass('buttom-14');
            }
        }
    }
}

function adminLogout() {
    window.localStorage.removeItem("DSVSaleReferer");
    DRIVER_CART.clear();
    window.location.href = window.location.origin;
}

function adminClearLeadCustomer() {
    window.localStorage.removeItem("LeadSale");
    window.location.reload();
}

function getAffiliateCode() {
    var code = '';

    var data = TXM_AB_COOKIE.getCookie('DVSAffiliate');

    if (data && data != '' && !getSaleReferrer()) {
        code = data;
    }

    return code;
}
