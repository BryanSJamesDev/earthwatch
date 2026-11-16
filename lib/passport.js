import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import usersDB from "../db/usersDB.js";

const myDB = usersDB();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await myDB.findByUsername(username);
      // same message for both cases so it doesn't reveal which usernames exist
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return done(null, false, { message: "Wrong username or password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// only the id goes in the session, the user is looked up on each request
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await myDB.findById(id);
    // a deleted user just ends up logged out
    done(null, user ? { _id: user._id, username: user.username } : false);
  } catch (err) {
    done(err);
  }
});

export default passport;
