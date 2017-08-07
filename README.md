# api.talky.io

##

Lance please document installing prosody trunk aka nightly here
http://prosody.im/download/package_repository

## Getting started
Make sure that postgres and psql are installed on your machine

1. Create the database `npm run createdb`
2. Run the migration `npm run migrate`
3. Seed the DB `npm run seed`

I think it's safe for us to just work out of the [initial migrations]('./migrations/20170614103301_initial.js') file for now as we get the schema's correct.  To roll back and re-migrate you can run `knex migrate:rollback && npm run migrate`

If you want to destroy the DB and start over just run `npm run destroydb`

##

Install lua 5.2 (flesh this out)

https://github.com/prosody/prosody-docker/blob/master/Dockerfile

## Setting up Prosody locally - OS/X and Windows

```sh
$ npm run prosody-config-install-docker
$ npm run start
```


## Setting up Prosody locally - Linux

```sh
$ npm run prosody-config-generate
$ sudo mv ./prosody.cfg.lua /etc/prosody/
$ sudo chown root:root /etc/prosody/prosody.cfg.lua
$ sudo chmod -x /etc/prosody/prosody.cfg.lua
$ npm run start
```

## Setting up the db

```sh
$ npm run createdb
$ npm run migrate
```

In development mode, `npm start` will start Prosody along with the HTTP API.

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
