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
class People {
	constructor(x, y, width, height, person, dom) {
		this.startX = x;
		this.startY = y;
		this.width = width;
		this.height = height;
		this.person = person; 
		this.dom = dom;
		this.reset();
		this.people = ['walking_left','man_left','woman_left','girl_right','man_right','walking_right'];
		this.dom.css({
    		position: "absolute",
    		width: "10vh",
    		height: "10vh",
    		"background-image": `url("./resources/images/${this.people[this.person % 6]}.gif")`,
    		"background-size": "10vh 10vh",
    		transition: "transform 0.125s ease-out",
		});
		this.dom.addClass('people');
		this.collideable = true; // enable collisions
		this.crashed = false;
		this.reset();
	}
	
	reset() {
		this.x = this.startX;
		this.y = this.startY;
		this.crashed = false;
		this.rotation = 0;
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
class ObstaclePeople extends People {
	constructor(y, x, height, person, dom, speed){
		super(-x, y, 10, height, person, dom);
		this.speed = speed;
		this.speedY = 1;
		this.minX = 0;
		this.minY = 0;
		this.maxY = 100 + this.height;
		this.maxX = 100 - this.x;
		this.person = dom; 
	}
	normalMove(){
		this.x += this.speed;
		this.y += this.speedY;
		super.normalMove();
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
		if(otherCar instanceof ObstaclePeople){
			if (this.x > (otherCar.x )) {
				return false;
			}
			// Are we to the right of the other?
			if ((this.x + this.width) < otherCar.x) {
				return false;
			}
	
			// Are we below the other?
			if (this.y > (otherCar.y + otherCar.height - 12)) {
				return false;
			}
			// Are we above the other?
			if ((this.y + this.width) < (otherCar.y - 4.5)) {
				return false;
			}
		}else{
			if (this.x > (otherCar.x + otherCar.width)) {
				return false;
			}
			// Are we to the right of the other?
			if ((this.x + this.width) < otherCar.x) {
				return false;
			}
	
			// Are we below the other?
			if (this.y > (otherCar.y + otherCar.height - 3)) {
				return false;
			}
			// Are we above the other?
			if ((this.y + this.width) < (otherCar.y - 4.5)) {
				return false;
			}
		}
		
		// None of the above? We must be intersecting.
		if(otherCar instanceof ObstaclePeople){
			console.log("this.x: "+this.x);
			console.log("this.width: "+this.width);
			console.log("otherCar.x: "+otherCar.x);
			console.log("otherCar.width: "+otherCar.width);
		}
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
		this.speed = 1;
		this.minX = 10;
		this.maxX = 80 - this.width;
		this.minY = 0;
		this.maxY = 100 - this.height;
	}

	normalMove() {
		if (gameManager.keyLeft) {
			this.x -= this.speed;
			this.rotation = -10;
			//gameManager.keyLeft = false;
		}
		if (gameManager.keyRight) {
			this.x += this.speed;
			this.rotation = 10;
			//gameManager.keyRight = false;
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
			collideWith.collideable = false;
		}

		super.normalMove();
	}

	crash() {
		super.crash();
		for(let object of gameManager.objects){
			if (object instanceof Lives){
				object.remove();
				break;
			}
		}
		gameManager.lives = gameManager.lives - 1;

		if (gameManager.lives == 0){
			gameManager.endGame();
		}
		else{
			this.reset();
			
		}
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

		this.restart = false;

		this.setupKeyListeners();

		setInterval(() => this.generateObstacles(), 1500);

		this.frame();
	}

	reset() {
		this.myCar.reset();
		this.vehicle = this.myCar.vehicle;
		this.objects.forEach(object => {
			if (object instanceof ObstacleCars) object.remove();
			if (object instanceof ObstaclePeople) object.remove();
		});
	}

	startGame() {
		this.timer = 0;
		this.lives = 3;
		this.reset();
		$('#titleScreen').css('display', 'none');
		$('#endScreen').css('display', 'none');
		this.gameState = 'inGame';
		this.generateLives();
		var timerInterval = setInterval(() => this.startTimer(timerInterval), 1000);
	}

	endGame() {
		$('#titleScreen').css('display', 'none');
		$('#endScreen').css('display', 'block');
		$("#finalScore").text(this.timer + " seconds!");
		if (this.timer > localStorage.highScore) {
			localStorage.highScore = this.timer;
		}
		$('#highScore').text(localStorage.highScore + " seconds!");
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

	generateObstacles() {
		const lanes = [10, 40, 70];
		let lane = lanes[Math.floor(Math.random() * 3)];
		let vehicle = Math.floor(Math.random() * 9);
		const newDom = $(document.createElement('div')).appendTo($('#gameArea'));
		this.objects.add(new ObstacleCars(lane, 10, 20, vehicle, newDom));

		let place = Math.floor(Math.random()*90)-20; 
		let person = Math.floor(Math.random() * 6);
		const newDomP = $(document.createElement('div')).appendTo($('#gameArea'));
		let speed = -0.5;
		let xplace = -90;
		if(person>2){
			speed = 0.5;
			xplace = 10;
		}
		this.objects.add(new ObstaclePeople(place, xplace, 20, person, newDomP, speed));
	}

	startTimer(timerInterval) {
		$("#timer").removeClass("flashing");
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
			$("#timer").addClass("flashing");
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
				case 32:
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
