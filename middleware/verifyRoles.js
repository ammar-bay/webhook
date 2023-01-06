const verifyRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req?.role) return res.sendStatus(401);
    const result = allowedRoles.includes(req.role);
    if (!result)
      return res
        .status(401)
        .json({ message: "Your role could not be verified for this request" });
    next();
  };
};

module.exports = verifyRoles;
