import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
});

function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

// Verifies a Firebase Auth ID token (the JWT you get from
// firebaseUser.getIdToken() on the frontend) without needing the
// Firebase Admin SDK or a service account key file.
export function verifyFirebaseToken(idToken) {
  // Read this INSIDE the function, not at module load time — .env
  // (via dotenv.config() in server.js) isn't guaranteed to be loaded
  // yet when this file is first imported.
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  return new Promise((resolve, reject) => {
    if (!FIREBASE_PROJECT_ID) {
      return reject(new Error("FIREBASE_PROJECT_ID is not set in the backend's .env"));
    }
    jwt.verify(
      idToken,
      getSigningKey,
      {
        algorithms: ["RS256"],
        audience: FIREBASE_PROJECT_ID,
        issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}
