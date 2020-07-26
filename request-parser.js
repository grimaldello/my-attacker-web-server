const url = require('url');

async function parseRequest(pOriginalRequest) {

    let parsedRequestPromise = new Promise((resolve, reject) => {

        (async () =>{
            let parsedRequest = {};
    
            // Prepare parsed request headers, body and connection   
            parsedRequest = await _parseHeaders(parsedRequest, pOriginalRequest);
            parsedRequest = await _parseData(parsedRequest, pOriginalRequest);
            parsedRequest = await _parseConnection(parsedRequest, pOriginalRequest);

            resolve(parsedRequest);
        })();

    });

    return parsedRequestPromise;
};

function _getQueryParameters(pOriginalRequest) {
    const requestUrl = url.parse(pOriginalRequest.url, true);
    return JSON.parse(JSON.stringify(requestUrl['query'])); // <--- Not really good
};

async function _parseHeaders(pParsedRequest, pOriginalRequest) {

    let parsedHeadersPromise = new Promise((resolve, reject) =>{
        const requestHeaders = pOriginalRequest.headers;
        const requestUrl = url.parse(pOriginalRequest.url, true);
    
        // Create objects that will contain parsed headers
        pParsedRequest.headers = {};
    
        // Get Host and Port from request
        const hostAndPort = requestHeaders.host.split(':');
        pParsedRequest.headers.host = hostAndPort[0];
        pParsedRequest.headers.port = hostAndPort[1];
    
        // Get user agent
        pParsedRequest.headers.userAgent = requestHeaders['user-agent'];
        pParsedRequest.headers.contentLength = requestHeaders['content-length'];
        pParsedRequest.headers.contentType = requestHeaders['content-type'];
    
        // Get request url
        pParsedRequest.headers.url = requestUrl['pathname'];
    
        // Get request method
        pParsedRequest.headers.method = pOriginalRequest['method'];

        resolve(pParsedRequest);
    });

    return parsedHeadersPromise;
};

async function _parseData(pParsedRequest, pOriginalRequest) {

    let parsedPOSTDataPromise = new Promise(((resolve, reject)=>{

        pParsedRequest.data = {};

        if(pOriginalRequest['method'] === 'GET') {

            pParsedRequest.data.query = _getQueryParameters(pOriginalRequest);
            resolve(pParsedRequest);
        }
        else if(pOriginalRequest['method'] === 'POST') {

            let body = '';

            pOriginalRequest.on('data', chunk => {
                body += chunk.toString();
            });

            pOriginalRequest.on('end', () => {

                pParsedRequest.data.query = _getQueryParameters(pOriginalRequest);
                pParsedRequest.data.body = body;
                resolve(pParsedRequest);
            });
        }  
    }));
    return parsedPOSTDataPromise; 
};

async function _parseConnection(pParsedRequest, pOriginalRequest) {

    let parsedConnectionPromise = new Promise(((resolve, reject)=>{
        pParsedRequest.connection = {};

        pParsedRequest.connection.remoteAddress = pOriginalRequest.connection.remoteAddress;
        pParsedRequest.connection.remotePort = pOriginalRequest.connection.remotePort
        pParsedRequest.connection.localAddress = pOriginalRequest.connection.localAddress
        pParsedRequest.connection.localPort = pOriginalRequest.connection.localPort
        resolve(pParsedRequest);
        
    }));

    return parsedConnectionPromise; 
};

exports.parseRequest = parseRequest;