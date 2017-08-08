# Talky Core API

## Getting started

### 1. Set up Postgres

Make sure that `postgres` and `psql` are installed on your machine

1. Create the database:

    ```sh
    $ npm run createdb
    ```

2. Run the migrations:

    ```sh
    $ npm run migrate
    ```

Generating data can be done by starting the Talky.io app locally and creating/ending some rooms.

If you need to destroy the DB and start over just run `npm run destroydb`.

I think it's safe for us to just work out of the [initial migrations]('./migrations/20170614103301_initial.js') file for now as we get the schema's correct.  To roll back and re-migrate you can run `knex migrate:rollback && npm run migrate`


### 2. Set up Prosody

#### OS X

1. Install Prosody using Homebrew:

    ```sh
    $ brew tap legastero/homebrew-prosody
    $ brew install --HEAD prosody
    ```

2. Configure Prosody:

    ```sh
    $ npm run prosody-config-install-local
    ```
    
    The Prosody config file is not regenerated automatically, so this step will need to be run any time you change the service configuration.

#### Linux (Debian based)

1. Install Prosody dependencies:

    ```sh
    apt-get install -y --no-install-recommends \
        libidn11 \
        liblua5.1-expat0 \
        libssl1.0.0 \
        lua-bitop \
        lua-dbi-mysql \
        lua-dbi-postgresql \
        lua-dbi-sqlite3 \
        lua-event \
        lua-expat \
        lua-filesystem \
        lua-sec \
        lua-socket \
        lua-zlib \
        lua5.1 \
        openssl \
        ca-certificates
    ```

2. Add Prosody repository:

    Follow the instructions at http://prosody.im/download/package_repository

3. Install Prosody trunk:

    ```sh
    $ apt-get install prosody-trunk
    ```

4. Configure Prosody:

    ```sh
    $ npm run prosody-config-generate
    $ sudo mv ./prosody.cfg.lua /etc/prosody/
    $ sudo chown root:root /etc/prosody/prosody.cfg.lua
    $ sudo chmod -x /etc/prosody/prosody.cfg.lua
    ```

    The Prosody config file is not regenerated automatically, so this step will need to be run any time you change the service configuration.

## 3. Generate Certificates

To run the API with HTTPS (needed for local testing clients), run:

```sh
$ npm run certgen
```

You will be prompted to fill in information for the certificate. The `Common Name` setting MUST be set to the domain/port you are using:

```sh
Country Name (2 letter code) [AU]:US
State or Province Name (full name) [Some-State]:WA 
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:localhost:8001
Email Address []:
```

## 3. Start the Service

The API server (along with Prosody when not in production mode), can be started with:

```sh
$ npm start
```

If HTTPS is used, you will need to load the API home page in your browser to approve using the generated certificate.


## Schema

### Rooms
- `id` - Unique identifier
- `name` - `some-room-name`
- `jid` - `some-room-name@rooms.talky-api.local`
- `created` - Timestamp
- `ended` - Timestamp

### Users
- `sessionid` - Unique identifier
- `userid` - User identity, `registered-user@users.talky-api.local`
- `type` - `browser` or `mobile`
- `os`
- `browser`
- `useragent`
- `created` - Timestamp
- `ended` - Timestamp

### Events
- `type` - See below
- `room id` - Room where the event happened
- `actor id` - User that triggered the event
- `peer id` - User that was affected by the event (i.e. it was specifically between two users, not the whole room)
- `time` - Timestamp
- `data` - JSON blob

## Event Types

- `room_created`
- `room_destroyed`
- `room_locked`
- `room_unlocked`
- `occupant_joined`
- `occupant_left`
- `message_sent`
- `screencapture_started`
- `screencapture_ended`
- `rtt_enabled`
- `rtt_disabled`
- `p2p_session_started`
- `p2p_session_ended`
- `p2p_session_stats`
- `video_paused`
- `video_resumed`
- `audio_paused`
- `audio_resumed`
