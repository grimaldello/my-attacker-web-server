const Logger = require('./logger.js')

let listeningMode = (pParsedRequest) => {
    Logger.logEntryToFile(pParsedRequest);
    console.log(pParsedRequest);

};

exports.listeningMode = listeningMode;