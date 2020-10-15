var { Webbit, html, css } = window.webbit;

class RobotState extends Webbit {

  static get metadata() {
    return {
      displayName: 'Gitpod Info Robot State',
      category: 'Simulation',
      slots: [],
      //description: 'Component for displaying data from a 3-axis accelerometer.',
      // documentationLink: 'https://frc-web-components.github.io/components/relay/'
      resizable: {},
    };
  }

  static get styles() {
      return css`
        :host {
          display: flex;
          align-items: center;
          white-space: nowrap;
          margin-right: 10px;
        }
    `;
  }

  static get properties() {
    return {
      enabled: { type: Boolean },
      autonomous: { type: Boolean },
      test: { type: Boolean },
      menuItems: { type: Array, attribute: false },
    };
  }

  constructor() {
    super();

    this.sourceKey = 'driverStation';
    this.sourceProvider = 'HALSim';
    
    this.enabled = false;
    this.autonomous = false;
    this.test = false;
    this.ds = false;

    this.setMenuItems();
  }

  getState() {
      if (this.isDisabled()) {
          return 'Disabled';
      } else if (this.isAutonomous()) {
          return 'Autonomous';
      } else if (this.isTeleop()) {
          return 'Teleoperated';
      } else {
          return 'Test';
      }
  }

  setMenuItems() {
    this.menuItems = [
        {
            text: this.getState(),
            children: [
                { text: 'Disabled', checkable: true, checked: this.isDisabled() },
                { text: 'Autonomous', checkable: true, checked: this.isAutonomous() },
                { text: 'Teleoperated', checkable: true, checked: this.isTeleop() },
                { text: 'Test', checkable: true, checked: this.isTest() },
            ]
        }
    ];
  }

  isDisabled() {
    return !this.enabled;
  }

  isAutonomous() {
    return this.enabled && this.autonomous && !this.test;
  }

  isTeleop() {
    return this.enabled && !this.autonomous && !this.test;
  }

  isTest() {
    return this.enabled && !this.autonomous && this.test;
  }

  robotStateSelected(ev) {
    const value = ev.detail.value.text;
    
    if (value === 'Disabled') {
      this.enabled = false;
    } else if (value === 'Autonomous') {
      this.enabled = true;
      this.autonomous = true;
      this.test = false;
    } else if (value === 'Teleoperated') {
      this.enabled = true;
      this.autonomous = false;
      this.test = false;
    } else if (value === 'Test') {
      this.enabled = true;
      this.autonomous = false;
      this.test = true;
    }
  }

  updated() {
      this.setMenuItems();
  }

  render() {
    return html`   
        <label>Robot State:</label>
        <vaadin-menu-bar .items="${this.menuItems}" theme="tertiary" @item-selected="${this.robotStateSelected}"></vaadin-menu-bar>
    `;
  }
}

webbitRegistry.define('frc-sim-gitpod-info-robot-state', RobotState);