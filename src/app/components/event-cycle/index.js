import BaseComponent from 'common/util/base-component';
import { audioEventBus, eventBus } from 'services/EventBus';
import Subscription from 'services/EventBus/Subscription';
import metronomeManager from 'services/metronome/metronomeManager';
import MetronomeScheduler from 'services/metronome/MetronomeScheduler';
import CycleManager from 'services/EventCycle/CycleManager';
import keyShortcutManager from 'services/keyShortcut';
import { uuid } from 'services/Math';
import style from './event-cycle.css';
import markup from './event-cycle.html';

const KEY_CODE_ENTER = 13;
const cssClass = {
  errorDisplay: 'error-display--visible',
  pendingChanges: 'pending-changes--active',
};
const dom = [ 'cycleInput', 'toggleButton', 'pendingChanges', 'errorDisplay' ];

function focusEditor(inputElement) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.setStart(inputElement, inputElement.childElementCount);
  range.setEnd(inputElement, inputElement.childElementCount);
  selection.removeAllRanges();
  selection.addRange(range);
}

export default class EventCycle extends BaseComponent {
  static get tag() {
    return 'event-cycle';
  }

  constructor() {
    super(style, markup, dom);
    this.cycle = uuid();
    this.cycleLength = 16;
    this.isOn = true;
    this.requestOn = false;
    this.lastValidCycleString = '';
    this.cycleManager = new CycleManager();
    this.dataStoreSubscription = new Subscription('DATA_STORE', this.handleDataStoreUpdate.bind(this));
    this.dom.toggleButton.addEventListener('click', this.handleToggleClick.bind(this));
  }

  connectedCallback() {
    this.dom.cycleInput.addEventListener('keydown', event => {
      if (keyShortcutManager.offerKeyShortcutEvent(event)) {
        event.stopPropagation();
        return;
      }
      event.stopPropagation();
      if (event.keyCode === KEY_CODE_ENTER && event.ctrlKey) {
        event.preventDefault();
        this.handleCycleChange(this.dom.cycleInput.innerText);
        return;
      }
    });
    this.dom.cycleInput.addEventListener('keyup', event => {
      event.stopPropagation();
      if (this.dom.cycleInput.innerText.trim() === this.lastValidCycleString) {
        this.dom.pendingChanges.classList.remove(cssClass.pendingChanges);
      } else {
        this.dom.pendingChanges.classList.add(cssClass.pendingChanges);
      }
    });
    this.metronomeSchedulable = new MetronomeScheduler({
      processTick: this.handleTick.bind(this),
      stop: () => this.cycleManager.stop(),
    });
    metronomeManager.getScheduler().register(this.metronomeSchedulable);
    eventBus.subscribe(this.dataStoreSubscription);

    // const testCycleValue = `
    //   // seq( p("a", "48 60 60 72") )
    //   // seq( p("b", "48 60 60 72") )
    //   // let mod = addr('b').envSin(10, 0, 40).gain(500, 0x9)
    //   // addr('a').envOsc('squ', 0, 0, 400).gain(0.5, 0x8).dac()
    //   osc('sin', 440).gain(0.1).dac()
    // `;
    // this.dom.cycleInput.innerText = testCycleValue.trim();
    // this.handleCycleChange(testCycleValue);
    // setTimeout(() => focusEditor(this.dom.cycleInput));
  }

  disconnectedCallback() {
    metronomeManager.getScheduler().deregister(this.metronomeSchedulable);
    eventBus.unsubscribe(this.dataStoreSubscription);
  }

  handleCycleChange(cycleString) {
    this.cycleManager.setCycleString(cycleString);
    if (!this.cycleManager.isValid()) {
      this.dom.errorDisplay.classList.add(cssClass.errorDisplay);
      this.dom.errorDisplay.innerText = this.cycleManager.errorMessage;
      this.dom.pendingChanges.classList.remove(cssClass.pendingChanges);
      return;
    }
    this.dom.errorDisplay.classList.remove(cssClass.errorDisplay);
    this.lastValidCycleString = cycleString.trim();
    this.dom.pendingChanges.classList.remove(cssClass.pendingChanges);
  }

  handleTick(tickNumber, time) {
    if (!this.isOn) { return; }
    const shouldRefresh = tickNumber % this.cycleLength === 0;
    if (this.requestOn) {
      if (shouldRefresh) {
        this.requestOn = false;
      } else {
        return;
      }
    }
    try {
      this.cycleManager.getAudioEventsAndIncrement(time, metronomeManager.getMetronome().getTickLength(), shouldRefresh)
        .forEach(audioEvent => audioEventBus.publish(audioEvent));
    } catch(error) {
      this.dom.errorDisplay.innerText = error.message;
      this.dom.errorDisplay.classList.add(cssClass.errorDisplay);
    }
  }

  handleDataStoreUpdate(obj) {
    this.dom.cycleInput.style.setProperty('font-size', `${obj.dataStore.fontSize}px`);
  }

  handleToggleClick() {
    this.isOn = !this.isOn;
    if (!this.isOn) {
      this.cycleManager.stop();
      this.dom.toggleButton.innerText = 'Off';
    } else {
      this.requestOn = true;
      this.dom.toggleButton.innerText = 'Active';
    }
  }
}
