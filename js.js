leftPressed = false;
rightPressed = false;
gameState = 'titleScreen'; // 'titleScreen' | 'inGame' | 'endScreen'
upPressed = false;
downPressed = false;
carPressed = false;
score = 0;

class Background {
	constructor(dom) {
		this.dom = dom;
		this.position = 0;
		this.verticalSpeed = 1;
	}

	update() {
		this.position += this.verticalSpeed;
		this.updateDOM();
	}

	updateDOM() {
		this.dom.css('background-position', `0vh ${this.position}vh`);
	}
}

class CarObject {
	constructor(x, y, width, height, vehicle, dom) {
		this.startX = x;
		this.startY = y;
		this.width = width;
		this.height = height;
		this.vehicle = vehicle; // vehicle position in array
		this.dom = dom;
		this.reset();
		this.vehicles = ['ambulance', 'audi', 'black_viper', 'mini_truck', 'mini_van', 'orange_car', 'police', 'taxi', 'truck']
		this.dom.css({
    		position: "absolute",
    		width: "20vh",
    		height: "20vh",
    		"background-image": `url("./resources/images/${this.vehicles[this.vehicle % 8]}.png")`,
    		"background-size": "20vh 20vh",
    		transition: "transform 0.125s ease-out",
		});
	}

	reset() {
		this.x = this.startX;
		this.y = this.startY;
	}

	changeCar() {
		this.vehicle += 1;
		this.dom.css('background-image', `url("./resources/images/${this.vehicles[this.vehicle % 8]}.png")`);
	}

	updateDOM() {
		this.dom.css('left', this.x+'vh');
		this.dom.css('top', this.y+'vh');
	}

	update() {
		this.updateDOM();
	}
}

class MyCar extends CarObject {
	constructor(x, y, width, height, vehicle) {
		super(x, y, width, height, vehicle, $('#myCar'));
		this.vehicle = vehicle;
		this.speed = 1;
		this.minX = 0;
		this.maxX = 90 - this.width;
		this.minY = 0;
		this.maxY = 100 - this.height;
		this.rotation = 0;
	}
	
	changeCar(){
		super.changeCar();
	}

	update() {
		if (leftPressed) {
			this.x -= this.speed;
			this.rotation = -10;
		}
		if (rightPressed) {
			this.x += this.speed;
			this.rotation = 10;
		}
		if (upPressed) {
			this.y -= this.speed;
		}
		if (downPressed) {
			this.y += this.speed;
		}
		if(carPressed) {
			super.changeCar();
			carPressed = false;
		}

		if(this.minX !== undefined && this.x < this.minX) {
			this.x = this.minX;
		}
		if(this.maxX !== undefined && this.x > this.maxX) {
			this.x = this.maxX;
		}
		if(this.minY !== undefined && this.y < this.minY) {
			this.y = this.minY;
		}
		if(this.maxY !== undefined && this.y > this.maxY) {
			this.y = this.maxY;
		}

		if ((!leftPressed && !rightPressed) || (leftPressed && rightPressed)) {
			this.rotation = 0;
		}

		super.update();
	}

	updateDOM() {
		super.updateDOM();
		this.dom.css('transform', `rotate(${this.rotation}deg)`);
	}
}

class ObstacleCars extends CarObject {
	constructor(x, width, height, vehicle, dom){
		super(x, -height, width, height, vehicle, $(`#obstacleCar${dom}`));
		this.speed = 0.5;
		this.minX = 0;
		this.minY = 0;
		this.maxY = 100 + this.height;
		this.maxX = 100 - this.width;
		this.vehicle = dom; // item position to delete obj and div later
	}

	update(){
		this.y += this.speed;
		super.update();
	}
}

$(() => {
	const background = new Background($('#gameArea'));
	const obstaclecars = [];
	const lanes = [10, 40, 70];
	const myCar = new MyCar(40, 70, 10, 20, 7);
	
	function startGame() {
		myCar.reset();
		$('#titleScreen').css('display', 'none');
		$('#endScreen').css('display', 'none');
		gameState = 'inGame';
	}

	function endGame() {
		$('#titleScreen').css('display', 'none');
		$('#endScreen').css('display', 'block');
		gameState = 'endScreen';
	}
	setInterval(function carGenerator() {
		let lane = lanes[Math.floor(Math.random() * 3)];
		let vehicle = Math.floor(Math.random() * 9);
		let num = obstaclecars.length;
		$('#gameArea').append(`<div id='obstacleCar${num}'>&nbsp;</div>`);
		obstaclecars.push(new ObstacleCars(lane, 10, 20, vehicle, num));
	}, 2000);

	$(document).keydown(e => {
		if (gameState !== 'inGame')
			return;
		switch(e.keyCode) {
			case 37:
				leftPressed = true;
				break;
			case 39:
				rightPressed = true;
				break;
		}
	});
	$(document).keyup(e => {
		if (gameState !== 'inGame')
			return;
		switch(e.keyCode) {
			case 37:
				leftPressed = false;
				break;
			case 39:
				rightPressed = false;
				break;
		}
	});
	$(document).keydown(e => {
		if (gameState !== 'inGame')
			return;
		switch(e.keyCode) {
			case 38:
				upPressed = true;
				break;
			case 40:
				downPressed = true;
				break;
			case 67:
				carPressed = true;
				break;
		}
	});
	$(document).keyup(e => {
		if (gameState !== 'inGame')
			return;
		switch(e.keyCode) {
			case 38:
				upPressed = false;
				break;
			case 40:
				downPressed = false;
				break;
			case 67:
				carPressed = false;
				break;
		}
	});
	$(document).keypress(e => {
		switch(e.keyCode) {
			case 13: // Enter
				if (gameState === 'titleScreen' || gameState === 'endScreen')
					startGame();
				break;
			case 101: // E
				if (gameState === 'inGame')
					endGame();
				break;
		}
	});

	function frame() {
		background.update();
		myCar.update();
		obstaclecars.forEach(function(item){
			item.update();
			if(item.y < -20){ // tried to implement score and delete 
				score++;
				delete item;
				$(`#obstacleCar${item.vehicle}`).remove();
			}
		});
		requestAnimationFrame(frame);
	}
	frame();
	
});
