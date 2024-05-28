import { prisma } from '../utils/prisma.util.js'

export const requireRoles = (allowedRoles) => {
    return async (req, res, next) => {
        // 인증 미들웨어가 req.user에 사용자 정보를 설정해줍니다.
        const userId = req.user.id;
        const userinfo = await prisma.userInfo.findFirst({
            where: { userid: userId }

        })

        // 허용된 역할 목록에 현재 사용자의 역할이 포함되어 있는지 확인합니다.
        if (!allowedRoles.includes(userinfo.role)) {
            return res.status(403).json({ message: '접근 권한이 없습니다.' });
        }

        // 사용자의 역할이 허용된 역할 중 하나라면 다음 미들웨어로 이동합니다.
        next();
    };
};

