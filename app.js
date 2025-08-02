const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require('./routes/index');
require('dotenv').config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); //req.body 를 객체로 인식하기 위해 필요

app.use('/api', indexRouter);

const mongoURI = process.env.LOCAL_DB_ADDRESS;
mongoose
  .connect(mongoURI, { useNewUrlParser: false })
  .then(() => console.log('DB connection is successed!'))
  .catch((err) => console.log('DB connection is failed', err));

app.listen(process.env.PORT || 5000, () => console.log('Server On!'));
