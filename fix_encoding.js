const fs = require('fs');
const file = 'src/components/EditServicesModal.tsx';
// Read it as a buffer
const buf = fs.readFileSync(file);
// Convert to string assuming it might be latin1 or whatever, but actually it's just normal characters except for the euro sign maybe?
// Wait, if it has a BOM or Windows-1252, let's just let Node read it as utf8 (which might fail if it's invalid) or just overwrite the file entirely from a clean script string!
