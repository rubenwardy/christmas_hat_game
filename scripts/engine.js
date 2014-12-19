// rubenwardy's simple HTML5 canvas engine
// License: LGPL 3.0

var CANVAS_H_MARGIN = 0;
var CANVAS_V_MARGIN = 0;

var engine = {
	fps: {
		dtime: 0,
		rtime: 0,
		utime: 0,
		last_tick: 0,
		target: 65,
		fpses: []
	},
	keys: [],
	mouse: {x: 0, y: 0},
	mousedown: false,
	labely: 0,
	toggle: false
};

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

// Dialog
var __diaid = 0;
var __curdiaid = -1;
function close_dialog(){
	$('#dialog').remove();
	__curdiaid = -1;
}
function hide_dialog(){
	$('#dialog').fadeOut();
	__curdiaid = -1;
}
function create_dialog(){
	__diaid = __diaid + 1;
	close_dialog();
	__curdiaid = __diaid;
	$('body').append('<div id="dialog"><div id="dialog_body">[dialog]</div></div>');
	return $('#dialog_body');
}
function show_dialog(msg){
	create_dialog().html(msg);
}
function show_dialog_and_close(msg){
	create_dialog().html(msg);
	var curid = __diaid;
	setTimeout(function(){
		if (__diaid == curid)
			hide_dialog();
	}, 2000);
}
function dialog_content(){
	var d = $("#dialog");

	if (!d)
		return "";

	return d.html();
}

// Start
engine.init = function() {
	engine.ce       = document.getElementById("canvas");
	engine.c        = engine.ce.getContext("2d");
	engine.c.font   = "12px Arial";
	engine.clear_canvas(engine.ce, engine.c);
	close_dialog();

	window.onkeydown = function(e){
		while (e.keyCode > engine.keys.length){
			engine.keys.push(false);
		}
		console.log(e.keyCode);
		engine.keys[e.keyCode] = true;
		if (engine.onKeyDown)
			engine.onKeyDown(e);
	};
	window.onkeyup = function(e){
		if (e.keyCode > engine.keys.length)
			return;
		engine.keys[e.keyCode] = false;
		if (engine.onKeyUp)
			engine.onKeyUp(e);
	};
	window.addEventListener('mousemove', function(e) {
		engine.mouse = {x: e.clientX, y: e.clientY};
		if (engine.onMouseMove)
			engine.onMouseMove(e);
	});
	window.addEventListener('mousedown', function(e){
		engine.mousedown = true;
		if (engine.onMouseDown)
			engine.onMouseDown(e);
	}, false);
	window.addEventListener('mouseup', function(e){
		engine.mousedown = false;
		if (engine.onMouseUp)
			engine.onMouseUp(e);
	}, false);
	engine.ce.addEventListener('mousedown', function(e){
		engine.canvasmousedown = true;
		if (engine.onCanvasMouseDown)
			engine.onCanvasMouseDown(e);
	}, false);
	engine.ce.addEventListener('mouseup', function(e){
		engine.canvasmousedown = false;
		if (engine.onCanvasMouseUp)
			engine.onCanvasMouseUp(e);
	}, false);

	engine.fps.last_tick = new Date().getTime();

	try {
		init();
	} catch(e) {
		// do nothing
	}

	setInterval(engine.tick,1000/65);
}

engine.clear_canvas = function(ce, c)
{
	var w = $(window).width() - CANVAS_H_MARGIN;
	var h = $(window).height() - CANVAS_V_MARGIN;
	if (ce.width != w || ce.height != h) {
		ce.width = w;
		ce.height = h;
	} else {
		c.clearRect(0, 0, ce.width, ce.height);
	}
};

function getKey(id){
	if (id > engine.keys.length)
		return false;
	return engine.keys[id];
}

function mousePosition() {
	return {x: engine.mouse.x, y: engine.mouse.y};
}

function mouseDown() {
	return engine.mousedown;
}

engine.reset_labels = function() {
	engine.labely = 20;
}

engine.add_label = function(text) {
	engine.labely += 15;
	engine.c.fillText(text, 20, engine.labely);
}

engine.add_separator = function() {
	engine.labely += 6;
	engine.c.beginPath();
	engine.c.strokeStyle = "white";
	engine.c.moveTo(20, engine.labely + 0.5);
	engine.c.lineTo(150, engine.labely + 0.5);
	engine.c.stroke();
}

engine.draw_fps = function(color) {
	engine.add_label("FPS: "+engine.fps.fps);
}

engine.tick = function(){
	if (engine.skipEOT && engine.skipEOT()) {
		engine.toggle = !engine.toggle;
		if (engine.toggle)
			return;
	}

	engine.clear_canvas(engine.ce, engine.c);
	engine.reset_labels();

	// Time settings
	var end = new Date().getTime();
	engine.fps.dtime = Math.round(end - engine.fps.last_tick);
	if (engine.fps.dtime > 1000)
		engine.fps.dtime = 1000;
	engine.fps.last_tick = end;

	if (engine.fps.dtime == 0)
		engine.fps.fpses.push(65);
	else
		engine.fps.fpses.push(1000 / engine.fps.dtime);
	while (engine.fps.fpses.length > 20) {
		engine.fps.fpses.splice(0, 1);
	}
	var sum = 0;
	for (var i = 0; i < engine.fps.fpses.length; i++) {
		sum += engine.fps.fpses[i];
	}
	engine.fps.fps = Math.round(sum / engine.fps.fpses.length);
	tick(engine.ce, engine.c, engine.fps.dtime / 1000);
}

$(engine.init);
