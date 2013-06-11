require(["javascripts/libs/jquery-1.7.2.min.js", "javascripts/libs/jquery.slider.js", "javascripts/libs/underscore-min.js", "javascripts/libs/backbone-min.js"], function($, slide,_, Backbone) {
	var supportsTouch = 	'createTouch' in document,
		cursorDownEvent = 	supportsTouch ? 'touchstart' : 'mousedown',
		cursorMoveEvent = 	supportsTouch ? 'touchmove' : 'mousemove',
		cursorUpEvent = 	supportsTouch ? 'touchend' : 'mouseup',
		tapEvent = 			supportsTouch ? 'touchstart' : 'click'

	var a;
	console.log(Backbone)
	(function($, _, Backbone){

		var app = {
			views: {},
			classes: {}
		}

		a = app;

		app.classes.LayoutView = Backbone.View.extend({    
			el: $("#container"),
			base: '',
			views: {},
			background: {},
			context: {},

			initialize: function(){
				_.bindAll(this, 'render'); 
				ev = {};
				ev[tapEvent] = "preventDrag";
				this.delegateEvents(ev);
			},

			preventDrag: function(e) {
				e.preventDefault();
			},

			show: function() {
				this.render();
				app.views.main.$el.css("background", "url(" + this.background.url + ")");
			},

			render: function(){
				for( i in this.views ) {
					this.views[i].render(this.base)
				}
			}
		});

		app.views.dockTop = new (Backbone.View.extend({
			el: $("#dock-top"),

			initialize: function(){
			  _.bindAll(this, 'render');

			  var ev = {}
			  ev[tapEvent + ' #left-menu-button'] = "toggleMenu"

			  this.delegateEvents(ev);
			},

			render: function(base) {
				this.$el.html( $("#" + base + "_dock_top").html() )
			},

			toggleMenu: function(e) {
				e.preventDefault();
				app.views.leftMenu.toggle();
			},
		}));

		app.views.dockBottom = new (Backbone.View.extend({
			el: $("#dock-bottom"),

			initialize: function(){
			  _.bindAll(this, 'render'); 
			},

			render: function(base) {
				this.$el.html( $("#" + base + "_dock_bottom").html())
			}
		}));

		app.views.main = new (Backbone.View.extend({
			el: $("#main"),

			initialize: function(){
			  _.bindAll(this, 'render');

			  var ev = {}
			  ev[tapEvent + ' #home-sys-opts-menu'] = "toggleMenu";
			  ev[tapEvent + ' #home-sys-opts-call'] = "switchToCall";
			  ev[tapEvent + ' #call-end-button'] = "switchToHome";

			  this.delegateEvents(ev);
			},

			render: function(base) {
				this.$el.html( $("#" + base + "_main").html())
			},

			toggleMenu: function(e) {
				app.views.leftMenu.toggle();
				e.preventDefault();
			},

			switchToHome: function() {
				app.views.leftMenu.close();
				app.views.rightMenu.close();
				app.router.navigate('home', {trigger:true})
			},

			switchToCall: function() {
				app.views.leftMenu.close();
				app.views.rightMenu.close();
				app.router.navigate('call', {trigger:true})
			}
		}));

		app.views.leftMenu = new (Backbone.View.extend({
			el: $("#leftMenu"),
			startOffset: 0,
			openOffset: 0,

			initialize: function(){
				_.bindAll(this, 'render');
				this.closeOffset = 0;
				this.openOffset = this.$el.outerWidth();
				this.$el.css("left", -this.$el.outerWidth());
				this.$el.css("top", app.views.dockTop.$el.outerHeight());
				this.$el.css("height", app.views.main.$el.height() - app.views.dockTop.$el.outerHeight() - app.views.dockBottom.$el.outerHeight() )

				///start hw acceleration early
				animate(this.$el, -this.openOffset, 0, 0, '.0s');
				animate(this.$el, -this.closeOffset, 0, 0, '.0s');
			},

			render: function(base) {
				this.$el.html( $("#" + base + "_left_menu").html())
			},

			isOpen: function() {
				return this.$el.css('-webkit-transform') === "matrix(1, 0, 0, 1, " + this.openOffset +', 0)';
			},

			open: function() {
				if(this.isOpen())
					return;

				animate(this.$el, this.openOffset, 0, 0, '.5s');
			},

			close: function() {
				if(!this.isOpen())
					return;

				animate(this.$el, this.closeOffset, 0, 0, '.5s');
			},

			toggle: function() {
				if(this.isOpen())
					this.close();
				else
					this.open();
			}
		}));

		app.views.rightMenu = new (Backbone.View.extend({
			el: $("#rightMenu"),
			startOffset: 0,
			openOffset: 0,

			initialize: function(){
				_.bindAll(this, 'render');
				this.closeOffset = 0;
				this.openOffset = this.$el.outerWidth();
				this.$el.css("right", -this.$el.outerWidth());
				this.$el.css("top", app.views.dockTop.$el.outerHeight());
			},

			render: function(base) {
				this.$el.html( $("#" + base + "_right_menu").html())

			},

			isOpen: function() {
				return this.$el.css('-webkit-transform') === "matrix(1, 0, 0, 1, " + -this.openOffset +', 0)';
			},

			open: function() {
				if(this.isOpen())
					return;

				animate(this.$el, -this.openOffset, 0, 0, '.5s');
			},

			close: function() {
				if(!this.isOpen())
					return;

				animate(this.$el, -this.closeOffset, 0, 0, '.5s');
			},

			toggle: function() {
				if(this.isOpen())
					this.close();
				else
					this.open();
			}
		}));

		app.views.home = new app.classes.LayoutView()
		app.views.home.base = 'home';
		app.views.home.views = {
			dockTop: app.views.dockTop,
			main: app.views.main,
			dockBottom: app.views.dockBottom,
			leftMenu: app.views.leftMenu
		}
		app.views.home.background = {url: "images/home.jpg"};

		app.views.call = new app.classes.LayoutView()
		app.views.call.base = 'call';
		app.views.call.views = {
			dockTop: app.views.dockTop,
			main: app.views.main,
			dockBottom: app.views.dockBottom,
			leftMenu: app.views.leftMenu,
			rightMenu: app.views.rightMenu
		}
		app.views.call.background = {url: "images/call.jpg" };

		app.views.menu = new app.classes.LayoutView()
		app.views.menu.base = 'menu';
		app.views.menu.views = {
			dockTop: app.views.dockTop,
			main: app.views.main,
			dockBottom: app.views.dockBottom,
			leftMenu: app.views.leftMenu,
			rightMenu: app.views.rightMenu
		}

		app.classes.router = Backbone.Router.extend({
			routes: {
				"":"home",
				"home":"home",
				"call":"call",
				"menu":"menu"
			},

			initialize: function () {

			},
			home: function() {
				app.views.home.show();
			},
			call: function() {
				app.views.call.show();
				$(".slider").slider({
					boundWidth: 0,
					boundHeight: 0,
					knobWidth: 40,
					knobHeight: 15,
					guideHeight: 3,
				});
			},
			menu: function () {
				app.views.menu.show();
			}
		});

		app.router = new app.classes.router();
		Backbone.history.start();


		function animate ($el, x, y, z, dur) {
			$el.css('-webkit-transition', '-webkit-transform ' + dur||".5s")
			$el.css('-webkit-transform', 'translate3d('+x+'px,'+y+'px,'+z+'px)')
		}

	})(jQuery, _, Backbone);
});