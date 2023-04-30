import './index.html';
import './styles/style.scss';
import keys from './keys.json';
import Keyboard from './Keyboard';

function createPageTemplate() {
  return `
        <div class="container">
            <h1 class="virtual-keyboard__title">RSS Virtual Keyboard</h1>
            <textarea class="virtual-keyboard__input-field" rows="7" cols="50"></textarea>
            <div class="virtual-keyboard__keyboard"></div>
            <p class="virtual-keyboard__description">Keyboard was created in Windows OS </br> Switch language: <b>control left</b> + <b>alt left</b></p>
        </div>
    `;
}

function createHTML() {
  const body = document.querySelector('.page');
  const main = document.createElement('main');
  main.className = 'virtual-keyboard';
  body.append(main);
  main.innerHTML = createPageTemplate();
  const a = new Keyboard(keys[0]).init();
  return a;
}

createHTML();
