const Logger = require('./logger.js')
const fs = require('fs');
const net = require('net');

const Types = {
    LISTENING_MODE: 'LISTENING_MODE',
    WEB_SERVER: 'WEB_SERVER'
};

let ListeningMode = {
    name: Types.LISTENING_MODE,
    execute: (pParsedRequest) => {
        Logger.logEntryToFile(pParsedRequest);
        console.log(pParsedRequest);
    }
};

let WebServerMode = {
    name: Types.WEB_SERVER,
    execute: (pParsedRequest) => {
        Logger.logEntryToFile(pParsedRequest);
        console.log(pParsedRequest);

        let htmlPageToReturn;

        try {
            if(net.isIP(pParsedRequest.headers.host) || pParsedRequest.headers.host.toLowerCase() === 'localhost'){
                htmlPageToReturn = fs.readFileSync(`${__dirname}/html/index.html`, 'utf8');
            }
    
            else if(!net.isIP(pParsedRequest.headers.host)) {
                if(pParsedRequest.headers.url === '/') {
                    htmlPageToReturn = fs.readFileSync(`${__dirname}/html/${pParsedRequest.headers.host}/index.html`, 'utf8');
                }
                else {
                    let destinationUrl = !pParsedRequest.headers.url.endsWith('.html') ?  `${pParsedRequest.headers.url}.html` : pParsedRequest.headers.url;
                    htmlPageToReturn = fs.readFileSync(`${__dirname}/html/${pParsedRequest.headers.host}${destinationUrl}`, 'utf8');
                }
            }
        } catch (error) {
            if(htmlPageToReturn === undefined){
                htmlPageToReturn = fs.readFileSync(`${__dirname}/html/404.html`, 'utf8');
            }
        }

        return htmlPageToReturn;
    }
}

exports.Types = Types;
exports.ListeningMode = ListeningMode;
exports.WebServerMode = WebServerMode;