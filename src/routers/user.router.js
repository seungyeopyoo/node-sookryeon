import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import bcrypt from 'bcrypt';

const router = express.Router();
// 회원가입 API 
router.post('/sign-up', async (req, res, next) => {
    // 이메일 비밀번호 비밀번호 확인 이름을 req.body로 전달 받습니다.
    const { email, password, passwordConfirm, name } = req.body;
    //     - 회원 정보 중 하나라도 빠진 경우 - “OOO을 입력해 주세요.”
    if (!email) {
        return res.status(400).json({ message: '이메일을 입력해주세요' });
    }
    if (!password) {
        return res.status(400).json({ message: '비밀번호를 입력해주세요' });
    }
    if (!passwordConfirm) {
        return res.status(400).json({ message: '비밀번호 확인을 입력해주세요' });
    }
    if (!name) {
        return res.status(400).json({ message: '이름을 입력해주세요' });
    }
    //     - 이메일 형식에 맞지 않는 경우 - “이메일 형식이 올바르지 않습니다.”
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '이메일 형식이 올바르지 않습니다.' });
    }
    //     - 이메일이 중복되는 경우 - “이미 가입 된 사용자입니다.”
    const isExistUser = await prisma.user.findUnique({
        where: { email: email },
    });
    if (isExistUser) {
        return res.status(400).json({ message: '이미 가입된 사용자입니다.' });
    }
    //     - 비밀번호가 6자리 미만인 경우 - “비밀번호는 6자리 이상이어야 합니다.”
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: '비밀번호는 6자 이상이어야합니다.' })
    }
    //     - 비밀번호와 비밀번호 확인이 일치하지 않는 경우 - “입력 한 두 비밀번호가 일치하지 않습니다.”
    if (password !== passwordConfirm) {
        return res.status(400).json({ message: '입력하신 비밀번호가 불일치합니다' });
    }
    //     - 사용자 ID, 역할, 생성일시, 수정일시는 자동 생성됩니다. 
    //     - 역할의 종류는 다음과 같으며, 기본 값은 `APPLICANT` 입니다. - 채용 담당자 `RECRUITER`
    //     - 보안을 위해 비밀번호는 평문(Plain Text)으로 저장하지 않고 Hash 된 값을 저장합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        }
    });

    await prisma.userInfo.create({
        data: {
            userId: user.id, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
            name,
        },
    });
    //  -  사용자 ID, 이메일, 이름, 역할, 생성일시, 수정일시를 반환합니다.
    return res.status(201).json({
        id: user.id,
        email,
        name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    })
});

export default router;
