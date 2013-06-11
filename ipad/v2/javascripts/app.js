$(document).ready(function(){

	var supportsTouch = 'createTouch' in document;
	var cursorDownEvent = (supportsTouch ? 'touchstart' : 'mousedown')
	var cursorMoveEvent = (supportsTouch ? 'touchmove' : 'mousemove')
	var cursorUpEvent = (supportsTouch ? 'touchend' : 'mouseup')
	var tapEvent = (supportsTouch ? 'tapone' : 'click')

	var $container = $("#container")
	var containerWidth = parseInt($container.width())
	var $body = $('body')

	var $main = $(".main-panel")
	var $menu = $("#menu")
	var menuWidth = $menu.width()
	var swipeThreshold = .10;

	var menu = {
		$el: $menu,
		percOpen: 0,
		lastDir: "right",
		startPosition: {x: 0, y: 0},
		isOpen: function() {
			return ($main.offset().left == 250)
		},
		wasOpen: false,
		open: function() {

			animate($main, menuWidth, 0, 0, ".5s")
			this.wasOpen = true;
		},
		close: function() {

			animate($main, 0, 0, 0, ".5s")
			this.wasOpen = false;
		},
		toggle: function() {

			if(this.isOpen())
				this.close();
			else
				this.open();
		}
	}

	function mouseDown(e) {
		if(e.target.id === "main") {
			e.preventDefault();
			menu.startPosition.x = e.pageX;
			menu.startPosition.y = e.pageY;

			if(event.touches) {
				menu.startPosition.x = event.touches[0].pageX;
				menu.startPosition.y = event.touches[0].pageY;
			}

			$main.on(cursorMoveEvent, startDrag);
			$main.on(cursorUpEvent, function(e) {
					finishDrag();
			});
		}
	}

	function startDrag(e) {
		e.preventDefault();
		var x = e.pageX;

		if(event.touches)
			x = event.touches[0].pageX

		var dir = (menu.startPosition.x - x > 0 ? "left" : "right")
		var dist = Math.abs(menu.startPosition.x - x);
		var perc = (dir === "left" ? (menu.startPosition.x - dist) / menu.startPosition.x : (x - menu.startPosition.x) / menuWidth)

		if(dir === "right" && menu.wasOpen)
			return

		if(dir === "left" && !menu.wasOpen)
			return

		perc = Math.max(0, perc);
		perc = Math.min(1, perc);

		menu.percOpen = perc;
		menu.lastDir = dir;

		animate($main, menuWidth * perc, 0, 0,"0ms");

		if(dir === "right" && perc >= (1 - swipeThreshold ) || dir === "left" && perc <= swipeThreshold )
			finishDrag();

	}

	function finishDrag() {
		$main.off(cursorMoveEvent).off(cursorUpEvent);

		if( menu.percOpen >= .20 && menu.lastDir === "right") {
			menu.open();
			return;
		}

		if( menu.percOpen <= .80 && menu.lastDir === "left") {
			menu.close();
			return;
		}

		if( menu.percOpen >= .5)
			menu.open();
		else
			menu.close();
	}

	function initEvents() {
		$main.on(cursorDownEvent, mouseDown);

		$(".menu-button").on(tapEvent, function(e) {
			menu.toggle();
			e.preventDefault();
		})
	}
	
	function animate($el, x, y, z, dur) {
		$el.css('-webkit-transition', '-webkit-transform ' + dur||".5s")
		$el.css('-webkit-transform', 'translate3d('+x+'px,'+y+'px,'+z+'px)')
	}

	initEvents();

});
