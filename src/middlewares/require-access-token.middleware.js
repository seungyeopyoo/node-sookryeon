import jwt from 'jsonwebtoken';

export const requireAccessToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
        }

        req.userId = decoded.id;
        next();
    });
};