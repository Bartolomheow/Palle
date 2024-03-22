canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
canvas.height = window.innerHeight*0.9;
canvas.width = window.innerWidth*0.8;
window.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);

let boing = new Audio("ball-bounce-94853.mp3");
boing.volume = 0.5;


function playSound(sound){
    sound.cloneNode(true).play();
} 

let fps = 60;

let startx = 0;
let starty = 0;

let clicked = false;

function getMousePos(event) {
    return {
        x: event.clientX,
        y: event.clientY,
    };
}

document.onmousemove = function(e){ 
    if(clicked){
        let vector = new Vector( -(getMousePos(e).x - startx)/10,-(getMousePos(e).y - starty)/10);
        vector.draw(startx, starty, 100);
    }  
} 


function handleMouseDown(event){
    let x = getMousePos(event).x;
    let y = getMousePos(event).y;
    startx = x;
    starty = y;
    vector = new Vector(0, 0);
    vector.draw(x, y);
    clicked = true;
}

function handleMouseUp(event){
    let x = event.clientX;
    let y = event.clientY;
    clicked = false;
    document.getElementById('arrow').style.display = 'none';
    let vector = new Vector( -(x - startx)/10,-(y - starty)/10);
    palla1.speed = vector;

}

function resizeCanvas(){
    canvas.height = window.height
    canvas.width = window.width
}

// LINE/RECTANGLE
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

function lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    let vector = new Vector(Infinity, Infinity);

    function updateVector(intersectionX, intersectionY) {
        const newVector = new Vector(Math.abs(x1 - intersectionX), Math.abs(y1 - intersectionY));
        if (newVector.mag() < vector.mag()) {
            vector = newVector;
        }
    }

    function checkIntersection(x3, y3, x4, y4) {
        const [isIntersecting, intersectionX, intersectionY] = lineLine(x1, y1, x2, y2, x3, y3, x4, y4);
        if (isIntersecting) {
            updateVector(intersectionX, intersectionY);
            return true;
        }
        return false;
    }

    if (checkIntersection(rx, ry, rx, ry + rh) ||
        checkIntersection(rx, ry, rx + rw, ry) ||
        checkIntersection(rx + rw, ry, rx + rw, ry + rh) ||
        checkIntersection(rx, ry + rh, rx + rw, ry + rh)) {
        return vector;
    }
    return false;
}

function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        const intersectionX = x1 + uA * (x2 - x1);
        const intersectionY = y1 + uA * (y2 - y1);
        return [true, intersectionX, intersectionY];
    }
    return [false, 0, 0];
}

  

function roundNum(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

function RectCircleColliding(circle,rect){
    var distX = Math.abs(circle.x - rect.x-rect.width/2);
    var distY = Math.abs(circle.y - rect.y-rect.height/2);

    if (distX > (rect.width/2 + circle.r)) { return false; }
    if (distY > (rect.height/2 + circle.r)) { return false; }

    if (distX <= (rect.width/2)) { return true; } 
    if (distY <= (rect.height/2)) { return true; }

    var dx=distX-rect.width/2;
    var dy=distY-rect.height/2;
    return (dx*dx+dy*dy<=(circle.r*circle.r));
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Method to draw the obstacle
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    add(v){
        this.x += v.x;
        this.y += v.y;
    }
    sub(v){
        this.x -= v.x;
        this.y -= v.y;
    }
    mult(s){
        this.x *= s;
        this.y *= s;
        return this;
    }
    div(s){
        this.x /= s;
        this.y /= s;
    }
    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }
    normalize(){
        let m = this.mag();
        if(m != 0){
            this.div(m);
        }
        return this
    }
    limit(max){
        if(this.mag() > max){
            this.normalize();
            this.mult(max);
        }
    }
    distance(v){
        return Math.sqrt((this.x - v.x)**2 + (this.y - v.y)**2);
    }
    copy(){
        return new vector(this.x, this.y);
    }
    set(x, y){
        this.x = x;
        this.y = y;
    }
    angle(){
        return Math.atan2(this.y, this.x);
    }
    rotate(a){
        let newx = this.x * Math.cos(a) - this.y * Math.sin(a);
        let newy = this.x * Math.sin(a) + this.y * Math.cos(a);
        this.x = newx;
        this.y = newy;
        return this
    }
    dot(v){
        return this.x * v.x + this.y * v.y;
    }
    cross(v){
        return this.x * v.y - this.y * v.x;
    }
    project(v){
        let dp = this.dot(v);
        let mag = v.mag();
        v.normalize();
        v.mult(dp);
        return v;
    }
    reflect(v){
        let n = v.copy();
        n.normalize();
        let dot = this.dot(n);
        n.mult(dot * 2);
        let reflected = this.copy();
        reflected.sub(n);
        return reflected;
    }
    draw(x, y){
        let arrow = document.getElementById('arrow');
        arrow.style.display = 'block';
        arrow.style.height = this.mag() + 50 + 'px';
        arrow.style.width = this.mag() + 50 + 'px';
        arrow.style.left = x + 'px';
        arrow.style.top = (y - (this.mag() + 50)/2) + 'px';
        arrow.style.transform = 'rotate(' + (Math.atan2(this.y, this.x) * 180 / Math.PI) + 'deg)';
    }
}


