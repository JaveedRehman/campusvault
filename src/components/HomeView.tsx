import React, { useState } from 'react';
import { AcademicResource, COLLEGES } from '../types/repository';

interface HomeViewProps {
  resources: AcademicResource[];
  onSelectResource: (id: string) => void;
  onGoToBrowse: (college?: string, search?: string) => void;
  onGoToUpload: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  resources,
  onSelectResource,
  onGoToBrowse,
  onGoToUpload
}) => {
  const [quickSearch, setQuickSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onGoToBrowse(undefined, quickSearch.trim());
    }
  };

  const recentUploads = [...resources]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 8);

  return (
    <div style={{ fontFamily: 'Arial, Verdana, sans-serif', fontSize: '13px', lineHeight: '1.4' }}>

      {/* Main Mission Announcement Block */}
      <table border={1} cellPadding={10} cellSpacing={0} style={{ width: '100%', borderColor: '#666666', borderCollapse: 'collapse', marginBottom: '15px', backgroundColor: '#fafafa' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#eeeeee', borderBottom: '1px solid #666666' }}>
              <strong>Welcome to CampusVault Academic PDF Repository</strong>
            </td>
          </tr>
          <tr>
            <td>
              <p style={{ margin: '0 0 8px 0' }}>
                CampusVault is a free, open access university repository designed to facilitate student learning, course preparation, and academic research. All registered students and faculty can contribute notes, lab reports, past exam solutions, and reference papers.
              </p>
              <ul style={{ margin: '4px 0 8px 20px', padding: 0 }}>
                <li><strong>Public Access:</strong> Anyone can search, view, and download PDF course materials without logging in.</li>
                <li><strong>Open Uploads:</strong> Authenticated users can upload course documents directly into Cloudflare R2 storage.</li>
                <li><strong>Community Ratings:</strong> Rate documents on a 1-5 star scale to highlight high-quality study notes.</li>
              </ul>
              <div style={{ fontSize: '12px' }}>
                <button
                  onClick={onGoToUpload}
                  style={{
                    backgroundColor: '#e6f0fa',
                    border: '1px solid #003399',
                    color: '#003399',
                    padding: '4px 10px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  Submit / Upload a New PDF Document &raquo;
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Quick Search Form */}
      <fieldset style={{ border: '1px solid #777777', padding: '10px 12px', marginBottom: '15px', backgroundColor: '#ffffff' }}>
        <legend style={{ fontWeight: 'bold', fontSize: '12px', padding: '0 5px' }}>
          Quick Repository Search
        </legend>
        <form onSubmit={handleSearchSubmit} style={{ margin: 0 }}>
          <label style={{ marginRight: '8px' }}>Search Title or Subject:</label>
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="e.g. Data Structures, Linear Algebra, Quantum..."
            style={{ width: '320px', padding: '3px', border: '1px solid #555555', fontFamily: 'Arial, sans-serif', fontSize: '12px', marginRight: '6px' }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#f0f0f0',
              border: '1px solid #444444',
              padding: '3px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Search Repository
          </button>
        </form>
      </fieldset>

      {/* Colleges Taxonomy Directory */}
      <fieldset style={{ border: '1px solid #777777', padding: '10px 12px', marginBottom: '15px' }}>
        <legend style={{ fontWeight: 'bold', fontSize: '12px', padding: '0 5px' }}>
          Browse by University Colleges
        </legend>
        <table border={0} cellPadding={4} cellSpacing={0} style={{ width: '100%' }}>
          <tbody>
            {COLLEGES.map((col, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eeeeee' }}>
                <td style={{ width: '35%', verticalAlign: 'top', fontWeight: 'bold' }}>
                  <a
                    href="#browse"
                    onClick={(e) => { e.preventDefault(); onGoToBrowse(col.name); }}
                    style={{ color: '#0000ee', textDecoration: 'underline' }}
                  >
                    {col.name}
                  </a>
                </td>
                <td style={{ verticalAlign: 'top', color: '#444444', fontSize: '12px' }}>
                  Departments: {col.departments.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>

      {/* Recently Uploaded Documents Table */}
      <table border={1} cellPadding={6} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#777777' }}>
        <thead>
          <tr style={{ backgroundColor: '#e0e0e0', textAlign: 'left' }}>
            <th style={{ width: '35%' }}>Document Title</th>
            <th style={{ width: '22%' }}>Department</th>
            <th style={{ width: '15%' }}>Semester</th>
            <th style={{ width: '10%', textAlign: 'center' }}>Rating</th>
            <th style={{ width: '18%', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recentUploads.map((res) => (
            <tr key={res.id} style={{ borderBottom: '1px solid #cccccc' }}>
              <td>
                <a
                  href={`#doc-${res.id}`}
                  onClick={(e) => { e.preventDefault(); if (res.id) onSelectResource(res.id); }}
                  style={{ color: '#0000ee', fontWeight: 'bold' }}
                >
                  {res.title}
                </a>
                {res.isSample && (
                  <span style={{ fontSize: '10px', color: '#666666', marginLeft: '6px' }}>[Archive Sample]</span>
                )}
              </td>
              <td style={{ fontSize: '12px' }}>{res.department}</td>
              <td style={{ fontSize: '12px' }}>{res.semester}</td>
              <td style={{ textAlign: 'center', fontSize: '12px' }}>
                {res.ratingCount > 0 ? (
                  <span>★ {res.averageRating} ({res.ratingCount})</span>
                ) : (
                  <span style={{ color: '#888' }}>Unrated</span>
                )}
              </td>
              <td style={{ textAlign: 'center', fontSize: '12px' }}>
                <a
                  href={`#doc-${res.id}`}
                  onClick={(e) => { e.preventDefault(); if (res.id) onSelectResource(res.id); }}
                  style={{ color: '#0000ee', textDecoration: 'underline', marginRight: '8px' }}
                >
                  [ Details ]
                </a>
                <a
                  href={res.fileUrl || `/api/download/${res.fileKey}?download=true`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#006600', textDecoration: 'underline' }}
                >
                  [ Download ]
                </a>
              </td>
            </tr>
          ))}
          {recentUploads.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>
                No PDF documents uploaded yet. Be the first to contribute!
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
};
