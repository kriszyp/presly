dojo.require("dojox.gfx");

presly = function(data){
	dojo.ready(function(){
		surface = dojox.gfx.createSurface("canvas", 1024, 768);
		group = surface.createGroup();
		//group.setTransform({dx:200, dy: 200});
		var size = 600;
		var ySize = 500;
		points = [];
		var counter = 0;
		var scaleStep = Math.pow(6,-1);
		function disperse(data, level, x, y){
			var len = data.length;
			var oneSide = false;//counter % 2 == 1;
			for(var i = 0; i < len; i++){
				counter++;
				var point = data[i];
				point.level = level;
				var scale = point.scale = Math.pow(6,-level);
				var angle = i / len * 2 * Math.PI;
				if(oneSide){
					angle = (angle + Math.PI) / 2;
				}
				point.x = size * Math.sin(angle) + (x / scaleStep);
				point.y = size * -Math.cos(angle) + (y / scaleStep);
				points.push(point);
				if(point.sub){
					disperse(point.sub, level + 1, point.x, point.y);
				}
				if(point.concepts){
					disperse(point.concepts, level + 2, point.x, point.y);
				}
			}
		}
		disperse(data, 0, 0, 0);
		debugger;
		for(var i = 0; i < points.length; i++){
			var point = points[i];
			if(point.text.length > 30){
				var cutoff = point.text.indexOf(" ", 25);
				if(cutoff > -1){
					cutoff = point.text.indexOf(" ", 20);
					if(cutoff > -1){
						var newPoint = dojo.mixin({}, point);
						newPoint.text = point.text.substring(cutoff + 1);
						newPoint.y += 50;
						newPoint.continued = true;
						point.text = point.text.substring(0, cutoff);
						points.splice(i + 1, 0, newPoint);
					}
				}
			}
			var t = makeText(group, point, {family: "Helvetica", size: "36pt", weight: "bold"}, "white", "white").setTransform({
				xx: point.scale, yy: point.scale
			});
			point.t = t;
		}
		document.body.onclick = next;
		document.body.onkeypress = function(){
			next();
		}
		var counter = 0;
		currentScale = 1;
		currentX = 0; currentY = 0;
		//var targetScale, targetX, targetY;
		setInterval(function(){
			var changed;
			var ratio = currentScale / targetScale;
			if(ratio < 0.96 || ratio > 1.04){
				currentX *= currentScale > targetScale ? 0.97 : 1.03;
				currentY *= currentScale > targetScale ? 0.97 : 1.03;
				currentScale *= currentScale > targetScale ? 0.97 : 1.03;
				changed = true;
			}
			if(Math.abs(targetX - currentX) > 6){
				changed = true;
				currentX += (targetX * currentScale / targetScale - currentX) / 20;
			}
			if(Math.abs(targetY - currentY) > 6){
				changed = true;
				currentY += (targetY * currentScale / targetScale - currentY) / 20;
			}
			for(var i = 0; i < points.length; i++){
				var point = points[i];
				if((point.scale > 2 / currentScale || point.scale < 0.2 / currentScale) && !point.hidden){
					point.hidden = true;
					group.remove(point.t);
				}
				if(point.scale < 2 /currentScale && point.scale > 0.2 / currentScale && point.hidden){
					point.hidden = false;
					group.add(point.t);
				}
			}
			if(changed){
				group.setTransform({
					xx: currentScale,
					yy: currentScale,
					dx: -currentX + (size / 2),
					dy: -currentY + (size / 2)
				});
			}
		},30);
		function next(){
			do{
				point = points[counter++];
			}while(point.continued);
			var links = dojo.byId("links");
			if(point.url){
				links.innerHTML = '<a href ="' + point.url + '">' + point.url + '</a>';
			}
			targetScale = 1/point.scale;
			targetX = point.x;
			targetY = point.y;
		}
		next();
	});
	
}
presly([
{text:"what if our code could run on the server and the browser?", sub:[
	{text:"one language"},
	{text:"one syntax"},
	{text:"one paradigm"},
	{text:"one mental model"}
	]},

{text:"NodeJS is JavaScript for the server", url: "http://nodejs.org/", sub:[
	{text:"and is really fast"},
	{text:"NodeJS provides asynchronous access to system I/O"},
	{text:"single-threaded, like the browser", sub:[
			{text:"event queue allows for multiple tasks to interleave"},
			{text:"avoids race conditions"},
			{text:"threading sucks"},
			{text:"dangerous (for mortals)"},
			{text:"context switching is expensive"},
			{text:"parallelism is achieved by multiple processes"}
		]}
	]},
{text:"browsers use JavaScript", sub:[
		{text:"so were set, right?"},
		{text:"not quite..."}
	]},
{text:"modules are a key part of programming", concepts:[
		{text:"code need to interact with other code"},
		{text:"depend on and use other modules"}
	],
	sub:[
	{text:"modules can be loaded with using script tags, but...", sub:[
		{text:"manually tracking dependencies sucks"},
		{text:"tracking order, timing issues"},
		{text:"O(n^2) complexity"}
	]},
	{text:"CommonJS defines a module format", sub:[
		{text:"used by Node, but..."},
		{text:"modules can be loaded with XHR and eval"},
		{text:"that sucks"},
		{text:"its slow"},
		{text:"its hard to debug"},
		{text:"cross-domain problematic"},
		{text:"often synchronous"}
	]},
	{text:"CommonJS also defines a module API", url: "http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition", sub:[
		{text:"designed for automated script injection"},
		{text:"asynchronous"},
		{text:"fast"},
		{text:"easy to debug"},
		{text:"cross-domain friendly"},
		{text:"implemented by RequireJS", url:"http//requirejs.org/"},
		{text:"soon Dojo", url:"http//dojotoolkit.org/"},
		{text:"and others", url:"http://github.com/jbrantly/yabble"}
	]},
	{text:"How to share modules?", sub:[
		{text:"sync format on server"},
		{text:"async API on client"},
		{text:"module wrapping", url:"http://github.com/kriszyp/transporter", sub:[
			{text:"write in sync format"},
			{text:"on request, transformed to browser format"},
			{text:"write once, automated transformation"}
		]},
		{text:"enhanced server side module loading", url:"http://github.com/kriszyp/nodules", sub:[
			{text:"write with async API"},
			{text:"Use Nodules (or RequireJS) on Node"},
			{text:"write once, no transformation"},
			{text:"both sync and async formats supported by Nodules"}
		]}
	]}
]},
{text:"how about data?", sub:[
	{text:"JSON is data written in JavaScript", sub:[
		{text:"easily serialized and parsed"},
		{text:"no impedance mismatch"},
		{text:"it's Javascript"}
	]},
	{text:"client and server can talk to each other in JavaScript", sub:[
		{text:"structure can be described with JSON Schema", url:"http://json-schema.org/"},
		{text:"REST/HTTP gives us a protocol for interaction"},
		{text:"real data has relations"},
		{text:"relations can be communicated with JSON Schema"},
		{text:"REST/HTTP + relations gives us a protocol for interaction"}
	]},
	{text:"NoSQL: JavaScript storage", sub:[
		{text:"data can be stored in JSON format"},
		{text:"indexes can defined in JavaScript map and reduce functions"},
		{text:"queries can be defined with RQL", url:"http://github.com/kriszyp/rql", sub:[
			{text:"what is RQL?"},
			{text:"query language with JavaScript syntax"},
			{text:"designed for the web"},
			{text:"designed for URLs"},
			{text:"designed for NoSQL"},
			{text:"designed to work with map/reduce"}
		]},
		{text:"IndexedDB: the JavaScript data storage interface", url:"http://www.w3.org/TR/IndexedDB/", sub:[
			{text:"the HTML5 standardized DB API"},
			{text:"being implemented by browsers"},
			{text:"and available on the server", url:"http://github.com/kriszyp/perstore", sub: [
				{text:"consistent API for common functions"},
				{text:"get(), put(), remove(), add()"},
				{text:"perstore, toolkit for IndexedDB on server"},
				{text:"mongodb, couchdb, redis, and more"},
				{text:"and RQL"}
			]}
		]}
	]}
]},
{text:"end-to-end JavaScript", sub:[
	{text:"consistent, coherent"},
	{text:"fast, fun"},
	{text:"enjoy!"}
]}
]);
var ROTATION = 30;

