import jwt from 'jsonwebtoken';

export const tokenSign = (user) => {
  const sign = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h'
    }
  );
  return sign;
};

export const verifyToken = (tokenJwt) => {
  try {
    return jwt.verify(tokenJwt, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

