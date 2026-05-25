import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { corsOptions } from './config/cors.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// CORS (whitelist-based) + preflight
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (sementara)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server Heartz API beroperasi dengan baik',
  });
});

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;