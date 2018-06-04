# GPhotos

GPhotos is a NodeJS SDK and CLI for interacting with and building applications with the new [Google Photos Library API](https://developers.google.com/photos/).

### Installation
`npm install -g gphotos`

### Usage

Before using the CLI, you must authenticate with Google's API. If you have your own API access, you can authenticate with your own credentials by setting the proper config values:

```
gphotos config google.client_id CLIENT_ID
gphotos config google.client_secret CLIENT_SECRET
```

Once done, or if you do not have your own credentials, start then authentication process with `gphotos init -s`.

***NOTE*** You will need to use your own credentials until Google removes the restrictions from their API as it is currently in a developer preview mode.
