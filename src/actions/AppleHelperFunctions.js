// Apple SignIn Auth
// https://developer.apple.com/documentation/signinwithapplerestapi
// const jwksClient = require('jwks-client');

import jwt_decode, {JwtPayload} from 'jwt-decode';

const TOKEN_ISSUER = 'https://appleid.apple.com';

const base64ToBufferAsync = async base64 => {
  var dataUrl = 'data:application/octet-binary;base64,' + base64;

  return fetch(dataUrl)
    .then(res => res.arrayBuffer())
    .then(buffer => {
      return new Uint8Array(buffer);
    });
};

const getAppleKeyByKeyId = async (keyId, cacheMaxEntries, cacheMaxAge) => {
  //   const client = jwksClient({
  //     jwksUri: `${TOKEN_ISSUER}/auth/keys`,
  //     cache: true,
  //     cacheMaxEntries,
  //     cacheMaxAge,
  //   });

  //   let key;
  //   try {
  //     key = await client.getSigningKey(keyId);
  //   } catch (error) {
  //     throw new Error(`Unable to find matching key for Key ID: ${keyId}`);
  //   }
  // return 'key';

  const res = await fetch(`${TOKEN_ISSUER}/auth/keys`);
  const json = await res.json();
  const keys = json.keys;
  const matchingKeys = keys.filter(key => key.kid === keyId);
  if (!matchingKeys.length) {
    throw new Error(`Unable to find matching key for Key ID: ${keyId}`);
  }
  const selectedKey = matchingKeys[0];
  //const keyDer = base64.toByteArray(selectedKey.x5c[0]).buffer;
  const keyDer = base64ToBufferAsync(selectedKey.x5c[0]);
  const rsaPublicKey = await crypto.subtle.importKey(
    'spki',
    keyDer,
    {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
    false,
    ['verify'],
  );
  return rsaPublicKey;
};

const getHeaderFromToken = token => {
  // const decodedToken = jwt.decode(token, {complete: true});
  const decodedToken = jwt_decode(token);

  if (!decodedToken) {
    throw new Error(`provided token does not decode as JWT`);
  }

  return decodedToken.header;
};

export const validateAuthData = async (
  token,
  clientId = 'com.hexims.stokeapp',
) => {
  if (!token) {
    throw new Error(`id token is invalid for this user.`);
  }

  const {kid: keyId, alg: algorithm} = getHeaderFromToken(token);
  const ONE_HOUR_IN_MS = 3600000;
  let jwtClaims;

  let cacheMaxAge = cacheMaxAge || ONE_HOUR_IN_MS;
  let cacheMaxEntries = cacheMaxEntries || 5;

  const appleKey = await getAppleKeyByKeyId(
    keyId,
    cacheMaxEntries,
    cacheMaxAge,
  );
  const signingKey = appleKey.publicKey || appleKey.rsaPublicKey;

  return signingKey;

  // try {
  //   jwtClaims =
  //   // jwt.verify(token, signingKey, {
  //   //   algorithms: algorithm,
  //   //   // the audience can be checked against a string, a regular expression or a list of strings and/or regular expressions.
  //   //   audience: clientId,
  //   // });
  // } catch (exception) {
  //   const message = exception.message;

  //   throw new Error(`${message}`);
  // }

  // if (jwtClaims.iss !== TOKEN_ISSUER) {
  //   throw new Error(
  //     `id token not issued by correct OpenID provider - expected: ${TOKEN_ISSUER} | from: ${jwtClaims.iss}`,
  //   );
  // }

  // //   if (jwtClaims.sub !== id) {
  // //     throw new Error(`auth data is invalid for this user.`);
  // //   }
  // console.log(jwtClaims);
  // return jwtClaims;
};
