import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();

/**내 정보 조회 API  (AccessToken 인증 필요) 인증 된 사용자의 정보를 조회합니다. */
router.get('/user', requireAccessToken, async (req, res, next) => {
    // →사용자 정보는 인증 Middleware(req.user)를 통해서 전달 받습니다.
    const { id, email, createdAt, updatedAt } = req.user;

    const { name, role } = await prisma.userInfo.findUnique({ where: { userid: id } });
    // →사용자 ID, 이메일, 이름, 역할, 생성일시, 수정일시를 반환합니다.
    return res.status(200).json({
        data: {
            userid: id,
            email: email,
            name: name,
            role: role,
            createdAt: createdAt,
            updatedAt: updatedAt,
        }
    });
});
export default router;