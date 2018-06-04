let App = require('node-climax').App;
(new App('gphotos'))
  .init({
    'init': {
      usage: '',
      desc: 'Initialize access',
      options: {},
      file: `${__dirname}/GoogleCommand`,
    },
    'album:create': {
      usage: '',
      desc: 'Create photo album',
      options: {},
      file: `${__dirname}/CreateAlbumCommand`,
    },
    'ls': {
      usage: '',
      desc: 'List library albums, contents, or album contents',
      options: {},
      file: `${__dirname}/ListCommand`,
    },
    'upload': {
      usage: '',
      desc: 'Upload files',
      options: {
        album: {
          group: 'Options:',
          alias: 'a',
          demand: false,
          desc: 'Add images to specified album',
          type: 'string'
        }
      },
      file: `${__dirname}/UploadCommand`,
    },
  }, {
    'google.client_id': {
      type: 'string',
      default: '',
    },
    'google.client_secret': {
      type: 'string',
      default: '',
    },
    'google.user': {
      type: 'string',
      default: '',
    },
    'google.scopes': {
      type: 'string',
      default: 'https://www.googleapis.com/auth/userinfo.profile,https://www.googleapis.com/auth/photoslibrary,https://www.googleapis.com/auth/photoslibrary.sharing',
    },
  }, {
    server: {
      group: 'Global Flags:',
      alias: 's',
      demand: false,
      desc: 'Run oAuth for access',
      type: 'boolean',
    },
  })
  .run();
