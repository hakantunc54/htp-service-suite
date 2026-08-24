const fs = require('fs');
let code = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

code = code.replace(
  'const [loading, setLoading] = useState(true);\n  const [passwordModalOpen, setPasswordModalOpen] = useState(false);\n  const [passwordModalUser, setPasswordModalUser] = useState({ id: "", name: "" });\n  const [newPassword, setNewPassword] = useState("");\n  const [newPassword, setNewPassword] = useState("");',
  'const [loading, setLoading] = useState(true);\n  const [passwordModalOpen, setPasswordModalOpen] = useState(false);\n  const [passwordModalUser, setPasswordModalUser] = useState({ id: "", name: "" });\n  const [newPassword, setNewPassword] = useState("");'
);

// If the regex didn't catch it, let's just do a string replace of the exact lines
let lines = code.split('\n');
let filteredLines = [];
let seenNewPassword = false;
for (let line of lines) {
  if (line.includes('const [newPassword, setNewPassword] = useState("");')) {
    if (seenNewPassword) continue;
    seenNewPassword = true;
  }
  filteredLines.push(line);
}

fs.writeFileSync('src/app/settings/page.tsx', filteredLines.join('\n'), 'utf8');
