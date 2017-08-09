'use strict';
const JWT = require('jsonwebtoken');

const DEV_PRIV_KEY = `
-----BEGIN RSA PRIVATE KEY-----
MIIJJwIBAAKCAgEA0WDsLKzNXKnti04N2wmgEkaUAgF/0IANp5tm01MeP46EdQkh
5/BUBGJt2i+Sf+Hwm+P+4hkCMXpeUksD/enAN1ehTs6PQyqn0vCM4xRxSmOjmhFc
+wM5QoD9sFH+A3mBli7pXwxxQPGwXaBbk3WMMH+EZQVZyIKGCRJyL/0UqkQ/vgOu
yOP412G6O+gPTfuw1vGCxcXsEUiSEP/apLSLKj2WDMysh1x6DtrEri4wcG/LXgym
Ig+Fp8PK6IvFsrmbyl2wIY/g/pG9zrnnk3btExd5nF2ugKzQdlEM+t0xDTc4Fjmn
mV8sS0T9ADRlqBWC0lOeFVtyvnp9eGb0c5Z3veAkg3HyOSJEw5rezdH2v8rngvbN
0j7V4NUwGY0TQQcKJHMYaS4WPNoADb1DR/XTNHxir20975HjrFTT8kipRI1fQj2Z
hrbFmgJVonxNkzwFqv2gTfsxs2+phJzUHYnyBVNIEhMyUZ4UJBaSFZVWacIYMbGf
e7THgfrNoJ6IdcwFO7+eaFks7s8uRrpKhXNA1lOBUiSJJLulEWjJWUfh7jGZBW5a
hbt64GvSYOZO5B0lm/TO1tgDhwmMaVa1vfhOhFhZ9nTVX8PzXMEem21bJlYbiNDI
ltynl2BucF3ZwZVE7Qz36Oy/uNIH7hmFuGVEQsbNZUDDT2zJ8MzAL3/yyKECAwEA
AQKCAgBx9yeWSZieT4AUyy+PgfW2/OOjE93WR10nVdbqP9u/DHvcmFP0Q0P3/vt8
P1imcvzcXYVm2+XtuIWOlXZextTxSqlqk9Q24wjmMDj/gSkJLKLoQXsyxdZs9Hkh
d/+jNIfsjyxHqCYdC3DMBXTTFrBv1Xji476y/Rin53pv1HljFDL94lNI1Y2k7nTI
Fs/9ynm/BUYBEHImFjIrPphr/jmhjFQYM2/VXeiyHTHg/RMwoCk5z/i9oWVGo7PW
T/4UAiNiSwyLuBznc7y0wUvjYGA6fBSdoABT2by+Ke++vJbucpf8wPUQ7lTVw39S
lTKgAtVqVkk9psEWHOYemyuDnusdWnDAEEAwtPFyq8+bLo95/Q9R+m4REJRJVYgZ
P62iD1Lj4L9jYJBVMftpKfJa4wgE7N7iK7xUZr8+2mvlGI+8U3Vhtdi6MmNZbHEe
AYZLvMCFNjS8auomCOvl8fkEVevFL2L4Imi41QgrXVp6wUVodIa00gk3DBl1lgsV
5BNQppq7KdfN+82tIDEJa/KeZKzDLlEIcIdBXh8TpM9hD4mUn2pjBx9aKBOzt6wE
zfHGE154GORXmAQ80Kgl/fRFgaE33rlzzflrSDRfLLK7fEJbMqSkuGPiJnVGcfrz
CC8LAg1gShmsoDEIijhHul32t1tvd5YwUXmHtfgHA7NDmIu5YQKCAQEA9JgJ0dYs
QwjQUWyzE9NeRA5Vy1lrWM0YXwBRnCRt/RAk+YYSfREUJcbhthmSrZSWksN3qbFK
cyk0al2NlzHVY12quHGd50E+hUX46EW3fxDsNzZZSvS6zJDC+DjVZLgKn57cBaB9
bnENXKMk4m14uGf3nc7X/mGBxF5nUZfe0duy49ktvM/ulIgjFmlzeZvHWdHbVC5s
EdB5e6Tbbe1FjRME253RaQfC074Vokt5ElStbr+p091EWjlDb43XorO7v5BzySA7
G70pISRlv6TirPksb20p5WF8xM6qeh12pQ6ZpQfPaF1DP9F6yT+ANSQGHKFQlo4s
vwcelbv1ajCaxwKCAQEA2yR76itQo4Kgk270O4HDJudOg3eI1rltDHsdQcbpG2Tu
+Lc5lX5BxsNXDGtpAB1Cw8KXKez7N0ZIp2K0WVylKnQIxVMynrwFBw+zx1N9VLkF
zYTc+tOdCv+ePC5/jjtzIST+q1TkOFtDd89rl0spOvQxZyJFhMp1rlz++dskI7RJ
YqrSGFjNm2a+rJOpfY4JjneNxHjoDA8kGTaXdwQSnjcZxCbZlidcqmVFKnmob6gH
j1QCYp9AEPJrJ8kWde/Myc63fm3xfclpEVozgQ+Z6j2UJgvVnHPEyEfW3G3nCJwL
A2U6sBeICNHoePBEF2xfqhL+DAY4q8+WmDLZuGlZVwKCAQB2ffU735q/utRYreUv
NJWVOLCde6tCcNFerKPcldVm5FxVOXtZdV2iU2/jLQ5e4v3zCZi973KWyZ5n7Px8
A5tRsP3Urs4FSxlDrTtBIw0bFJKqyLyHUHnyQisB316ZlYMoAuiqHS7GwyPq/eoP
e2MhStStcZg31vrrq6Q35e//EITgVsUOlFkLQcxlvh5ACpSP0deEN50JIErJ+HqJ
DYpFJrKSxii9zhG3TH3kitWTaMxAO7/FMIs9fkJKF5ggbRwGWK+O/vtDm+cB9EUK
i5F4pJm/PU4vnoO4QDpcQEvK+IC8b0UuVQgQMaZfOlEc7V+8nPWSijvpK0TI2y6w
C+3fAoIBAEOckg7BpnOMTfau+POTKZ7LJtIxAyscsqRzJ6evsyQclA5wmXeiKLEm
e6j9SrwaSwsS8oig8TEwoiHitjoL93mNq1cWQDvxTqvLEHCjNbv6CexK3dMVjxJh
o3R19Czx8qd7Poel/XPV1I8Wk99t9R6XUNa9IC3EOWK+lnyIPDI34Zxrj76rR2R2
4sVkGZr/Q7uM71R66T0vPrf4u+qgew4Negmm4uMM6e44qIpeVrV8Zji2drXu5FlW
MfFofWGNxuVMvhhn22YvyhbseY+MPLSkoxzJ8fH/VetlHsmLrwhc/JjjlqPV3sa5
3LvThW6kpS9YBMG4+asotRHoPnxDJKkCggEAXgT7zBF3nCXlreC0rXdtMogubIIt
M20vZSpyBRmsHo/1H4BVdkozXMmfX+sa0bGo9A5TdFkxAUoUKmz6l61aMfyAH/ZR
t2vk3pdtgB+iCzMH37xD171yOBodrdkcQ502sFIAgZ4KLyTEsdkepCo1V9222caV
1L634kuxFomIqSPyaZSLSokJuBXtB97d2H/AjeO69vFrNjRBpHGyr7wp+3DEiSdU
hhvJa8KADrZ/J2Q/e02iKO3E0F21Gyez5KTkQF/nwkUTEit+hnBQMYhR8IV0eaKB
W2f3wVIKkKpd6xEI6veBMmbDLKEMXKfLoNWha1T7rmqI4PuVaWzg3p9uEg==
-----END RSA PRIVATE KEY-----
`;

