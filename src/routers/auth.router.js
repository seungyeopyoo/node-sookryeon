import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();

// 액세스 토큰 생성 함수
// AccessToken(Payload에 사용자 ID를 포함하고 유효기간이 12시간)을 생성합니다.
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
    try {
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
            return res
                .status(400)
                .json({ message: '이메일 형식이 올바르지 않습니다.' });
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
            return res
                .status(400)
                .json({ success: false, message: '비밀번호는 6자 이상이어야합니다.' });
        }
        //     - 비밀번호와 비밀번호 확인이 일치하지 않는 경우 - “입력 한 두 비밀번호가 일치하지 않습니다.”
        if (password !== passwordConfirm) {
            return res
                .status(400)
                .json({ message: '입력하신 비밀번호가 불일치합니다' });
        }
        //     - 사용자 ID, 역할, 생성일시, 수정일시는 자동 생성됩니다.
        //     - 역할의 종류는 다음과 같으며, 기본 값은 `APPLICANT` 입니다. - 채용 담당자 `RECRUITER`
        //     - 보안을 위해 비밀번호는 평문(Plain Text)으로 저장하지 않고 Hash 된 값을 저장합니다.
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        const userinfo = await prisma.userInfo.create({
            data: {
                userid: user.id, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
                name,
            },
        });
        //  -  사용자 ID, 이메일, 이름, 역할, 생성일시, 수정일시를 반환합니다.
        return res.status(201).json({
            message: '회원가입에 성공하였습니다.',
            data: {
                id: user.id,
                email,
                name,
                role: userinfo.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (err) {
        next(err);
    }
});
// 로그인 API
// 이메일 비밀번호를 req.body로 전달 받습니다.
router.post('/sign-in', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // → 로그인 정보 중 하나라도 빠진 경우 - “OOO을 입력해 주세요.”
        if (!email) {
            return res.status(400).json({ message: '이메일을 입력해주세요' });
        }
        if (!password) {
            return res.status(400).json({ message: '비밀번호를 입력해주세요' });
        }
        // → 이메일 형식에 맞지 않는 경우 - “이메일 형식이 올바르지 않습니다.”
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({ message: '이메일 형식이 올바르지 않습니다.' });
        }
        // → 이메일로 조회가 불가하거나 비밀번호가 다를 경우 - “인증 정보가 유효하지 않습니다”
        const user = await prisma.user.findUnique({
            where: { email: email }, // DB안의 email 컬럼안의 값이 req.body로 전달된email과 일치하는행을 user로 선언
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            //email 불일치거나 user객체의 비번이랑 DB해싱비번이 불일치면
            return res.status(400).json({ message: '인증 정보가 유효하지 않습니다.' });
        }

        const token = generateAccessToken(user.id);
        // res.cookie('accessToken', `Bearer ${token}`); //accessToken을 cookie로 반환합니다.


        return res.status(200).json({
            message: '로그인에 성공했습니다.',
            generateAccessToken: `Bearer ${token}`
        });
    } catch (err) {
        next(err);
    }
});

export default router;
