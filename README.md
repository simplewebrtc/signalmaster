# api.talky.io

## Getting started
Make sure that postgres and psql are installed on your machine

1. Create the database `npm run createdb`
2. Run the migration `npm run migrate`
3. Seed the DB `npm run seed`

I think it's safe for us to just work out of the [initial migrations]('./migrations/20170614103301_initial.js') file for now as we get the schema's correct.  To roll back and re-migrate you can run `knex migrate:rollback && npm run migrate`

If you want to destroy the DB and start over just run `npm run destroydb`

## Schema

### Rooms
- `id`
- `name`
- `jid`
- `created`
- `ended`

### Users
- `sessionid`
- `userid`
- `type`
- `os`
- `browser`
- `useragent`
- `created`
- `ended`

### Events
- `type`
- `room id`
- `actor id`
- `peer id`
- `time`
- `data`

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


