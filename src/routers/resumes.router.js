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
    // 사용자 ID는 미들웨어를 통해 req.user에 설정됨
    const { id } = req.user;

    // 새로운 이력서 생성
    const newResume = await prisma.resume.create({
        data: {
            userid: id,
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
        status: newResume.applystatus,
        createdAt: newResume.createdAt,
        updatedAt: newResume.updatedAt,
        message: '새로운 이력서가 생성되었습니다.',
    });
});
/** 이력서 목록 조회 API (🔐 AccessToken 인증 필요) 내가 등록 한 이력서 목록을 조회합니다.*/

// → 사용자 정보는 인증 Middleware(req.user)를 통해서 전달 받습니다.
router.get('/resume', requireAccessToken, async (req, res, next) => {
    const { id } = req.user;
    // → 쿼리 파라미터에서 정렬 조건을 가져옵니다. 기본값은 'DESC'입니다.
    const { sort, status } = req.query;
    // → 생성일시 기준 정렬은 과거순(ASC), 최신순(DESC)으로 전달 받습니다. 
    // 정렬 조건이 'ASC' 또는 'DESC' 중 하나인지 확인합니다. 그렇지 않으면 기본값 'DESC'를 사용합니다.
    // 값이 없는 경우 최신순(DESC) 정렬을 기본으로 합니다. 대소문자 구분 없이 동작해야 합니다.
    const sortOrder = sort ? sort.toLowerCase() : 'desc';
    // → 지원 상태 별 필터링 조건을 받습니다. 값이 없는 경우 모든 상태의 이력서를 조회합니다
    const statusFilter = status ? status.toUpperCase() : undefined;
    // 현재 로그인 한 사용자가 작성한 이력서 목록만 조회합니다.
    // → DB에서 이력서 조회 시 작성자 ID가 일치해야 합니다.
    // → 정렬 조건에 따라 다른 결과 값을 조회합니다.
    // → 작성자 ID가 아닌 작성자 이름을 반환하기 위해 스키마에 정의 한 Relation을 활용해 조회합니다.
    const { role } = await prisma.userInfo.findFirst({
        where: { userid: id },
        select: { role: true }
    });
    // 역할이 RECRUITER 인 경우 모든 사용자의 이력서를 조회할 수 있습니다.APPLICANT RECRUITER
    const resume = await prisma.resume.findMany({
        where: {
            userid: role === 'APPLICANT' ? id : undefined,
            applystatus: statusFilter,

        },
        select: {
            resumeid: true,
            userid: true,
            title: true,
            content: true,
            applystatus: true,
            createdAt: true,
            updatedAt: true,
            UserInfo: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: sortOrder
        }


    });
    // 일치하는 값이 없는 경우 → 빈 배열([])을 반환합니다. (StatusCode: 200)
    if (!resume) {
        return res.status(200).json([]);
    }
    // → 이력서 ID, 작성자 이름, 제목, 자기소개, 지원 상태, 생성일시, 수정일시의 목록을 반환합니다.
    const result = resume.map(resume => ({
        resumeid: resume.resumeid,
        userid: resume.userid,
        name: resume.UserInfo.name,
        title: resume.title,
        content: resume.content,
        applystatus: resume.applystatus,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
    }));
    return res.status(200).json({ data: result });
});
/**이력서 상세 조회 API (🔐 AccessToken 인증 필요) 내가 등록 한 이력서의 상세 정보를 조회합니다. */

// → 사용자 정보는 인증 Middleware(req.user)를 통해서 전달 받습니다.
// → 이력서 ID를 Path Parameters(req.params)로 전달 받습니다.
router.get('/resume/:resumeid', requireAccessToken, async (req, res, next) => {
    const userId = req.userId;
    const { resumeid } = req.params;
    // → 현재 로그인 한 사용자가 작성한 이력서만 조회합니다.
    // → DB에서 이력서 조회 시 이력서 ID, 작성자 ID가 모두 일치해야 합니다.
    // → 작성자 ID가 아닌 작성자 이름을 반환하기 위해 스키마에 정의 한 Relation을 활용해 조회합니다.
    const resume = await prisma.resume.findUnique({
        where: {
            userid: userId,
            resumeid: +resumeid
        },
        select: {
            resumeid: true,
            userid: true,
            title: true,
            content: true,
            applystatus: true,
            createdAt: true,
            updatedAt: true,
            UserInfo: {
                select: {
                    name: true
                }
            }
        }
    });
    // → 이력서 정보가 없는 경우 → “이력서가 존재하지 않습니다.”
    if (!resume) {
        return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
    }

    // 이력서 ID, 작성자 이름, 제목, 자기소개, 지원 상태, 생성일시, 수정일시를 반환합니다.
    const result = {
        resumeid: resume.resumeid,
        userid: resume.userid,
        name: resume.UserInfo.name,
        title: resume.title,
        content: resume.content,
        applystatus: resume.applystatus,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
    };
    return res.status(200).json({ data: result });
})
/** 이력서 수정 API (🔐 AccessToken 인증 필요) 내가 등록 한 이력서를 수정합니다.*/

