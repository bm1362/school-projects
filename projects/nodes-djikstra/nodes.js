var nodes = [];
var connections = [];

var ctx;
var canvas;

var numNodes = 10;
var perc2 = .99;
var perc3 = .99;

function node() {
	var node = {};

	//private vars
	var position = {x: 0, y: 0};
	var connections = [];
	var data;

	//private functs
	
	//public vars
	node.number = nodes.length;

	//public functs
	node.draw = function (ctx) {
		//styling
		ctx.fillStyle = 'rgba(102,204,0, .7)';
        ctx.strokeStyle = 'rgba(102,204,0, .7)';  
		//draw position
		ctx.beginPath();
		ctx.arc(position.x,position.y,5,0,Math.PI*2,true);
		ctx.fillText(String.fromCharCode(node.number+65),position.x + 15, position.y)
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
	}

	node.addConnection = function( otherNode ) {
		var connection = {a: node, b: otherNode, dist: calcDist(node, otherNode)};
		connections.push( connection );
		//connection = {a: otherNode, b: node, dist: calcDist(node, otherNode)};
		//otherNode.getConnections().push(connection);
		//otherNode.addConnection( node );
	}

	node.clearConnections = function() {
		connections.clear();
	}

	node.getConnections = function() {
		return connections;
	}

	node.setPos = function(x, y) {
		position.x = x;
		position.y = y;
	}

	node.getPos = function(x, y) {
		return position;
	}

	node.getData = function() {
		return data;
	}

	node.setData = function ( newData ) {
		data = newData;
	}

	return node;
};


function generateNodes() {
	//make some nodes
	for( var i = 0; i < numNodes; i++ ) {
		var n = new node;
		//n.number = i;
		nodes.push(n);
	}
	//randomize location
	for( var i = 0; i < nodes.length; i++) {
		nodes[i].setPos(Math.random() * canvas.width, Math.random() * canvas.height)
	}

	//create connections
	//sort nodes in order of x position
	var sortedNodes = quickSort(nodes);
	for(var i = 0; i < sortedNodes.length - 1; i++) {
		sortedNodes[i].number = i;
		//var numberOfConnections = Math.ceil((Math.random() * (sortedNodes.length - i) / 2 ));

		sortedNodes[i].addConnection(sortedNodes[i+1]);
		var n1 = sortedNodes[i];
		var n2 = sortedNodes[i+1];

		var dist = calcDist(n1, n2);
		connections.push({a: n1, b: n2, dist: dist})

		//50% chance a node has a 2nd child
		if(Math.random() < perc2 && i < sortedNodes.length - 2) {
			sortedNodes[i].addConnection(sortedNodes[i+2]);
			n1 = sortedNodes[i];
			n2 = sortedNodes[i+2];

			dist = calcDist(n1, n2);
			connections.push({a: n1, b: n2, dist: dist})

			//5% chance a node has a 3rd child iff it has a 2nd
			if(Math.random() < perc3 && i < sortedNodes.length - 3) {
				sortedNodes[i].addConnection(sortedNodes[i+3]);
				n1 = sortedNodes[i];
				n2 = sortedNodes[i+3];

				dist = calcDist(n1, n2);
				connections.push({a: n1, b: n2, dist: dist})
			}
		}
	}
	sortedNodes[sortedNodes.length-1].number = sortedNodes.length-1;
	nodes = sortedNodes;
}

function drawConnections() {
	//styling
	ctx.strokeStyle = 'rgba(0,153,255, .3)';

	//draw connections
	for(var i = 0; i < connections.length; i++) {
		ctx.beginPath()
		ctx.moveTo( connections[i].a.getPos().x, connections[i].a.getPos().y);
		ctx.lineTo( connections[i].b.getPos().x, connections[i].b.getPos().y);
		//label them
		var mid = calcMidPoint(connections[i].a, connections[i].b);
		ctx.fillText(Math.ceil(connections[i].dist),mid.x -10, mid.y)
		ctx.stroke();
		ctx.closePath();

	} 
}

