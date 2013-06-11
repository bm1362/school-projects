(function( $ ){
	var supportsTouch = 	'createTouch' in document,
		cursorDownEvent = 	supportsTouch ? 'touchstart.slider' : 'mousedown.slider',
		cursorMoveEvent = 	supportsTouch ? 'touchmove.slider' : 'mousemove.slider',
		cursorUpEvent = 	supportsTouch ? 'touchend.slider' : 'mouseup.slider';
	
	function animate ($el, x, y, z, dur) {
		$el.css('-webkit-transition', '-webkit-transform ' + dur||".5s")
		$el.css('-webkit-transform', 'translate3d('+x+'px,'+y+'px,'+z+'px)')
	}

	function getList($title) {
		var listID = $title.attr('data-list-id');
		var list = $(".accordion-list[data-id='"+listID+"']");
		return list;
	}

	function getTitle($list) {
		var id = $list.attr('data-id');
		var title = $(".accordion-list-title[data-list-id='"+id+"']");
		return title;
	}

	$.fn.accordion = function( options ) {

		var $el = this;

		if(supportsTouch)
			$("body").attr("ontouchstart", "");

	    // Create some defaults, extending them with any options that were provided
	    var settings = $.extend( {

	    }, options);

	    var parents = $("ul", $el);
	    var children = $("li", $el);
	    var titles = $("div", $el);

	    parents.addClass('accordion-list');
	    children.addClass('accordion-list-index');
	    titles.addClass("accordion-list-title")

	    $.each(parents, function() {
	    	var list = $(this);
	    	var id = list.attr('data-id');
	    	
	    	//find matching title element
	    	var title = getTitle(list);

	    	//add event to title element
	    	title.on(cursorDownEvent, function(e) {
	    		e.preventDefault();

	    		if(list.queue().length > 1)
	    			return;

	    		//on click flip state
	    		var isOpen = list.data().isOpen;
	    		isOpen = !isOpen;
	    		list.data('isOpen', isOpen);

	    		//close other actives
	    		var actives = $(".accordion-list-title.active")

	    		$.each(actives, function () {
	    			var $title = $(this)
	    			var $list = getList($title);

	    			if(list.data().id !== $list.data().id) {
	    				$title.removeClass('active')
	    				$list.data('isOpen', false);
	    				$list.animate({
	    					height: "hide"
	    				}, 300)

	    			}
	    		})

	    		if(isOpen) {
	    			title.addClass('active')
	    			//do animation
		    		list.animate({
		    			height: "show"
		    		}, 300)
	    		}
	    		else {
	    			title.removeClass('active')
	    			list.animate({
		    			height: "hide"
		    		}, 300)
	    		}	    		
	    	});

	    	//set state
	    	list.data('isOpen', false);

	    	//close list
	    	list.animate({
	    			height: "hide"
	    	}, 0)



	    });

		$el.on(cursorDownEvent, function(e) {
			e.preventDefault();
		})

		//$(".accordion-list").on(cursorDownEvent, function(e){
		//	e.preventDefault();
		//})

	    return this;

	};
})( jQuery );