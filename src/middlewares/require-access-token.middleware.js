import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';

export const requireAccessToken = async (req, res, next) => {
    try {
        // const { accessToken } = req.cookies
        const accessToken = req.headers['authorization'];
        const [tokenType, encodedToken] = accessToken.split(' ');

        // → Authorization 또는 AccessToken이 없는 경우- “인증 정보가 없습니다.”
        if (!accessToken) {
            return res.status(401).json({ message: '인증 정보가 없습니다.' });
        }
        // → JWT 표준 인증 형태와 일치하지 않는 경우- “지원하지 않는 인증 방식입니다.”
        if (tokenType !== 'Bearer') {
            return res.status(401).json({ message: '지원하지 않는 인증 방식입니다.' });
        }
        // // → 그 밖의 AccessToken 검증에 실패한 경우- “인증 정보가 유효하지 않습니다.” 토큰해석시에 유효한게 아닐때  
        const decoded = jwt.verify(encodedToken, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        })
        // // → Payload에 담긴 사용자 ID와 일치하는 사용자가 없는 경우- “인증 정보와 일치하는 사용자가 없습니다.”
        if (!user) {
            return res.status(401).json({ message: '인증 정보와 일치하는 사용자가 없습니다.' });
        }
        // →조회 된 사용자 정보를 req.user에 담고, 다음 동작을 진행합니다.
        req.user = user;

        next();

    } catch (err) {
        switch (err.name) {
            case 'TokenExpiredError':
                return res.status(401).json({ message: '인증 정보가 만료되었습니다.' });
            case 'JsonWebTokenError':
                return res.status(401).json({ message: '인증 정보가 유효하지 않습니다.' });
            default:
                next(err);
        }
    }
};

