var canvas = document.getElementById('worldscreen');

var bd = 0; //NO LONGER NEEDED - I FIXED IT - 20 fits nicely on a half screen

var ctx = canvas.getContext('2d');
canvas.height = window.innerHeight - bd;
canvas.width = window.innerWidth - bd;

//Testing balls Pedro, Queenie and Robert
var p = new Particle(new Vector(350, 500), new Vector(1, 0));
p.drawColor = "rgb(255,0,0)";
var q = new Particle(new Vector(150, 500), new Vector(500, 0));
q.drawColor = "rgb(128,155,100)";
var r = new Particle(new Vector(450, 500), new Vector(0, 0));

var particles = [];
for (var i = 0; i < settings.count; i++) {
    addNewParticle(new Vector(Math.random() * canvas.width, Math.random() * canvas.width));
}

function addNewParticle(position) {
    var o = new Particle(position);
    o.velocity = new Vector(Math.random() * 10 - 5, Math.random() * 10 - 5); //Omnidirectional
    //I'm leaving a little red in because A) It's the best colour and B) Very dark balls don't show up well on a black background
    o.drawColor = "rgb(" + Math.floor(Math.random() * 200 + 55) + "," + Math.floor(Math.random() * 200) + "," + Math.floor(Math.random() * 255) + ")";
    particles.push(o); //comment this out when testing
}

function loop() { //This is the ideal function layout
    clear();      // You may not like it,
    update();     // but this is what peak
    draw();       // performance looks like.
    queue();      // | || || |_ 22:46, 19/01/2019
}                 // anyone else who works on this code, leave a note here to mark the "version history" that gets passed down

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function queue() {
    window.requestAnimationFrame(loop); //This will run at full speed, but won't run in the background, so feel free to test on mobile devices with no fear of destroying your battery
}

function update() {
    plotParticles(canvas.width, canvas.height);
}

function draw() {
    drawParticles();
}

function plotParticles(boundsX, boundsY) {
    for (var i = particles.length - 1; i >= 0; i--) {
        var particle = particles[i];
        var pos = particle.position;

        particle.move();
        if (settings.mode == 1) {
            particle.position.x = ((pos.x % boundsX) + boundsX) % boundsX; //Wrap around, but also deal with javascript's sh*tty "%" tool
            particle.position.y = ((pos.y % boundsY) + boundsY) % boundsY; //JAVASCRIPT, % IS NOT SUPPOSED TO GIVE YOU A NEGATIVE JFC
        } else if (settings.mode == 2) {
            if (particle.position.x < 0) { //bounce
                particle.position.x = 0;
                particle.velocity.x *= -1;
            } else if (particle.position.x > boundsX) {
                particle.position.x = boundsX;
                particle.velocity.x *= -1;
            }
            if (particle.position.y < 0) {
                particle.position.y = 0;
                particle.velocity.y *= -1;
            } else if (particle.position.y > boundsY) {
                particle.position.y = boundsY;
                particle.velocity.y *= -1;
            }

        }
        for (var j = particles.length - 1; j >= 0; j--) { //touch ALL the things
            if (j != i) {
                particle.interact(particles[j]);
            }
        }
    }

}

function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
        drawCircle(particles[i]); //if you use anything other than a circle i will personally come to your house and cry on your doorstep
    }
}

function drawCircle(object) {
    ctx.fillStyle = object.drawColor || "rgb(0,255,255)";
    ctx.beginPath();
    ctx.arc(object.position.x, object.position.y, object.objectSize, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function onResize() { //this is pretty fun, you can make the balls spread out then smallify the window to make a tidal wave :3
    canvas.height = window.innerHeight - bd;
    canvas.width = window.innerWidth - bd;
}

loop();
