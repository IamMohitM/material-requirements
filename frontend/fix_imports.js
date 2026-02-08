const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/invoices/InvoiceForm.tsx',
  'src/components/invoices/MatchingAnalysis.tsx',
  'src/components/invoices/InvoiceList.tsx',
  'src/components/deliveries/DeliveryList.tsx',
  'src/components/deliveries/DeliveryForm.tsx',
  'src/pages/DeliveriesPage.tsx',
  'src/pages/InvoicesPage.tsx',
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove unused React import when it's not used for other things
    content = content.replace(/^import React, \{ /m, 'import { ');
    
    // If only importing React, remove the line completely
    if (content.match(/^import React from 'react';\n/m)) {
      content = content.replace(/^import React from 'react';\n/m, '');
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${file}`);
  }
});
