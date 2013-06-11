(function( $ ){

	$.fn.slider = function( options ) {

		var $el = this;

		if(options === "val")
			return getValue();

		if(isInitialized() && options !== "reset")
			return;

	    // Create some defaults, extending them with any options that were provided
	    var settings = $.extend( {
			'width': this.width(),
			'height': this.height(),

			'guideWidth': this.width() * .5,
			'guideHeight': 5,

			'boundWidth': 10,
			'boundHeight': 10,

			'knobWidth': 20,
			'knobHeight': 40,

			'startValue': .5,

			'increment': .03,
			'buttonWidth': 50,
			'buttonHeight': 25

	    }, options);

	    var supportsTouch = 	'createTouch' in document,
			cursorDownEvent = 	supportsTouch ? 'touchstart.slider' : 'mousedown.slider',
			cursorMoveEvent = 	supportsTouch ? 'touchmove.slider' : 'mousemove.slider',
			cursorUpEvent = 	supportsTouch ? 'touchend.slider' : 'mouseup.slider';

		var $guide = $("<div class='slider-guide'></div>"),
			$leftBound = $("<div class='slider-left-bound'></div>"),
			$rightBound = $("<div class='slider-right-bound'></div>"),
			$knobWrapper = $("<div class='slider-knob-wrapper'></div>"),
			$knob = $("<div class='slider-knob'></div>"),
			$dec = $("<div class='slider-dec-btn'></div>"),
			$inc = $("<div class='slider-inc-btn'></div>"),

			leftBound,
			rightBound,
			knobStart,

			interval;



	    function initialize() {
	    	value = settings.startValue;
	    	setValue(value)

			$el.css('-webkit-tap-highlight-color','rgba(0,0,0,0)')

			var offset = $el.offset().left;

			leftBound = offset + ((settings.width - settings.guideWidth)/2);
			rightBound = offset + ((settings.width + settings.guideWidth)/2) - settings.knobWidth/2 + settings.boundWidth;

			knobStart = offset + ((settings.startValue * settings.width) - settings.knobWidth/2);
			var baseHeight = settings.height/2; //offset.top + settings.height/2;

			$guide.width(settings.guideWidth).height(settings.guideHeight);

			$leftBound.width(settings.boundWidth).height(settings.boundHeight);

			$rightBound.width(settings.boundWidth).height(settings.boundHeight);

			$knob.width(settings.knobWidth).height(settings.knobHeight);

			$knobWrapper.width(settings.knobWidth).height(settings.knobHeight);
			$knob.append($knobWrapper);

			$inc.width(settings.buttonWidth).height(settings.buttonHeight);
			$dec.width(settings.buttonWidth).height(settings.buttonHeight);

			$el.prepend($dec).prepend($guide).prepend($leftBound).prepend($rightBound).prepend($knob).prepend($inc);

			$dec.css("position", "absolute").css("top", (baseHeight - settings.buttonHeight/2) + "px").css("left", leftBound - (2 * settings.buttonWidth) + "px");
			$guide.css("position", "absolute").css("top", (baseHeight - settings.guideHeight/2) + "px").css("left", leftBound + settings.boundWidth + "px");
			$leftBound.css("position", "absolute").css("top", (baseHeight - settings.boundHeight/2) + "px").css("left", leftBound + "px");
			$rightBound.css("position", "absolute").css("top", (baseHeight - settings.boundHeight/2) + "px").css("left", rightBound + "px");
			$knob.css("position", "absolute").css("top",  (baseHeight - settings.knobHeight/2) + "px").css("left", knobStart + "px");
			$inc.css("position", "absolute").css("top", (baseHeight - settings.buttonHeight/2) + "px").css("left", (rightBound + settings.knobWidth/2 + settings.buttonWidth) + "px");
			$knobWrapper.css("position", "absolute").css("padding", "15px").css("left", -$knob.width()/2).css("top", -$knobWrapper.height())


			$knobWrapper.on(cursorDownEvent, onCursorDown)
			$inc.on(cursorDownEvent, onCursorDown)
			$dec.on(cursorDownEvent, onCursorDown)

			//prevent window drag on mobile
			$el.on(cursorDownEvent, function(e) {
				e.preventDefault();
			})

			$.data( $el, 'init', true)

	    }

	    function animate ($el, x, y, z, dur) {
			$el.css('-webkit-transition', '-webkit-transform ' + dur||".5s")
			$el.css('-webkit-transform', 'translate3d('+x+'px,'+y+'px,'+z+'px)')
		}

		function onCursorDown(e) {
			e.preventDefault();

			if(e.target.className === "slider-knob-wrapper") {
				$(document).on(cursorMoveEvent, onCursorMove)
			}

			if(e.target.className === "slider-inc-btn") {
				increment();
				interval = setInterval(increment, 15);
			}

			if(e.target.className === "slider-dec-btn") {
				decrement();
				interval = setInterval(decrement, 15);
			}

			$(document).on(cursorUpEvent, onCursorUp)
		}

		function onCursorMove(e) {
			e.preventDefault();

			var x = e.pageX;

			if(event.touches)
				x = event.touches[0].pageX;

			x = Math.max(x, leftBound)
			x = Math.min(x, rightBound - settings.knobWidth/2 + 1)
			var value = (x - leftBound) / (rightBound - leftBound);

			setValue(value)
		}

		function onCursorUp() {
			clearInterval(interval)
			$(document).off(cursorUpEvent)
			$(document).off(cursorMoveEvent)
		}

		function setValue(value) {

			value = Math.min(value, 1.0);
			value = Math.max(value, 0);

			$el.data('value', value);

			var x = (value * (rightBound - leftBound)) + leftBound;
			x = Math.max(x, leftBound)
			x = Math.min(x, rightBound - settings.knobWidth/2 + 1)
			animate($knob, (x - knobStart), 0, 0, "0s")
		}

		function increment() {
			var value = getValue() + settings.increment;
			setValue(value)
		}

		function decrement() {
			var value = getValue() - settings.increment;
			setValue(value)
		}

		function getValue() {
			return $el.data('value')
		}

		function isInitialized() {
			return $el.data('init');
		}

		initialize();
	    return this;

	};
})( jQuery );