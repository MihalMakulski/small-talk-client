const socket = require('socket.io-client')('https://m-small-talk.herokuapp.com/');
const {colors} = require('./utils/nice-stuff');
const [,,name] = process.argv;

const adminColor = colors.FgYellow;
const userColor = colors.FgCyan;
const resetColor = colors.Reset;

process.on('exit', (code) => {
  const exitCodes = {
    0: '\nThanks for using SmallTalk! <3',
    9: 'Name is required, dude! And it can\'t be "admin".'
  }
  const exitMsg = exitCodes[code] || 'SmallTalk disconnected...';

  console.log(`${colors.FgMagenta}${exitMsg}${resetColor}`);
});

if (!name || (name.toLowerCase() === 'admin')) {
  process.exit(9);
}

socket.on('connect', () => {
  socket.emit('new-user', name, (err) => {
    if (err) {
      socket.disconnect();
      process.exit(err.exitCode);
    }
  })
});

socket.on('newMessage', function(message) {
  const {from, text, emoji} = message;
  const isAdmin = from === 'Admin';
  const color = isAdmin ? adminColor : userColor;
  const nextLine = isAdmin ? '\n' : '';

  process.stdout.write(`${emoji} ${color}${from}${resetColor}: ${text}${nextLine}`);
});

socket.on('disconnect', () => {
  console.log('SmallTalk disconnected...');
});

process.stdout.on('data', (data) => {
  socket.emit('createMessage', {from: name, text: data.toString()});
});

module.exports = socket;