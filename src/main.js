import loop from './logic';
import { loadControlBar, loadThemeSwitch } from './ui';
import './main.css';

document.getElementById('score-box').style.display = 'inline-block';
loop();
loadThemeSwitch();
loadControlBar();
