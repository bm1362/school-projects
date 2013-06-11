App.Region = function( map, options ) {
    //set defaults
    this.attrs = {
        height: options.height || 26,
        width: options.width || 26,
        position: { x: options.x || 10, y: options.y || 10 },
        fill: options.fill || "#BD362F",
        opacity: options.opacity || .65,
        stroke: options.stroke || "#000"
    };



    var region = this;
    this.id = options.id || Raphael.createUUID();
    this.properties = options.properties || {
        name: "Ben Mays",
        roomNumber: "1024",
        phoneNumber: "512.681.4246"
    };

    //create rect
    this.element = map.paper.rect(this.attrs.position.x, this.attrs.position.y, this.attrs.width, this.attrs.height);

    //create resize circle
    this.resize = map.paper.circle(this.attrs.position.x + this.attrs.width, this.attrs.position.y + this.attrs.height, 10)

    //apply css styles
    this.element.attr("fill", this.attrs.fill);
    this.element.attr("stroke", this.attrs.stroke);
    this.element.attr("opacity", this.attrs.opacity);
    $(this.resize.node).attr('class', 'drag sizer');

    //merge them as a set
    this.set = map.paper.set();
    this.set.push(
        this.element,
        this.resize
    );

    var active = false;
    var locked = false;

    

    //useful utility functions
    this.element.topLeft = function() { return {x: this.attr('x'), y: this.attr('y')} }
    this.element.topRight = function() { return {x: this.attr('x') + this.attr('width'), y: this.attr('y')} }
    this.element.bottomLeft = function() { return {x: this.attr('x'), y: this.attr('y') + this.attr('height')} }
    this.element.bottomRight = function() { return {x: this.attr('x') + this.attr('width'), y: this.attr('y') + this.attr('height')}}

    //bind drag events
    this.set.drag(function(dx, dy, x, y, e) {

        if( (!App.isAdmin) || region.locked ) { return; }
        var self = this;
        var xProp = this.type === "rect" ? 'x' : 'cx';
        var yProp = this.type === "rect" ? 'y' : 'cy';

        //assume element
        var bounds = {
            left: {
                x: 0,
                y: 0
            },
            right: {
                x: map.width - this.attrs.width,
                y: map.height - this.attrs.height
            }
        }

        //assume were on element
        updateOthers = function() {
            self.next.attr({
                cx: self.bottomRight().x,
                cy: self.bottomRight().y
            });
        }

        //if using resizer
        if( this.type === 'circle' ) {
            if( this.prev !== null ) {
                bounds = {
                    left: {
                        x: this.prev.topLeft().x,
                        y: this.prev.topLeft().y
                    },
                    right: {
                        x: map.width,
                        y: map.height
                    }
                }

                updateOthers = function() {
                    //update element w/h on the fly
                    var w = self.attr("cx") - self.prev.bottomLeft().x;
                    var h = self.attr("cy") - self.prev.topLeft().y;

                    self.prev.attr('width', w)
                    self.prev.attr('height', h)
                }
            }
        }

        //move element
        var newPos = {}
        newPos[xProp] = Math.min(Math.max(this.startX + dx, bounds.left.x), bounds.right.x)
        newPos[yProp] = Math.min(Math.max(this.startY + dy, bounds.left.y), bounds.right.y)

        this.attr(newPos);

        //update other members of the set
        updateOthers();

    },
    function(x, y, e) {
        var xProp = this.type === "rect" ? 'x' : 'cx';
        var yProp = this.type === "rect" ? 'y' : 'cy';

        this.startX = this.attr(xProp);
        this.startY = this.attr(yProp);

        this.attr({
            opacity: '.25'
        });
    },
    function(e) {


        //set opacity across the set
        var iter = this;
        while(iter.prev) {
            iter = iter.prev;
        }

        while(iter) {

            iter.attr({
                opacity: region.attrs.opacity
            });
            iter = iter.next;
        }
        
    });

    //bind info popover display
    this.element.mouseover(function(){
        if(App.isAdmin) {return;}
        $(this.node).popover({
            content: region.displayHTML(),
            title: region.properties.name,
            trigger: "manual",
            placement: "top",
            animation: false
        })

        $(this.node).popover("show");

        var popover = $(".popover");
        var offset = popover.offset();
        var w = this.attr('width');

        popover.css('left', offset.left + w/2 + "px");

    });

    this.element.mouseout(function(){
        if(App.isAdmin) {return;}
        $(this.node).popover("hide");
    });

    //bind click events
    this.element.mousedown(function(){
        if(App.activeRegion instanceof App.Region)
            App.activeRegion.setActive('false');

        App.activeRegion = region;
        App.activeRegion.setActive(true);
    });

}

App.Region.prototype.render = function() {
    
}

App.Region.prototype.toHTML = function() {
    var html = "";

    html += "<li>id:" + this.id + "</li>";
    html += "<li>x:" + this.element.topLeft().x + "</li>";
    html += "<li>y:" + this.element.topLeft().y + "</li>";
    html += "<li>width:" + this.element.attr('width') + "</li>";
    html += "<li>height:" + this.element.attr('height') + "</li>";
    html += "<li>Locked:" + this.locked + "</li>";

    for( var i in this.properties ) {
        html += "<li>" + i + ": " + this.properties[i] + "</li>";
    }

    return html;
}

App.Region.prototype.displayHTML = function() {
    var html = "";

    for( var i in this.properties ) {
        html += "<li>" + i + ": " + this.properties[i] + "</li>";
    }

    return html;
}

App.Region.prototype.toJSON = function() {
    var output = {
        id: this.id,
        x: this.element.topLeft().x,
        y: this.element.topLeft().y,
        width: this.element.attr('width'),
        height: this.element.attr('height'),
        properties: this.properties
    }

    return JSON.stringify(output);
}
App.Region.prototype.destroy = function() {
    this.set.remove();
}

App.Region.prototype.isActive = function() {
    return this.active;
}

App.Region.prototype.setActive = function(state) {
    App.activeRegion.element.attr("fill", state === true ? "#0074CC" : (App.isAdmin ? App.activeRegion.attrs.fill : "#FFF"))
    this.active = state;
}

App.Region.prototype.lock = function() { this.locked = true; }
App.Region.prototype.unlock = function() { this.locked = false; }
App.Region.prototype.toggleLock = function() { this.locked = !this.locked; }