const DEV_PUB_KEY = `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0WDsLKzNXKnti04N2wmg
EkaUAgF/0IANp5tm01MeP46EdQkh5/BUBGJt2i+Sf+Hwm+P+4hkCMXpeUksD/enA
N1ehTs6PQyqn0vCM4xRxSmOjmhFc+wM5QoD9sFH+A3mBli7pXwxxQPGwXaBbk3WM
MH+EZQVZyIKGCRJyL/0UqkQ/vgOuyOP412G6O+gPTfuw1vGCxcXsEUiSEP/apLSL
Kj2WDMysh1x6DtrEri4wcG/LXgymIg+Fp8PK6IvFsrmbyl2wIY/g/pG9zrnnk3bt
Exd5nF2ugKzQdlEM+t0xDTc4FjmnmV8sS0T9ADRlqBWC0lOeFVtyvnp9eGb0c5Z3
veAkg3HyOSJEw5rezdH2v8rngvbN0j7V4NUwGY0TQQcKJHMYaS4WPNoADb1DR/XT
NHxir20975HjrFTT8kipRI1fQj2ZhrbFmgJVonxNkzwFqv2gTfsxs2+phJzUHYny
BVNIEhMyUZ4UJBaSFZVWacIYMbGfe7THgfrNoJ6IdcwFO7+eaFks7s8uRrpKhXNA
1lOBUiSJJLulEWjJWUfh7jGZBW5ahbt64GvSYOZO5B0lm/TO1tgDhwmMaVa1vfhO
hFhZ9nTVX8PzXMEem21bJlYbiNDIltynl2BucF3ZwZVE7Qz36Oy/uNIH7hmFuGVE
QsbNZUDDT2zJ8MzAL3/yyKECAwEAAQ==
-----END PUBLIC KEY-----
`;


exports.DEV_ISSUER = 'licenses-dev.talky.io';
exports.DEV_PUBLIC_KEY = DEV_PUB_KEY.trim();

exports.createLicense = function (opts) {

  const token = JWT.sign({
    roomLimit: opts.roomLimit,
    userLimit: opts.userLimit,
    roomUserLimit: opts.roomUserLimit
  }, DEV_PRIV_KEY.trim(), {
    issuer: exports.DEV_ISSUER,
    algorithm: 'RS256',
    expiresIn: opts.expiresIn
  });

  return token;
};


if (require.main === module) {
  const Readline = require('readline-sync');
  const ParseArgs = require('minimist');
  const opts = ParseArgs(process.argv.slice(2));

  const roomLimit = opts['max-rooms'] || parseInt(Readline.question('Max number of active rooms: '), 10) || undefined;
  const userLimit = opts['max-users'] || parseInt(Readline.question('Max number of online users: '), 10) || undefined;
  const roomUserLimit = opts['max-room-size'] || parseInt(Readline.question('Max number of users per room: '), 10) || undefined;

  let expiresIn = opts['expires-in'] || Readline.question('Expires in (30 days, 1 year, etc): ') || 'never';
  if (expiresIn === 'never') {
    expiresIn = undefined;
  }

  const token = exports.createLicense({
    roomLimit,
    userLimit,
    roomUserLimit,
    expiresIn
  });

  process.stderr.write('\nGenerating Talky Core API Dev License\n');
  process.stderr.write('=====================================\n');
  process.stderr.write(`${JSON.stringify(JWT.decode(token), null, 2)  }\n\n`);

  console.log(token);
}

