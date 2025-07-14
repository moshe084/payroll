const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function testPdfUpload() {
  try {
    // Read the PDF file
    const pdfPath = path.join(__dirname, 'salary.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Data = pdfBuffer.toString('base64');
    
    console.log('PDF file size:', pdfBuffer.length, 'bytes');
    console.log('Base64 size:', base64Data.length, 'characters');
    
    // Test the API
    const response = await fetch('http://localhost:3001/api/process-payslip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data: base64Data,
        mediaType: 'application/pdf',
        apiKey: 'your_claude_api_key_here'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPdfUpload();