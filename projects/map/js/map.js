(function() {
    App.Map = function(container, map) {

        //if no container, bind to body
        if( typeof container === undefined ) {
            container = document.createElement('<div class="map"><div class="map-bg"></div></div>');
            $(body).append(container);
        }

        //set container
        this.$container = $(container);

        //if importing a map
        console.log(map)
        if( typeof map !== 'undefined') {
            this.id = map.id
            this.left = map.left;
            this.top = map.top;
            this.width = map.width;
            this.height = map.height;
            this.regions = map.regions;
            this.bgSrc = map.bgSrc;

            this.$container.css('width', this.width);
            this.$container.css('height', this.height);
            this.$container.css('left', this.left);
            this.$container.css('top', this.top);

            this.$container.addClass("map");

            this.$container.append("<div class='map-bg'><img src='" + this.bgSrc + "'></img></div>");

            App.maps[this.id] = this;

            //create paper
            this.paper = Raphael(this.left, this.top, this.width, this.height);

            for( var i in this.regions ) {
                new App.Region(this, this.regions[i])
            }

        }else {

            //gen id
            this.id = Raphael.createUUID();

            //set map dimensions variables
            this.left = this.$container.offset().left;
            this.top = this.$container.offset().top;
            this.width = this.$container.outerWidth();
            this.height = this.$container.outerHeight();

            //create paper
            this.paper = Raphael(this.left, this.top, this.width, this.height);

            //stores child regions
            this.regions = {};
        }

        this.$container.data('map-id', this.id);

        //set id as an attribute on the svg element so we can reference the map object during events
        $(this.paper.canvas).data('map-id', this.id);

        //store bg info
        this.$bg = this.$container.find('img');
        this.bgSrc = this.$bg.attr("src");

        this.name = this.$container.attr("id");
    }

    App.Map.prototype.export = function () {
        var output = {
            id: this.id,
            name: this.name,
            left: this.left,
            top: this.top,
            width: this.width,
            height: this.height,
            bgSrc: this.bgSrc,
            regions: (function(map) { 
                var o = {}

                for( var i in map.regions ) {
                    o[i] = JSON.parse(map.regions[i].toJSON());
                }

                return o;
            })(this),
        }

        return JSON.stringify(output);
    }

    App.Map.prototype.toHTML = function () {
        var html = "<ul>";
        for( var i in this ) {
            if( typeof this[i] === "string" )
                html += "<li>" + i + ": " + this[i] + "</li>";
        }

        html += "</ul>";
        return html;
    }
})();
