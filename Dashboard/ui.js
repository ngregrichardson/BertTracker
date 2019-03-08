// Shortcut variables for PixiJS
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

// Empty sprites
var field, robot;

// Initialize PixiJS with transparent background
var app = new PIXI.Application(window.innerWidth, window.innerHeight, { transparent: true, autoResize: true });
document.body.appendChild(app.view); // Append it to the view
loader.add(["images/field.png", "images/robot.png"]).load(setup); // Load images

// Runs once images are loaded
function setup() {
    // Initialize my sprites to images
    field = new Sprite(resources["images/field.png"].texture);
    robot = new Sprite(resources["images/robot.png"].texture);

    // Set the dimensions of the field
    field.width = 296;
    field.height = 585;

    // Center the sprite and set the width/height
    robot.anchor.set(0.5);
    robot.width = 25;
    robot.height = 25;

    // Move the sprite to the starting position
    robot.x = 130;
    robot.y = 62;

    // Initialize speeds to 0
    robot.vx = 0;
    robot.vy = 0;
    robot.rotateSpeed = 0;

    // Add sprites to view
    app.stage.addChild(field);
    app.stage.addChild(robot);

    /* START KEYBOARD CONTROLS FOR MOVEMENT TESTING */

    //Capture the keyboard arrow keys
    let up = keyboard("ArrowUp"),
        down = keyboard("ArrowDown"),
        turnLeft = keyboard("ArrowLeft"),
        turnRight = keyboard("ArrowRight");
    let speed = 1.5; // The speed 

    // Move up on keypress
    up.press = () => {
        robot.vy = speed;
    };

    // Stop moving up on keyrelease
    up.release = () => {
        if (!down.isDown) {
            robot.vy = 0;
        }
    };

    // Move down on keypress
    down.press = () => {
        robot.vy = -speed;
    };

    // Stop moving down on keyrelease
    down.release = () => {
        if (!up.isDown) {
            robot.vy = 0;
        }
    };

    // Turn left on keypress
    turnLeft.press = () => {
        robot.rotateSpeed = -speed / 20;
    };

    // Stop turning left on keyrelease
    turnLeft.release = () => {
        if (!turnRight.isDown) {
            robot.rotateSpeed = 0;
        }
    };

    // Turn right on keypress
    turnRight.press = () => {
        robot.rotateSpeed = speed / 20;
    };

    // Stop turning right on keyrelease
    turnRight.release = () => {
        if (!turnLeft.isDown) {
            robot.rotateSpeed = 0;
        }
    };

    /* END KEYBOARD CONTROLS FOR MOVEMENT TESTING */

    // Loop the gameLoop
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {

    /* START KEYBOARD CONTROLS FOR MOVEMENT TESTING */
    //robot.rotation += robot.rotateSpeed;
    //robot.x += robot.vy * Math.sin(-robot.rotation);
    //robot.y += robot.vy * Math.cos(-robot.rotation);
    /* END KEYBOARD CONTROLS FOR MOVEMENT TESTING */

    // Collider for right side
    if (robot.x + (robot.width / 2) > field.width) {
        robot.x = field.width - (robot.width / 2);
    }

    // Collider for left side
    if (robot.x - (robot.width / 2) < 0) {
        robot.x = robot.width / 2;
    }

    // Collider for bottom
    if (robot.y + (robot.height / 2) > field.height) {
        robot.y = field.height - (robot.height / 2);
    }

    // Collider for top
    if (robot.y - (robot.height / 2) < 0) {
        robot.y = robot.height / 2;
    }
}

// This runs when the x value is updated
NetworkTables.addKeyListener('/tracker/x', (key, value) => {
    robot.x = 130 + value;
});

// This runs when the y value is updated
NetworkTables.addKeyListener('/tracker/y', (key, value) => {
    robot.y = 62 + value;
});

// This runs when the angle is updated
NetworkTables.addKeyListener('/tracker/angle', (key, value) => {
    robot.rotation = value * (Math.PI / 180);
});

// This listens for network table errors and displays them
addEventListener('error', (ev) => {
    ipc.send('windowError', { mesg: ev.message, file: ev.filename, lineNumber: ev.lineno })
});

// This allows the app to resize when the window is resized
window.addEventListener("resize", function () {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

// This listens for key presses and releases
function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}