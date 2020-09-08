const express = require('express');
const indexRouter = require('./router/index');
const throttle = require('./middleware/throttle');
const app = express();

app.use(throttle(60));
app.use('', indexRouter);
app.listen(3000, () => console.log(`Listening on port 3000`));