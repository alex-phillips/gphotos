let GoogleCommand = require('./GoogleCommand'),
  Logger = require('node-climax').Logger,
  fs = require('fs-extra'),
  path = require('path'),
  request = require('request-promise-native'),
  GooglePhotosAPI = require('./GooglePhotosAPI');

class UploadCommand extends GoogleCommand {
  async run(args, options) {
    await super.run(args, options);
    for (let file of args) {
      let stat = fs.statSync(file);
      if (stat.isDirectory()) {
        let files = await UploadCommand.walk(file);
        for (let f of files) {
          await this.upload(f, options);
        }
      } else {
        await this.upload(file, options);
      }
    }
  }

  async upload(file, options = {}) {
    let stat = fs.statSync(file);
    if (stat.isDirectory()) {
      let files = await UploadCommand.walk(file);
      for (let f of files) {
        return await this.upload(f);
      }
    }

    Logger.info(`Uploading ${file}`);

    // Upload media bytes
    let mediaID = await GooglePhotosAPI.uploadBytes(file);

    Logger.debug(`Media ID: ${mediaID}`);

    // Turn media bytes into media object
    let response = await GooglePhotosAPI.createMediaItem(mediaID, {
      album: options.album,
    });

    Logger.debug(`Response: ${JSON.stringify(response)}`);
  }

  async uploadFile(file, options) {

  }

  static walk(dir) {
    return new Promise((resolve, reject) => {
      let results = [];

      fs.readdir(dir, function (err, list) {
        if (err) {
          return reject(err);
        }

        var pending = list.length;

        if (!pending) {
          return resolve(results);
        }

        list.forEach(function (file) {
          file = path.resolve(dir, file);

          let stat = fs.statSync(file);
          // If directory, execute a recursive call
          if (stat && stat.isDirectory()) {
            // Add directory to array [comment if you need to remove the directories from the array]
            results.push(file);

            return UploadCommand.walk(file)
              .then(res => {
                results = results.concat(res);
                if (!--pending) {
                  resolve(results);
                }
              })
              .catch(reject)
          } else {
            results.push(file);

            if (!--pending) {
              resolve(results);
            }
          }
        });
      });
    });
  }
}

module.exports = UploadCommand;
