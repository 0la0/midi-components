import BaseComponent from 'common/util/base-component';
import { mapToRange } from 'services/Math';
import { eventBus } from 'services/EventBus';
import Subscription from 'services/EventBus/Subscription';
import markup from './fft-visualizer.html';
import style from './fft-visualizer.css';

let WIDTH = 2 ** 8;
let HEIGHT = 2 ** 7;
const STROKE_ADJUST = 4;
const MAX_BYTE = (2 ** 8) - 1;
const MIN_WIDTH = 100;
const MIN_HEIGHT = 50;

function getGraphicsContext(canvasElement, width, height) {
  const g2d = canvasElement.getContext('2d');
  canvasElement.width = width;
  canvasElement.height = height;
  g2d.width = width;
  g2d.height = height;
  g2d.clearRect(0, 0, WIDTH, HEIGHT);
  g2d.strokeStyle = '#FFFFFFBB';
  g2d.fillStyle = '#FFFFFFBB';
  g2d.lineWidth = STROKE_ADJUST / 2;
  return g2d;
}

export default class FftVisualizer extends BaseComponent {
  static get tag() {
    return 'fft-visualizer';
  }

  constructor() {
    super(style, markup, [ 'canvas', 'draggable' ]);
    this.g2d = getGraphicsContext(this.dom.canvas, WIDTH, HEIGHT);
    this.strokeStyle = '#FFFFFFBB';
    this.isDragging = false;
    this.lastRenderTime = performance.now();
    this.dom.draggable.addEventListener('mousedown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = true;
    });
    this.dom.draggable.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    this.mouseMoveSubscription = new Subscription('MOUSE_MOVE', (msg) => {
      if (!this.isDragging) { return; }
      // TODO: wrap in RAF
      const { event } = msg;
      const { width, height } = document.body.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      const newWidth = Math.max(width - x, MIN_WIDTH);
      const newHeight = Math.max(height - y, MIN_HEIGHT);
      this.strokeWidth = (newWidth / 2) / MIN_WIDTH;
      this.dom.canvas.setAttribute('width', newWidth);
      this.dom.canvas.setAttribute('height', newHeight);
      this.dom.canvas.style.setProperty('width', newWidth);
      this.dom.canvas.style.setProperty('height', newHeight);
      WIDTH = newWidth;
      HEIGHT = newHeight;
    });
    this.mouseUpSubscription = new Subscription('MOUSE_UP', (msg) => {
      if (!this.isDragging) { return; }
      msg.event.preventDefault();
      msg.event.stopPropagation();
      this.isDragging = false;
    });
  }

  connectedCallback() {
    eventBus.subscribe(this.mouseMoveSubscription);
    eventBus.subscribe(this.mouseUpSubscription);
  }

  disconnectedCallback() {
    eventBus.unsubscribe(this.mouseMoveSubscription);
    eventBus.unsubscribe(this.mouseUpSubscription);
  }

  clear() {
    this.g2d.clearRect(0, 0, WIDTH, HEIGHT);
  }

  fadeCanvas() {
    this.g2d.fillStyle = '#242424FF';
    this.g2d.fillRect(0, 0, WIDTH, HEIGHT);
    this.g2d.fillStyle = '#FFFFFF99';
  }

  renderTimeData(timeData) {
    const bufferLength = timeData.length;
    const step = WIDTH / bufferLength;
    this.fadeCanvas();
    this.g2d.strokeStyle = this.strokeStyle;
    this.g2d.lineWidth = this.strokeWidth;
    this.g2d.beginPath();
    timeData.forEach((value, index) => {
      const normalValue = (value / MAX_BYTE) * HEIGHT;
      const x = step * index;
      const y = ( (MAX_BYTE / HEIGHT) + normalValue ) - STROKE_ADJUST;
      index === 0 ? this.g2d.moveTo(x, y) : this.g2d.lineTo(x, y);
    });
    this.g2d.stroke();
  }

  renderFrequencyData(frequencyData) {
    this.fadeCanvas();
    const step = 2 * WIDTH / frequencyData.length;
    frequencyData.forEach((value, index) => {
      const normalValue = (value / MAX_BYTE) * HEIGHT;
      const height = ( (MAX_BYTE / HEIGHT) + normalValue ) - STROKE_ADJUST;
      this.g2d.fillRect(step * index, HEIGHT - height, step, height);
    });
  }

  renderSpectrogram(frequencyData) {
    const timestamp = performance.now();
    const elapsedTime = timestamp - this.lastRenderTime;
    this.lastRenderTime = timestamp;
    const timeDiff = elapsedTime * 0.075;
    this.g2d.drawImage(this.dom.canvas, 0, 0, WIDTH, HEIGHT, 0, -timeDiff, WIDTH, HEIGHT);
    const step = 2 * WIDTH / frequencyData.length;
    frequencyData.forEach((value, index) => {
      const val = mapToRange(0, MAX_BYTE, 36, MAX_BYTE, value);
      this.g2d.fillStyle = `rgb(${val}, ${val}, ${val})`;
      this.g2d.fillRect(step * index, HEIGHT - timeDiff, step, STROKE_ADJUST);
    });
  }
}
