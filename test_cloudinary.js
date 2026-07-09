const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const envPath = './.env.local';
let config = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
  const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (match) {
    config = {
      api_key: match[1],
      api_secret: match[2],
      cloud_name: match[3]
    };
  }
}

console.log("Config:", config);

const timestamp = Math.round(new Date().getTime() / 1000);
const params = {
  folder: "DevEvent",
  timestamp: timestamp
};

// Create signature
const paramKeys = Object.keys(params).sort();
const paramString = paramKeys.map(key => `${key}=${params[key]}`).join('&');
const signature = crypto.createHash('sha1').update(paramString + config.api_secret).digest('hex');

console.log("Signature string input:", paramString + config.api_secret);
console.log("Generated signature:", signature);

// Build multi-part form request
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const parts = [];

parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"\r\n\r\ndata:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\r\n`);
parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="api_key"\r\n\r\n${config.api_key}\r\n`);
parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="timestamp"\r\n\r\n${timestamp}\r\n`);
parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\n${params.folder}\r\n`);
parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="signature"\r\n\r\n${signature}\r\n`);
parts.push(`--${boundary}--\r\n`);

const body = Buffer.concat(parts.map(p => Buffer.from(p)));

const reqOptions = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${config.cloud_name}/image/upload`,
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': body.length
  }
};

const req = https.request(reqOptions, res => {
  console.log("Response Status:", res.statusCode);
  console.log("Response Headers:", res.headers);
  let resData = '';
  res.on('data', chunk => {
    resData += chunk;
  });
  res.on('end', () => {
    console.log("Response Body:", resData);
  });
});

req.on('error', err => {
  console.error("Request Error:", err);
});

req.write(body);
req.end();
