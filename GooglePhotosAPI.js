let fs = require('fs-extra'),
  path = require('path'),
  request = require('request-promise-native');

class GooglePhotosAPI {
  static async listAlbums() {
    let response = await request.get('https://photoslibrary.googleapis.com/v1/albums', {
      headers: {
        "Authorization": `Bearer ${GooglePhotosAPI.token.access_token}`,
      },
    });

    return response;
  }

  static async uploadBytes(file) {
    let mediaID = await request.post({
      url: 'https://photoslibrary.googleapis.com/v1/uploads',
      body: fs.createReadStream(file),
      headers: {
        "Authorization": `Bearer ${GooglePhotosAPI.token.access_token}`,
        "X-Goog-Upload-File-Name": path.basename(file),
      },
    });

    return mediaID;
  }

  static async createMediaItem(mediaID, options = {}) {
    let body = {
      newMediaItems: [
        {
          simpleMediaItem: {
            uploadToken: mediaID,
          }
        }
      ]
    };

    if (options.album) {
      body.albumId = options.album;
    }

    let response = await request.post({
      url: 'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate',
      body: body,
      json: true,
      headers: {
        "Authorization": `Bearer ${GooglePhotosAPI.token.access_token}`,
      },
    });
  }
}

GooglePhotosAPI.token = null;

module.exports = GooglePhotosAPI;
