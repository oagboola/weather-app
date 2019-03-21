import bunyan from 'bunyan';
import PrettyStream from 'bunyan-pretty-stream';

const log = bunyan.createLogger({
  name: 'Weather App',
  streams: [
    {
      level: 'debug',
      stream: new PrettyStream(),
    }
  ]
});

module.exports = log;
