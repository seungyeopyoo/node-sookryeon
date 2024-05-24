import express from 'express';
import { json } from 'express';
import { prisma } from './utils/prisma.util.js'
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();
const port = 3306;

app.use(express, json());
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 