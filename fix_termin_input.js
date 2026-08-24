const fs = require('fs');
let code = fs.readFileSync('src/app/terminabsprachen/page.tsx', 'utf8');

// The date input looks like this:
/*
                          <input 
                            type="datetime-local" 
                            step="1800"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                          />
*/

// Let's replace it with a date input and a time select!

const replacement = `
                          <div className="flex gap-2">
                            <input 
                              type="date" 
                              value={date ? date.split('T')[0] : ''}
                              onChange={e => {
                                const newDate = e.target.value;
                                const time = date ? date.split('T')[1] : '08:00';
                                setDate(newDate ? \`\${newDate}T\${time}\` : '');
                              }}
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                            <select
                              value={date ? date.split('T')[1] : '08:00'}
                              onChange={e => {
                                const newTime = e.target.value;
                                const d = date ? date.split('T')[0] : new Date().toISOString().split('T')[0];
                                setDate(\`\${d}T\${newTime}\`);
                              }}
                              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            >
                              {Array.from({ length: 24 }).flatMap((_, i) => {
                                const h = i.toString().padStart(2, '0');
                                return [
                                  <option key={\`\${h}:00\`} value={\`\${h}:00\`}>{h}:00</option>,
                                  <option key={\`\${h}:30\`} value={\`\${h}:30\`}>{h}:30</option>
                                ];
                              })}
                            </select>
                          </div>
`;

code = code.replace(/<input\s+type="datetime-local"[\s\S]*?onChange=\{e => setDate\(e\.target\.value\)\}[\s\S]*?\/>/, replacement.trim());

fs.writeFileSync('src/app/terminabsprachen/page.tsx', code, 'utf8');
