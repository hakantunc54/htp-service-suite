const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Hakan\\.gemini\\antigravity\\brain\\50b88787-f476-4565-a04c-f8caafb3884a\\.system_generated\\logs\\transcript.jsonl', 'utf8').split('\n');

for (const line of lines) {
  if (line.includes('"type":"USER_INPUT"')) {
    const data = JSON.parse(line);
    const text = data.content;
    if (text && text.toLowerCase().includes('port:')) {
      console.log(text);
      break;
    }
  }
}
