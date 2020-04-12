var WEB_VIEW = "";

$(document).ready(function () {
    checkWebView();
});

(function( $ ){
    $.fn.AutoProvince = function( options ) {
        var Setting = $.extend( {
            PROVINCE:       '#province', // select div สำหรับรายชื่อจังหวัด
            AMPHUR:         '#amphur', // select div สำหรับรายชื่ออำเภอ
            DISTRICT:       '#district', // select div สำหรับรายชื่อตำบล
            POSTCODE:       '#postcode', // input field สำหรับรายชื่อรหัสไปรษณีย์
            CUSTOM_DISTRICT: '#custom_district',
            arrangeByName:      false, // กำหนดให้เรียงตามตัวอักษร
            onReady: function () {

            }
        }, options);
        
        return this.each(function() {
            var json;
            var random = Math.random();
            var dataUrl = BASE_FRONT_URL+"js/thailand.json?i="+random;
            
            $(function() {
                initialize();
            });
            
            function initialize(){
                $.ajax({
                    type: "GET",
                    url: dataUrl,
                    dataType: "json",
                    success: function(jsonDoc) {
                        json = $(jsonDoc);
                        _loadProvince();
                        addEventList();

                        if (typeof Setting.onReady === 'function') {
                            Setting.onReady();
                        }
                    },
                    error: function() {
                        
                    }
                });  
            }
            
            function _loadProvince()
            {
                var list = [];
                var province = json[0].province ;
                province.forEach(function(col) {
                    var PROVINCE_ID = col.id;
                    var PROVINCE_NAME = col.nm;
                    if(PROVINCE_ID)list.push({id:PROVINCE_ID,name:PROVINCE_NAME});
                });

                if(Setting.arrangeByName){
                    list.sort(SortByName);
                }
                AddToView(list,Setting.PROVINCE);
            }
            
            function _loadAmphur(PROVINCE_ID_SELECTED)
            {
                var list = [];
                $(Setting.AMPHUR).empty();
                if(PROVINCE_ID_SELECTED != null && typeof(PROVINCE_ID_SELECTED) != "undefined" && PROVINCE_ID_SELECTED != ""){
                    var amphur = json[0].amphur ;
                    amphur.forEach(function(col) {
                        var AMPHUR_ID = col.id;
                        var AMPHUR_NAME = col.nm;
                        var POSTCODE = col.pc;
                        var PROVINCE_ID = col.pid;
                        if(PROVINCE_ID_SELECTED == PROVINCE_ID && AMPHUR_ID){
                            list.push({id:AMPHUR_ID,name:AMPHUR_NAME,postcode:POSTCODE});
                        }
                    });
                } else {
                    $(Setting.AMPHUR).parents('.custom_form_tm').addClass('disabled');
                    list.push({id:"",name:DICT['lead']['please_select_province_first']});
                }

                $(Setting.POSTCODE).val("");

                if(Setting.arrangeByName){
                    list.sort(SortByName);
                }
                if(list.length > 1){
                    list.unshift({id:"",name:DICT['lead']['please_select'],postcode:""});
                }
                
                AddToView(list,Setting.AMPHUR);
            }
            
            function _loadDistrict(AMPHUR_ID_SELECTED)
            {
                var list = [];
                $(Setting.DISTRICT).empty();
                var custom_dis_area = false;
                if(AMPHUR_ID_SELECTED != null && typeof(AMPHUR_ID_SELECTED) != "undefined" && AMPHUR_ID_SELECTED != ""){
                    var district = json[0].district ;
                    district.forEach(function(col) {
                        var DISTRICT_ID = col.id;
                        var DISTRICT_NAME = col.nm;
                        var AMPHUR_ID = col.aid;
                        if(AMPHUR_ID_SELECTED == AMPHUR_ID && DISTRICT_ID){
                            list.push({id:DISTRICT_ID,name:DISTRICT_NAME});
                        }
                    });
                    custom_dis_area = true;
                } else {
                    $(Setting.DISTRICT).parents('.custom_form_tm').addClass('disabled');
                    list.push({id:"",name:DICT['lead']['please_select_amphur_first']});
                    $(Setting.POSTCODE).val("");
                }
                
                if(Setting.arrangeByName){
                    list.sort(SortByName);
                }

                if(list.length > 1){
                    list.unshift({id:"",name:DICT['lead']['please_select']});
                }

                if(custom_dis_area){
                    list.push({id:"custom",name:"อื่นๆ โปรดระบุ..."});
                }

                AddToView(list,Setting.DISTRICT);
                
                if(list.length == 1 || (list.length == 2 && custom_dis_area)){
                    setTimeout(function(){
                        $(Setting.DISTRICT).val(list[0]['id']);
                    }, 100);
                }

            }
            
            function addEventList(){
                
                $(Setting.PROVINCE).change(function(e) {
                    var PROVINCE_ID = $(this).val();
                    $(Setting.AMPHUR).parents('.custom_form_tm').removeClass('disabled');
                    $(Setting.DISTRICT).parents('.custom_form_tm').addClass('disabled');
                    _loadAmphur(PROVINCE_ID);
                });

                $(Setting.AMPHUR).change(function(e) {
                    var AMPHUR_ID = $(this).val();
                    $(Setting.DISTRICT).parents('.custom_form_tm').removeClass('disabled');
                    $(Setting.POSTCODE).val("");
                    _loadDistrict(AMPHUR_ID);
                });

                $(Setting.DISTRICT).change(function(e) {
                    e.stopPropagation();
                    
                    var DISTRICT_ID = $(this).val();
                    $(Setting.CUSTOM_DISTRICT).hide();
                    if(DISTRICT_ID != ""){
                        $(Setting.POSTCODE).val($(Setting.AMPHUR).children("option:selected").attr('postcode'));
                        if(DISTRICT_ID == "custom"){
                            $(Setting.CUSTOM_DISTRICT).show();
                            setTimeout(function(){
                                $(Setting.CUSTOM_DISTRICT).focus();
                            }, 100);
                        }
                    } else {
                        $(Setting.POSTCODE).val("");
                    }
                });

                // $(Setting.POSTCODE).focusout(function(e) {
                //     if($(this).val() == ""){
                //         var AMPHUR_ID = $(Setting.AMPHUR).val();
                //         $(Setting.POSTCODE).val($(Setting.AMPHUR).find('option:selected').attr("POSTCODE"));
                //         _loadDistrict(AMPHUR_ID);
                //     }
                // });

                $(Setting.POSTCODE).inputFilter(function(value) {
                    return /^\d*$/.test(value);
                });
            }
            function AddToView(list,key){
                for (var i = 0;i<list.length;i++) {
                    if(key != Setting.AMPHUR){
                        $(key).append("<option value='"+list[i].id+"'>"+list[i].name+"</option>");  
                    }else{
                        $(key).append("<option value='"+list[i].id+"' POSTCODE='"+list[i].postcode+"'>"+list[i].name+"</option>");  
                    }
                }
            }
            
            function SortByName(a, b){
              var aName = a.name.toLowerCase();
              var bName = b.name.toLowerCase(); 
              return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }
        });
    };

    $.fn.button = function(action) {
        if (action === 'loading') {
            var w = this.width();
            var h = this.height();

            var html_loading = '';
            html_loading += '<div class="dot-loading d-flex align-items-center justify-content-center" style="min-width:' + w + 'px; min-height: ' + h + 'px;">';
            html_loading += '   <div class="dot"></div>';
            html_loading += '   <div class="dot"></div>';
            html_loading += '   <div class="dot"></div>';
            html_loading += '</div>';

            this.attr('data-original-text', this.html()).html(html_loading).prop('disabled', true);
            $(this).addClass('btn-loading');
        }

        if (action === 'reset') {
            this.prop('disabled', false);
            $(this).removeClass('btn-loading');

            if (this.attr('data-original-text')) {
                this.html(this.attr('data-original-text'));
            }
        }
    };

    $.fn.inputFilter = function(inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    };
})( jQuery );

