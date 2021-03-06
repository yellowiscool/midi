require.config({
	paths: {
		jquery: '../bower_components/jquery/jquery',
		eve: '../bower_components/eve-adobe/eve',
		raphael: '../bower_components/raphael/raphael',
		'g.raphael': '../bower_components/g.raphael/g.raphael',
		'g.pie': '../bower_components/g.raphael/g.pie',
		'seedrandom': '../bower_components/seedrandom/seedrandom'
	},
	shim: {
		'eve': {
			exports: "eve"
		},
		'raphael': {
			deps: ["eve"],
			exports: "Raphael"
		},
		'g.raphael': ['raphael'],
		'g.pie': ['g.raphael']
	}
});

require(['seedrandom', 'raphael', 'g.pie'], function (seedrandom) {
	'use strict';

	var r = Raphael("wheel", 800, 600),

	legend = ["Midi", "12h01", "12h02", "12h03", "12h04", "12h05", "12h06", "12h07", "12h08", "12h09", "12h10", "12h11", "12h12", "12h13", "12h14", "Midi et quart"],

	pie = r.piechart(400, 300, 200, [1.015, 1.014, 1.013, 1.012, 1.011, 1.01, 1.009, 1.008, 1.007, 1.006, 1.005, 1.004, 1.003, 1.002, 1.001, 1.0],
		{ legend: legend,
		// legendpos: "south",
		// init: true,
		colors: ["#FF0000", "#AED0CF", "#CDCDCD", "#ADA59A", "#ECB813", "#FF4B00", "#BAC900", "#595959", "#D2204C", "#55BCBE", "#3E647E", "#8F7092", "#EC7413", "#6F8793", "#526180", "#051039", ],
		strokewidth: 2.5
	});

	// Initialize the random seed because we want the same hour for everybody
	var today = new Date();
	Math.seedrandom(today.getDate()+"-"+today.getMonth()+"-"+today.getYear());

	// No jQuery this time
	var midi = document.getElementById("midi").firstChild,
		wheel = document.getElementById("wheel");

	// When the user start the animation
	wheel.className = 'click';

	// Create a triangle pointer
	var pointer = r.path("M400,110,391,86,409,86z").attr({"fill": "white", "stroke-width": 2, "stroke": "#051039"});

	// Create a HTML5 sound
	var sound = document.createElement("audio");
	sound.src = "glass.ogg";
	sound.preload = true;

	wheel.onclick = function() {

		// Get the final angle
		var max = 32,
			min = 48,
			angle = Math.floor((Math.random() * ((max + 1) - min)) + min);

		angle *= -360/16.0;

		var oldIndex = 0,
			oldAngle = 0;

		// While the animation is running
		var getCurrentTime = window.setInterval(function() {
			// Get the current angle (weird method)
			var angle = (-pie.series[0].transform()[0][1]+11.25)%360;
			if (angle < 0) angle += 360;

			var currentIndex = parseInt((angle/360.0)*16);
			// 	var t = "r"+((pie.series[0].transform()[0][1]+11.25%360)%16)+",400,300";
			// 	console.log(currentIndex, t);
			// 	pointer.attr({transform: t});

			// If the current index is not the same
			if (currentIndex != oldIndex) {

				// Identifiate the speed
				var diff = Math.abs(oldAngle-angle);

				// Animate the pointer
				pointer.stop().animate({transform: "r52,400,86"}, 90/diff, ">", function() {

					// Artificial delay if it's the end of animations
					var obj = this;
					if (diff < 2.8) {
						window.setTimeout(function() {
							obj.animate({transform:""}, 666, "bounce");
						}, parseInt(130/diff));
					} else {
						this.animate({transform:""}, 666, "bounce");
					}
				});

				// Put the label in bold
				pie.labels[currentIndex].attr({"font-weight": 800});
				pie.labels[oldIndex].attr({"font-weight": 400});

				// Put a stroke on the selected option
				pie.series[currentIndex].attr({"stroke": "#051039"}).toFront();
				pointer.toFront();
				pie.series[oldIndex].animate({"stroke": "#FFF"}, 200, ">");

				// Set the page title
				midi.data = legend[currentIndex];
				document.title = legend[currentIndex];

				try {
					// Play the ding sound
					if (sound.pause && sound.play) {
						sound.pause();
						sound.currentTime = 0;
						sound.play();
					}
				} catch (e) {}
			}

			oldIndex = currentIndex;
			oldAngle = angle;
		}, 33);

		// RaphaelJS is funny
		pie.series.animate({transform:"r"+angle+",400,300"}, 12000, "cubic-bezier(0,.36,.3,1)", function() {
			window.clearInterval(getCurrentTime);
			wheel.className = '';
		});

		// Wonderfull javascript code here
		wheel.className = 'wait';
		wheel.onclick = function() {};

		return false;
	};

});