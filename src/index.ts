import { LOG_COLORS } from './reader/utils/log-colors';
import { LogType } from './reader/models/log-name.enum';
import { startReaderByErrorType } from './reader/reader';
import { customLog } from './reader/utils/custom-log';

(async () => {
  await startReaderByErrorType(LogType.EXCEPTION, LOG_COLORS.text.red);
  await startReaderByErrorType(LogType.REST_SERVICE, LOG_COLORS.text.yellow);
  await startReaderByErrorType(LogType.SERVER, LOG_COLORS.text.green);
  customLog(LOG_COLORS.text.cyan, 'App Running');
})();
