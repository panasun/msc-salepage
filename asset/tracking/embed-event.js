var txm = new TXMTracking();
function TXMTracking () {
    var THIS = this;
    this.conf_path = '//cdn.taximail.com/asset/tracking/';
    this.w = window;
    this.d = document;
    var u = this.d.getElementById("txm-tracking-sdk").getAttribute("data-key");
    u = u.replace('txm','');
    this.cid = parseInt(u);
    this.u = 'txm-'+this.cid;
    this.ck = this.u+'-tr';
    this.e = '';
    this.dm = [];
    this.wl = [];
    this.tracking_dm = undefined;
    this.config = undefined;
    this.config_exp = 15*60*1000;
    this.cookie_exp = 15*60*1000;
    this.cookie_nf_exp = 5*24*60*60*1000;
    this.Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=this._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=this._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
    this.FBevents = ['AddPaymentInfo','AddToCart','AddToWishlist','CompleteRegistration','Contact','CustomizeProduct','Donate','FindLocation','InitiateCheckout','Lead','Purchase','Schedule','Search','StartTrial','SubmitApplication','Subscribe','ViewContent'];
    /**/
    this.check_wl = false;
    if (typeof ENABLE_FB_PIXEL !== 'undefined') {
        if (ENABLE_FB_PIXEL == "T") {
            this.fb_pixel_enabled = true;
        }else{
            this.fb_pixel_enabled = false;
        }
        
    }else{
        this.fb_pixel_enabled = false; 
    }
    this.txm_driver_domain = "driver.taximail.com";
    this.event_tracking_url = "https://api.taximail.com/v2/track";
    this.loaded = false;
    this.init = function(ins,conf){
        // console.log('init >>');
        ins.config = conf;
        ins.dm = ('dm' in ins.config) ? ins.config["dm"] : [];
        ins.wl = ('wl' in ins.config) ? ins.config["wl"] : [];
        if (this.check_wl == true) {
            if (this.d.domain != this.txm_driver_domain ) {
                var allow = ins.checkWl();
                if (allow === false) {return;}
                var c = ins.checkWindowCookie(ins.ck);
                if ( c != undefined) {
                    if (c == 'F') {return;}
                    var tmp_c = c.split('.');
                    if (tmp_c.length == 2) {
                        ins.tracking_dm = THIS.Base64.decode(tmp_c[1]);
                        ins.e = tmp_c[0];
                        ins.track();
                    }
                }else{
                    ins.getcookie(0);
                }
            }
        }else{
            ins.init_tracking_event();

            // ins.track_pageview();
        }
    }

    this.checkWl = function(){
        var d = this.Base64.encode(this.d.domain);
        if (this.wl.indexOf(d) != -1) {return true};
        return false;
    }
    this.checkConfig = function(callback){
        var cid = this.u.replace('txm-','');
        if (parseInt(cid) < 0) {return;}
        var url = this.conf_path+cid+'/conf.json';
        var k = this.ck+'-conf';
        var check_exp = this.checkLocalStorageExpire();
        if (check_exp) {
            this.w.localStorage.removeItem(k);
        }
    
        var conf = this.w.localStorage.getItem(k);
        if (conf == null || conf == undefined) {
            this.httpGet(url,'F',{},function(v){
                THIS.w.localStorage.setItem(k,v);
                var r = JSON.parse(v);
                callback(THIS,r);
            });
        }else{
            var r = JSON.parse(conf);
            callback(THIS,r);
        }
    }

    this.checkLocalStorageExpire = function(){
        var now = new Date().getTime();
        var  k = this.ck+'-exp';
        var setupTime = this.w.localStorage.getItem(k);
        if (setupTime == null) {
            this.w.localStorage.setItem(k,now);
            return true;
        } else {
            if(now-setupTime > this.config_exp) {
                this.w.localStorage.removeItem(k);
                this.w.localStorage.setItem(k, now);
                return true;
            }
        }

        return false;
    }

    this.httpGet = function(url,enable_cross_domain,data,callback){
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if(data != null && data != undefined && data != ""){
            url = url + "?" + this.serialize(data);
        }

        if (enable_cross_domain != undefined && enable_cross_domain == 'T') {
            xhr.crossDomain = true;
            xhr.withCredentials = true;
        }
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.responseText);
            }
        }
        xhr.send(null);
    }

    this.httpPost = function(url,enable_cross_domain,data,callback){
        // console.log('track >>>',JSON.stringify(data));
        $.ajax({
            url: url,
            type: "post",
            dataType: "json",
            data: JSON.stringify(data),
            crossDomain: true,
            error: function(jqXHR, textStatus, errorThrown){
            },
            success: function(res){
                // console.log('res >>',res);
                
            }
        });

        // var xhr;
        // if (window.XMLHttpRequest) {
        //     xhr = new XMLHttpRequest();
        // } else {
        //     xhr = new ActiveXObject("Microsoft.XMLHTTP");
        // }
        // if(data != null && data != undefined && data != ""){
        //     url = url + "?" + this.serialize(data);
        // }

        // if (enable_cross_domain != undefined && enable_cross_domain == 'T') {
        //     xhr.crossDomain = true;
        //     xhr.withCredentials = true;
        // }
        // xhr.open('POST', url, true);
        // xhr.onreadystatechange = function() {
        //     console.log('xhr.status',xhr.status);
        //     if (xhr.readyState === 4 && xhr.status === 200) {
        //         callback(xhr.responseText);
        //     }
        // }

        // xhr.send(null);
    }

    this.serialize = function(obj, prefix) {
        var str = [], p;
        for(p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push((v !== null && typeof v === "object") ?
                    this.serialize(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    }


    this.tracking_email = function(v){
        if (v == '' || v == undefined) {return;}
        var _v = 'em::'+this.Base64.encode(v);
        this.e = _v;
        if (this.tracking_dm == undefined && this.dm.length > 0) {
            this.tracking_dm = this.dm[0];
        }
        if (this.tracking_dm == undefined) {return;}
        var allow = this.checkWl();
        if (allow === false) {return;}

        var value = _v+'.'+this.Base64.encode(this.tracking_dm);
        var data = {'u':this.u,'e':this.e,'d':this.tracking_dm};
        var url = '//'+this.tracking_dm+'/sck';
        this.httpGet(url,'T',data,function(v){
            var res = JSON.parse(v);
            if (res.s == "ok") {
                THIS.setcookie(THIS.ck,value,THIS.cookie_exp);
            }
        });
        
    }

    this.getcookie = function(i){
        var data = {'u':this.u};
        var url = '//'+this.dm[i]+'/gck';
        this.httpGet(url,'T',data,function(v){
            var res = JSON.parse(v);
            if (res.s == "ok") {
                res['dm_track'] = THIS.dm[i];
                THIS.callbackGetcookie(i,res);
            }else if(res.s == "err") {
                THIS.callbackGetcookie(i,res);
            }
        });
    }

    this.callbackGetcookie = function(i,res){
        if (res.s == "ok") {
            this.receiveCookie(res);
        }else{
            i++;
            if (i < this.dm.length) {
                this.getcookie(i);
            }
            if (i == this.dm.length) {
                this.notReceiveCookie();
            }
        }
    }

    this.receiveCookie = function(res){
        this.tracking_dm = res.dm_track;
        var dm = this.Base64.encode(res.dm_track);
        var key = this.u
        this.setcookie(this.ck,res.v+"."+dm,this.cookie_exp);
        this.track();
    }

    this.notReceiveCookie = function(){
        this.setcookie(this.ck,"F",this.cookie_nf_exp);
    }

    this.checkWindowCookie = function(name){
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) {
            return parts.pop().split("; ").shift();
        }
    }

    this.track = function(){
        if (this.tracking_dm == undefined) {return};
        
        var j,f=this.d.getElementsByTagName('body')[0];
        if(this.d.getElementById(this.u)){return;} 
        j=this.d.createElement('img');
        j.style.cssText = 'width:1px;height:1px;display:none;';
        j.src='//'+this.tracking_dm+'/tracking?tr='+this.u+'&e='+encodeURIComponent(this.e)+'&r='+encodeURIComponent(this.d.referrer);
        f.parentNode.insertBefore(j,f);
    }

    this.setcookie = function(key,value,exp){
        var v = key+"="+value+"; expires="+this.genExptime(exp)+"; path=/";
        document.cookie = v;
    }

    this.genExptime = function(exp){
        var now = new Date();
        var time = now.getTime();
        var expireTime = time + (exp);
        now.setTime(expireTime);
        return now.toUTCString();
    }

    this.init_tracking_event = function(){

        var list_event_offer_detail = ["AddToCart","Purchase","InitiateCheckout"];
        $("#txm_tracking_pagview").unbind("click");
        $(".btn_tracking").click(function(e){

            var id = $(this).attr("id");
            if (id == "txm_tracking_pagview") {
                if (!THIS.loaded) {
                    THIS.loaded = true; 
                }else{
                    return;
                }
            }

            var data = {};
            var event = $(this).attr("tracking_event");
            // console.log('event',event)
            if (event != undefined) {
                data.event = event;
                data.company_id = THIS.cid;
                data.funnel = $(this).attr("funnel");
                var page = $(this).attr("tracking_page");
                data.url = THIS.w.location.href;
                if (page != undefined) {
                    data.path = page;
                }else{
                    data.path = THIS.w.location.pathname;
                }

                var offer = $(this).attr("offer");
                if (list_event_offer_detail.indexOf(event) != -1) {
                    for(var i in OFFER_LIST){
                        var obj = OFFER_LIST[i];
                        // console.log('obj',obj);
                        var reward_id = obj.reward_id;
                        if (reward_id == offer) {

                            data.offer_id = reward_id;
                            data.offer_title = obj.title;
                            data.currency = CURRENCY.toUpperCase();
                            data.price = obj.price;
                            data.num_items = 1;

                            // var offer_detail = {};
                            // offer_detail.amount = obj.amount;
                            // offer_detail.currency = CURRENCY.toUpperCase();
                            // var offer = {};
                            // offer.id = reward_id;
                            // offer.quantity = 1;
                            // offer_detail.contents = [offer];
                            // data.data = offer_detail;

                            var k = "TXM-Lead-"+GEN_KEY;
                            var storage_data = THIS.w.localStorage.getItem(k);
                            if (storage_data != null && storage_data != undefined) {
                                storage_data = JSON.parse(storage_data);
                                if ('emailaddress' in storage_data) {
                                    data.email = storage_data.emailaddress;
                                }
                            }

                            break;
                        }
                    }
                }
                THIS.track_event(data);
            }
        });
        $("#txm_tracking_pagview").click();
        
    }
    this.parserTrackData = function(){
        var k = "TXM-Lead-"+GEN_KEY;
        var data = this.w.localStorage.getItem(k);
        if (data != null && data != undefined) {
            data = JSON.parse(data);
            if ('emailaddress' in data) {
                var track_data = new Object();
                track_data.email = data.emailaddress;
                console.log('track_data',track_data);
            }
        }
    }
    this.getQueryStr = function(k){
        var urlParams = new URLSearchParams(window.location.search);
        var v = urlParams.get(k);
        return v;
    }

    this.track_pageview = function(){
        var target = $("#txm_tracking_pagview");
        var data = {};
        data.event = $(target).attr("tracking_event");
        data.company_id = THIS.cid;
        data.funnel = $(target).attr("funnel");
        THIS.track_event(data);
    }

    this.track_event = function(data){
        if (data == undefined) {
            data = {}
        }
        var url = THIS.event_tracking_url;
        this.httpPost(url,'T',data,function(v){
            var res = JSON.parse(v);
            console.log('res >>',res)
        });

        this.track_fb(data)

    }

    this.track_fb = function(data){
        if (this.fb_pixel_enabled) {
            var event = data.event;
            var event_data = {};
            if (event != "") {
                if (event == "Purchase") {
                    var cart_id = THIS.getQueryStr("cartId");
                    var cart_data = THIS.w.localStorage.getItem(cart_id);
                    if (cart_data != undefined && cart_data != null) {
                        event_data.currency =  toUpperCase(CURRENCY);
                        event_data.value = cart_data.grandTotal;
                    }
                }
            }
            
            if (THIS.FBevents.indexOf(event) != -1) {
                if (event != "PageView") {
                    fbq('track',event,event_data);
                }
            }else{
                fbq('trackCustom',event,event_data);
            }
            
        }
    }

    this.update_lead = function(data){
        var email = data["email"];
    }

    this.checkConfig(this.init);
}