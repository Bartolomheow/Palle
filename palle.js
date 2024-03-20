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
        console.log(vector);
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

 

function roundNum(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
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
    constructor(x, y, r) {
        this.x = x
        this.y = y
        this.r = r
        this.speed = {x: 0, y: 0};
    }
    show() {
       ctx.beginPath();
       ctx.ellipse(this.x, this.y, this.r, this.r, 0, 0, 2 * Math.PI)
       ctx.fillStyle = 'red'
       ctx.fill();
    }
    movex(x){
        this.x += x
    }
    movey(y){
        this.y += y
    }
    move(vector){
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
        this.bounce(0.8);
        this.show();
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
    }
}

let palla1 = new Palla(canvas.width/8, canvas.height-50, 30)


let vector = {x: 0, y: 0}
palla1.speed = vector;
setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    palla1.handle();
}, 1000/fps)

