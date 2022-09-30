// imports winston...
const winston = require('winston');
const JsonSerializer = require('./json-serializer');
const { splat, combine, timestamp, printf } = winston.format;
const configuration = require('../configuration');

module.exports = class Logger {

  constructor() {
    const customFormat = printf(({
      timestamp,
      level,
      message,
      label = '',
      ...meta
    }) => `[${level.toUpperCase()}] [${timestamp}]${label} ${message} ${JsonSerializer.serialize(meta, 2, false)}`);

    this.logger = winston.createLogger({
      level: 'info',
      format: combine(
        timestamp({ format: 'MMM D, YYYY hh:mm:ss A', }),
        splat(),
        customFormat,
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: `${configuration.logsDirectory}/error${configuration.instanceId ? `-${configuration.instanceId}` : ''}.log`, level: 'error' }),
        new winston.transports.File({ filename: `${configuration.logsDirectory}/combined${configuration.instanceId ? `-${configuration.instanceId}` : ''}.log` }),
      ],
    });

    // overrides console methods with winston logger methods...
    global.console.log = this.logger.info.bind(this.logger);
    global.console.info = this.logger.info.bind(this.logger);
    global.console.warn = this.logger.warn.bind(this.logger);
    global.console.error = this.logger.error.bind(this.logger);
    global.console.debug = this.logger.debug.bind(this.logger);
  }

  static instance = new Logger();

  /**
   * 
   * @returns {winston.Logger}
   */
  static getInstance() {
    return this.instance.logger;
  }
};
