let Command = require('node-climax').Command,
  Logger = require('node-climax').Logger,
  http = require('http'),
  fs = require('fs-extra'),
  querystring = require('querystring'),
  request = require('request-promise-native'),
  GooglePhotosAPI = require('./GooglePhotosAPI');

class GoogleCommand extends Command {
  async run(args, options) {
    this.user = this.config.get('google.user');

    if (!this.user) {
      throw Error(`Please set the active user with the 'config' command.`);
    }

    this.token = null;

    if (options.server) {
      if (!this.config.get('google.client_id') || !this.config.get('google.client_secret')) {
        Logger.error("Cannot run local authentication without client_id and client_secret config values.");
        Command.shutdown(1);
      }

      await this.runOAuthServer();
      Command.shutdown(0);
    }

    try {
      this.token = JSON.parse(fs.readFileSync(`${Command.getCacheDirectory()}/${this.user}.token`));
    } catch(e) {}

    if (!this.token && this.config.get('google.client_id') && this.config.get('google.client_secret')) {
      Logger.error(`Invalid token for user ${this.user}. Please run with '-s' to authenticate locally.`);
      Command.shutdown(0);
    } else {
      Logger.warn(`Authentication required`);
      return await this.runRemoteAuth();
    }

    if (this.token.time + (this.token.expires_in * 1000) < Date.now()) {
      Logger.verbose('Requesting refresh token...');
      await this.renewToken();
    }

    this.userInfo = await this.getUserInfo();
    GooglePhotosAPI.token = this.token;
  }

  async renewToken() {
    var authOptions = {
      url: 'https://accounts.google.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(this.config.get('google.client_id') + ':' + this.config.get('google.client_secret')).toString('base64'))
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: this.token.refresh_token,
      },
      json: true
    };

    try {
      let response = await request.post(authOptions);

      for (var key in response) {
        this.token[key] = response[key];
      }

      this.token.time = Date.now();
      Logger.debug('Writing token file');
      fs.writeFileSync(`${Command.getCacheDirectory()}/${this.user}.token`, JSON.stringify(this.token));

      return;
    } catch (err) {
      Logger.error(err);
    }
  }

  asycn runRemoteAuth() {

  }

  async runOAuthServer() {
    Logger.info(`https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify({
      client_id: this.config.get('google.client_id'),
      redirect_uri: 'http://localhost:8080',
      response_type: 'code',
      scope: this.config.get('google.scopes').split(',').join(' '),
    })}`);

    return new Promise((resolve, reject) => {
      http.createServer((req, res) => {
        if (req.url.match(/code=/)) {
          let code = decodeURIComponent(querystring.parse(req.url.replace(/^\/\?/, '')).code);
          Logger.debug(`Found code ${code} in request ${req.url}`);

          var authOptions = {
            url: `https://www.googleapis.com/oauth2/v4/token`,
            form: {
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: 'http://localhost:8080',
            },
            headers: {
              'Authorization': 'Basic ' + (new Buffer(this.config.get('google.client_id') + ':' + this.config.get('google.client_secret')).toString('base64'))
            },
            json: true
          };

          return request.post(authOptions)
            .then(response => {
              let body = response;
              body.time = Date.now();
              this.token = body;
              fs.writeFileSync(`${Command.getCacheDirectory()}/${this.user}.token`, JSON.stringify(this.token));
              Logger.info('Done!');
              resolve();
            })
            .catch(err => {
              reject(err);
            });
        }
      }).listen(8080);
    });
  }

  async getUserInfo() {
    let response = await request.get({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo?alt=json',
      headers: {
        Authorization: `Bearer ${this.token.access_token}`,
      },
      json: true,
    });
  }
}

module.exports = GoogleCommand;
