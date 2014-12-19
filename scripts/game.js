var balls = [];
var paddle = 0;
var level = 1;
var since_last = 0;
var score = 0;
var lifes = 3;
var snow = [];
var last_snow = 0;
var top_score = null;

// Initialise Game
function init()
{
	for (var y = 0; y < engine.ce.height - 100; y += 5) {
		snow.push({x: Math.random() * engine.ce.width, y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 50 });
		snow.push({x: Math.random() * engine.ce.width, y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 50 });
		snow.push({x: Math.random() * engine.ce.width, y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 50 });
		snow.push({x: Math.random() * engine.ce.width, y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 50 });
		snow.push({x: Math.random() * engine.ce.width, y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 50 });
	}
	paddle = engine.ce.width / 2;
}

function levelUp() { level++; }

// Update and draw the game state
function tick(ce, c, dtime)
{
	var now = new Date().getTime();
	if (now > last_snow + 10) {
		last_snow = now;
		snow.push({x: Math.random() * ce.width, y: 0, vx: (Math.random() - 0.5) * 50 });
		snow.push({x: Math.random() * ce.width, y: 0, vx: (Math.random() - 0.5) * 50 });
		snow.push({x: Math.random() * ce.width, y: 0, vx: (Math.random() - 0.5) * 50 });
		snow.push({x: Math.random() * ce.width, y: 0, vx: (Math.random() - 0.5) * 50 });
		snow.push({x: Math.random() * ce.width, y: 0, vx: (Math.random() - 0.5) * 50 });
	}

	if (lifes > 0) {
		if (level == 1) {
			if (now > since_last + 1000) {
				since_last = now;
				balls.push({x: Math.random() * 400 + ce.width/2 - 200, y: 0, v: {x: 0, y: 0}, id: "blue", score: 1});
			}
			if (score > 20)
				levelUp();
		} else if (level == 2) {
			if (now > since_last + 1000) {
				since_last = now;
				if (Math.random() > 0.6)
					balls.push({x: Math.random() * 400 + ce.width/2 - 200, y: 0, v: {x: 0, y: 10}, id: "brussel", score: 0, no_drop_penalty: true, hp: -1});
				else
					balls.push({x: Math.random() * 400 + ce.width/2 - 200, y: 0, v: {x: 0, y: 10}, id: "blue", score: 1});
			}
		}
	}

	var g = c.createLinearGradient(0, 2 * ce.height / 3, 0, ce.height);
	g.addColorStop(0, "#636eca");
	g.addColorStop(1, "#9375b1");
	c.fillStyle = g;
	c.fillRect(0, 0, ce.width, ce.height);

	for (var i = 0; i < snow.length; i++) {
		var one = snow[i];
		c.fillStyle = "white";
		c.fillRect(one.x, one.y, 3, 3);
		one.x += one.vx * dtime;
		one.y += 200 * dtime;
		if (one.y > ce.height - 100) {
			snow.splice(i, 1);
			i--;
		}
	}

	var g = c.createLinearGradient(0, ce.height - 100, 0, ce.height);
	g.addColorStop(0, "rgba(255, 255, 255, 0)");
	g.addColorStop(0.07, "white");
	g.addColorStop(1, "#ccc");
	c.fillStyle = g;
	c.fillRect(0, ce.height - 100, ce.width, ce.height);

	for (var i = 0; i < balls.length; i++) {
		var ball = balls[i];
		c.drawImage($("#"+ball.id)[0], ball.x, ball.y);
		ball.x   += ball.v.x * dtime;
		ball.y   += ball.v.y * dtime;
		ball.v.y += 9.8 * 50 * dtime;

		if (lifes > 0 && ball.y > ce.height - 260 && !ball.failed) {
			if (Math.abs(ball.x - paddle) < 132/2) {
				score += ball.score;
				if (ball.hp)
					lifes += ball.hp;
				balls.splice(i, 1);
				i--;
			} else {
				ball.failed = true;
				if (!ball.no_drop_penalty)
					lifes--;
			}
		}

		if (ball.y > ce.height - 90) {
			if (ball.x > ce.width/2)
				ball.v.x += 5;
			else
				ball.v.x -= 5;
			ball.v.y = 0;

			if (ball.x > ce.width || ball.x < 0) {
				balls.splice(i, 1);
				i--;
			}
		}
	}

	if (lifes > 0) {
		var mouse = mousePosition();
		paddle += (mouse.x - paddle) * 0.8;
		if (paddle < 100)
			paddle = 101;
		if (paddle > ce.width - 100)
			paddle = ce.width - 101;
		c.drawImage($("#hat")[0], paddle - 132/2, ce.height - 260);
	}

	c.fillStyle = "white";
	c.font = "40px Arial";
	c.fillText(score, 10, 40);
	c.font = "16px Arial";
	c.fillText("Level " + level, 10, 60);
	c.fillText(lifes + " lifes remaining", 10, 80);

	if (lifes <= 0)
		c.fillText("You died, reload the page to restart.", 20, ce.height / 2 - 5);
	else if (score == 0)
		c.fillText("Catch the boubles, avoid the brussel sprouts!", 20, ce.height / 2 - 5);
}
