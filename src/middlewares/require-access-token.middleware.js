import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';

export const requireAccessToken = async (req, res, next) => {
    try {  // const token = req.headers['authorization']?.split(' ')[1]; 
        const { accessToken } = req.cookies
        console.log(accessToken);
        const encodedToken = accessToken.split(' ')[1];

        if (!accessToken) {
            return res.status(401).json({ message: '토큰이 없습니다.' });
        }

        const decoded = jwt.verify(encodedToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
            }
            return decoded
        });

        const userId = decoded.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        // →조회 된 사용자 정보를 req.user에 담고, 다음 동작을 진행합니다.

        req.user = user;

        next();

    } catch (err) {
        next(err);
    }
};

