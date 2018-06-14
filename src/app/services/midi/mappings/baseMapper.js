
export default class BaseMidiMapper {
  constructor(name) {
    this.name = name;
  }

  setDevice(deviceInput, deviceOutput) {
    if (!deviceInput || !deviceOutput) {
      console.log(`${this.name}: no connections`);
      return false;
    }
    if (deviceInput === this.deviceInput && deviceOutput === this.deviceOutput) {
      console.log(`${this.name}: already connected`);
      return false;
    }
    this.deviceInput = deviceInput;
    this.deviceOutput = deviceOutput;
    return true;
  }

  onMessage(message) {}

  getName() {
    return this.name;
  }

  destroy() {
    console.log('TODO: release', this.deviceInput, this.deviceOutput);
  }
}