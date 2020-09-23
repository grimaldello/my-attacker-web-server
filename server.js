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
                break;
        
            default:
                Modes.ListeningMode.execute(result);
                break;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`OK\n`);
    });

}).listen(Settings.ListenPort, Settings.ListenIPAddres, () => {
    console.log(`Server listening on ${Settings.ListenIPAddres}:${Settings.ListenPort}...`);
});
