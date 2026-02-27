const DEV_USER = {
  id: 'dev-user-1',
  email: 'dev@chantier-pro.fr',
  name: 'Utilisateur Dev',
};

export const authenticateToken = (req, res, next) => {
  req.user = DEV_USER;
  next();
};
