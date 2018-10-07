import BaseComponent from 'components/_util/base-component';
import Component from 'components/_util/component';
import { ContinuousOsc } from 'services/audio/synth/Osc';
import { PATCH_EVENT } from 'components/patch-space/modules/PatchEvent';
import PatchAudioModel from 'components/patch-space/modules/PatchAudioModel';
import PatchParam from 'components/patch-param';

const COMPONENT_NAME = 'patch-lfo';
const style = require(`./${COMPONENT_NAME}.css`);
const markup = require(`./${COMPONENT_NAME}.html`);

const domMap = {};

class PatchLfo extends BaseComponent {
  constructor() {
    super(style, markup, domMap);
    this.frequency = 10;
    this.isOn = false;
    this.lfo = new ContinuousOsc();
    this.audioModel = new PatchAudioModel('LFO', this.lfo, PATCH_EVENT.EVENT, PATCH_EVENT.SIGNAL);
  }

  connectedCallback() {
    const lfoModel = {
      defaultValue: 0.8,
      setValue: this.onFrequencyUpdate.bind(this),
      setValueFromMessage: () => {},
    };
    this.lfoParam = new PatchParam.element(lfoModel);
    this.root.appendChild(this.lfoParam);
  }

  onFrequencyUpdate(value) {
    const frequency = 1 + 30 * value;
    this.lfo.setFrequency(frequency, 0);
    this.frequency = frequency;
  }

  handleToggle() {
    this.isOn = !this.isOn;
    this.isOn ? this.lfo.start(this.frequency, 0) : this.lfo.stop(0);
  }

  onRemove() {
    this.parentNode.removeChild(this);
  }
}

export default new Component(COMPONENT_NAME, PatchLfo);