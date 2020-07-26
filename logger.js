const fs = require('fs');

function logEntryToFile(pStringToLog) {
    const logStream = fs.createWriteStream('log.txt', {flags: 'a'}, 'utf-8');
    logStream.write(`${new Date().toISOString()} >>> ${JSON.stringify(pStringToLog)}`);
    logStream.end('\n');
};


exports.logEntryToFile = logEntryToFile;