// → 사용자 정보는 인증 Middleware(req.user)를 통해서 전달 받습니다.
router.patch('/resume/:resumeid', requireAccessToken, async (req, res, next) => {
    // → 이력서 ID를 Path Parameters(req.params)로 전달 받습니다.
    // → 제목, 자기소개를 Request Body(req.body)로 전달 받습니다.
    const userId = req.userId;
    const { resumeid } = req.params;
    const { title, content } = req.body;
    // → 제목, 자기소개 둘 다 없는 경우 → “수정 할 정보를 입력해 주세요.”
    if (!title && !content) {
        return res.status(404).json({ message: '수정 할 정보를 입력해 주세요.' });
    }
    // → 이력서 정보가 없는 경우 → “이력서가 존재하지 않습니다.”
    if (!resumeid) {
        return res.status(400).json({ message: '이력서가 존재하지 않습니다.' });
    }
    // → 현재 로그인 한 사용자가 작성한 이력서만 수정합니다.
    // → DB에서 이력서 조회 시 이력서 ID, 작성자 ID가 모두 일치해야 합니다.
    const resume = await prisma.resume.findFirst({
        where: {
            userid: userId,
            resumeid: +resumeid
        },
        select: {
            resumeid: true,
            userid: true,
            title: true,
            content: true,
            applystatus: true,
            createdAt: true,
            updatedAt: true,
            UserInfo: {
                select: {
                    name: true
                }
            }
        }
    });
    // → 이력서 정보가 없는 경우 → “이력서가 존재하지 않습니다.”
    if (!resume) {
        return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
    }
    // → DB에서 이력서 정보를 수정합니다.
    // → 제목, 자기소개는 개별 수정이 가능합니다.
    const updatedResume = await prisma.resume.update({
        where: { resumeid: +resumeid },
        data: {
            ...(title && { title }),
            ...(content && { content }),
        },
    });
    // → 수정 된 이력서 ID, 작성자 ID, 제목, 자기소개, 지원 상태, 생성일시, 수정일시를 반환합니다.
    return res.status(200).json({ data: updatedResume });
})
/** 이력서 삭제 API (🔐 AccessToken 인증 필요) 내가 등록 한 이력서를 삭제합니다.*/

// → 사용자 정보는 인증 Middleware(req.user)를 통해서 전달 받습니다.
router.delete('/resume/:resumeid', requireAccessToken, async (req, res, next) => {
    // → 이력서 ID를 Path Parameters(req.params)로 전달 받습니다.
    const { resumeid } = req.params;
    const userId = req.userId;
    // → 이력서 정보가 없는 경우 → “이력서가 존재하지 않습니다.”
    if (!resumeid) {
        return res.status(400).json({ message: '이력서가 존재하지 않습니다.' });
    }
    // → DB에서 이력서 조회 시 이력서 ID, 작성자 ID가 모두 일치해야 합니다.
    const resume = await prisma.resume.findFirst({
        where: {
            userid: userId,
            resumeid: +resumeid
        },
    });
    if (!resume) {
        return res.status(404).json({ message: '이력서를 찾을 수 없습니다.' });
    }
    // → DB에서 이력서 정보를 삭제합니다.
    const deleteResume = await prisma.resume.delete({
        where: { resumeid: +resumeid },
    });
    // → 삭제 된 이력서 ID를 반환합니다.
    const result = {
        resumeid: deleteResume.resumeid,
    };
    return res.status(200).json({ data: result });
})

export default router;
