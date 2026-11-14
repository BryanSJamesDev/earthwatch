import express from "express";
import bcrypt from "bcryptjs";
import passport from "../lib/passport.js";
import usersDB from "../db/usersDB.js";

const router = express.Router();
const myDB = usersDB();

const USERNAME_PATTERN = /^[a-z0-9_.-]{3,30}$/;
const MIN_PASSWORD = 8;
// bcrypt ignores anything past 72 bytes
const MAX_PASSWORD = 72;

// only what the frontend needs, never the password hash
const publicUser = (user) => ({ _id: user._id, username: user.username });

// returns an error message, or null if the username and password are ok
const checkCredentials = (username, password) => {
  if (!USERNAME_PATTERN.test(username)) {
    return "Username must be 3-30 characters: letters, numbers, . _ or -";
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return `Password must be at least ${MIN_PASSWORD} characters`;
  }
  if (Buffer.byteLength(password) > MAX_PASSWORD) {
    return `Password must be ${MAX_PASSWORD} characters or less`;
  }
  return null;
};

router.get("/me", (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

router.post("/register", async (req, res, next) => {
  try {
    const username = String(req.body.username || "")
      .trim()
      .toLowerCase();
    const { password } = req.body;

    const error = checkCredentials(username, password);
    if (error) {
      return res.status(400).json({ error });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await myDB.createUser({ username, passwordHash });
    if (!user) {
      return res.status(409).json({ error: "That username is taken" });
    }

    // log the new user straight in
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json({ user: publicUser(user) });
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Failed to register" });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error logging in:", err);
      return res.status(500).json({ error: "Failed to log in" });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || "Login failed" });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ user: publicUser(user) });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

export default router;
