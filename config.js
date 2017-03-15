// module
// exports config
module.exports = {
  // mongo, obj
  mongo: {
    // db name
    name: 'test_mongoose_populate',
    // localhost
    host: '127.0.0.1',
    // port
    port: 27017,
    // username
    username: 'test_mongoose_populate',
    // password
    password: 'test_mongoose_populate',
    url: function() {
      return ['mongodb://',
        this.username, ':',
        this.password, '@',
        this.host, ':', this.port, '/', this.name].join('');
    }
  },
  mongoOptions: {
    server: {
      poolSize: 1,
      socketOptions: {
        auto_reconnect: true
      }
    }
  }
}