class Palla{
    constructor(x, y, r, bounciness) {
        this.x = x
        this.y = y
        this.r = r
        this.prevx = x;
        this.prevy = y;
        this.bounciness = bounciness
        this.speed = new Vector( 0, 0);
    }
    show() {
       ctx.beginPath();
       ctx.ellipse(this.x, this.y, this.r, this.r, 0, 0, 2 * Math.PI)
       ctx.fillStyle = 'red'
       ctx.fill();
    }
    movex(x){
        this.prevx = this.x
        this.x += x
        
    }
    movey(y){
        this.prevy = this.y
        this.y += y
    }
    move(vector){
        this.prevx = this.x
        this.prevy = this.y
        this.x += vector.x
        this.y += vector.y
    }
    bounce(bounciness){
        if(this.x + this.r > canvas.width){
            this.speed.x *= -bounciness
            this.x = canvas.width - this.r
            playSound(boing);
        }
        if(this.x - this.r < 0){
            this.speed.x *= -bounciness
            this.x = this.r
            playSound(boing);
        }
        if(this.y + this.r > canvas.height){
            this.speed.y *= -bounciness
            this.y = canvas.height - this.r
            playSound(boing);
        }
        if(this.y - this.r < 0){
            this.speed.y *= -bounciness
            this.y = this.r
            playSound(boing);
        }
    }
    handleObstacleCollision(rect) {
        // Check for collision with the obstacle
        if (RectCircleColliding(this, rect)) {
            let NearestX = Math.max(rect.x, Math.min(this.x+1, rect.x + rect.width));
            let NearestY = Math.max(rect.y, Math.min(this.y+1, rect.y + rect.height));

            console.log("x",this.x, NearestX)
            console.log("y", this.y, NearestY)
            let dist = new Vector(this.x - NearestX, this.y - NearestY);
            console.log("dist",dist)
            let dnormal = new Vector(-dist.y, dist.x);
            //if (dist.dot({x: this.x, y:this.y}) < 0) { 
                let normal_angle = Math.atan2(dnormal.y, dnormal.x);
                let incoming_angle = Math.atan2(this.speed.y, this.speed.x);
                let theta = normal_angle - incoming_angle;
                this.speed = this.speed.rotate(2*theta).mult(this.bounciness);
            //}
            
            
            let penetrationDepth = this.r - dist.mag();
            console.log("dist", dist)
            console.log("norma", dist.mag())
            //console.log("penetrationDepth", penetrationDepth);
            //console.log("normalizzato", dist.normalize())
            let penetrationVector = dist.normalize().mult(penetrationDepth);
            console.log("dist2", dist);
            console.log( "penetration", penetrationVector)
            //console.log("x, y", this.x, this.y);
            this.x += penetrationVector.x
            this.y += penetrationVector.y
            //console.log("x, y", this.x, this.y);
            console.log("dist3", dist);

        }
    }
    
    gravity(){
        if(this.y < canvas.height - this.r){
            this.speed.y += 9.8*1/fps
        }
    }
    friction(){
        if(Math.abs(this.y - (canvas.height - this.r)) < 1){
            this.speed.x *= 0.99
        }
        this.speed.x *= 0.999
        this.speed.y *= 0.999
    }

    roundValues(){
        this.x = roundNum(this.x, 3)
        this.y = roundNum(this.y, 3)
        this.speed.x = roundNum(this.speed.x, 3)
        this.speed.y = roundNum(this.speed.y, 3)
    }
    handle(){
        this.gravity();
        this.friction();
        
        if(Math.abs(this.speed.x) > 0.2){
            this.movex(this.speed.x);
        }else{
            this.speed.x = 0;
        }
        if(Math.abs(this.speed.y) > 0.2){
            this.movey(this.speed.y);
        }else if(Math.abs(this.y - (canvas.height - this.r))<1){
            this.speed.y = 0;
        }
        this.bounce(this.bounciness);
        obstacles.forEach(obstacle => {
            this.handleObstacleCollision(obstacle); // Assuming you have a draw method for obstacles
        });
        this.show();
        
    }
}

let palla1 = new Palla(canvas.width/8, canvas.height-50, 30, 0.6)
let obstacles = []
obstacles[0] = new Obstacle(200, 200, 200, 100);
 obstacles[1] =  new Obstacle(600, 200, 100, 20);
obstacles[2] = new Obstacle(900, 300, 5, 100)
obstacles[3] = new Obstacle(1000, 250, 5, 150)


let vector = new Vector(0, 0);
palla1.speed = vector;
setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    obstacles.forEach(obstacle => {
        obstacle.draw(); // Assuming you have a draw method for obstacles
    });
    palla1.handle();
}, 1000/fps)

