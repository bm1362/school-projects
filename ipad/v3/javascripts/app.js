var a;
$(document).ready(function () {

	var app = {
		views: {},
		events: {
			base: [],
			home: [],
			call: []
		},
		backgrounds: {
			'home': 'images/home.jpg',
			'call': 'images/call.jpg'
		},
		currentView: null
	}

	var supportsTouch = 	'createTouch' in document,
		cursorDownEvent = 	supportsTouch ? 'touchstart' : 'mousedown',
		cursorMoveEvent = 	supportsTouch ? 'touchmove' : 'mousemove',
		cursorUpEvent = 	supportsTouch ? 'touchend' : 'mouseup',
		tapEvent = 			supportsTouch ? 'tapone' : 'click',

		$container = 		$("#container"),
		containerWidth = 	parseInt($container.width(), 10),
		$body = 			$('body'),

		$main = 			$(".main-panel"),
		swipeThreshold = 	.10;

	//Main View
	var	main = {
		$el: $main,
		events: {
			preventProp: {
				map: {},
				add: function (target) {
					if (!this.map.hasOwnProperty(target))
						this.map[target] = 1; 
				},
				remove: function (target) {
					if (this.map.hasOwnProperty(target))
						this.map[target] = null; 
				},
				has: function (target) {
					return this.map.hasOwnProperty(target);
				}
			},
		}
	}

	app.views.main = main;

	//Menu View Class
	var	menu = function(options) {
		var obj = {
			$el: options.$el || $("#menu"),
			startOffset: options.startOffset,
			openOffset: options.openOffset,
			percOpen: 0,
			width: options.width || options.$el.outerWidth(),
			height: options.height || options.$el.height()
		};

		obj.init = function() {
			animate(this.$el, this.openOffset, 0, 0, '0s');
			animate(this.$el, this.startOffset, 0, 0, '0s');
		}

		obj.isOpen = function() {
			return this.$el.css('-webkit-transform') === "matrix(1, 0, 0, 1, " + obj.openOffset +', 0)';
		}

		obj.open = function() {
			if(this.isOpen())
				return;

			animate(this.$el, this.openOffset, 0, 0, '.5s');
			this.percOpen = 1;
		}

		obj.close = function() {
			if(!this.isOpen())
				return;

			animate(this.$el, this.startOffset, 0, 0, '.5s');
			this.percOpen = 0;
		}

		obj.toggle = function() {
			if(this.isOpen())
				this.close()
			else
				this.open()
		}

		obj.$el.height(obj.height)
		obj.$el.width(obj.width)
		obj.$el.css('top', 0)//$("#dock-top").height())

		if(obj.$el.hasClass('left-side'))
			obj.$el.css("left", -obj.width)

		if(obj.$el.hasClass('right-side'))
			obj.$el.css("right", -obj.width)

		return obj;
	}

	//Events for touch/swipe
	/*function mouseDown(e) {
		if (!main.events.preventProp.has(e.target.id) && !main.events.preventProp.has(e.target.className)) {
			e.preventDefault();
			var x = e.pageX,
				y = e.pageY;

			if(event.touches) {
				x = event.touches[0].pageX;
				y = event.touches[0].pageY;
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
	}

	function finishDrag() {
		$main.off(cursorMoveEvent).off(cursorUpEvent);
	}*/


	//Utility Functions

	function initEvents() {
		//bind main drag..
		//$main.on(cursorDownEvent, mouseDown);

		//bind on container, prevent default behavior of Safari dragging around
		$container.on(cursorDownEvent, function(e){
			e.preventDefault();
		});

		//main.events.preventProp.add('left-menu-button');

		var openLeftMenu = (function(e) {
			e.preventDefault();
			app.views.leftMenu.toggle();
		});

		//Bind left menu buttons
		app.events['base'].push({
			target: "#left-menu-button",
			trigger: tapEvent,
			handler: openLeftMenu
		});

		app.events['home'].push({
			target: "#home-sys-opts-menu",
			trigger: tapEvent,
			handler: openLeftMenu
		});

		app.events['home'].push({
			target: "#home-sys-opts-call",
			trigger: tapEvent,
			handler: (function(){ showView('call') })
		});

		app.events['call'].push({
			target: "#call-end-button",
			trigger: tapEvent,
			handler: (function(){ showView('home') })
		});

		addEvents('base');
	}

	function animate ($el, x, y, z, dur) {
		$el.css('-webkit-transition', '-webkit-transform ' + dur||".5s")
		$el.css('-webkit-transform', 'translate3d('+x+'px,'+y+'px,'+z+'px)')
	}

	function addEvents( view ) {
		if(app.events[view])
			for(var i in app.events[view]) {
				var ev = app.events[view][i];
				$(ev.target).bind(ev.trigger, ev.handler)
			}
	}

	function removeEvents( view ) {
		if(app.events[view])
			for(var i in app.events[view]) {
				var ev = app.events[view][i];
				$(ev.target).unbind(ev.trigger)
			}
	}

	function showView(view) {

		//close menus if they're open
		app.views.leftMenu.close();
		app.views.rightMenu.close();

		//remove old events
		removeEvents(app.currentView);
		app.currentView = view;

		//set background
		$("#main").css('background-image', 'url(' + app.backgrounds[view] + ' )');

		//set left menu context
		var leftMenuHtml = _.template($("#" + view+'_left_menu').html());
		$("#leftMenu > .content").html( leftMenuHtml );

		//set left menu context
		var rightMenuHtml = _.template($("#" + view+'_right_menu').html());
		$("#rightMenu > .content").html( rightMenuHtml );

		//set main content
		var mainHtml = _.template($("#" + view).html());
		$("#main > .content").html( mainHtml );

		//add new events
		addEvents( app.currentView );

	}

	function init() {

		//Left Menu View
		app.views.leftMenu = new menu({
			$el: $("#leftMenu"),
			startOffset: $('#leftMenu').width() - $('#leftMenu').outerWidth(),
			openOffset: $('#leftMenu').outerWidth(),
			height: $container.height() //- $("#dock-top").height() - $("#dock-bottom").height()
		});

		//Right Menu View
		app.views.rightMenu = new menu({
			$el: $("#rightMenu"),
			startOffset: $('#rightMenu').width() - $('#rightMenu').outerWidth(),
			openOffset: -$('#rightMenu').outerWidth(),
			height: $container.height() //- $("#dock-top").height() - $("#dock-bottom").height()
		});

		app.views.leftMenu.init();
		app.views.rightMenu.init();

	}

	//Start App
	init();
	initEvents();
	showView('home');

	a = app;
	a.show = showView;
	a.addEv = addEvents;
});
