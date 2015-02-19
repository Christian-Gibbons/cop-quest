window.onload = function() {
	// You might want to start with a template that uses GameStates:
	//     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic

	// You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
	// You will need to change the fourth parameter to "new Phaser.Game()" from
	// 'phaser-example' to 'game', which is the id of the HTML element where we
	// want the game to go.
	// The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
	// You will need to change the paths you pass to "game.load.image()" or any other
	// loading functions to reflect where you are putting the assets.
	// All loading functions will typically all be found inside "preload()".

	"use strict";

	var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update} );

	function preload() {
		game.load.tilemap('overworld', 'assets/tilemaps/maps/overworld.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.tilemap('buildingInterior', 'assets/tilemaps/maps/overworld.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('happylandTiles', 'assets/tilemaps/tilesets/happyland/tileset_8.png');
		game.load.image('sovietTiles', 'assets/tilemaps/tilesets/PST/PostSovietTile.png');
		game.load.image('indoorRPGTiles', 'assets/tilemaps/tilesets/indoor_RPG_baseline/tilesetformattedupdate1.png');
		game.load.image('collisionTile', 'assets/tilemaps/tilesets/tiles/collision.png');
		game.load.spritesheet('player', 'assets/spritesheets/sara/sara 16x18 source.png', 16, 18);
	}

	var map;
	var backgroundLayer;
	var fringeLayer;
	var collisionLayer;

	var items;
	var doors;
	var door;

	var cursors;

	var player;
	var playerDirection;
	var playerStart;

	function create() {

		map = game.add.tilemap('overworld');

		map.addTilesetImage('tileset_8', 'happylandTiles');
		map.addTilesetImage('PostSovietTile', 'sovietTiles');
		map.addTilesetImage('collision', 'collisionTile');

		backgroundLayer = map.createLayer('Background');
		fringeLayer = map.createLayer('Fringe');
		collisionLayer = map.createLayer('Collision');
		collisionLayer.renderable = false;

		game.physics.arcade.enable(collisionLayer);
		map.setCollisionByExclusion([],true,collisionLayer);
		backgroundLayer.resizeWorld();

		createDoors();
		playerStart = findObjectsByType('playerStart', map, 'Objects');
		player = game.add.sprite(playerStart[0].x, playerStart[0].y, 'player');
		player.anchor.setTo(0.5,0.5);

		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.0;
		player.body.gravity.y = 0;
		player.body.collideWorldBounds = true;

		player.animations.add('walk_right', [9, 10, 11], 10, true);
		player.animations.add('walk_left', [27, 28, 29], 10, true);
		player.animations.add('walk_up', [0, 1, 2], 10, true);
		player.animations.add('walk_down', [18, 19, 20], 10, true);

		playerDirection = 'down';
		cursors = game.input.keyboard.createCursorKeys();
//		jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		game.camera.follow(player);
		game.camera.deadzone = new Phaser.Rectangle(100,100,250,400);
	}

	function update() {
		game.physics.arcade.collide(player, collisionLayer);


		game.physics.arcade.overlap(player, doors, enterDoor, null, this);

		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
		var walkSpeed = 75;
		if(cursors.down.isDown){
			player.body.velocity.y += walkSpeed;
			playerDirection = 'down';
			player.animations.play('walk_down');
		}
		else if(cursors.up.isDown){
			player.body.velocity.y -= walkSpeed;
			playerDirection = 'up';
			player.animations.play('walk_up');
		}
		if(cursors.left.isDown){
			player.body.velocity.x -= walkSpeed;
			playerDirection = 'left';
			player.animations.play('walk_left');
		}
		else if(cursors.right.isDown){
			player.body.velocity.x += walkSpeed;
			playerDirection = 'right';
			player.animations.play('walk_right');			
		}
		if(!(cursors.down.isDown || cursors.up.isDown || cursors.left.isDown || cursors.right.isDown)){
			player.animations.stop();
			player.frame = 1;
			switch(playerDirection){
				case 'right':
					player.frame += 9;
					break;
				case 'down':
					player.frame += 18;
					break;
				case 'left':
					player.frame += 27;
					break;
				default:
					break;
			}
		}

	}

	function findObjectsByType(type, map, layer) {
		var result = new Array();
		map.objects[layer].forEach(function(element){
			if(element.properties.type === type){
				element.y -= map.tileHeight;
				result.push(element);
			}
		});
		return result;
	}

	function createFromTiledObject(element, group){
		var sprite = group.create(element.x, element.y, element.properties.sprite);
		Object.keys(element.properties).forEach(function(key){
			sprite[key] = element.properties[key];
		});
	}

	function createItems(){
		items = game.add.group();
		items.enableBody = true;
		var item;
		result = findObjectsByType('item', map, 'Objects');
		result.forEach(function(element){
			createFromTiledObject(element, items);
		}, this);
	}

	function createDoors(){
		doors = game.add.group();
		doors.enableBody = true;
//		doors.renderable = false;

		var result = findObjectsByType('door', map, 'Objects');
		result.forEach(function(element){
			createFromTiledObject(element, doors);
		}, this);
	}

	function enterDoor(player, door){
		map.removeAllLayers();
		map.destroy();
		map = {};
		map = game.add.tilemap('buildingInterior');
//		map.layers = {};
		backgroundLayer = {};
		fringeLayer = {};
		collisionLayer = {};
		map.addTilesetImage('tileset_8', 'happylandTiles');
		map.addTilesetImage('tilesetformattedupdate1', 'indoorRPGTiles');
		map.addTilesetImage('collision', 'collisionTile');

		backgroundLayer = map.createLayer('Background1');
		fringeLayer = map.createLayer('Fringe');
		collisionLayer = map.createLayer('Collision');
		collisionLayer.renderable = false;

		game.physics.arcade.enable(collisionLayer);
		map.setCollisionByExclusion([],true,collisionLayer);
		backgroundLayer.resizeWorld();

		createDoors();
		playerStart = findObjectsByType('playerStart', map, 'Objects');
		player.body.x = playerStart[0].x;
		player.body.y = playerStart[0].y;
	}
};
