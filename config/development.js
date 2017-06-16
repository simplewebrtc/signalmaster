module.exports = {
  talky: {
    apiKey: '',

    domains: {
      api: 'talky-core-api.local',
    },

    ice: {
      secret: 'foo',
      servers: [
        'http://ice.kestrel.link'
      ]
    }
  },
  db: {
    user: 'talky',
    password: 'password',
    database: 'talky_api'
  },
  server: {
    port: 8001, 
    host: 'localhost'
  }
}
