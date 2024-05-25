import express from 'express';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import UserRouter from './routers/auth.router.js'

const app = express();
const port = 3306;

app.use(express.json());
app.use(errorHandler);
app.use('/api', [UserRouter]);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 