module.exports = (app, control, mware) =>{
    app.get('/', mware.response.render('home.html', {name: 'qzx', age: 18}));

    app.get('/user', mware.response.render('user/acc.html'));
}