var Base64 = {


    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },


    decode: function(input) {
        if (isNull(input)) {
            return "";
        }
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}

function showSuccess(_text) {
    var title = DICT['alert']['success'];
    var text = '';

    if (_text) {
        text = _text;
    }

    showNotification(title, text, 'success');
}

function showError(_text, _title) {
    var title = DICT['alert']['error'];

    if (_title) {
        title = _title;
    }

    var text = '';

    if(typeof(_text) == "object"){
        var error_key = "error_" + _text['err_key']
        text = DICT['alert'][error_key];

        if (!text) {
            text = DICT['alert']['try_again_later'];
        }
    } else if (typeof(_text) == "string"){
        text = _text;
    } else {
        if(_text){
            text = _text;
        }
    }

    showNotification(title, text, 'error');
}

function isNull(value) {
    if (value != null && value != undefined) {
        return false;
    } else {
        return true;
    }
}

function showNotification(title, detail, type) {
	toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "preventDuplicates": false,
        "preventOpenDuplicates": false,
        "positionClass": "toast-top-right",
        "onclick": null,
        "showDuration": "400",
        "hideDuration": "500",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    toastr[type](detail, title);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function getLoading(id, mode, fix_height, fix_height_not_cal) {
    var get_spinner = getSpinner();

    if (fix_height_not_cal) {
      $(id).css("min-height", fix_height_not_cal);
    } else if (fix_height) {
      var screen_height = $(window).height();
      var footer_height = $('footer').outerHeight();
      var header_height = $('.page-heading').outerHeight();
      var need_fix_height = screen_height - footer_height - (header_height * 2);
      $(id).css("height", need_fix_height);
    }

    if (mode == "load" || mode == "load_without_height") {
        if (mode == "load") {
            var old_height = $(id).height();
            if (old_height < 275) {
                old_height = 275;
            }
            $(id).css("min-height", old_height);
        }
        $(id + ' div').hide();
        $(id + ' table').hide();
        $(id).append(get_spinner);
        $(id).css({ 'position': 'relative' }); 
    } else if (mode == "resized") {
        $(id + ' .spinner_loading').remove();
        $(id + ' div').css('visibility', '');
        $(id + ' div').css('position', '');
        $(id + ' div').hide();
        $(id + ' div').fadeIn();
    } else {
        $(id).css("min-height", '');
        if (fix_height) {
            $(id).css("height", '');
        }
        $(id + ' .spinner_loading').remove();
        $(id + ' div').fadeIn();
        $(id + ' table').fadeIn();
    }
}

function getSpinner() {
    var str_html = '';
    str_html += "<div class='spinner_loading spinner center'>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += "   <div class='spinner-blade'></div>";
    str_html += '</div>';
    return str_html;
}

function checkWebView() {
    if (navigator.userAgent.match(/(FBIOS)/)) {
        WEB_VIEW = 'FBIOS';
    }

    if (navigator.userAgent.match(/(Line\/)/)) {
        WEB_VIEW = 'LINE';
    }
}