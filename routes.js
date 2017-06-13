const controllers = require('./controllers')
module.exports = [
  { method: 'GET', path: '/', handler: controllers.home.get },
  { method: 'POST', path: '/config', handler: controllers.config.post }
]