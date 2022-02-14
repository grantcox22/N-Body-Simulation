var canvas = document.querySelector(".canvas");
var ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.fillStyle = "white";

var G = 1;
var S = 0.98;
var DT = 0.01;
var N = 40;
var SCALE = 3;
var C = false;


let colors = [
    '#1b8036',
    '#005fa3',
    '#6200a3',
    '#bf6b34',
    '#bf3d34',
    '#ffffff',
    '#49f23a',
    '#ecf23a',
    '#3af2f2',
    '#3a43f2',
    '#ef3af2',
    '#999999',
    '#ff0000',
    '#ff9100',
    '#95ff00',
    '#00ffa2'
];

let bodies = [];

window.addEventListener('resize',
    (event) => {
        canvas.width = window.innerWidth,
        canvas.height = window.innerHeight;
        init();
    }
);
class Body {
    constructor (xInitial, yInitial, velXInitial, velYInitial, initialMass, color) {
        this.pos = {
            x: xInitial,
            y: yInitial
        }
        this.vel = {
            x: velXInitial,
            y: velYInitial
        }
        this.mass = initialMass;
        this.radius = Math.log(this.mass * SCALE) / 2;
        this.acc = {
            x: 0,
            y: 0
        }
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x - this.radius, this.pos.y - this.radius, this.radius * 2, Math.PI*2, false);
        ctx.fill();
    }

    update() {
        this.radius = Math.pow(this.mass, 1/3) * Math.log(SCALE);


        this.vel.x += this.acc.x * (DT / 2);
        this.vel.y += this.acc.y * (DT / 2);

        this.pos.x += this.vel.x * DT;
        this.pos.y += this.vel.y * DT;

        this.vel.x += this.acc.x * (DT / 2);
        this.vel.y += this.acc.y * (DT / 2);

        this.draw();
    }
}

function init() {
    time = 0;
    bodies = [];
    for (let i = 0; i < N; i++) {
        let mass = Math.random() * 99 + 1;
        let x = (Math.random() * innerWidth * 0.8) + innerWidth * 0.1;
        let y = (Math.random() * innerHeight * 0.8) + innerHeight * 0.1;
        let c = Math.floor(Math.random() * (colors.length));
        let velX = (Math.random() * 30) - 15;
        let velY = (Math.random() * 30) - 15;
        bodies.push(new Body(x, y, velX, velY, mass, colors[c]));
    }
}

function animate() {
    requestAnimationFrame(animate);

    time++;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    bodies.forEach((body1, i) => {
        body1.acc.x = 0;
        body1.acc.y = 0;
        bodies.forEach((body2, j) => {



            if (i != j) {
                let dx = body2.pos.x - body1.pos.x;
                let dy = body2.pos.y - body1.pos.y;
                if (C) {
                    if (Math.sqrt((dx * dx) + (dy * dy)) <= body1.radius + body2.radius) {
                        let m = body1.mass + body2.mass;
                        let velFinal = {
                            x: ((body1.mass * body1.vel.x) + (body2.mass * body2.vel.x)) / m,
                            y: ((body1.mass * body1.vel.y) + (body2.mass * body2.vel.y)) / m
                        }
                        if (body1.mass > body2.mass) {
                            body1.mass = m;
                            body1.vel = velFinal;
                            bodies.splice(j, 1);
                        } else {
                            body2.mass = m;
                            body2.vel = velFinal;
                            bodies.splice(i, 1);
                        }
                    }
                }
                let dist = Math.sqrt((dx * dx) + (dy * dy) + (S*S));
                body1.acc.x += G * body2.mass * dx / Math.pow(dist, 2);
                body1.acc.y += G * body2.mass * dy / Math.pow(dist, 2);
            }
        });
        body1.update();
    });
}

let num = document.querySelector('.num');
num.oninput = function() {
    N = this.value;
    document.querySelector('.number').innerHTML = `Number: ${this.value}`;
    init();
}

let grav = document.querySelector('.grav');
grav.oninput = function() {
    let v = this.value / 10;
    G = v;
    document.querySelector('.gravity').innerHTML = `Gravity: ${v}`;
}

let spd = document.querySelector('.spd');
spd.oninput = function() {
    let v = this.value / 100;
    DT = v;
    document.querySelector('.speed').innerHTML = `Speed: ${v}`;
}

let scl = document.querySelector('.scl');
scl.oninput = function() {
    SCALE = this.value;
    document.querySelector('.scale').innerHTML = `Scale: ${this.value}`;
}

let col = document.querySelector('.col');
col.onchange = function() {
    C = col.checked;
}

init();
animate();