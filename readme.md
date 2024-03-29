
# Grants

## Requirements

 - docker
 - docker-compose
 - nodejs >= 8.x

## Quick setup

```sh
npm install # install dependencies (first time)
npm run setup # creates directories (once only)
# vim ./data/config/config.js # put your email in .authorizedEmail and edit any other setting
npm run build:all # builds everything
npm run docker:db # starts database (doesnt run detached)
npm run docker:web # starts app (doesnt run detached)
```

A more detailed explanation of the setup is desribed in the **Running** section.

**Important**: You can leave the current google oauth config for testing, but it
will be important that you create your own app if you switch to production. See
the **Google OAuth** section.

**Note**: when you make changes, rebuild the app with `npm run build:all`.

#### General structure
```
.
├── bin/www     -- starts the application
├── client      -- all front-end files are here
│   ├── build       -- autogenerated. Is copied at /public on `npm run build`
│   │   └── static
│   │       ├── css
│   │       ├── js
│   │       └── media
│   ├── public
│   └── src
│       ├── actions
│       ├── assets
│       ├── components
│       ├── constants
│       ├── containers
│       ├── reducers
│       ├── routes
│       ├── store
│       ├── styles
│       └── utils
├── config/config.js    -- development configuration file
├── data                -- where data is stored
│   ├── db                  -- This folder is mounted as a volume in the image, for DB files
│   └── files               -- Mounted as well, but here are stored the user-uploaded files
├── helpers         -- general purpose utils
├── models          -- models for interacting with the database
├── public          -- autogenerated public files
│   ├── static
│   |   ├── css
│   |   ├── js
│   |   └── media
|   └── index.html
├── routes/ -- contains API routes
└── app.js -- backend app entry point
```

## Development

The first time, run:
```sh
npm install
npm run setup
# Then, modify ./data/config/config.js as you need
```

Then, let these 3 commands run in separate terminals:

```sh
npm run docker:dev
cd client && npm run watch-css
cd client && npm start # runs webpack-dev-server
```


## Building

```sh
npm run build:all
# The command above runs the two below
npm run build:client # builds front-end
npm run build:server # builds back-end docker image
```


## Running

You will need to create two directories:

- `$DB_DATA_DIRECTORY`: This will contain the database data. It's an external
     volume that persists across docker restats.
- `$CONFIG_DIRECTORY`: This will contain the application configuration (e.g.
     SMTP account, Google OAuth account, etc). It must be created by copying the
     `/config` directory of this project, and modifying the
     `$CONFIG_DIRECTORY/config.js` file accordingly.

Here is a proposed procedure to setup the directories, then start the
application:

```sh
cd $APPLICATION_DIRECTORY

mkdir -p data/db
mkdir -p data/files
cp -r config data/config

# At this point, modify ./data/config/config.js as you need

export DB_DATA_DIRECTORY="$(pwd)/data/db"
export CONFIG_DIRECTORY="$(pwd)/data/config"
export PORT=8080

docker-compose run \
  -d \
  -v $DB_DATA_DIRECTORY:/var/lib/postgresql/data \
  db

docker-compose run \
  -d \
  -v $CONFIG_DIRECTORY:/usr/etc/grants \
  -p $PORT:3001 \
  web
```


## Backups

Backup the state of the application by copying the `$DB_DATA_DIRECTORY`
directory. If you followed the above procedure, both are
contained in the `/data` folder.

An example script is provided in `daily-backup`, which can be placed in the
`/etc/cron.daily` folder of your machine. Make sure to have the `zip` utility
installed and to adjust the paths.


## Google OAuth

To configure the google authentication to work with your domain, you will need
to follow this procedure:

 - Goto [Google Cloud Console](https://console.cloud.google.com)
 - Create a new project (top bar maybe?), and give it a name (e.g. `grants-app`)
 - Enable the **Google+ API**
 - In the menu, choose **API & Services** > **Credentials**, then on that page
     choose **Create Credentials** > **OAuth client id**
    - Set the application name & logo (if applicable)
    - Select type **Web Application**
    - Fill the `Name`
    - Fill the `Authorised JavaScript origins` with, e.g.:
        `https://YOUR_DOMAIN.com`
    - Fill the `Authorised redirect URIs` with, e.g.:
        `https://YOUR_DOMAIN.com/auth/google/callback`
    - Note your client ID & client secret, and replace those values in the
        `./data/config/config.js` file.
