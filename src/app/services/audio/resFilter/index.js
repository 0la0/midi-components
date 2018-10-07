import audioGraph from 'services/audio/graph';

export default class ResFilter {
  constructor() {
    const audioContext = audioGraph.getAudioContext();
    this.output = audioContext.createGain();
    this.filter = audioContext.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 400;
    this.filter.gain.value = 0;
    this.filter.connect(this.output);
  }

  connect(node) {
    this.output.connect(node);
  }

  disconnect(node) {
    this.output.disconnect(node);
  }

  getInput() {
    return this.filter;
  }

  setType(type) {
    this.filter.type = type;
  }

  setFrequency(frequency, time) {
    if (time) {
      this.filter.frequency.linearRampToValueAtTime(frequency, time);
    } else {
      this.filter.frequency.value = frequency;
    }
  }

  setResonance(resonance, time) {
    if (time) {
      this.filter.Q.linearRampToValueAtTime(resonance, time);
    } else {
      this.filter.Q.value = resonance;
    }
  }

  getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    return this.filter.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
  }
}