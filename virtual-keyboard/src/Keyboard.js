export default class Keyboard {
  constructor(arr) {
    this.arr = arr;
    this.hotkeys = ['CapsLock', 'ShiftLeft', 'ShiftRight', 'Enter', 'Backspace', 'Delete', 'Tab', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'MetaLeft'];
    this.textfield = null;
    this.status = {
      isCaps: false,
      isShiftL: false,
      isShiftR: false,
      lang: 'eng',
      case: 'down',
    };
    this.prevElem = {
      elem: null,
      evt: null,
      code: null,
      charcode: null,
    };
    this.currElem = {
      elem: null,
      evt: null,
      code: null,
      charcode: null,
    };
  }

  createKeyboardRows() {
    const keyboardParent = document.querySelector('.virtual-keyboard__keyboard');
    const rows = Object.entries(this.arr);
    return rows.forEach((elem) => {
      const rowCont = document.createElement('div');
      rowCont.className = `virtual-keyboard__row ${elem[0]}`;
      keyboardParent.append(rowCont);
      rowCont.innerHTML += elem[1].map((el) => `
        <button class="virtual-keyboard__key" data-elem-code="${el.className}">
            <span class="virtual-keyboard__text eng down">${el.eng.caseDown}</span>
            <span class="virtual-keyboard__text virtual-keyboard__text--hidden eng up">${el.eng.caseUp}</span>
            <span class="virtual-keyboard__text virtual-keyboard__text--hidden rus down">${el.rus.caseDown}</span>
            <span class="virtual-keyboard__text virtual-keyboard__text--hidden rus up">${el.rus.caseUp}</span>
        </button>
        `).join('');
    });
  }

  addActiveClass() {
    if (this.currElem.elem) this.currElem.elem.classList.add('virtual-keyboard__key--active');
  }

  removeActiveClass() {
    if (this.currElem.elem) {
      if (this.prevElem.elem) {
        if (!this.prevElem.elem.classList.contains('virtual-keyboard__key--active') && !(['CapsLock', 'ShiftLeft', 'ShiftRight'].includes(this.prevElem.code))) {
          this.prevElem.elem.classList.remove('virtual-keyboard__key--active');
        }
      }
      this.currElem.elem.classList.remove('virtual-keyboard__key--active');
    }
  }

  changeLanguage() {
    const showCurrentLang = function myFunc() {
      const keys = Array.from(document.querySelectorAll(`.${this.status.lang}`));
      keys.forEach((elem) => {
        if (elem.classList.contains(`${this.status.case}`)) {
          elem.classList.toggle('virtual-keyboard__text--hidden');
        }
      });
    }.bind(this);
    showCurrentLang();
    if (this.status.lang === 'rus') this.status.lang = 'eng';
    else this.status.lang = 'rus';
    window.localStorage.setItem('lang', this.status.lang);
    showCurrentLang();
  }

  changeCase() {
    const keys = Array.from(document.querySelectorAll(`button > .${this.status.lang}`));
    keys.forEach((elem) => {
      if (!elem.classList.contains('virtual-keyboard__text--hidden')) {
        elem.classList.add('virtual-keyboard__text--hidden');
      }
      if ((this.isShiftL === true || this.isShiftR === true) && this.isCaps === true) {
        this.status.case = 'down';
      } else if (this.isCaps === true) {
        this.status.case = 'up';
      } else if (this.isShiftL === true || this.isShiftR === true) {
        this.status.case = 'up';
      } else {
        this.status.case = 'down';
      }
      if (elem.classList.contains(`${this.status.case}`)) {
        elem.classList.remove('virtual-keyboard__text--hidden');
      }
    });
  }

  keydownHandler(evt) {
    evt.preventDefault();
    this.currElem.evt = evt;
    this.currElem.code = evt.code;
    this.currElem.elem = document.querySelector(`[data-elem-code="${evt.code}"`);
    if (this.currElem.elem) {
      this.currElem.charcode = this.currElem.elem.querySelector(':not(.virtual-keyboard__text--hidden)')
        .textContent;
    }
    this.createShortcuts();
    if (this.currElem.code === 'MetaLeft') {
      this.addActiveClass();
      setTimeout(this.removeActiveClass.bind(this), 300);
    } else if (this.currElem.code !== 'CapsLock' && this.currElem.code !== 'ShiftLeft' && this.currElem.code !== 'ShiftRight') {
      this.addActiveClass();
    }
  }

  keyupHandler(evt) {
    const upElem = document.querySelector(`[data-elem-code="${evt.code}"`);
    if (upElem) {
      this.currElem.elem = upElem;
      if (evt.code !== 'CapsLock') this.removeActiveClass();
      if (evt.code === 'ShiftLeft') {
        this.isShiftL = false;
        this.removeActiveClass();
        this.changeCase();
      } else if (evt.code === 'ShiftRight') {
        this.isShiftR = false;
        this.removeActiveClass();
        this.changeCase();
      }
    }
  }

  mouseDownHandler(evt) {
    if (evt.target.tagName === 'SPAN') {
      this.currElem.evt = evt;
      const parent = evt.target.closest('button');
      this.currElem.elem = parent;
      const code = this.currElem.elem.dataset.elemCode;
      this.currElem.code = code;
      this.currElem.charcode = evt.target.textContent;
      this.createShortcuts();
      if (this.currElem.code !== 'CapsLock') {
        this.addActiveClass();
      }
      this.prevElem = { ...this.currElem };
      evt.preventDefault();
    }
  }

  mouseUpHandler(evt) {
    this.currElem.evt = evt;
    if (evt.target.tagName === 'SPAN') {
      const parent = evt.target.closest('button');
      this.currElem.elem = parent;
      if (this.currElem.elem && this.currElem.elem.classList.contains('virtual-keyboard__key')) {
        const code = this.currElem.elem.dataset.elemCode;
        this.currElem.code = code;
      } else {
        this.currElem = { ...this.prevElem };
      }
      if (this.currElem.code !== 'CapsLock') {
        this.removeActiveClass();
        if (this.isShiftR === true && this.currElem.code === 'ShiftRight') {
          this.isShiftR = false;
          this.changeCase();
        }
        if (this.isShiftL === true && this.currElem.code === 'ShiftLeft') {
          this.isShiftL = false;
          this.changeCase();
        }
      }
    }
  }

  createShortcuts() {
    this.textfield = document.querySelector('.virtual-keyboard__input-field');
    let val = this.textfield.value;
    const start = this.textfield.selectionStart;
    const addTextarea = function func() {
      if (start >= 0 && start <= val.length) {
        this.textfield.value = val.slice(0, start)
      + this.currElem.charcode + val.slice(start, this.textfield.length);
        this.textfield.selectionStart += this.currElem.charcode.length;
        this.textfield.selectionEnd = start + this.currElem.charcode.length;
      } else { this.textfield.value += this.currElem.charcode; }
    }.bind(this);
    if (this.hotkeys.includes(this.currElem.code)) {
      switch (this.currElem.code) {
        case 'CapsLock':
          if (this.isCaps && !this.currElem.evt.repeat) {
            this.removeActiveClass();
            this.isCaps = false;
            this.status.case = 'down';
          } else {
            this.addActiveClass();
            this.isCaps = true;
            this.status.case = 'up';
          }
          this.changeCase();
          break;
        case 'ShiftRight':
          if (!this.isShiftR || !this.isShiftL) {
            this.addActiveClass();
            this.isShiftR = true;
            this.changeCase();
          }
          break;
        case 'ShiftLeft':
          if (!this.isShiftL || !this.isShiftR) {
            this.addActiveClass();
            this.isShiftL = true;
            this.changeCase();
          }
          break;
        case 'Backspace':
          if (start >= 0 && start <= val.length) {
            val = val.slice(0, start - 1)
                + val.slice(start, val.length);
            this.textfield.value = val;
            this.textfield.selectionStart = start - 1;
            this.textfield.selectionEnd = start - 1;
          }
          break;
        case 'Delete':
          if (start >= 0 && start <= val.length - 1) {
            val = val.slice(0, start) + val.slice(start + 1, val.length);
            this.textfield.value = val;
            this.textfield.selectionStart = start;
            this.selectionEnd = start;
          }
          break;
        case 'Enter':
          this.currElem.charcode = '\n';
          addTextarea();
          break;
        case 'Tab':
          this.currElem.charcode = '    ';
          addTextarea();
          break;
        default:
          break;
      }
    } else if (this.currElem.elem) {
      addTextarea();
    } else {
      return;
    }
    if (this.currElem.evt.ctrlKey && this.currElem.evt.altKey) this.changeLanguage();
  }

  addLang() {
    const currLang = window.localStorage.getItem('lang');
    if (currLang === 'rus') this.changeLanguage();
  }

  init() {
    this.createKeyboardRows();
    this.addLang();
    document.addEventListener('keydown', this.keydownHandler.bind(this));
    document.addEventListener('keyup', this.keyupHandler.bind(this));
    document.addEventListener('mousedown', this.mouseDownHandler.bind(this));
    document.addEventListener('mouseup', this.mouseUpHandler.bind(this));
  }
}
