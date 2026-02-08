const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with unused React
try {
  const files = execSync("find src -name '*.tsx' -type f").toString().split('\n').filter(f => f);
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const original = content;
      
      // Only remove React if it's not used elsewhere in file
      // Check for React. usage patterns
      if (!content.includes('React.') && !content.includes('<React.')) {
        // Remove: import React from 'react';
        content = content.replace(/import React from 'react';\n/g, '');
        // Remove: import React, { ... } and convert to import { ... }
        content = content.replace(/import React, \{ /g, 'import { ');
      }
      
      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed: ${file}`);
      }
    }
  });
} catch (e) {
  console.error('Error:', e.message);
}
