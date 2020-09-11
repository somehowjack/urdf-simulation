
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
            // var data = JSON.parse(msg.data);
            // onMessage(data);
            onMessage(msg.data);
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

function sendMsg(o) {
    if (socket) {
        var msg = JSON.stringify(o);
        socket.send(msg);
    }
}

class RobotLog extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
            }
        `;
    }

    static get properties() {
        return {
            message: { type: String }
        }
    }
    
    constructor() {
        super();
        createSocket(message => {
            // console.log('message:', message);
            this.message = message;
        }, () => {});
    }

    render() {
        return html`
            <frc-logger info="${this.message}"></frc-logger>
        `;
    }
}

customElements.define('frc-robot-log', RobotLog);    

