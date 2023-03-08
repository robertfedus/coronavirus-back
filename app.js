const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const authRouter = require('./routes/authRoutes');
const connRouter = require('./routes/connectionRoutes');
const doctorRouter = require('./routes/doctorRoutes');
const patientRouter = require('./routes/patientRoutes');
const updateRouter = require('./routes/updateRoutes');

app.use(morgan());
app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/connect', connRouter);
app.use('/api/v1/doctor', doctorRouter);
app.use('/api/v1/patient', patientRouter);
app.use('/api/v1/update', updateRouter);

module.exports = app;
