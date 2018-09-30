gameManager = null;

class Background {
	constructor(dom) {
		this.dom = dom;
		this.body = $('body');
		this.position = 0;
		this.verticalSpeed = 1.5;
	}

	update() {
		this.position += this.verticalSpeed;
		this.updateDOM();
	}

	updateDOM() {
		this.dom.css('background-position', `0vh ${this.position}vh`);
		this.body.css('background-position', `0vh ${this.position}vh`);
	}
}

class CarObject {
	constructor(x, y, width, height, vehicle, dom) {
		this.startX = x;
		this.startY = y;
		this.width = width;
		this.height = height;
		this.rotation = 0;
		this.vehicle = vehicle; // vehicle position in array
		this.dom = dom;
		this.vehicles = ['ambulance', 'audi', 'black_viper', 'mini_truck', 'mini_van', 'orange_car', 'police', 'taxi', 'truck']
		this.dom.css({
    		position: "absolute",
    		width: "20vh",
    		height: "20vh",
    		"background-image": `url("./resources/images/${this.vehicles[this.vehicle % 8]}.png")`,
    		"background-size": "20vh 20vh",
    		transition: "transform 0.125s ease-out",
		});
		this.collideable = true; // enable collisions
		this.crashed = false;
		this.reset();
	}

	reset() {
		this.x = this.startX;
		this.y = this.startY;
		this.rotation = 0;
		this.crashed = false;
	}

	changeCar() {
		this.vehicle += 1;
		this.dom.css('background-image', `url("./resources/images/${this.vehicles[this.vehicle % 8]}.png")`);
	}

	updateDOM() {
		this.dom.css('left', this.x+'vh');
		this.dom.css('top', this.y+'vh');
		this.dom.css('transform', `rotate(${this.rotation}deg)`);
	}

	update() {
		if (!this.crashed) {
			// Normal behaviour
			this.normalMove();
		} else {
			// Crashed!
			this.y += this.dy;
			this.dy = 0.9 * this.dy + 0.1 * gameManager.background.verticalSpeed;

			this.rotation += this.drot;
			this.drot = 0.9 * this.drot;
		}
		this.updateDOM();
	}

	normalMove() {} // Override in subclasses for movement behaviour

	collidesWith(otherCar) {
		// Is it not collideable?
		if (!otherCar.collideable) {
			return false;
		}
		// Are we to the left of the other?
		if (this.x > (otherCar.x + otherCar.width)) {
			return false;
		}
		// Are we to the right of the other?
		if ((this.x + this.width) < otherCar.x) {
			return false;
		}

		// Are we below the other?
		if (this.y > (otherCar.y + otherCar.height)) {
			return false;
		}
		// Are we above the other?
		if ((this.y + this.width) < otherCar.y) {
			return false;
		}

		// None of the above? We must be intersecting.
		return true;
	}

	getCollisions() {
		for (const otherCar of gameManager.objects) {
			if (otherCar === this) continue;

			if (this.collidesWith(otherCar)) {
				return otherCar;
			}
		}
	}

	crash() {
		this.crashed = true;
		this.dy = 0; // dx is for the movement downward after a crash
		this.drot = Math.random() * 4 - 2;
	}

	remove() {
		this.dom.remove();
		gameManager.objects.delete(this);
	}
}

class Lives extends CarObject {
	constructor(x, y, width, height, vehicle, dom, carChange) {
		super(x, y, width, height, vehicle, dom);
		this.carChange = carChange;
	}

	normalMove() {
		if (gameManager.keyCar) {
			super.changeCar();
			if(this.carChange) gameManager.keyCar = false;
		}
		super.updateDOM();
	}
}

class MyCar extends CarObject {
	constructor(x, y, width, height, vehicle) {
		super(x, y, width, height, vehicle, $('#myCar'));
		this.speed = 2;
		this.minX = 10;
		this.maxX = 80 - this.width;
		this.minY = 0;
		this.maxY = 100 - this.height;
	}

	normalMove() {
		if (gameManager.keyLeft) {
			this.x -= this.speed * 15;
			this.rotation = -10;
			gameManager.keyLeft = false;
		}
		if (gameManager.keyRight) {
			this.x += this.speed * 15;
			this.rotation = 10;
			gameManager.keyRight = false;
		}
		if (gameManager.keyUp) {
			this.y -= this.speed;
			//gameManager.keyUp = false;
		}
		if (gameManager.keyDown) {
			this.y += this.speed;
			//gameManager.keyDown = false;
		}
		if (gameManager.keyCar) {
			super.changeCar();
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

		if ((!gameManager.keyLeft && !gameManager.keyRight) || (gameManager.keyLeft && gameManager.keyRight)) {
			this.rotation = 0;
		}

		const collideWith = this.getCollisions();

		if (collideWith) { // if it collided with something
			this.crash();
			collideWith.crash();
		}

		super.normalMove();
	}

	crash() {
		gameManager.endGame();
		super.crash();
		for(let object of gameManager.objects){
			if (object instanceof Lives){
				object.remove();
				break;
			}
		}
		gameManager.lives = gameManager.lives - 1;
	}
}

class ObstacleCars extends CarObject {
	constructor(x, width, height, vehicle, dom){
		super(x, -height, width, height, vehicle, dom);
		this.speed = 0.5;
		this.minX = 0;
		this.minY = 0;
		this.maxY = 100 + this.height;
		this.maxX = 100 - this.width;
		this.vehicle = dom; // item position to delete obj and div later
	}

