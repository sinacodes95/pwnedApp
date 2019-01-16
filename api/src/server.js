const express = require('express');
const cors = require('cors');
const routes = require('./routes/api')

const app = express();

app.use(cors());
app.use('/api', routes);


app.listen(4000, () => {
  console.log('Project set up');
});