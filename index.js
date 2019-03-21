import express from 'express';

import log from './log';

const app = express();
const PORT = process.env.PORT || '3000';

app.listen(PORT, () => {
  log.info('App running on port', PORT)
})
