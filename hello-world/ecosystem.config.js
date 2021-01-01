module.exports = {
  apps : [{
    name: 'APP',
    script: 'app.js',
    args: 'one two',
    instance: 0,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:YouheiNozaki/nodejs-practice.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
    }
  }
};
