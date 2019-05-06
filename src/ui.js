import './ui.css';
import { currentBox, board } from './logic';

export function showScore(score) {
    let scoreBox = document.getElementById('score-box');
    if (scoreBox)
        document.body.removeChild(scoreBox);
    let newBox = document.createElement('div');
    newBox.id = 'score-box';
    newBox.innerHTML = `Score: <div id="score">${score}</div>`;
    document.body.appendChild(newBox);
}

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
    let pauseButton = document.createElement('div');
    pauseButton.id = 'pause-button';
    pauseButton.innerHTML = "| |";
    pauseButton.onclick = () => {
        if (pauseButton.innerHTML === "| |") {
            pauseButton.innerHTML = "▶";
            currentBox[0].state.paused = true;

        } else if (pauseButton.innerHTML === "▶") {
            pauseButton.innerHTML = "| |";
            currentBox[0].state.paused = false;
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
