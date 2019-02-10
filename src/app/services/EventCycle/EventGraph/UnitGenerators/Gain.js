import Gain from 'services/audio/gain';
import PATCH_EVENT from 'services/PatchSpace/PatchEvent';
import PatchAudioModel from 'services/PatchSpace/PatchAudioModel';

export default class PatchGain {
  constructor(gainValue) {
    this.gain = new Gain(gainValue);
    this.audioModel = new PatchAudioModel('GAIN', this.gain, PATCH_EVENT.SIGNAL, PATCH_EVENT.SIGNAL);
  }

  disconnect() {
    this.audioModel.disconnect();
  }

  static fromParams({ gainValue, }) {
    return new PatchGain(gainValue);
  }
}