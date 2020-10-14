const fs = require('fs');
const bite_size = 256;

class LiveStream {
    
    constructor(filename, onIncomingData) {
        this.filename = filename;
        this.onIncomingData = onIncomingData;
        this.file = null;
        this.readbytes = 0;
        this.stopped = false;
        this.initialize();
    }

    stop() {
        this.stopped = true;
    }

    initialize() {

        if (this.stopped) {
            return;
        }

        if (fs.existsSync(this.filename)) {
            fs.writeFileSync(this.filename, '');
            fs.open(this.filename, 'r', (err, fd) => { 
                this.file = fd; 
                this.readsome(); 
            });
        } else {
            setTimeout(() => {
                this.initialize();
            }, 100);
        }
    }

    readsome() {

        if (this.stopped) {
            return;
        }

        var stats = fs.fstatSync(this.file); // yes sometimes async does not make sense!
        if(stats.size<this.readbytes+1) {
            setTimeout(() => {
                this.readsome();
            }, 100);
        }
        else {
            fs.read(this.file, new Buffer(bite_size), 0, bite_size, this.readbytes, (...args) => {
                this.processsome(...args);
            });
        }
    }

    processsome(err, bytecount, buff) {
        this.onIncomingData(buff.toString('utf-8', 0, bytecount));

        // So we continue reading from where we left:
        this.readbytes += bytecount;
        process.nextTick(() => {
            this.readsome();
        });
    }

}


// const fileName = '/workspace/testFRCOnlineIDE/TestProject/build/stdout/simulateJava.log';

module.exports.LiveStream = LiveStream;

// new LiveStream(fileName, (text) => {
//     console.log(text);
// });