	normalMove(){
		this.y += this.speed;
		super.normalMove();
	}
}

class GameManager {
	initialize() {
		this.background = new Background($('#gameArea'));
		this.vehicle = Math.floor(Math.random() * 9);
		this.myCar = new MyCar(40, 70, 10, 20, this.vehicle);
		this.lives = 3;
		this.timer = 0;

		this.gameState = 'titleScreen'; // titleScreen | inGame | endScreen
		this.objects = new Set();
		this.objects.add(this.background);
		this.objects.add(this.myCar);

		this.keyLeft = false;
		this.keyRight = false;
		this.keyUp = false;
		this.keyDown = false;
		this.keyCar = false;

		this.setupKeyListeners();

		setInterval(() => this.generateCar(), 1500);

		this.generateLives();

		this.frame();
	}

	reset() {
		this.myCar.reset();
		this.objects.forEach(object => {
			if (object instanceof ObstacleCars) object.remove();
		});
	}

	startGame() {
		this.reset();
		$('#titleScreen').css('display', 'none');
		$('#endScreen').css('display', 'none');
		this.gameState = 'inGame';
		this.timer = 0;
		var timerInterval = setInterval(() => this.startTimer(timerInterval), 1000);
	}

	endGame() {
		$('#titleScreen').css('display', 'none');
		$('#endScreen').css('display', 'block');
		this.gameState = 'endScreen';
		this.keyLeft = false;
		this.keyRight = false;
		this.keyUp = false;
		this.keyDown = false;
		this.keyCar = false;
	}

	generateLives() {
		for(let i = 0; i < this.lives; i++){
			let carChange = false;
			if(i == this.lives - 1){
				carChange = true;
			}
			const liveDom = $(document.createElement('div')).appendTo($('#gameArea'));
			this.objects.add(new Lives(115 - (10 * i) , 10, 10, 20, this.vehicle, liveDom, carChange));
		}
	}

	generateCar() {
		const lanes = [10, 40, 70];
		let lane = lanes[Math.floor(Math.random() * 3)];
		let vehicle = Math.floor(Math.random() * 9);
		const newDom = $(document.createElement('div')).appendTo($('#gameArea'));
		this.objects.add(new ObstacleCars(lane, 10, 20, vehicle, newDom));
	}

	startTimer(timerInterval) {
		var min = Math.floor(this.timer / 60);
		var sec = Math.floor(this.timer % 60);
		if(sec < 10){
			$("#timer").text(min + ":0" + sec);
		}
		else {
			$("#timer").text(min + ":" + sec);
		}
		if (this.gameState != "inGame"){
			clearInterval(timerInterval);
		}
		this.timer ++;
	}

	frame() {
		this.objects.forEach(obj => obj.update());
		window.requestAnimationFrame(() => this.frame());
	}

	setupKeyListeners() {
		$(document).keydown(e => {
			if (this.gameState !== 'inGame')
				return;
			switch(e.keyCode) {
				case 37:
					this.keyLeft = true;
					break;
				case 38:
					this.keyUp = true;
					break;
				case 39:
					this.keyRight = true;
					break;
				case 40:
					this.keyDown = true;
					break;
				case 67:
					this.keyCar = true;
					break;
			}
		});
		$(document).keyup(e => {
			if (this.gameState !== 'inGame')
				return;
			switch(e.keyCode) {
				case 37:
					this.keyLeft = false;
					break;
				case 38:
					this.keyUp = false;
					break;
				case 39:
					this.keyRight = false;
					break;
				case 40:
					this.keyDown = false;
					break;
			}
		});
		$(document).keypress(e => {
			switch(e.keyCode) {
				case 13: // Enter
					if (this.gameState === 'titleScreen' || this.gameState === 'endScreen')
						this.startGame();
					break;
				case 101: // E
					if (this.gameState === 'inGame')
						this.endGame();
					break;
			}
		});
	}
}

$(() => {
	gameManager = new GameManager();
	gameManager.initialize();
});
