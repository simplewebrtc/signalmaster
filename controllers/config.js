const post = (req, reply) => {
  reply(`I got ${req.payload}`)
}

module.exports = {
  post
}