import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '..', '.env.jwt') });

const JWT_SECRET = process.env.JWT_SECRET as string;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (payload, done) => {
    try {
      // Replace with a real database lookup
      const user = { id: payload.userId, email: 'user@example.com' }; // Mock user
      if (user) return done(null, user);
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
