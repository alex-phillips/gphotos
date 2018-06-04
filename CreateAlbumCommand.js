let GoogleCommand = require('./GoogleCommand'),
  Logger = require('node-climax').Logger,
  fs = require('fs-extra'),
  path = require('path'),
  request = require('request-promise-native'),
  GooglePhotosAPI = require('./GooglePhotosAPI');

class CreateAlbumCommand extends GoogleCommand {
  async run(args, options) {
    await super.run(args, options);
    await this.createAlbum(args[0]);
  }

  async createAlbum(albumName) {
    Logger.info(`Creating album ${albumName}`);

    // Upload media bytes
    let response = await request.post({
      url: 'https://photoslibrary.googleapis.com/v1/albums',
      json: true,
      body: {
        album: {
          title: albumName,
        },
      },
      headers: {
        "Authorization": `Bearer ${this.token.access_token}`,
      },
    });

    Logger.debug(`Album ID: ${response.id}`);
  }
}

module.exports = CreateAlbumCommand;
