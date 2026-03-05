// Run this script to create a test user
// Usage: node scripts/create-test-user.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Test user credentials
const TEST_EMAIL = 'admin@labelapp.com';
const TEST_PASSWORD = 'admin123';
const TEST_NAME = 'Platform Admin';

console.log('\n🔐 Test User Credentials:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Email:    ${TEST_EMAIL}`);
console.log(`Password: ${TEST_PASSWORD}`);
console.log(`Name:     ${TEST_NAME}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 Instructions:');
console.log('1. Start your dev server: npm run dev');
console.log('2. Go to http://localhost:3000/signup');
console.log('3. Create an account with the credentials above');
console.log('4. Or use any email/password you prefer!\n');

console.log('💡 Note: Better Auth will hash passwords securely');
console.log('   and create the database automatically on first use.\n');
