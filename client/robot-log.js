
var socketOpen = false;
var socket = null;
const listeners = [];

function getAddress(type) {
    return `wss://8082${window.location.href.substring(12)}ws`;
}

function createSocket(onMessage, onClose) {

    socket = new WebSocket(getAddress());
    if (socket) {
        socket.onopen = function () {
            console.info("robot socket opened");
            socketOpen = true;
        };

        socket.onmessage = function (msg) {
            console.log('msg:', msg.data);
            const data = JSON.parse(msg.data);
            onMessage(data);
        };

        socket.onclose = function () {
            if (socketOpen) {
                console.info("robot socket closed");
                socket = null;
                onClose();
            }
            // respawn the websocket
            setTimeout(() => {
                createSocket(onMessage, onClose);
            }, 300);
        };
    }
}

function sendMsg(msg) {
    if (socket) {
        socket.send(msg);
    }
}

class RobotLog extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
                width: 500px;
                height: 300px;
            }

            frc-logger {
                width: 100%;
                height: 100%;
            }
        `;
    }

    static get properties() {
        return {
            info: { type: String },
            error: { type: String },
            success: { type: String },
        }
    }
    
    constructor() {
        super();
        this.info = '';
        this.error = '';
        this.success = '';
        createSocket(({ level, message }) => {
            this[level] = message;
        }, () => {});
    }

    render() {
        return html`
             <vaadin-dialog modeless draggable resizable opened>
                <p>sdfdsffds</p>
            </vaadin-dialog>

            <frc-logger info="${this.info}" error="${this.error}" success="${this.success}"></frc-logger>
        `;
    }

    buildCode() {
        sendMsg('build');
    }

    deployCode() {
        sendMsg('deploy');
    }
}

customElements.define('frc-robot-log', RobotLog);    

