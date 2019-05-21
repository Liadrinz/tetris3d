import loop, { board, currentBox } from './logic';
import { loadControlBar, loadThemeSwitch, showInfo, showTitle } from './ui';
import './main.css';
import { scene } from './Root';
import { Color } from 'three';
import { themes } from './config';

var conf = require('./config');

export let vueApp = new Vue({
    el: '#vue-app',
    data: function () {
        return {
            started: false,
            score: board.score,
            pauseControl: {
                pasued: false
            }
        }
    },

    mounted() {
        document.getElementById('theme-button').className = conf.theme.button;
        document.getElementsByClassName('control-bar')[0].style.left = window.innerWidth - 100 + 'px';
        window.addEventListener('resize', function () {
            document.getElementsByClassName('control-bar')[0].style.left = window.innerWidth - 100 + 'px';
        });
    },

    methods: {
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
