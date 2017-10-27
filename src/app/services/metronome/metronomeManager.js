import audioGraph from '../audioGraph';
import Metronome from './metronome';
import Scheduler from './scheduler';

let scheduler;
let metronome;

function init() {
  if (scheduler || metronome) {
    console.error('metronomeManager error', 'cannot init more than once');
    return;
  }
  scheduler = new Scheduler(audioGraph.getAudioContext());
  metronome = new Metronome(audioGraph.getAudioContext(), scheduler);
}

function getScheduler() {
  return scheduler;
}

function getMetronome() {
  return metronome;
}

const metronomeManager = {
  init,
  getScheduler,
  getMetronome
};

export default metronomeManager;
