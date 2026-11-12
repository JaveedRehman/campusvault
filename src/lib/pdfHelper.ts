/**
 * Generates a clean, valid PDF document buffer in pure JavaScript/Node
 * so that all uploaded or sample documents can be viewed and downloaded directly.
 */
export function generatePDFBuffer(title: string, contentLines: string[]): Buffer {
  const textContent = contentLines.map(line => `(${line.replace(/[()\\]/g, '\\$&')}) Tj T*`).join('\n');

  const pdfStream = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
>>
endobj
4 0 obj
<< /Length ${150 + textContent.length} >>
stream
BT
/F1 18 Tf
50 740 Td
(${title.replace(/[()\\]/g, '\\$&')}) Tj
0 -30 Td
/F1 12 Tf
${textContent}
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000305 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${480 + textContent.length}
%%EOF`;

  return Buffer.from(pdfStream, 'utf-8');
}
