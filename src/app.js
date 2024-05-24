import express from 'express';
import { json } from 'express';
import { prisma } from './utils/prisma.util.js'
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();
const port = 3306;

app.use(express, json());
app.use(errorHandler);

app.get('/', async (req, res) => {
    try {
        // 연결된 데이터베이스에 대한 간단한 쿼리를 수행하여 연결을 확인합니다.
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error('쿼리 실행 중 오류가 발생했습니다.', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 