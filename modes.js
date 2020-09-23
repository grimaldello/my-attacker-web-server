const Logger = require('./logger.js')

const Types = {
    LISTENING_MODE: 'LISTENING'
};

let ListeningMode = {
    name: Types.LISTENING_MODE,
    execute: (pParsedRequest) => {
        Logger.logEntryToFile(pParsedRequest);
        console.log(pParsedRequest);
    }
};

exports.Types = Types;
exports.ListeningMode = ListeningMode;