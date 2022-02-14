import { LOG_COLORS } from './reader/utils/log-colors';
import { LogType } from './reader/models/log-name.enum';
import { customLog } from './reader/utils/custom-log';
import { ColdFusionLogReader } from './reader';

(async () => {
  const reader = new ColdFusionLogReader();
  await reader.startReaderByErrorType(LogType.EXCEPTION, LOG_COLORS.text.red);
  await reader.startReaderByErrorType(
    LogType.REST_SERVICE,
    LOG_COLORS.text.yellow
  );
  await reader.startReaderByErrorType(LogType.SERVER, LOG_COLORS.text.green);
  customLog(LOG_COLORS.text.cyan, 'App Running');
})();
