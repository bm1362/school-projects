//Dependent on json2.js and jQuery

// do some js
Object.prototype.eventLogger = {

   //initialization function
   init : function () {
    eventLogger.time.start();
   },

   //Mouse down variable/function used to detect a 'drag' by the user.
   isMouseDown : false,
   toggleMouseDown : function () {
      eventLogger.isMouseDown = !eventLogger.isMouseDown;
   },

   //Array containing user events, defined in handlers.
   events : [],

   //An object containing all of the event handlers.
   handlers : {

     bind : function( handler, func ) {
       this[handler] = func;
     },
     unbind : function(handler) {
       for( var i in this )
          if(i == handler) {
             $(document).off(i);
             delete this[i];
             return;
           }
     },

     click : $(document).on('click', function (event) {
        var obj = {
          pos: { x: event.pageX, y: event.pageY },
          type: event.type,
          time: eventLogger.time.timeVal,
          target: event.target
        }
        //draw
        eventLogger.draw(obj);
        eventLogger.events.push(obj);
        //return false;
     }), // end of click
     mousedown : $(document).on('mousedown', function (event) {
        eventLogger.toggleMouseDown();
        var obj = {
          pos: { x: event.pageX, y: event.pageY },
          type: event.type,
          time: eventLogger.time.timeVal
        }
        //draw
        eventLogger.draw(obj);
        eventLogger.events.push(obj);
        //return false;
     }), // end of mousedown
     mouseup : $(document).on('mouseup', function (event) {
        eventLogger.toggleMouseDown();
        var obj = {
          pos: { x: event.pageX, y: event.pageY },
          type: event.type,
          time: eventLogger.time.timeVal
        }
        //draw
        eventLogger.draw(obj);
        eventLogger.events.push(obj);
     }), //end of mouseup
     mousemove : $(document).on('mousemove', function (event) {
        var obj = {
          pos: { x: event.pageX, y: event.pageY },
          type: event.type,
          time: eventLogger.time.timeVal
        }

        //case user is 'dragging'
        if(eventLogger.isMouseDown) {
          eventLogger.draw(obj);
        }
        //case user is hovering
        else {
          obj.type = 'hover';
          obj.target = event.target;
          //obj.radius = eventLogger.events[eventLogger.events.length - 1].time;
          var prev = eventLogger.events[eventLogger.events.length-1];

          if(prev) { 
            var duration = obj.time - prev.time;
            obj.duration = duration;
            if(duration > 10)
               eventLogger.draw(obj);
          }
        }

        eventLogger.events.push(obj);
        
     }), //end of mousemove
     dblclick : $(document).on('dblclick', function (event) {
        var obj = {
          pos: { x: event.pageX, y: event.pageY },
          type: event.type,
          time: eventLogger.time.timeVal,
          target: event.target
        }
        //draw
        eventLogger.draw(obj);
        eventLogger.events.push(obj);
        return false;
     }) // end of dbl click
   }, // end of handlers

   //Time is an object used to tag each event with a time value relative to other events.
   time : {
     intervalArray : new Array(),
     delay : 100,
     timeVal : 0,

     render : function () {
       //do stuff
       this.eventLogger.time.timeVal += 1;
     },

     start : function () {
       this.eventLogger.time.intervalArray.push(setInterval(this.eventLogger.time.render, this.eventLogger.time.delay));
     },

     stop : function () {
       clearInterval(this.eventLogger.time.intervalArray.pop());
     },

     reset : function () {
       for( var i in this.eventLogger.time.intervalArray )
          this.eventLogger.time.stop();

       this.eventLogger.time.timeVal = 0;
     }
   },

   //Returns a JSON object of the current events array
   createJSON : function () {
     var obj = {};

     obj["time-on-site"] = this.eventLogger.time.timeVal;
     obj["timestamp"] = (new Date());
     obj["events"] = this.eventLogger.events;

     return JSON.stringify(obj, 2, null);
   },
   draw : function () {}, // empty function
   render : function() {}, //empty function
}; // end of eventLogger