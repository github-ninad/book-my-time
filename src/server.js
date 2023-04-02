const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
const morganlogger = morgan('combined');
app.use(morganlogger);


app.post('/hello', async (req, res) => {
  return res.json({
    hello: "world"
  });
});

app.listen(PORT);
