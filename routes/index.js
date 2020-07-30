module.exports = (app, control, mware) =>{
    app.get('/', mware.response.render('home.html'));

    app.get('/user', mware.response.render('user/acc.html'));
}