function tick() {
	//clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//redraw nodes
	for( var i = 0; i < nodes.length; i++ ) {
		nodes[i].draw(ctx);
	}

	//draw lines
	drawConnections();

	//blinking cursor effect
	$('#cursor').toggleClass("cursorToggle");

}

function initCanvas () {
	$('body').append('<canvas id="node-canvas"></canvas>');
	canvas = $('#node-canvas')[0];

	//generate color palette
	var colors = [
	 //[0,0,0], //white
		[1,1,1], [2,2,2], [3,3,3], [4,4,4], //grayscale
		[5,5,5], //black
		[5,0,0],[4,0,0],[3,0,0],[2,0,0],[1,0,0], //reds
		[5,3,0],[5,2,0],[4,2,0],[3,1,0],[2,1,0], //oranges
		[5,4,2],[5,4,1],[4,3,1],[3,2,1],[2,1,1], //orange-yellow
		[5,5,0],[4,4,0],[3,3,0],[2,2,0],[1,1,0], //yellows
		[1,5,1],[1,4,0],[0,3,0],[0,2,0],[0,1,0], //greens
		[2,4,4],[0,4,4],[1,3,3],[1,2,2],[0,1,1], //green-bue
		[1,4,5],[1,2,5],[1,1,5],[0,0,3],[0,0,2], //blues
		[2,2,4],[3,1,5],[2,0,4],[1,1,3],[1,0,3], //blue-purple
		[4,2,4],[4,1,4],[3,1,3],[2,1,2],[1,0,1]  //purples

	];
			  
	//Set width/height for canvas
	$(canvas).css('position','absolute').css('top', 0).css('left', 0);
	canvas.width = $('body').outerWidth();
	canvas.height = $('body').outerHeight();
	ctx = canvas.getContext('2d');
	ctx.lineJoin = "round";
	ctx.lineWidth = 5;
};

//Main
function init() {
	//do drawing/canvas stuff
	initCanvas();
	//init nodes
	generateNodes();
	//start tick
	setInterval(tick, 500);
}

//On load, call Init (Main)
$(document).ready( function () {
	init();
	//$('#control-panel-wrapper').height( $('#content').height() + 50 )

	//init control values
	$('#num-nodes').text(numNodes);
	$('#chance2').text(perc2 * 100 + '%');
	$('#chance3').text(perc3 * 100 + '%');

	//init button stuff
	$('#calc-min').on('click', function() {
		
		//do stuff
		//start timer
		var start = new Date().getTime();
		var end;
		//traverse
		traverse();
		//end timer
		end = new Date().getTime();
		var runtime = end - start;
		print(start);
		print(end);
		//update results
		$('#results').html('');
		for( var i = 0; i < nodes.length; i++ ) {
			$('#results').append('' + getMinimal(i) + '<br>');
		}

		//update stats
		if(runtime == 0) runtime = '<0'
		$('#stats').text('Traversed in ' + runtime + 'ms.');
		//do animations
		doAnimations();

	})

	//init screen controls
	$('#win-control-minimize').on('click', function() {
		$('#control-panel-wrapper').animate({height: 25});
		$(this).hide();
		$('#win-control-maximize').show();
	})

	$('#win-control-maximize').on('click', function() {
		var height = $('#content').height();
		$('#control-panel-wrapper').animate({
			height: height
		}, 500, function() {
			$('#control-panel-wrapper').css('height', 'auto') 
		});
		$(this).hide();
		$('#win-control-minimize').show();
	})

	$('#pre-cursor').hide();
	$('#stats').hide();
});


