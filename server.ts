import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generatePDFBuffer } from './src/lib/pdfHelper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// In-memory / filesystem cache for uploaded PDFs
const uploadsDir = path.join(__dirname, 'uploaded_pdfs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileStore = new Map<string, { buffer: Buffer; fileName: string; contentType: string }>();

// Pre-fill sample PDFs in memory/disk
const samplePdfs: Record<string, { title: string; lines: string[] }> = {
  'sample_cs101_dsa.pdf': {
    title: 'CS 101: Introduction to Data Structures & Algorithms',
    lines: [
      'CampusVault Academic Archive - Department of Computer Science & Engineering',
      'Topic 1: Big-O Notation and Algorithm Complexity Analysis',
      'Topic 2: Abstract Data Types - Arrays, Stacks, Queues, and Priority Queues',
      'Topic 3: Balanced Search Trees (AVL & Red-Black Trees)',
      'Topic 4: Graph Representations & Shortest Path Algorithms (Dijkstra, A*)',
      'Verified Academic Material - Available for Free Distribution.'
    ]
  },
  'sample_math204_linear_algebra.pdf': {
    title: 'MATH 204: Linear Algebra Midterm Exam Solutions',
    lines: [
      'CampusVault Academic Archive - Department of Mathematics & Statistics',
      'Section 1: Vector Spaces, Subspaces, Basis, and Dimension',
      'Section 2: Linear Transformations & Matrix Representations',
      'Section 3: Determinants, Eigenvalues, and Eigenvectors',
      'Section 4: Orthogonality & Gram-Schmidt Orthogonalization Process',
      'Solutions verified by Course TAs.'
    ]
  },
  'sample_phys301_quantum.pdf': {
    title: 'PHYS 301: Fundamentals of Quantum Mechanics',
    lines: [
      'CampusVault Academic Archive - Department of Physics & Astronomy',
      'Module 1: Wave-Particle Duality and De Broglie Wavelength',
      'Module 2: Time-Dependent and Time-Independent Schrodinger Equations',
      'Module 3: Quantum Operators and Commutation Relations',
      'Module 4: Quantum Tunneling through Potential Barriers',
      'Course Notes Edition 2005.'
    ]
  },
  'sample_econ101_macro.pdf': {
    title: 'ECON 101: Macroeconomics Principles & Fiscal Policy',
    lines: [
      'CampusVault Academic Archive - Department of Economics & Finance',
      'Chapter 1: Measuring Gross Domestic Product and Inflation Rates',
      'Chapter 2: The Aggregate Demand and Aggregate Supply Model',
      'Chapter 3: Fiscal Multipliers and Government Expenditure Policy',
      'Chapter 4: Central Banking and Interest Rate Controls',
      'Introductory Undergraduate Course Notes.'
    ]
  },
  'sample_ee210_circuits.pdf': {
    title: 'EE 210: Electric Circuit Analysis & Frequency Response',
    lines: [
      'CampusVault Academic Archive - Department of Electrical Engineering',
      'Lab 1: Nodal and Mesh Analysis of Complex Resistive Networks',
      'Lab 2: Operational Amplifier Configurations and Gain Equations',
      'Lab 3: Transient Response of First and Second-Order RLC Circuits',
      'Lab 4: AC Steady-State Power Analysis and Phasor Diagrams',
      'Engineering Laboratory Manual.'
    ]
  }
};

// Seed sample PDFs
Object.entries(samplePdfs).forEach(([key, sample]) => {
  const buf = generatePDFBuffer(sample.title, sample.lines);
  fileStore.set(key, {
    buffer: buf,
    fileName: key,
    contentType: 'application/pdf'
  });
});

app.use(express.json({ limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusVault Academic Gateway', timestamp: new Date().toISOString() });
});

// PDF Upload Endpoint (simulating Cloudflare R2 / Server storage)
app.post('/api/upload', (req, res) => {
  try {
    const { fileName, fileData, title, college, department, semester, subject } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing file name or file content.' });
    }

    const fileKey = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.pdf`;
    let buffer: Buffer;

    if (typeof fileData === 'string' && fileData.startsWith('data:application/pdf;base64,')) {
      const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const base64Data = fileData.split(',')[1] || '';
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      // Build valid PDF with custom content
      buffer = generatePDFBuffer(title || fileName, [
        `Document Title: ${title || fileName}`,
        `College: ${college || 'General'}`,
        `Department: ${department || 'General'}`,
        `Semester: ${semester || 'N/A'}`,
        `Subject: ${subject || 'N/A'}`,
        `Uploaded to CampusVault Archive on ${new Date().toLocaleDateString()}`
      ]);
    }

    // Save to memory store
    fileStore.set(fileKey, {
      buffer,
      fileName: fileName || fileKey,
      contentType: 'application/pdf'
    });

    // Save to disk backup
    fs.writeFileSync(path.join(uploadsDir, fileKey), buffer);

    const fileUrl = `/api/download/${fileKey}`;

    return res.json({
      success: true,
      fileKey,
      fileUrl,
      fileName: fileName || fileKey,
      fileSize: buffer.length
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Server upload failure.' });
  }
});

// PDF Download / Preview Endpoint
app.get('/api/download/:fileKey', (req, res) => {
  try {
    const { fileKey } = req.params;
    let fileItem = fileStore.get(fileKey);

    if (!fileItem) {
      const filePath = path.join(uploadsDir, fileKey);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        fileItem = { buffer, fileName: fileKey, contentType: 'application/pdf' };
        fileStore.set(fileKey, fileItem);
      }
    }

    if (!fileItem) {
      // Fallback: Generate a sample PDF on-the-fly for unknown keys
      const buf = generatePDFBuffer(`CampusVault Archive Document (${fileKey})`, [
        'CampusVault Academic Repository Document',
        `File Key Reference: ${fileKey}`,
        `Generated on: ${new Date().toLocaleDateString()}`
      ]);
      fileItem = { buffer: buf, fileName: `${fileKey}.pdf`, contentType: 'application/pdf' };
    }

    const downloadMode = req.query.download === 'true';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${downloadMode ? 'attachment' : 'inline'}; filename="${encodeURIComponent(fileItem.fileName)}"`
    );
    res.setHeader('Content-Length', fileItem.buffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600');

    return res.send(fileItem.buffer);
  } catch (err: any) {
    console.error('Download error:', err);
    return res.status(500).send('Error generating PDF document.');
  }
});

// Configure Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusVault server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
