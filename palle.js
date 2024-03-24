canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
canvas.height = window.innerHeight*0.9;
canvas.width = window.innerWidth*0.8;
window.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);

let boing = new Audio("ball-bounce-94853.mp3");
boing.volume = 0.5;


function playSound(sound, volume = 0.5) {
    // Create a clone of the sound
    const soundClone = sound.cloneNode();
    
    // Set the volume of the cloned sound
    soundClone.volume = volume;
    
    // Play the cloned sound
    soundClone.play();
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



function lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    let vector = new Vector(Infinity, Infinity);

    function updateVector(intersectionX, intersectionY) {
        const newVector = new Vector(intersectionX-x1,intersectionY-y1);
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
        console.log(vector);

        vector.drawline(palla1.x, palla1.y, "green");
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
        /*
        ctx.color = "black";
        ctx.beginPath();
        ctx.arc(intersectionX, intersectionY, 10, 0, 2 * Math.PI);
        ctx.stroke();
        */
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
        this.hit = false;
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
    equals(v){
        return this.x == v.x && this.y == v.y
    }
    add(v){
        this.x += v.x;
        this.y += v.y;
        return this
    }
    sub(v){
        this.x -= v.x;
        this.y -= v.y;
        return this
    }
    mult(s){
        this.x *= s;
        this.y *= s;
        return this;
    }
    div(s){
        this.x /= s;
        this.y /= s;
        return this
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
        return new Vector(this.x, this.y);
    }
    set(x, y){
        this.x = x;
        this.y = y;
        return this
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
    normal1(){
        return new Vector(-this.y, this.x)
    }
    normal2(){
        return new Vector(this.y, -this.x)        
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
    drawline(x, y, color = "black"){
        //console.log("ho disegnato");
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+this.x, y+this.y);
        ctx.stroke();
        //console.log("end", x+this.x,y+this.y)
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
        //console.log("x after move", this.x)
        
    }
    movey(y){
        this.prevy = this.y
        this.y += y
        //console.log("y after move", this.y)
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
        if (rect.hit, RectCircleColliding(this, rect)) {
            let NearestX = Math.max(rect.x, Math.min(this.x, rect.x + rect.width));
            let NearestY = Math.max(rect.y, Math.min(this.y, rect.y + rect.height));

            if(rect.hit){
                rect.hit = false;
            }

            if(this.speed.mag() > 1) {
                playSound(boing     );
            }   

        
            let dist = new Vector(this.x - NearestX, this.y - NearestY);
            let dnormal = new Vector(-dist.y, dist.x);
            //if (dist.dot({x: this.x, y:this.y}) < 0) { 
                let normal_angle = Math.atan2(dnormal.y, dnormal.x);
                let incoming_angle = Math.atan2(this.speed.y, this.speed.x);
                let theta = normal_angle - incoming_angle;
                this.speed = this.speed.rotate(2*theta).mult(this.bounciness);
            //}
            
            
            let penetrationDepth = this.r - dist.mag();
            let penetrationVector = dist.normalize().mult(penetrationDepth);

            let unstick = 0.3;
            let unstickx = unstick;
            let unsticky = unstick;
            if(penetrationVector.x == 0){ 
                unstickx = 0
            }else if(penetrationVector.x < 0){
                unstickx = -unstick
            }
            if(penetrationVector.y == 0){ 
                unsticky = 0
            }else if(penetrationVector.y < 0){
                unsticky = -unstick
            }
            this.x += penetrationVector.x+unstickx;
            this.y += penetrationVector.y+unsticky;
        
        }
    }

    handleCollisions(){
        obstacles.forEach(obstacle => {
            this.handleObstacleCollision(obstacle); // Assuming you have a draw method for obstacles
        });    
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
        this.show();
        this.gravity();
        this.friction();
        
        let expectedMove = new Vector(this.speed.x, this.speed.y);
        let normalPosition1 = expectedMove.normal1().normalize().mult(this.r)
        //normalPosition1.drawline(this.x, this.y);
        let normalPosition2 = expectedMove.normal2().normalize().mult(this.r)
        //normalPosition2.drawline(this.x, this.y);
        let start = new Vector(this.x+expectedMove.copy().normalize().mult(this.r).x, this.y+expectedMove.copy().normalize().mult(this.r).y)
        let start1 = new Vector(this.x+normalPosition1.x, this.y + normalPosition1.y);
        let start2 = new Vector(this.x+normalPosition2.x, this.y + normalPosition2.y);
        //this.speed.drawline(start.x, start.y)
        //this.speed.drawline(start1.x, start1.y)
        //this.speed.drawline(start2.x, start2.y)
        let move = expectedMove.copy();
        obstacles.forEach(obstacle => {
            // Calculate potential movement vectors
            let newMove = calculateMovement(start.x, start.y, expectedMove.x, expectedMove.y, obstacle);
            let newMove1 = calculateMovement(start1.x, start1.y, expectedMove.x, expectedMove.y, obstacle);
            let newMove2 = calculateMovement(start2.x, start2.y, expectedMove.x, expectedMove.y, obstacle);
        
            // Check for collision and update expected movement vector
            updateExpectedMove(newMove, expectedMove, obstacle);
            updateExpectedMove(newMove1, expectedMove, obstacle);
            updateExpectedMove(newMove2, expectedMove, obstacle);
        });
        
        // Function to calculate movement vector
        function calculateMovement(x, y, moveX, moveY, obstacle) {
            return lineRect(x, y, x + moveX, y + moveY, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
        
        // Function to update expected movement vector based on collision
        function updateExpectedMove(newMove, expectedMove, obstacle) {
            if (newMove && newMove.mag() < expectedMove.mag()) {
                expectedMove.x = newMove.x;
                expectedMove.y = newMove.y;
                obstacle.hit = true;
            }
        }        
        if(!expectedMove.equals(move)){
            console.log("expected", move, "actual", expectedMove)
        }
         

        if(Math.abs(this.speed.x) > 0.01){
            this.movex(expectedMove.x);
        }else{
            this.speed.x = 0;
        }
        if(Math.abs(this.speed.y) > 0.3){
            this.movey(expectedMove.y);
        }else if(Math.abs(this.y - (canvas.height - this.r))<1){
            this.speed.y = 0;
        }
        this.bounce(this.bounciness);
        this.handleCollisions();
        
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

