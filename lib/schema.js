'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const uuid = require('uuid').v4;
const Base32 = require('base32-crockford-browser');

const id = Joi.string().example(uuid());
const jid =  Joi.string().example(`${Base32.encode(uuid())}@users.api.talky.io`);
const botid =  Joi.string().example(`${Base32.encode(uuid())}@bots.api.talky.io`);
const signalingUrl = Joi.string().uri().example('ws://api.talky.io/ws-bind');
const telemetryUrl = Joi.string().uri().example('http://api.talky.io/telemetry');
const roomServer = Joi.string().example('rooms.api.talky.io');
const credential = Joi.string().description('Signed JWT Token');
const displayName = Joi.string().allow('').example('Lance Charles McClain');
const screensharingExtensions = Joi.object({
  chrome: Joi.string().example('3iy2ouipokqolkhr31oie2pjo'),
  firefox: Joi.string().example('talky-core-screensharing')
}).unknown().label('Screensharing Extension IDs');
const instance = Joi.string().example(uuid());
const service = Joi.string().example('api');
const host = Joi.string().example(Config.talky.domains.api);

const iceServers = Joi.array().items(
  Joi.object({
    type: Joi.string().example('turn'),
    host: Joi.string().example('10.0.0.42'),
    port: Joi.number().example(3452),
    transport: Joi.string().example('tcp'),
    username: Joi.string().example('123456789'),
    password: Joi.string().example(uuid())
  }).unknown().label('ICECandidate')
).label('ICECandidates');

exports.iceServers = iceServers;

exports.hostmeta = Joi.object({
  links: Joi.array().items(
    Joi.object({
      rel: Joi.string().example('urn:xmpp:alt-connections:websocket'),
      href: Joi.string().uri({ allowRelative: true }).example('ws://api.talky.io/ws-bind')
    }).label('HostMetaLink')
  ).label('HostMetaLinks')
}).label('HostMeta');

exports.user = Joi.object({
  id,
  userId: jid,
  signalingUrl,
  telemetryUrl,
  roomServer,
  iceServers,
  displayName,
  screensharingExtensions,
  credential
}).label('User');

exports.bot = Joi.object({
  id,
  userId: botid,
  signalingUrl,
  telemetryUrl,
  roomServer,
  iceServers,
  screensharingExtensions,
  credential
}).label('Bot');

exports.guest = Joi.object({
  id,
  userId: jid,
  signalingUrl,
  telemetryUrl,
  roomServer,
  iceServers,
  displayName,
  screensharingExtensions,
  credential
}).label('Guest');

exports.instanceCheck = Joi.object({
  instance,
  service,
  host
}).label('InstanceCheck');

//TODO differentiate client and prosody types
exports.eventTypes = Joi.string().valid([
  'room_created',
  'room_destroyed',
  'room_locked',
  'room_unlocked',
  'occupant_joined',
  'occupant_left',
  'message_sent',
  'screencapture_started',
  'screencapture_ended',
  'rtt_enabled',
  'rtt_disabled',
  'video_paused',
  'video_resumed',
  'audio_paused',
  'audio_resumed',
  'started_speaking',
  'stopped_speaking',
  'peer_stream_added',
  'peer_stream_removed',
  'peer_session_added',
  'peer_session_removed',
  'peer_session_connection_state',
  'peer_session_stats',
  'peer_session_ice_stats'
]);
