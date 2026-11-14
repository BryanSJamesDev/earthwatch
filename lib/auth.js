// route guard for anything that needs a logged in user
export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "You need to log in first" });
  }
  next();
};
