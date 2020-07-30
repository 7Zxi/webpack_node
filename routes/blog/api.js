module.exports = (app, control, mware) => {

    app.post('/register', control('blog/api:register'));

    app.post('/login', control('blog/api:login'));

    app.get('/logout', control('blog/api:logout'));

    app.get('/config', control('blog/api:getVal'));

    app.post('/upload', mware.upload(), control('blog/api:upload'));

}
