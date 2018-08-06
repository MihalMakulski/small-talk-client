const socket = require('socket.io-client')('http://localhost:3000');
const {emojis, colors} = require('./utils/nice-stuff');
const {getRandomInt} = require('./utils/utils');
const [,,name] = process.argv;

const adminColor = colors.FgYellow;
const adminEmoji = '🤖';

const userColor = colors.FgCyan;
const userEmoji = emojis[getRandomInt(0, emojis.length)];

socket.on('connect', () => {
  socket.emit('new-user', name, (err) => {
    if (err) {
      return console.log(err);
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