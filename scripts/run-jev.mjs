import { readFileSync } from 'node:fs';
const KEY = process.env.TYPESAFE_API_KEY;

const reqFile = process.argv[2];
if (!reqFile || !KEY) {
  console.error('usage: node run-jev.mjs <request.json>  (needs TYPESAFE_API_KEY)');
  process.exit(1);
}

const body = readFileSync(reqFile, 'utf8');
const res = await fetch('https://api.typesafe.ai/v1/systemone', {
  method: 'POST',
  headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body,
});
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
