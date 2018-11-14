import audioGraph from 'services/audio/graph';
import {mtof} from 'services/midi/util';
import { AsrEnvelope } from 'services/audio/util/Envelopes';
import { playNoiseBuffer } from 'services/audio/whiteNoise';
import OSCILATORS from 'services/audio/synth/Oscilators';

export default function envelopedOscilator(midiNote, startTime, asr, type, gain, outputs, modulator) {
  const _type = OSCILATORS[type] || OSCILATORS.SINE;
  if (_type === OSCILATORS.NOISE) {
    playNoiseBuffer(startTime, asr, gain, outputs);
    return;
  }
  const frequency = mtof(midiNote);
  const endTime = startTime + asr.attack + asr.sustain + asr.release;
  const osc = audioGraph.getAudioContext().createOscillator();
  const envelope = new AsrEnvelope(asr.attack, asr.sustain, asr.release)
    .build(startTime, gain);
  osc.connect(envelope);
  outputs.forEach(output => envelope.connect(output));
  osc.type = _type;
  // osc.frequency.setValueAtTime(frequency, 0);
  osc.frequency.value = frequency;
  console.log('modulator', modulator);
  if (modulator) {
    modulator.connect(osc.frequency);
  }
  osc.start(startTime);
  osc.stop(endTime);
}
