const post = (req, reply) => {
  reply(`I got ${req.payload.sup}`)
}

module.exports = {
  post
}