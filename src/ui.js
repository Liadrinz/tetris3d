import './ui.css';
import { board, history } from './logic';
import { theme } from './config';
import Block from './Block';
import { scene } from './Root';
import { freeDrop } from './Physical';
import * as THREE from 'three';
import { vueApp } from './main';

export function showInfo(text, color) {
    let infoBox = document.createElement('p');
    document.body.appendChild(infoBox);
    infoBox.style.position = 'absolute';
    infoBox.style.fontSize = '30px';
    infoBox.style.opacity = '1.0';
    infoBox.innerHTML = text;
    let centerH = window.innerWidth / 2 - infoBox.clientWidth / 2;
    let centerV = window.innerHeight / 2 - infoBox.clientHeight / 2;
    infoBox.style.left = centerH + 'px';
    infoBox.style.top = centerV + 'px';
    infoBox.style.color = color;
    let s = setInterval(() => {
        let topValue = parseFloat(infoBox.style.top.substr(0, infoBox.style.top.length - 2)) - 10;
        infoBox.style.top = topValue + 'px';
        let opacityValue = parseFloat(infoBox.style.opacity) - 0.1;
        infoBox.style.opacity = '' + opacityValue;
        if (opacityValue <= 0) {
            clearInterval(s);
            document.body.removeChild(infoBox);
        }
    }, 50);
}

export function showMessage(text, color, callback) {
    if (document.getElementById('message')) return;
    let infoBox = document.createElement('p');
    infoBox.id = 'message';
    document.body.appendChild(infoBox);
    infoBox.style.position = 'absolute';
    infoBox.style.fontSize = '40px';
    infoBox.innerHTML = text;
    let centerH = window.innerWidth / 2 - infoBox.clientWidth / 2;
    let centerV = window.innerHeight / 2 - infoBox.clientHeight / 2;
    infoBox.style.left = centerH + 'px';
    infoBox.style.top = centerV + 'px';
    infoBox.style.color = color;
    window.addEventListener('resize', () => {
        let centerH = window.innerWidth / 2 - infoBox.clientWidth / 2;
        let centerV = window.innerHeight / 2 - infoBox.clientHeight / 2;
        infoBox.style.left = centerH + 'px';
        infoBox.style.top = centerV + 'px';
        infoBox.style.color = color;
    })
    callback();
}

export function hideMessage(callback) {
    if (!document.getElementById('message')) return;
    let infoBox = document.getElementById('message');
    document.body.removeChild(infoBox);
    callback();
}

function pauseButton() {
    if (board.dieCheck()) return;
    let pauseButton = document.createElement('el-button');
    pauseButton.id = 'pause-button';
    pauseButton.icon = 'el-icon-video-play';
    pauseButton.onclick = () => {
        if (pauseButton.icon === 'el-icon-video-play') {
            pauseButton.icon = 'el-icon-video-pause';
        } else if (pauseButton.icon === 'el-icon-video-pause') {
            pauseButton.icon = 'el-icon-video-play';
        }
    }
    return pauseButton;
}

export function loadControlBar() {
    let bar = document.createElement('div');
    bar.className = 'control-bar';
    bar.appendChild(pauseButton());
    document.body.appendChild(bar);
}

export function showTitle() {
    let T1 = new Block(
        [[0, 3, 0], [1, 3, 0], [2, 3, 0], [1, 2, 0], [1, 1, 0], [1, 0, 0]],
        [0, 0, 0],
        theme.blockColors[0]
    );
    let E = new Block(
        [[0, 3, 0], [1, 3, 0], [2, 3, 0], [0, 2, 0], [0, 1, 0], [0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1.5, 0]],
        [0, 0, 0],
        theme.blockColors[2]
    );
    let T2 = new Block(
        [[0, 3, 0], [1, 3, 0], [2, 3, 0], [1, 2, 0], [1, 1, 0], [1, 0, 0]],
        [0, 0, 0],
        theme.blockColors[3]
    );
    let R = new Block(
        [[0, 3, 0], [1, 3, 0], [0, 2, 0], [0, 1, 0], [0, 0, 0], [1, 1, 0], [2, 2.5, 0], [2, 1.5, 0], [2, 0, 0]],
        [0, 0, 0],
        theme.blockColors[1]
    );
    let I = new Block(
        [[1, 3, 0], [1, 2, 0], [1, 1, 0], [1, 0, 0]],
        [0, 0, 0],
        theme.blockColors[2]
    );
    let S = new Block(
        [[0, 3, 0], [1, 3, 0], [2, 3, 0], [0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 2, 0], [1, 1.5, 0], [2, 1, 0]],
        [0, 0, 0],
        theme.blockColors[0]
    );

    let title = new THREE.Group();
    let TETRIS = [T1, E, T2, R, I, S];
    let total = [0, 0, 0, 0, 0, 0];
    let direction = [1, -1, 1, -1, 1, -1];
    for (let i = 0; i < TETRIS.length; i++) {
        setInterval(() => {
            TETRIS[i].object3d.translateY(direction[i] * 0.01);
            total[i] += 0.01;
            if (total[i] >= 0.3) {
                total[i] = 0;
                direction[i] = -direction[i];
            }
        }, Math.random() * 30 + 15);
        TETRIS[i].object3d.translateX(4 * i);
        TETRIS[i].object3d.translateY(-10);
        title.add(TETRIS[i].object3d);
    }
    title.translateZ(-2);
    title.rotateY(Math.PI / 4);
    title.translateX(-12);
    scene.add(title);

    showMessage('[Press Space to start]', 0xfff, () => { });

    let prev = document.onkeydown;

    document.onkeydown = (e) => {
        if (e.keyCode === 32) {
            document.onkeydown = prev;
            hideMessage(() => {});
            vueApp.started = true;
            scene.remove(title);
        }
    }
}