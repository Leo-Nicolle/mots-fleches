import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { type Express } from 'express';
import prisma from '../prisma';
import config from '../services/env';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.auth.jwtSecret,
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      // Fetch user from the database using Prisma
      const user = await prisma.users.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return done(null, false);
      }

      // Attach user to request object
      return done(null, user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return done(error, false);
    }
  })
);

export default function setupAuth(app: Express) {
  app.use(passport.initialize());
}
