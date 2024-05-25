import express from 'express';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import UserRouter from './routers/auth.router.js';
import ResumeRouter from './routers/resumes.router.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = 3306;

app.use(express.json());
app.use(cookieParser());
app.use('/api', [UserRouter, ResumeRouter]);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
