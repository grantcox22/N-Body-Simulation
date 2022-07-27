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
        this.radius = Math.sqrt(mass) / 3;
        this.color = color;
    }

    draw(ctx, offset) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x - this.radius, this.pos.y - this.radius, this.radius * 2, Math.PI * 2, false);
        ctx.fill();
    }

    update(DT) {

        this.radius = Math.sqrt(this.mass) / 3;

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
    let mouse = false;
    let ctrl = false;
    let mousePos = {
        x : 0,
        y : 0
    }
    let startPos = null;

    // Smoothing Value
    const S = 0.98;

    function drawLine(x1, x2, y1, y2) {
        ctx.current.lineWidth = 2;
        ctx.current.beginPath();
        ctx.current.lineCap = "round";
        ctx.current.moveTo(x1, y1);
        ctx.current.lineTo(x2, y2);
        ctx.current.strokeStyle = "#ff9900";
        ctx.current.stroke();
    }

    function keydown(e) {
        if (e.keyCode == 17) ctrl = true;
    }

    function keyup(e) {
        if (e.keyCode == 17) ctrl = false;
    }

    function mousedown(e) {
        startPos = {x : e.pageX, y : e.pageY}
        mouse = true;
    } 

    function mouseup(e) {
        let vx = startPos.x - e.pageX;
        let vy = startPos.y - e.pageY;
        if (!ctrl) bodies.push(new Body(e.pageX, e.pageY, vx * 0.3, vy * 0.3, parseInt(form.current.m.value), colors[Math.floor(Math.random() * 5)]));
        mouse = false;
        startPos = null;
    }

    function mousemove(e) {
        let mousePosLast = mousePos;
        mousePos = {x : e.pageX, y : e.pageY}
        if (mouse && ctrl) {
            let mouseDifX = mousePos.x - mousePosLast.x;
            let mouseDifY = mousePos.y - mousePosLast.y;
            bodies.forEach((body) => {
                body.pos.x += mouseDifX;
                body.pos.y += mouseDifY;
            })
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.style.width = window.innerWidth;
        canvas.style.height = window.innerHeight;

        const context = canvas.getContext('2d');
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;

        ctx.current = context;

        let can = document.querySelector(".canvas");

        can.onmousedown = mousedown;
        can.onmouseup = mouseup;
        can.onmousemove = mousemove;
        window.onkeydown = keydown;
        window.onkeyup = keyup;

        animate();

    });

    function reset() {
        bodies = [];
        ctx.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function update() {
        let G = form.current.g.value / 10;

        // Calculate Collsion
        if (form.current.c.checked) {
            for (let i = 0; i < bodies.length; i++) {
                let b1 = bodies[i];
                for (let j = i+1; j < bodies.length; j++) {
                    let b2 = bodies[j];

                    let dx = b2.pos.x - b1.pos.x;
                    let dy = b2.pos.y - b1.pos.y;
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
            }
        }

        for (let i = 0; i < bodies.length; i++) {
            let b1 = bodies[i];
            b1.acc = {x : 0, y : 0};
            for (let j = 0; j < bodies.length; j++) {
                let b2 = bodies[j];

                // Caluclate Distance
                let dx = b2.pos.x - b1.pos.x;
                let dy = b2.pos.y - b1.pos.y;

                // Calculate Acceleration
                let dist = Math.sqrt((dx * dx) + (dy * dy) + (S*S));
                b1.acc.x += G * b2.mass * dx / Math.pow(dist, 2);
                b1.acc.y += G * b2.mass * dy / Math.pow(dist, 2);
            }

            b1.update(form.current.s.value / 1000);
        }
    }

    window.onresize = () => {
        ctx.current.canvas.width = window.innerWidth;
        ctx.current.canvas.height = window.innerHeight;
    }

    function animate() {
        requestAnimationFrame(animate);
        update();
        if (mouse && !ctrl) drawLine(startPos.x, mousePos.x, startPos.y, mousePos.y);
        ctx.current.fillStyle = "rgba(0,0,0,0.25)";
        ctx.current.fillRect(0, 0, window.innerWidth, window.innerHeight);
        for (let i = 0; i < bodies.length; i++)
            bodies[i].draw(ctx.current);
    }

    return (
        <>
        <canvas ref={canvasRef} className="canvas"></canvas>
        <form className="settings" ref={form}>
            <label>Initial Mass</label>
            <input name='m' type="range" min="10" max="500" defaultValue={100}/>
            <label>Gravity</label>
            <input name='g' type="range" min="1" max="20" defaultValue={10}/>
            <label>Speed</label>
            <input name='s' type="range" min="0" max="250" defaultValue={50}/>
            <label>Collision</label>
            <input name="c" type="checkbox" defaultValue={true} />
            <a onClick={() => reset()} href={"#"}>Reset</a>
            <a href={"./"}>Article</a>
        </form>
        <p className='info'>Click to Add | Ctrl + Click to Move</p>
        <a href="./"><Logo className="logo" /></a>
        </>
    );
}