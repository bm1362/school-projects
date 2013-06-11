var App = {
	activeRegion: {},
	activeMap: {},
	maps: {},
	isAdmin: true
};

App.render = function() {

	for( var i in App.maps ) {
		for ( var j in App.maps[i].regions ) {
		
		}
	}

    var currentID = $("#map-select option:selected").data('map-id');
    var currentMap = App.maps[currentID];

    App.activeMap = currentMap;

	if(App.activeRegion instanceof App.Region) {
        $("#act-region").html(App.activeRegion.toHTML())
	}

	if(App.activeMap instanceof App.Map) {
        $("#act-map").html(App.activeMap.toHTML())
	}
}

App.toggleAdmin = function() {
	App.isAdmin = !App.isAdmin;
	if(App.isAdmin) {
		$("#toolbar #admin").show();
		$("svg .sizer").show();

		applyToRegions(function(region){
			region.set.attr("fill", region.attrs.fill);
		})
		
	}
	else{
		$("#toolbar #admin").hide();
		$("svg .sizer").hide();

		applyToRegions(function(region){
			region.set.attr("fill", "#fff");
		})
	}
}

function applyToRegions(func) {
	for( var i in App.maps ) {
		for ( var j in App.maps[i].regions ) {
			func(App.maps[i].regions[j]);
		}
	}
}

App.init = function() {
	setInterval(App.render, 100);
}