//PHYSICS SIM VARIABLES very fun to play with
//var objectConst = 20; //DEPRECATED: Distance between objects for XTREME FORCE
//var frictionLimit = 0.02; //Velocities lower than this = 0 (default 0.02)
//var frictionMultip = 0.999; //How much velocity is retained [1 to 0] (default 0.999+)
//var strongForce = 0.2; //Repelling multiplar between "touching" particles (default 0.2)
//var hookRange = 100; //Max distance to calculate hook (default 100, but very flexible)
//var hookMult = 1; //CURRENTLY DOES NOTHINGMultiplier on the hook forces (default 1 - use with caution)
//var hookSpeed = 2; //Over this speed, the hook forces apply (2 makes strong patterns, 5+ makes weak patterns)
//var speedLimit = 20; //Max velocity (honestly whatever floats your boat, it gets hard to see things travelling over 70)
//var speedSizing = 2; //0-constant,1-fast=big,2-fast=small,3-random constant
//var maxSize = 30; // (default 30)
//var count = 20; //Particle count: Used in "world.js". Gets kinda oofy over 1000
//var mode = 2; //0-no walls,1-looping walls,2-solid walls
//var newChance = 0.05; //Chance for a new particle to form on collision
//var maxCount = 200; //No new particles formed after this
//var puberty = 100; //Forms new particles after this age
//var death = -1; //Dies after this age (-1 for immortal)

var settings = {
    frictionLimit: 0.02,
    frictionMultip: 0.999,
    strongForce: 0.2,
    hookRange: 100,
    hookSpeed: 2,
    speedLimit: 20,
    speedSizing: 2,
    maxSize: 30,
    count: 20,
    mode: 2,
    newChance: 0.05,
    maxCount: 200,
    puberty: 100,
    death: -1
}

//FUN PRESETS:
//Chain reaction
/*
frictionMultip = 0.9;
speedSizing = 2;
maxSize = 30; //can be varied
count = 100; //100 for half screen, 200-300 for full
*/

class Vector {
    //A 2D Vector used for position and velocity
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }
    multiply(multip) {
        this.x *= multip;
        this.y *= multip;
    }
    //R = return - does not change the original vector
    Radd(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    Rmultiply(multip) {
        return new Vector(this.x * multip, this.y * multip);
    }
    getMagnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    getAngle() {
        //Returns angle of the vector from the x axis
        return Math.atan2(this.y, this.x); //love this function
    }

    distanceFrom(vector) { //Effectively vector subtraction
        var distancex = this.x - vector.x;
        var distancey = this.y - vector.y;
        return new Vector(distancex, distancey);
    }
    rotate(angle) { //Preserves magnitude
        var newVect = Vector.fromAngle(this.getAngle() + angle, this.getMagnitude());
        this.x = newVect.x;
        this.y = newVect.y;
    }
    zero() { //Useful for removing velocity
        this.x = 0;
        this.y = 0;
    }
    static fromAngle(angle, magnitude) {
        //Contructs a vector from a direction and magnitude
        return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }
}


class Particle {
    constructor(point, velocity, acceleration, color) {
        if (settings.speedSizing == 3) { //Fixed random
            this.objectSize = settings.maxSize * 4 / 5 * Math.random() + settings.maxSize * 1 / 5;
        } else { //Fixed
            this.objectSize = settings.maxSize * 3 / 5;
        } //Otherwise set in first movement iteration

        this.age = 0;
        this.position = point || new Vector();
        this.velocity = velocity || new Vector();
        this.acceleration = acceleration || new Vector();
        this.drawColor = color || "rgb(0,128,255)"; //A nice blue, but I mostly stick to random colours
    }
    move() {
        this.age += Math.random() * (1 - this.velocity.getMagnitude() / settings.speedLimit);
        if (settings.death > 0 && this.age > settings.death) {
            particles.splice(particles.indexOf(this), 1);
        }
        if (this.velocity.getMagnitude() < settings.frictionLimit) { //Stops very small calculations, honestly kind of unneccesary
            this.velocity.zero();
        }
        else {
            this.velocity.multiply(settings.frictionMultip);
        }
        if (this.velocity.getMagnitude() >= settings.speedLimit) {
            this.velocity.multiply(1 / this.velocity.getMagnitude()); //Maintains direction
            this.velocity.multiply(settings.speedLimit);
        }
        this.velocity.add(this.acceleration); //I never use this, maybe for rocket experiments?
        this.position.add(this.velocity);

        //Resizing
        if (settings.speedSizing == 1) { //Fast = big
            this.objectSize = settings.maxSize * this.velocity.getMagnitude() / settings.speedLimit;
        } else if (settings.speedSizing == 2) { //Fast = small
            this.objectSize = (settings.maxSize / 4) / (this.velocity.getMagnitude() / settings.speedLimit + 0.25);
        }

    }
    interact(particle) { //Detects collisions, and other laws of physics
        var distance = this.position.distanceFrom(particle.position);
        //Collision force range
        if (distance.getMagnitude() < (this.objectSize + particle.objectSize)) { //If touching... god i love circles
            if (this.age > settings.puberty && Math.random() < settings.newChance && particles.length < settings.maxCount) {
                addNewParticle(this.position.Radd(Vector.fromAngle(Math.random() * 2 * Math.PI, Math.random() * 10)));
            }
            this.velocity.add(distance.Rmultiply(settings.strongForce)); //Big boy force in the opposite direction
        }
        //Turning "hook" force range
        else if (distance.getMagnitude() < settings.hookRange) {
            if (this.velocity.getMagnitude() > settings.hookSpeed && particle.velocity.getMagnitude() > settings.hookSpeed) {//This breaks with very slow particles sometimes, and it looks more interesting like this
                var rotmult = 1 / (distance.getMagnitude() - (this.objectSize + particle.objectSize - 1)); //Inversely proportional to distance
                var anglediff = this.velocity.getAngle() - particle.velocity.getAngle() % (Math.PI);
                this.velocity.rotate(-trueDiff(anglediff) * rotmult); //look just trust me dont take away the minus (also that would be cool maybe try that?)
            }
        }
    }
}

function trueDiff(diff) { //Finds out whether or not your rotation will break if you try to find a fraction of it
    if (diff > Math.PI) {
        diff -= 2 * Math.PI;
    }
    else if (diff < -Math.PI) {
        diff += 2 * Math.PI;
    }

    if (diff > Math.PI || diff < -Math.PI) {
        return trueDiff(diff);
    } else { return diff; } //this makes it not break, well done you

}

var gui = new dat.GUI();
gui.add(settings, "frictionLimit");
gui.add(settings, "frictionMultip");
gui.add(settings, "strongForce");
gui.add(settings, "hookRange");
gui.add(settings, "hookSpeed");
gui.add(settings, "speedLimit");
gui.add(settings, "speedSizing");
gui.add(settings, "maxSize");
gui.add(settings, "count");
gui.add(settings, "mode");
gui.add(settings, "newChance");
gui.add(settings, "maxCount");
gui.add(settings, "puberty");
gui.add(settings, "death");