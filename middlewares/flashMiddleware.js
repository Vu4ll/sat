module.exports = (req, res, next) => {
    res.locals.messages = req.cookies.messages || {};
    res.clearCookie('messages');
    next();
};
