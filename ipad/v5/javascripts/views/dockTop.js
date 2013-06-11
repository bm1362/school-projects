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