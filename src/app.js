import express from 'express';
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();
const port = 3010;

app.use(errorHandler);



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 