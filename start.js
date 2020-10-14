const { spawn } = require('child_process');
const fs = require('fs').promises;
const { LiveStream } = require('./live-stream');
const { createServer } = require('wss');

class RobotWs {

    constructor(onBuild, onDeploy) {
        
        this.connections = [];

        createServer(connection => {
            connection.send('welcome!');
            connection.on('message', (data) => {
                const command = data.toString();
                if (command === 'build') {
                    onBuild().then(result => {
                        this.sendMessage(result ? 'success' : 'error', result ? 'Build Successful' : 'Build Failed');
                    });
                } else if (command === 'deploy') {
                    onDeploy().then(result => {
                        this.sendMessage(result ? 'success' : 'error', result ? 'Deploy Successful' : 'Deploy Failed');
                    });
                }
            });
            this.connections.push(connection);
        })
        .listen(8082, function ()  {
            const {address, port} = this.address() // this is the http[s].Server
            console.log('listening on http://%s:%d (%s)', /::/.test(address) ? '0.0.0.0' : address, port)
        });
    }

    sendMessage(level, message) {
        const msg = JSON.stringify({
            level,
            message
        });
        this.connections.forEach(connection => {
            if (connection.readyState === connection.OPEN) {
                connection.send(msg);
            }
        });
    }
}

async function getSimulationPid() {
    return new Promise(async (resolve, reject) => {
        try { 
            resolve(await fs.readFile('/workspace/urdf-simulation/build/pids/simulateJava.pid', 'utf8'));
        } catch(e) {
            reject(e);
        }
    });
}

async function killSimulationPid() { 
    return new Promise(async resolve => {
        try {
            const pid = await getSimulationPid();
            const childProcess = spawn('kill', ['-15', pid]);
            childProcess.on('exit', function (code) {
                resolve();
            }); 
        } catch(e) {
            console.log('error:', e);
            resolve();
        }
    });
}

async function killSimulationPort() { 
    return new Promise(async resolve => {
        try {
            const childProcess = spawn('fuser', ['-k', '8080/tcp']);
            childProcess.on('exit', function (code) {
                resolve();
            }); 
        } catch(e) {
            console.log('error:', e.message);
            resolve();
        }
    });
}

async function buildRobotCode(callback) {
    return new Promise(async resolve => {
        try {
            const childProcess = spawn('./gradlew', ['build']);
            childProcess.stdout.on('data', function (data) {
                callback(data.toString());
            });

            childProcess.stderr.on('data', function (data) {
                callback(data.toString());
            });

            childProcess.on('exit', function (code) {
                resolve(code === 0);
            }); 
        } catch(e) {
            console.log('error:', e.message);
            resolve();
        }
    });
}

async function deploy(callback) {

    const buildSuccessful = await buildRobotCode(callback);

    if (buildSuccessful) {
        await killSimulationPid();
        await killSimulationPort();
        spawn('./gradlew', ['simulateJava']);
        return true;
    }

    return false;
}

async function start() {

    let liveStream = null;

    const robotWs = new RobotWs(
        async () => {
            return await buildRobotCode(message => robotWs.sendMessage('info', message));
        },
        async () => {
            const success = await deploy(message => robotWs.sendMessage('info', message));
            if (success && liveStream) {
                liveStream.stop();
                liveStream = new LiveStream('./build/stdout/simulateJava.log', text => {
                    robotWs.sendMessage('info', text);
                });
            }
            return success;
        }
    );
    
    liveStream = new LiveStream('./build/stdout/simulateJava.log', text => {
        robotWs.sendMessage('info', text);
    });

    const result = await deploy(message => robotWs.sendMessage('info', message));
    robotWs.sendMessage(result ? 'success' : 'error', result ? 'Deploy Successful' : 'Deploy Failed');
}

start();

