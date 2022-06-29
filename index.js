const express = require('express');
var expressWs = require('express-ws');
var os = require('os');
var pty = require('node-pty');

const app = express();
expressWs(app);

var path = require('path');
const port = 3000;

app.use('/xterm', express.static('node_modules/xterm/'));
app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/xterm.html'));
});

app.ws('/', function (ws, req) {
  console.log('Connected to terminal');

  const env = Object.assign({}, process.env);
  env['COLORTERM'] = 'truecolor';

  let term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: process.platform === 'win32' ? undefined : env.PWD,
    env: env,
    encoding: 'utf8'
  });

  console.log('Created terminal with PID: ' + term.pid);

  ws.on('message', function(msg) {
    console.log('message ' + msg);
    var cmd = JSON.parse(msg)['command'];
    console.log("cmd " + cmd)
    term.write(cmd + '\r');
  });

  term.onData(data => {
    console.log('send data ' + data);
    ws.send(data);
  });

  ws.on('close', function () {
    term.kill();
    console.log('Closed terminal ' + term.pid);
    // Clean things up
  });
});

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`);
});