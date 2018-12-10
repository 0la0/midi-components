import BaseComponent from 'components/_util/base-component';
import Component from 'components/_util/component';
import { buildAttributeCallback } from 'components/_util/dom';
import buttonStyle from 'components/primitives/text-button/text-button.css';

const style = `
  ${buttonStyle}
  .button--active {
    background-color: var(--color-grey-light);
    color: var(--color-black-light);
  }
`;
const markup = '<button id="button"/>';

const BUTTON_ACTIVE = 'button--active';

class ToggleButton extends BaseComponent {
  constructor() {
    super(style, markup, ['button']);
    this.isOn = false;
  }

  connectedCallback() {
    this.onClick = buildAttributeCallback(this, 'click');
    this.addEventListener('click', this.handleClick.bind(this));
    this.onText = this.getAttribute('onlabel') || '';
    this.offText = this.getAttribute('offlabel') || '';
    this.isOn = !!this.getAttribute('ison');
    this.render();
  }

  handleClick(event) {
    this.onClick(event);
    this.isOn = !this.isOn;
    this.render();
  }

  render() {
    this.isOn ?
      this.dom.button.classList.add(BUTTON_ACTIVE) :
      this.dom.button.classList.remove(BUTTON_ACTIVE);
    this.dom.button.innerText = this.isOn ? this.onText : this.offText;
  }
}

export default new Component('toggle-button', ToggleButton);
