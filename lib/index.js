const socket = require('socket.io-client')('https://m-small-talk.herokuapp.com/');
const {emojis, colors} = require('./utils/nice-stuff');
const {getRandomInt} = require('./utils/utils');
const [,,name] = process.argv;

const adminColor = colors.FgYellow;
const adminEmoji = '🤖';

const userColor = colors.FgCyan;
const userEmoji = emojis[getRandomInt(0, emojis.length)];

process.on('exit', (code) => {
  console.log(`${colors.FgMagenta}Name is required, dude! And it can't be "admin".${colors.Reset}`);
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
  const {from, text} = message;
  const isAdmin = from === 'Admin';
  const emoji = isAdmin ? adminEmoji : userEmoji;
  const color = isAdmin ? adminColor : userColor;
  const nextLine = isAdmin ? '\n' : '';

  process.stdout.write(`${emoji} ${color}${from}${colors.Reset}: ${text}${nextLine}`);
});

socket.on('disconnect', () => {
  console.log('Client disconnected...');
});

process.stdout.on('data', (data) => {
  socket.emit('createMessage', {from: name, text: data.toString()});
});

module.exports = socket;