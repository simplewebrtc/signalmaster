'use strict';

const Joi = require('joi');
const uuid = require('uuid').v4;
const buildUrl = require('./buildUrl');
const Base32 = require('base32-crockford-browser');

const sessionId = Joi.string().example(uuid());
const userId =  Joi.string().example(`${Base32.encode(uuid())}@users.api.talky.io`);
const botid =  Joi.string().example(`${Base32.encode(uuid())}@bots.api.talky.io`);
const signalingUrl = Joi.string().uri().example('ws://api.talky.io/ws-bind');
const telemetryUrl = Joi.string().uri().example('http://api.talky.io/telemetry');
const roomServer = Joi.string().example('rooms.api.talky.io');
const credential = Joi.string().description('Signed JWT Token');
const displayName = Joi.string().example('Lance Charles McClain');

const iceServers = Joi.array().items(
  Joi.object({
    type: Joi.string().example('turn'),
    host: Joi.string().example('10.0.0.42'),
    port: Joi.number().example(3452),
    transport: Joi.string().example('tcp')
  }).label('ICECandidate')
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
  sessionId,
  userId,
  signalingUrl,
  telemetryUrl,
  roomServer,
  iceServers,
  displayName,
  credential
}).label('User');

exports.bot = Joi.object({
  sessionId,
  userId: botid,
  signalingUrl,
  telemetryUrl,
  roomServer,
  iceServers,
  credential
}).label('Bot');

exports.guest = Joi.object({
  sessionId,
  userId,
  signalingUrl,
  telemetryUrl,
  roomServer,
  iceServers,
  displayName,
  credential
}).label('Guest')
