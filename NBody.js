import React, { useEffect, useRef, useState } from 'react';
import { BsWindowSidebar } from 'react-icons/bs';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import './style.css';

class Body {
    constructor (initX, initY, velX, velY, mass, color) {
        this.pos = {
            x: initX,
            y: initY
        }
        this.vel = {
            x: velX,
            y: velY
        }
        this.acc = {
            x: 0,
            y: 0
        }
        this.mass = mass;
        this.radius = Math.sqrt(mass) / 4;
        this.color = color;
    }

    draw(ctx, offset) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x - this.radius, this.pos.y - this.radius, this.radius * 2, Math.PI * 2, false);
        ctx.fill();
    }

    update(DT) {

        this.radius = Math.sqrt(this.mass) / 4;

        this.vel.x += this.acc.x * (DT / 2);
        this.vel.y += this.acc.y * (DT / 2);

        this.pos.x += this.vel.x * DT;
        this.pos.y += this.vel.y * DT;

        this.vel.x += this.acc.x * (DT / 2);
        this.vel.y += this.acc.y * (DT / 2);

    }
}

export default function NBody() {
    const canvasRef = useRef(null);
    const form = useRef(null);
    const ctx = useRef(null);

    let colors = [
        "#0057ff",
        "#00f0ff",
        "#34c600",
        "#faff00",
        "#ff0000",
        "#ff00f5"
    ];
    let bodies = [];

    // Smoothing Value
    const S = 0.98;

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.style.width = window.innerWidth;
        canvas.style.height = window.innerHeight;

        const context = canvas.getContext('2d');
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;

        ctx.current = context;

        init();
        animate();

    });

    function init() {
        bodies = [];
        for (let i = 0; i < form.current.n.value; i++) {
            let mass = Math.random() * 99 + 1;
            let x = (Math.random() * window.innerWidth);
            let y = (Math.random() * window.innerHeight);
            let velX = 0;
            let velY = 0;
            let color = colors[Math.floor(Math.random() * 5)];
            bodies.push(new Body(x, y, velX, velY, mass, color));
        }

    }

    function update() {
        let G = form.current.g.value / 10;
        let bodiesInFrame = 0;
        for (let i = 0; i < bodies.length; i++) {
            let b1 = bodies[i];
            b1.acc = {x : 0, y : 0};
            for (let j = i+1; j < bodies.length; j++) {
                let b2 = bodies[j];

                // Caluclate Distance
                let dx = b2.pos.x - b1.pos.x;
                let dy = b2.pos.y - b1.pos.y;

                // Calculate Collsion
                if (form.current.c.checked) {
                    if (Math.sqrt((dx * dx) + (dy * dy)) <= b1.radius + b2.radius) {
                        let m = b1.mass + b2.mass;
                        let vel = {
                            x: ((b1.mass * b1.vel.x) + (b2.mass * b2.vel.x)) / m,
                            y: ((b1.mass * b1.vel.y) + (b2.mass * b2.vel.y)) / m
                        }
                        if (b1.mass > b2.mass) {
                            b1.mass = m;
                            b1.vel = vel;
                            bodies.splice(j, 1);
                        } else {
                            b2.mass = m;
                            b2.vel = vel;
                            bodies.splice(i, 1);
                        }
                    }
                }

                // Calculate Acceleration
                let dist = Math.sqrt((dx * dx) + (dy * dy) + (S*S));
                b1.acc.x += G * b2.mass * dx / Math.pow(dist, 2);
                b1.acc.y += G * b2.mass * dy / Math.pow(dist, 2);
            }

            if (form.current.m.checked) {
                let dx = window.innerWidth / 2 - b1.pos.x;
                let dy = window.innerHeight / 2 - b1.pos.y;
                let dist = Math.sqrt((dx * dx) + (dy * dy) + (S * S));
                b1.acc.x += 5000 * dx / Math.pow(dist, 2);
                b1.acc.y += 5000 * dy / Math.pow(dist, 2);
            }

            if (b1.pos.x > 0 && b1.pos.x < window.innerWidth && b1.pos.y > 0 && b1.pos.y < window.innerHeight) bodiesInFrame++;

            b1.update(form.current.s.value / 500);
            b1.draw(ctx.current);
        }
        if (bodiesInFrame == 0) init();
    }

    window.onresize = () => {
        ctx.current.canvas.width = window.innerWidth;
        ctx.current.canvas.height = window.innerHeight;
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
        update();
    }

    return (
        <>
        <a href="../"><Logo className="logo" /></a>
        <canvas ref={canvasRef} className="canvas"></canvas>
        <div className="settings">
            <form className="form" ref={form}>
                <label>Number</label>
                <input name='n' type="range" min="10" max="200" defaultValue={40} onChange={() => {init()}}/>
                <label>Gravity</label>
                <input name='g' type="range" min="1" max="20" defaultValue={10}/>
                <label>Speed</label>
                <input name='s' type="range" min="1" max="50" defaultValue={10}/>
                <label>Center Mass</label>
                <input name='m' type="checkbox" defaultValue={true}/>
                <label>Collision</label>
                <input name='c' type="checkbox" defaultValue={true}/>
                <a onClick={() => init()} href={"#"}>Reset</a>
            </form>
        </div>
        </>
    );
}