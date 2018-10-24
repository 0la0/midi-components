import BaseComponent from 'components/_util/base-component';
import Component from 'components/_util/component';
import { getPosNeg } from 'components/_util/math';
import { PATCH_EVENT } from 'components/patch-space/modules/PatchEvent';
import PatchAudioModel from 'components/patch-space/modules/PatchAudioModel';
import PatchEventModel from 'components/patch-space/modules/PatchEventModel';
import ParamScheduler from 'components/patch-space/modules/ParamScheduler';
import PatchParam, { PatchParamModel } from 'components/patch-param';

const COMPONENT_NAME = 'patch-message-spread';
const style = require(`./${COMPONENT_NAME}.css`);
const markup = require(`./${COMPONENT_NAME}.html`);

const DEFAULT_VALUES = {
  SPREAD: 0,
};

const domMap = {};

// TODO: rename to PatchAddress
class PatchMessageSpread extends BaseComponent {
  constructor(options) {
    super(style, markup, domMap);
    this.eventModel = new PatchEventModel(this.schedule.bind(this));
    this.audioModel = new PatchAudioModel('Spread', this.eventModel, PATCH_EVENT.MESSAGE, PATCH_EVENT.MESSAGE);
    this.params = {
      spread: DEFAULT_VALUES.SPREAD,
    };
    this.paramScheduler = {
      spread: new ParamScheduler(message => message.note),
    };
  }

  connectedCallback() {
    const spreadParam = new PatchParam.element(new PatchParamModel({
      label: '',
      defaultValue: DEFAULT_VALUES.SPREAD,
      setValue: val => this.params.spread = val,
      setValueFromMessage: message => this.paramScheduler.spread.schedule(message),
      showValue: false,
    }));
    this.root.appendChild(spreadParam);
  }

  schedule(message) {
    const spread = this.paramScheduler.spread.getValueForTime(message.time.audio) || this.params.spread;
    const spreadVal = Math.round(getPosNeg() * 10 * spread);
    const note = message.note + spreadVal;
    const modifiedMessage = Object.assign(message, { note });
    this.eventModel.getOutlets().forEach(outlet => outlet.schedule(modifiedMessage));
  }
}

export default new Component(COMPONENT_NAME, PatchMessageSpread);