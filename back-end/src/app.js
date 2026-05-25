import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (sementara)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server Heartz API beroperasi dengan baik',
  });
});

// 404 handler (setelah semua route)
app.use(notFound);

// Centralized error handler (paling bawah)
app.use(errorHandler);

export default app;