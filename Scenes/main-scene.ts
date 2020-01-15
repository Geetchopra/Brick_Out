import * as Phaser from 'phaser';
import {Ball} from './../Objects/ball';
import {Paddle} from "./../Objects/paddle";
import {Brick} from "./../Objects/brick";
import {Helper} from "./../Helpers/helper";

export class BrickOut extends Phaser.Scene {
	private bricks : Array<Brick> = [];
	private paddle : Paddle;
	private ball : Ball;
	private score_text : Phaser.GameObjects.Text;
	private score : number;
	private lives_text : Phaser.GameObjects.Text;
	private lives : number;
	private full_reset : boolean;
	private helper : Helper = new Helper();

	preload() : void {
		let assets : Array<string> = ["red_brick", "super_bar", "you_win", "you_lose", "flower", "drop", "leaf", "blue_brick", "yellow_brick", "green_brick", "ball", "paddle", "background"];
		for (var i = 0; i < assets.length; i++) {
			this.load.image(assets[i], "Assets/" + assets[i] + ".png");
		}
		this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
	}

	create() : void {
		this.physics.world.setBounds(65, 65, 715, 1275, true, true, true, false);
		this.init_UI();
		this.init_paddle();
		this.init_bricks();
		this.init_ball();
		this.init_colliders();
	}

	update() : void {
		this.input_manager();
		if (this.ball.out_of_bounds()) {
			if (--this.lives == 0)
				this.lose();
			else
				this.reset_game();
		}
	}

	init_bricks() : void {
		let brick_x : number = 132;
	    let brick_y : number = 150;
	    let brick_colour : string;
	    for (var i = 0; i < 5; i++) {
	        for (var j = 0; j < 9; j++) {
	        	brick_colour = this.helper.get_colour(Math.random());
	            let brick = new Brick({scene: this, x: brick_x, y: brick_y, key: brick_colour + "_brick"});
	            brick.init();
	            this.bricks.push(brick);
	            brick_x += 64;
	        }
	        brick_x = 132;
	        brick_y += 32;
	    }
	}

	init_paddle() : void {
		this.paddle = new Paddle({scene: this, x: 356, y: 1230, key: 'paddle'});
		this.paddle.init();
	}

	init_ball() : void {
		this.ball = new Ball({scene: this, x: this.paddle.x + 51.5, y: this.paddle.y - 50, key: 'ball'});
		this.ball.init();
	}

	init_colliders() : void {
		for (var i = 0; i < this.bricks.length; i++) {
			this.physics.add.collider(this.ball, this.bricks[i], this.hit_brick, null, this);
		}
		this.physics.add.collider(this.ball, this.paddle, this.hit_paddle, null, this);
	}

	init_UI() : void {
		this.score = 0;
		this.lives = 3;
		this.full_reset = false;
		this.add.image(0, 0, 'background').setOrigin(0, 0);
		this.score_text = this.add.text(350, 20, "Score: " + this.score, {fill: "#fbd063", font : "30px Baloo Bhai", stroke : "#42210b", strokeThickness: "5"});
    	this.lives_text = this.add.text(360, 1345, "Lives: " + this.lives, {fill: "#fbd063", font : "30px Baloo Bhai", stroke : "#42210b", strokeThickness: "5"});
	}

	input_manager() : void {
		this.paddle.on('drag', (pointer) => {
			this.paddle.input_callback(pointer, this.ball);
		});

		this.paddle.on('pointerup', (pointer) => {
			this.ball.input_callback(pointer);
		});
	}

	hit_brick(ball : Ball, brick : Brick) : void {
		this.score += brick.hit();
		this.score_text.setText("Score: " + this.score);
		if (this.check_win())
			this.win();
	}

	check_win() : boolean {
		let i : integer;
		for (i = 0; i < this.bricks.length; i++) {
			if (!this.bricks[i].is_dead())
				return false;
		}
		return true;
	}

	hit_paddle(ball : Ball, paddle : Paddle) : void {
		ball.hit(paddle.x);
	}

	lose() : void {
		let retry : Phaser.GameObjects.Image;
		this.full_reset = true;
		this.input.disable(this.paddle);
		retry = this.physics.add.sprite(60, 460, "you_lose").setOrigin(0, 0).setInteractive();
		retry.on('pointerup', () => {
			this.input.enable(this.paddle);
			retry.destroy();
		});
	}

	reset_game() : void {
		this.lives_text.setText("Lives: " + (this.lives));
	    if (this.full_reset) {
	        this.lives = 3;
	        this.score = 0;
	        this.score_text.setText("Score: " + this.score);
	        this.lives_text.setText("Lives: " + this.lives);
	        this.full_reset = false;
	        for (var i = 0; i < this.bricks.length; i++) {
	   			this.bricks[i].reset();
	        }
	    }
	    this.paddle.reset();
	    this.ball.reset(this.paddle.x);
	}

	win() : void {
		let sprite : Phaser.GameObjects.Image;
		sprite = this.add.image(60, 460, "you_win").setOrigin(0, 0).setScale(0);
		let tween;

		this.ball.disable();
		this.paddle.disableBody(true, true);

		tween = this.tweens.add({
	        targets: sprite,
	        scale: 1,
	        ease: 'linear',
	        duration: 500,
	        yoyo: false
    	});
	}
}




