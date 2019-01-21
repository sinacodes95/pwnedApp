const express = require('express');
const cors = require('cors');
const routes = require('./routes/api');
const bodyParser = require('body-parser')

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api', routes);


// error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({err: err.message});
});

app.listen(4000, () => {
  console.log('Project set up');
});