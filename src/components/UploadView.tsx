import React, { useState, useMemo } from 'react';
import { COLLEGES, SEMESTERS, AcademicResource } from '../types/repository';
import { createResource } from '../lib/repositoryService';

interface UploadViewProps {
  user: any;
  onSignIn: () => void;
  onUploadSuccess: (newDoc: AcademicResource) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  user,
  onSignIn,
  onUploadSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(COLLEGES[0].name);
  const [selectedDepartment, setSelectedDepartment] = useState(COLLEGES[0].departments[0]);
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ msg: string; docId: string; fileKey: string } | null>(null);

  // Update departments based on college selection
  const availableDepartments = useMemo(() => {
    const colObj = COLLEGES.find(c => c.name === selectedCollege);
    return colObj ? colObj.departments : [];
  }, [selectedCollege]);

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCollege = e.target.value;
    setSelectedCollege(newCollege);
    const colObj = COLLEGES.find(c => c.name === newCollege);
    if (colObj && colObj.departments.length > 0) {
      setSelectedDepartment(colObj.departments[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Invalid file format. Only PDF documents (.pdf) are permitted.');
        setFile(null);
        return;
      }
      setErrorMessage(null);
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrorMessage('Authentication required. Please sign in with Google first.');
      return;
    }

    if (!file) {
      setErrorMessage('Please select a PDF document to upload.');
      return;
    }

    if (!title.trim() || !subject.trim()) {
      setErrorMessage('Document Title and Subject fields are required.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Read file data as base64 or binary
      const fileDataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // 2. Upload PDF file via Cloudflare R2 / Express gateway
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileData: fileDataUri,
          title,
          college: selectedCollege,
          department: selectedDepartment,
          semester: selectedSemester,
          subject
        })
      });

      if (!uploadResponse.ok) {
        const errJson = await uploadResponse.json();
        throw new Error(errJson.error || 'File gateway upload failed.');
      }

      const uploadResult = await uploadResponse.json();

      // 3. Save Document Metadata into Cloud Firestore
      const newResourcePayload: Omit<AcademicResource, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        college: selectedCollege,
        department: selectedDepartment,
        semester: selectedSemester,
        subject: subject.trim(),
        fileKey: uploadResult.fileKey,
        fileUrl: uploadResult.fileUrl,
        fileName: file.name,
        fileSize: file.size,
        uploadedBy: user.uid,
        uploadedByEmail: user.email || '',
        uploadedByName: user.displayName || user.email || 'University Member',
        uploadedAt: new Date().toISOString(),
        averageRating: 0,
        ratingCount: 0
      };

      const docId = await createResource(newResourcePayload);

      const createdResource: AcademicResource = {
        id: docId,
        ...newResourcePayload
      };

      onUploadSuccess(createdResource);
      setSuccessInfo({
        msg: 'Your PDF has been uploaded successfully!',
        docId,
        fileKey: uploadResult.fileKey
      });

      // Reset form
      setFile(null);
      setTitle('');
      setSubject('');
      setDescription('');
    } catch (err: any) {
      console.error('Upload Error:', err);
      setErrorMessage(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, Verdana, sans-serif', fontSize: '13px' }}>

      {/* Authentication Prompt if not logged in */}
      {!user ? (
        <fieldset style={{ border: '1px solid #cc0000', padding: '15px', backgroundColor: '#fff5f5', marginBottom: '15px' }}>
          <legend style={{ fontWeight: 'bold', color: '#cc0000', padding: '0 5px' }}>
            Authentication Required for Uploads
          </legend>
          <p style={{ margin: '0 0 10px 0' }}>
            Only authenticated university members can upload PDF course materials to CampusVault. Browsing and downloading remain freely available to everyone without logging in.
          </p>
          <button
            onClick={onSignIn}
            style={{
              backgroundColor: '#e6f0fa',
              border: '1px solid #003399',
              color: '#003399',
              padding: '6px 14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            [ Click to Sign In with Google ]
          </button>
        </fieldset>
      ) : (
        <div style={{ backgroundColor: '#eef6ee', border: '1px solid #228822', padding: '6px 10px', marginBottom: '15px', fontSize: '12px' }}>
          Signed in as: <strong>{user.email || user.displayName}</strong> (Authenticated for PDF Upload)
        </div>
      )}

      {/* Success Confirmation Box */}
      {successInfo && (
        <fieldset style={{ border: '2px solid #008800', padding: '15px', backgroundColor: '#e6ffe6', marginBottom: '15px' }}>
          <legend style={{ fontWeight: 'bold', color: '#006600', padding: '0 5px' }}>
            Upload Status: Success
          </legend>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#006600' }}>
            {successInfo.msg}
          </p>
          <div style={{ fontSize: '12px', color: '#333333' }}>
            Document ID: <code>{successInfo.docId}</code> | File Key: <code>{successInfo.fileKey}</code>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => setSuccessInfo(null)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #006600',
                padding: '3px 8px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              [ Upload Another PDF Document ]
            </button>
          </div>
        </fieldset>
      )}

      {/* Upload Form */}
      {user && !successInfo && (
        <fieldset style={{ border: '1px solid #777777', padding: '15px', backgroundColor: '#ffffff' }}>
          <legend style={{ fontWeight: 'bold', fontSize: '13px', padding: '0 5px' }}>
            Submit Academic PDF File
          </legend>

          <form onSubmit={handleSubmit} style={{ margin: 0 }}>
            {errorMessage && (
              <div style={{ backgroundColor: '#ffe6e6', border: '1px solid #cc0000', color: '#cc0000', padding: '8px', marginBottom: '12px' }}>
                <strong>Error:</strong> {errorMessage}
              </div>
            )}

            <table border={0} cellPadding={6} cellSpacing={0} style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '22%', fontWeight: 'bold', verticalAlign: 'top' }}>
                    1. PDF Document File: *
                  </td>
                  <td style={{ width: '78%' }}>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#666666', marginTop: '2px' }}>
                      Allowed format: .pdf only (Max size: 20 MB). File will be uploaded to Cloudflare R2 bucket.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>
                    2. Document Title: *
                  </td>
                  <td>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. CS 101 Midterm Exam Solutions 2005"
                      style={{ width: '90%', padding: '3px', border: '1px solid #555555', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>
                    3. Academic College: *
                  </td>
                  <td>
                    <select
                      value={selectedCollege}
                      onChange={handleCollegeChange}
                      style={{ width: '90%', padding: '3px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                    >
                      {COLLEGES.map((col, idx) => (
                        <option key={idx} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                <tr>
                  <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>
                    4. Department: *
                  </td>
                  <td>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      style={{ width: '90%', padding: '3px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                    >
                      {availableDepartments.map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                <tr>
                  <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>
                    5. Academic Semester: *
                  </td>
                  <td>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      style={{ width: '90%', padding: '3px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                    >
                      {SEMESTERS.map((sem, idx) => (
                        <option key={idx} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                <tr>
                  <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>
                    6. Course Subject: *
                  </td>
                  <td>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Data Structures & Algorithms, Quantum Mechanics..."
                      style={{ width: '90%', padding: '3px', border: '1px solid #555555', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>
                    7. Description (Optional):
                  </td>
                  <td>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Enter a brief summary of topics covered in this PDF document..."
                      style={{ width: '90%', padding: '3px', border: '1px solid #555555', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td></td>
                  <td style={{ paddingTop: '10px' }}>
                    <button
                      type="submit"
                      disabled={isUploading}
                      style={{
                        backgroundColor: '#e6f0fa',
                        border: '1px solid #003399',
                        color: '#003399',
                        padding: '6px 16px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: isUploading ? 'wait' : 'pointer',
                        fontFamily: 'Arial, sans-serif'
                      }}
                    >
                      {isUploading ? 'Uploading to Cloudflare R2 & Registering Metadata...' : '[ Submit PDF Document ]'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </fieldset>
      )}

    </div>
  );
};
