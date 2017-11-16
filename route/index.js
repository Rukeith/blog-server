module.exports = api => {
  api.get('/', ctx => ctx.render('index', { title: 'Rukeith blog backend api server' }));
};
