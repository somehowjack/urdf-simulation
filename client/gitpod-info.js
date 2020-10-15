var { html, css, Webbit } = window.webbit;
var { 
  sourceProviderAdded,
  getSourceProvider,
  hasSourceProvider
} = window.webbitStore;

class GitpodInfo extends Webbit {

  static get metadata() {
    return {
      displayName: 'Gitpod Info',
      category: 'Simulation',
      // description: 'Used to show a single data point on a line chart.',
      // documentationLink: 'https://frc-web-components.github.io/components/line-chart/',
      slots: [],
      resizable: { left: true, right: true },
      minSize: { width: 380 }
    };
  }

  static get styles() {
    return css`
      :host {
        margin: 5px;
        padding-bottom: 5px;
        display: flex;
        font-family: sans-serif;
        align-items: center;
        border-bottom: 1px solid #eee;
      }

      vaadin-button {
        margin-right: 15px;
      }

      [part=connection] {
        margin-right: 15px;
      }

      .connected {
        color: green;
      }

      .disconnected {
        color: red;
      }

      [part=mode] {
          display: flex;
          align-items: center;
          white-space: nowrap;
          margin-right: 10px;
      }
    `;
  }

  static get properties() {
    return {
      networktablesConnected: { type: Boolean },
      halsimConnected: { type: Boolean },
      mode: { type: String, attribute: false },
      showConsole: { type: Boolean, attribute: false },
      menuItems: { type: Array, attribute: false }
    };
  }

  constructor() {
    super();
    this.networktablesConnected = false;
    this.halsimConnected = false;
    this.modes = ['Disabled', 'Autonomous', 'Teleoperated', 'Test']
    this.mode = 'Disabled';
    this.showConsole = false;
    this.setMenuItems();
  }

  setMenuItems() {
    this.menuItems = [
        {
            text: `${this.mode}`,
            children: this.modes.map(mode => ({
                text: mode,
                checkable: true,
                checked: mode === this.mode
            }))
        }
    ];
  }

  addNtConnectionListener() {
    if (hasSourceProvider('NetworkTables')) {
      const provider = getSourceProvider('NetworkTables');
        provider.addWsConnectionListener(connected => {
          this.networktablesConnected = connected;
      }, true);
    }
  }

  addHalSimConnectionListener() {
    if (hasSourceProvider('HALSim')) {
      const provider = getSourceProvider('HALSim');
        provider.addConnectionListener(connected => {
          this.halsimConnected = connected;
      }, true);
    }
  }

  firstUpdated() {
    this.addNtConnectionListener();
    this.addHalSimConnectionListener();
    sourceProviderAdded(providerName => {
      if (providerName === 'NetworkTables') {
        this.addNtConnectionListener();
      } else if (providerName === 'HALSim') {
        this.addHalSimConnectionListener();
      }
    });
  }

  onDeploy() {
    this.dispatchEvent(new CustomEvent('deploy'));
  }

  onBuild() {
    this.dispatchEvent(new CustomEvent('build'));
  }

  robotStateSelected(ev) {
    this.mode = ev.detail.value.text;
    this.setMenuItems();
  }

  render() {
    return html`
      <div part="mode">
        <label>Robot State:</label>
        <vaadin-menu-bar .items="${this.menuItems}" theme="tertiary" @item-selected="${this.robotStateSelected}"></vaadin-menu-bar>
      </div>
      <vaadin-button theme="contrast small" @click="${this.onDeploy}">
        <iron-icon icon="vaadin:rocket" slot="prefix"></iron-icon>
        Deploy Robot Code
      </vaadin-button>
      <vaadin-button theme="contrast small" @click="${this.onBuild}">
        <iron-icon icon="vaadin:building" slot="prefix"></iron-icon>
        Build Robot Code
      </vaadin-button>
      <vaadin-button theme="contrast small" @click="${this.onToggleConsole}">
        <iron-icon icon="vaadin:terminal" slot="prefix"></iron-icon>
        ${this.showConsole ? 'Hide' : 'Show'} Console
      </vaadin-button>
      <div part="connection">
        Robot Simulator:
        ${this.halsimConnected ? html`
          <span class="connected">Connected</span>
        ` : html`
          <span class="disconnected">Disconnected</span>
        `}
      </div>
      <div part="connection">
        NetworkTables:
        ${this.networktablesConnected ? html`
          <span class="connected">Connected</span>
        ` : html`
          <span class="disconnected">Disconnected</span>
        `}
      </div>
    `;
  }
}

webbitRegistry.define('frc-sim-gitpod-info2', GitpodInfo);