//// Helper Functions \\\\\
function quickSort( arr ) {
	array = arr.slice(0); //makes a copy, prevents overwriting

    if( array.length <= 1 )
    	return array

    var lhs = new Array();
    var rhs = new Array();
    var pivot = Math.ceil(array.length/2)-1;

    pivot = array.splice(pivot, 1)[0];

    for( var i = 0; i < array.length; i++ )
        if( array[i].getPos().x <= pivot.getPos().x )
        	lhs.push(array[i]);
        else
        	rhs.push(array[i]);

    var t1 = quickSort(lhs);
    var t2 = quickSort(rhs);

    t1.push(pivot);
    return t1.concat(t2);
}

function calcDist(n1, n2) {
	var x1 = n1.getPos().x;
	var x2 = n2.getPos().x;
	var y1 = n1.getPos().y;
	var y2 = n2.getPos().y;

	var dist = Math.pow( x2 - x1, 2) + Math.pow( y2 - y1, 2);
	dist = Math.sqrt( dist );

	return dist;
}

function calcMidPoint(n1, n2) {
	var x1 = n1.getPos().x;
	var x2 = n2.getPos().x;
	var y1 = n1.getPos().y;
	var y2 = n2.getPos().y;

	var mid = {x: (x1 + x2) / 2, y: (y1 + y2) / 2 };

	return mid;
}

function traverse( ) {
	var unvisited = nodes.slice(0);
	var dist = 0;

	for( var k = 0; j < nodes.length; k++ ) { nodes[k].setData(undefined)};

	var currNode = nodes[0];
	currNode.setData({d:0, parent: null});

	var currIndex = 0;
	while(currNode != undefined && currNode.getConnections().length > 0 && unvisited.length >= 1) {
		dist = currNode.getData().d;
		var minIndex = 0, minVal = 0;
		
		//Loop through all adjacent nodes, and set the shortest path to reach to 
		//those nodes as the sum of shortest path to reach the current node and 
		//the weight of the adjacent node. If you find any new lower shortest path to any node, 
		//discard the previous and set the new shortest path.
		var adjacent = currNode.getConnections();
		minVal = adjacent[0].dist;
		for( var j = 0; j < adjacent.length; j++ ) {
			var n = adjacent[j].b;
			var d = dist + adjacent[j].dist;

			if( n.getData() == undefined || n.getData().d > d) {
				n.setData({d: d, parent: currNode});
			}

			if(minVal > adjacent[j].dist) {
				minVal = adjacent[j].dist;
				minIndex = j;
			}
		}

		//remove currNode from unvisited set
		unvisited.splice(currIndex, 1);
		//calculate lowest node and move there
		currNode = adjacent[minIndex].b;
		currIndex = minIndex;
	}
}

function getMinimal( target ) {

	if(target < 0 || target > nodes.length) { 
		print('No target specified.'); 
		return ; 
	}

	//get path and print it out
	currNode = nodes[target];
	var visited = [];
	var x = currNode;
	while(x != null) {
		visited.push(String.fromCharCode(x.number+65));
		x = x.getData().parent;
	}
	visited.reverse();
	var string = visited.join('>');
	string += ' - ' + Math.floor(currNode.getData().d);
	//print(string);
	return string;
}

function min( arr ) {
	var min = arr[0];
	var minIndex = 0;

	for( var i = 0; i < arr.length; i++ ) {
		if( min > arr[i] ) {
			min = arr[i];
			minIndex = i;
		}
	}

	return minIndex;
}

function print( msg ) {
	console.log(msg);
}

function showPreCursor() {
	$('#pre-cursor').animate({width: 'toggle'})
}

function showStats() {
	$('#stats').animate({width: 'toggle'})
}

function doAnimations() {
	$('#pre-cursor').hide();
	$('#results').hide();
	$('#stats').hide();

	$('#pre-cursor').animate({
    	opacity: 0.8,
    	width: 'toggle'
  	}, 500, function() {
   		// Animation complete.
   		$('#results').animate({
    		opacity: 0.8,
    		height: 'toggle'
  		}, 750, function() {
   			// Animation complete.

			$('#stats').animate({
    			opacity: 0.8,
    			width: 'toggle'
  			}, 500, function() {
   				// Animation complete.

  			});
  		});
  	});

}