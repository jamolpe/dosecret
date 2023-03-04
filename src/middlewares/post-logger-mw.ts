import { DateWorker } from '../helpers/date';
import logger from '../helpers/logger';
import { RequestUuid } from '../models/requester';

const postLoggerMiddleware = (req: RequestUuid, res, next) => {
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = (...restArgs) => {
    chunks.push(Buffer.from(restArgs[0]));
    oldWrite.apply(res, restArgs);
  };

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    const now = new DateWorker();
    const difference = now.diff(req.start, 'milliseconds');
    if (
      [
        'login',
        'register',
        'confirm-password',
        'forgot-password',
        'auth',
        'api-docs'
      ].some((path) => req.url.includes(path))
    ) {
      logger.info(
        `request: ${req.uuid} ${req.ip} ${req.method} ${req.url} and response: NO DISPLAY on: ${difference} milliseconds`
      );
    } else {
      logger.info(
        `request: ${req.uuid} ${req.ip} ${req.method} ${
          req.url
        } and response: ${JSON.stringify(body)} on: ${difference} milliseconds`
      );
    }

    // console.log(body);
    oldEnd.apply(res, restArgs);
  };

  next();
};

export default postLoggerMiddleware;
