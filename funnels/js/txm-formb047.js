(function ($) {
    var originalVal = $.fn.val;
    $.fn.val = function (value) {
        if (arguments.length >= 1) {
            // setter invoked, do processing
            if($(this).parents('.custom_form_tm').length > 0){
              return originalVal.call(this, value).trigger('change');
            } else {
              return originalVal.call(this, value);//.trigger('change');
            }
        }
        //getter invoked do processing
        return originalVal.call(this);
    };
})(jQuery);

$(document).ready(function(){
	var all_txm_input = new TxmCustomForm();
  all_txm_input.init();
});

TxmCustomForm = function(){
	this.init = function(){
		this.initEvent();
    // console.log("$('.custom_form_tm .form_input')",$('.custom_form_tm .form_input'))
    $('.custom_form_tm .form_input').each(function(e,input){
      if($(input).val() != "" || $(input).attr('placeholder') != undefined){
        $(input).parents('.custom_form_tm').addClass('active');
      } else {
        $(input).parents('.custom_form_tm').removeClass('active');
      }
      $(input).trigger('change');
    });
	}

	this.initEvent = function(){
    var _this = this;
		$(document).on('focus','.custom_form_tm .form_input',function(){
      if ($(this).attr('readonly') != 'readonly') {
  		  $(this).parents('.custom_form_tm').addClass('focus active');
      }
      
      if ($(this)[0].nodeName.toLowerCase() == 'select') {
        $(this).parents('.custom_form_tm').find('.select-arrow .down').addClass('d-none');
        $(this).parents('.custom_form_tm').find('.select-arrow .up').removeClass('d-none');
      }
		});
    
		$(document).on('focusout','.custom_form_tm .form_input',function(){
  		if($(this).val() == ""){
  			$(this).parents('.custom_form_tm').removeClass('focus active');
        if($(this).attr('placeholder') != undefined){
          $(this).parents('.custom_form_tm').addClass('active');
        }
  		} else {
        $(this).parents('.custom_form_tm').removeClass('focus');
      }

      if ($(this)[0].nodeName.toLowerCase() == 'select') {
        $(this).parents('.custom_form_tm').find('.select-arrow .down').removeClass('d-none');
        $(this).parents('.custom_form_tm').find('.select-arrow .up').addClass('d-none');
      }
		});

    $(document).on('change','.custom_form_tm .form_input',function(event){
      $(this).parents('.custom_form_tm').removeClass('has-error');
      if($(this).val() != "" || $(this).attr('placeholder') != undefined){
        $(this).parents('.custom_form_tm').addClass('active');
      } else {
        $(this).parents('.custom_form_tm').removeClass('focus active');
      }
    });

    $(document).on('input','.custom_form_tm .form_input',function(event){
      var val = $.trim($(this).val());

      if (val != '') {
        $(this).parents('.custom_form_tm').removeClass('has-error');
      }
    });
	}
}
