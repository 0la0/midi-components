import audioGraph from 'services/audio/graph';

export default class Gain  {
  constructor () {
    const audioContext = audioGraph.getAudioContext();
    this.gain = audioContext.createGain();
  }

  connect(node) {
    this.gain.connect(node);
  }

  disconnect(node) {
    this.gain.disconnect(node);
  }

  getInput() {
    return this.gain;
  }

  setValue(gain) {
    this.gain.gain.setValueAtTime(gain, 0);
  }

  setValueAtTime(gain, scheduledTime) {
    const time = (scheduledTime === undefined) ? 0 : scheduledTime;
    this.gain.gain.linearRampToValueAtTime(gain, time);
  }
}