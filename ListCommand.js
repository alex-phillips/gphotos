let GoogleCommand = require('./GoogleCommand'),
  Logger = require('node-climax').Logger,
  fs = require('fs-extra'),
  path = require('path'),
  request = require('request-promise-native'),
  GooglePhotosAPI = require('./GooglePhotosAPI');

class ListCommand extends GoogleCommand {
  async run(args, options) {
    await super.run(args, options);

    let type = args[0];
    switch (type) {
      case 'albums':
        let albums = await GooglePhotosAPI.listAlbums();
        break;
      case 'album':
        // let data = await GooglePhotosAPI.listAlbumContents(args[1]);
        // break;
    }
  }
}

module.exports = ListCommand;