var surface = null, t1, t2, t3, t4, t5;

var placeAnchor = function(surface, x, y){
	surface.createLine({x1: x - 2, y1: y, x2: x + 2, y2: y}).setStroke("blue");
	surface.createLine({x1: x, y1: y - 2, x2: x, y2: y + 2}).setStroke("blue");
};

function makeText(group, text, font, fill, stroke){
	var t = group.createText(text);
	if(font)   t.setFont(font);
	if(fill)   t.setFill(fill);
	if(stroke) t.setStroke(stroke);
	return t;
};

makeShapes = function(){
	surface = dojox.gfx.createSurface("test", 500, 500);
	group = surface.createGroup();
	var m = dojox.gfx.matrix;
	surface.createLine({x1: 250, y1: 0, x2: 250, y2: 500}).setStroke("green");
	t1 = makeText(surface, {x: 250, y: 50, text: "Start", align: "start"}, 
		{family: "Times", size: "36pt", weight: "bold"}, "black", "red")
		.setTransform(m.rotategAt(ROTATION, 250, 50));
	t2 = makeText(surface, {x: 250, y: 100, text: "Middle", align: "middle"}, 
		{family: "Symbol", size: "24pt"}, "red", "black")
		.setTransform(m.rotategAt(ROTATION, 250, 100));
	t3 = makeText(surface, {x: 250, y: 150, text: "End", align: "end"}, 
		{family: "Helvetica", style: "italic", size: "18pt", rotated: true}, "#FF8000")
		.setTransform(m.rotategAt(ROTATION, 250, 150));
	t4 = makeText(surface, {x: 250, y: 200, text: "Define Shuffle Tiff", align: "middle", kerning: true}, 
		{family: "serif", size: "36pt"}, "black")
		.setTransform(m.rotategAt(0, 250, 200));
	t5 = makeText(surface, {x: 250, y: 250, text: "Define Shuffle Tiff", align: "middle", kerning: false}, 
		{family: "serif", size: "36pt"}, "black")
		.setTransform(m.rotategAt(0, 250, 250));
};

getSizes = function(){
	var t = [];
	dojo.forEach(["t1", "t2", "t3", "t4", "t5"], function(name){
		var node = eval("(" + name + ")");
		t.push(node.getShape().text + " = " + node.getTextWidth());
	});
	dojo.byId("sizes").innerHTML = t.join("<br/>");
};

//dojo.addOnLoad(makeShapes);
