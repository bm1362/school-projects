//on drag/touch event handlers
//render elements and their current state
//animate slide outs
$(document).ready(function(){

	var supportsTouch = 'createTouch' in document;
	var cursorDownEvent = (supportsTouch ? 'touchstart' : 'mousedown')
	var cursorMoveEvent = (supportsTouch ? 'touchmove' : 'mousemove')
	var cursorUpEvent = (supportsTouch ? 'touchend' : 'mouseup')

	var $container = $("#container")
	var $leftTab = $("#left-tab");
	var $rightTab = $("#right-tab");
	var docWidth = $(document).width()
	var panelWidth = $(".panel").width()
	var tabWidth = $(".pull-tab").width()
	var startPos;
	var startTime = new Date();

	var currentPanel = {
		$el: null,
		perc: 0,
		view: {}
	}

	var leftMenuView = {
		$el: $leftTab.parent(),
		isOpen: false,
		open: function() {
			this.$el.css('-webkit-transition', "all .5s ease-in-out")
			anim(this.$el,panelWidth,0,0);
			this.isOpen = true;
		},
		close: function() {
			this.$el.css('-webkit-transition', "all .5s ease-in-out")
			anim(this.$el,0,0,0);
			this.isOpen = false;
		},
		toggle: function() {
			(this.isOpen ? this.close() : this.open())
		}
	}

	var rightMenuView = {
		$el: $rightTab.parent(),
		isOpen: false,
		open: function() {
			this.$el.css('-webkit-transition', "all .5s ease-in-out")
			anim(this.$el,-panelWidth,0,0);
			this.isOpen = true;
		},
		close: function() {
			this.$el.css('-webkit-transition', "all .5s ease-in-out")
			anim(this.$el,0,0,0);
			this.isOpen = false;
		},
		toggle: function() {
			(this.isOpen ? this.close() : this.open())
		}
	}

	function bindEvents() {

		$container.on(cursorUpEvent, function(e){

			if(new Date() - startTime < 150)
				currentPanel.view.toggle()
			else
				currentPanel.perc > .5 ? currentPanel.view.open() : currentPanel.view.close()

			removeEvents();
		})

		$container.on(cursorMoveEvent, function(e){
			var pageX = event.pageX
	  		if (event.touches) pageX = event.touches[0].pageX;

	  		var newX = (currentPanel.$el.hasClass("left-side") ? pageX: pageX - docWidth) 
	  		var dir = (pageX - startPos < 0 ? "left" : "right")

	  		if(currentPanel.$el.hasClass("left-side")) {
	  			newX = Math.min(panelWidth, newX)
	  			newX = Math.max(0, newX)
	  			anim(currentPanel.$el,newX,0,0)

	  			if(newX >= panelWidth && dir === "right"){
	  				leftMenuView.open();
	  				removeEvents();
	  			}
	  			if(newX <= 0 || (Math.abs(newX) < 20 && dir === "left")){
	  				leftMenuView.close();
	  				removeEvents();
	  			}
	  		}else{
	  			newX = Math.max(-panelWidth, newX)
	  			newX = Math.min(0, newX)
	  			anim(currentPanel.$el,newX,0,0)

	  			if(newX <= -panelWidth && dir === "left"){
	  				rightMenuView.open()
	  				removeEvents();
	  			}

	  			if(newX >= 0 || (Math.abs(newX) < 20 && dir === "right")) {
	  				rightMenuView.close();
	  				removeEvents();
	  			}
	  		}

	  		var perc = Math.abs(newX/panelWidth)
	  		currentPanel.perc = perc

		})
	}

	function removeEvents() {
		$container.off(cursorMoveEvent)
		$container.off(cursorUpEvent)
		//currentPanel = {};
	}

	function anim($el, x, y, z) {
		var css = 'translate3d('+x+'px,'+y+'px,'+z+'px)';
		$el.css('-webkit-transform', css)
	}

	function init() {

		$leftTab.on(cursorDownEvent, function(e){
			e.preventDefault();
			bindEvents();

			currentPanel.$el = $leftTab.parent();
			currentPanel.$el.css('-webkit-transition', "all 0s ease-in-out")
			currentPanel.view = leftMenuView;
			startPos = event.pageX;
			if (event.touches) startPos = event.touches[0].pageX;
			startTime = new Date()

		});

		$rightTab.on(cursorDownEvent, function(e){
			e.preventDefault();
			bindEvents();

			currentPanel.$el = $rightTab.parent();
			currentPanel.$el.css('-webkit-transition', "all 0s ease-in-out")
			currentPanel.view = rightMenuView;
			startPos = event.pageX;
			if (event.touches) startPos = event.touches[0].pageX;
			startTime = new Date()
		});
	}

	init();
})