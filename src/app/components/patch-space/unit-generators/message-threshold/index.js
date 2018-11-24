import BaseComponent from 'components/_util/base-component';
import Component from 'components/_util/component';
import { getPosNeg, clamp } from 'components/_util/math';
import { PATCH_EVENT } from 'components/patch-space/modules/PatchEvent';
import PatchAudioModel from 'components/patch-space/modules/PatchAudioModel';
import PatchEventModel from 'components/patch-space/modules/PatchEventModel';
import ParamScheduler from 'components/patch-space/modules/ParamScheduler';
import PatchParam, { PatchParamModel } from 'components/patch-param';

const COMPONENT_NAME = 'message-threshold';
const style = require(`./${COMPONENT_NAME}.css`);
const markup = require(`./${COMPONENT_NAME}.html`);
const DEFAULT_VALUE = 4;

class MessageThreshold extends BaseComponent {
  constructor(options) {
    super(style, markup, [ 'threshInput' ]);
    this.eventModel = new PatchEventModel(this.schedule.bind(this));
    this.audioModel = new PatchAudioModel('MsgThresh', this.eventModel, PATCH_EVENT.MESSAGE, PATCH_EVENT.MESSAGE);
    this.threshold = DEFAULT_VALUE;
    this.messageCount = 0;
    this.dom.threshInput.addEventListener('change', event => {
      const value = parseInt(this.dom.threshInput.value, 10);
      // TODO: validation
      this.threshold = value;
    });
  }

  connectedCallback() {
    this.dom.threshInput.value = this.threshold;
  }

  schedule(message) {
    if (++this.messageCount % this.threshold !== 0) { return; }
    this.eventModel.getOutlets().forEach(outlet => outlet.schedule(message));
  }

  // TODO: clear local values on metronome start / stop
}

export default new Component(COMPONENT_NAME, MessageThreshold);
