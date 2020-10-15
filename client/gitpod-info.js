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
      showConsole: { type: Boolean, attribute: false },
    };
  }

  constructor() {
    super();
    this.networktablesConnected = false;
    this.halsimConnected = false;
    this.showConsole = false;
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

  onToggleConsole() {
      this.showConsole = !this.showConsole;
  }

  dialogRenderer(root, dialog) {
      root.innerHTML = '<frc-robot-log></frc-robot-log>';
  }

  render() {
    return html`
        <vaadin-dialog modeless draggable resizable ?opened="${this.showConsole}" .renderer="${this.dialogRenderer}">
            <p>sdfdsffds</p>
        </vaadin-dialog>
      <frc-sim-gitpod-info-robot-state></frc-sim-gitpod-info-robot-state>
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