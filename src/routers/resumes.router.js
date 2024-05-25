import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();
/** 이력서 생성 API (🔐 AccessToken 인증 필요) 새로운 이력서를 생성합니다.*/

// 사용자 정보는 인증 Middleware(req.user)를 통해서 전달 받습니다.
router.post('/resume', requireAccessToken, async (req, res, next) => {
    // 제목, 자기소개를 Request Body(req.body)로 전달 받습니다.
    const { title, content } = req.body;
    // → 제목, 자기소개 중 하나라도 빠진 경우→ “OO을 입력해 주세요”
    if (!title) {
        return res.status(400).json({ message: '제목을 입력해 주세요' });
    }
    if (!content) {
        return res.status(400).json({ message: '자기소개를 입력해 주세요' });
    }
    // → 자기소개 글자 수가 150자 보다 짧은 경우 → “자기소개는 150자 이상 작성해야 합니다.”
    if (content.length < 150) {
        return res.status(400).json({ message: '자기소개는 150자 이상 작성해야 합니다.' });
    }

    // 사용자 ID는 미들웨어를 통해 req.userId에 설정됨
    const userId = req.userId;

    // 새로운 이력서 생성
    const newResume = await prisma.resume.create({
        data: {
            userid: userId,
            title,
            content,
        }
    });
    // → 이력서 ID, 작성자 ID, 제목, 자기소개, 지원 상태, 생성일시, 수정일시를 반환합니다.
    return res.status(201).json({
        resumeid: newResume.resumeid,
        userid: newResume.userid,
        title: newResume.title,
        content: newResume.content,
        status: newResume.status,
        createdAt: newResume.createdAt,
        updatedAt: newResume.updatedAt,
        message: '새로운 이력서가 생성되었습니다.',
    });
});

export default router;