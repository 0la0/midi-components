export function mtof (midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}
