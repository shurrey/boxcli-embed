var term = new Terminal({
    cursorBlink: "block"
});

const ws = new WebSocket("ws://localhost:3000", "echo-protocol");

var curr_line = "";
var entries = [];

term.open(document.getElementById('terminal'));

term.prompt = () => {
    if (curr_line) {
        let data = { method: "command", command: curr_line };
        console.log('send data ' + JSON.stringify(data));
        ws.send(JSON.stringify(data));
    }
};
term.prompt();

// Receive data from socket
ws.onmessage = msg => {
    term.write("\r\n" + msg.data);
    curr_line = "";
};

term.on("key", function(key, ev) {
    // If user presses ENTER
    if ( ev.keyCode === 13) {
        if (curr_line) {
            entries.push(curr_line);
            term.write("\r\n");
            term.prompt();
        }
    } else if (ev.keyCode === 8) {
      // If user presses Backspace
      if (curr_line) {
        curr_line = curr_line.slice(0, curr_line.length - 1);
        term.write("\b \b");
      }  
    } else {
            curr_line += key;
            term.write(key)
    }
});

// allow users to paste values
term.on("paste", function(data) {
    curr_line += data;
    term.write(data);
});