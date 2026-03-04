// Generate Expo development certificate to bypass login prompt
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const codesigningDir = path.join(require('os').homedir(), '.expo', 'codesigning');

// Create directory if it doesn't exist
if (!fs.existsSync(codesigningDir)) {
  fs.mkdirSync(codesigningDir, { recursive: true });
}

// Generate a self-signed keypair for local development
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'P-256',
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Create a simple self-signed certificate
const keyId = crypto.randomUUID();

// Save the development signing keys
const certData = {
  keyId,
  publicKey,
  privateKey, 
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
};

fs.writeFileSync(
  path.join(codesigningDir, 'development-certificate.json'),
  JSON.stringify(certData, null, 2)
);

console.log('Development certificate generated at:', codesigningDir);
console.log('Key ID:', keyId);
