#!/usr/bin/env node

// Generate a secure random secret for BETTER_AUTH_SECRET
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Generated BETTER_AUTH_SECRET:\n');
console.log(secret);
console.log('\n📋 Copy this value and add it to your Vercel environment variables\n');
console.log('In Vercel Dashboard:');
console.log('Settings → Environment Variables → Add New\n');
console.log('Name: BETTER_AUTH_SECRET');
console.log('Value: ' + secret);
console.log('\n');
