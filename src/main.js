import loop, { board, currentBox, title } from './logic';
import './main.css';
import { scene } from './Root';
import { Color } from 'three';
import { themes } from './config';

var conf = require('./config');

// the vue app
export let vueApp = new Vue({
    el: '#vue-app',
    data: function () {
        return {
            started: false,
            game: false,
            workshop: false,
            settings: false,
            score: board.score,
            pauseControl: {
                pasued: false
            }
        }
    },

    mounted() {
        let menu = document.getElementById('menu');
        menu.style.left = parseInt((window.innerWidth - menu.clientWidth) / 2) + 'px';
        menu.style.top = parseInt((window.innerHeight - menu.clientHeight) / 5 * 4) + 'px';
        document.getElementById('theme-button').className = conf.theme.button;
        document.getElementsByClassName('control-bar')[0].style.left = window.innerWidth - 100 + 'px';
        window.addEventListener('resize', function () {
            menu.style.left = parseInt((window.innerWidth - menu.clientWidth) / 2) + 'px';
            menu.style.top = parseInt((window.innerHeight - menu.clientHeight) / 5 * 4) + 'px';
            document.getElementsByClassName('control-bar')[0].style.left = window.innerWidth - 100 + 'px';
        });
    },

    methods: {
        startGame() {
            this.started = true;
            this.game = true;
            scene.remove(title);
        },

        startWorkshop() {

        },

        startSettings() {

        },

        addScore(score) {
            this.score += score;
        },

        setScore(score) {
            this.score = score;
        },

        pauseOrPlay() {
            if (board.dieCheck()) return;
            if (this.pauseControl.pasued) {
                this.pauseControl.pasued = false;
                document.getElementById('pause-button').className = 'el-icon-video-pause';
            } else {
                this.pauseControl.pasued = true;
                document.getElementById('pause-button').className = 'el-icon-video-play';
            }
            currentBox[0].state.paused = !currentBox[0].state.paused;
        },

        switchTheme() {
            if (conf.THEME === 'LIGHT') {
                scene.background = new Color(themes.DARK.background);
                conf.switchTheme();
                document.getElementById('theme-button').className = themes.DARK.button;
            }
            else if (conf.THEME === 'DARK') {
                scene.background = new Color(themes.LIGHT.background);
                conf.switchTheme();
                document.getElementById('theme-button').className = themes.LIGHT.button;
            }
        }
    }
});

loop();
