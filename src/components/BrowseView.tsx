import React, { useState, useMemo } from 'react';
import { AcademicResource, COLLEGES, SEMESTERS } from '../types/repository';

interface BrowseViewProps {
  resources: AcademicResource[];
  initialCollege?: string;
  initialSearch?: string;
  onSelectResource: (id: string) => void;
  onResetFilters: () => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  resources,
  initialCollege = '',
  initialSearch = '',
  onSelectResource,
  onResetFilters
}) => {
  const [selectedCollege, setSelectedCollege] = useState(initialCollege);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Filter available departments based on selected college
  const availableDepartments = useMemo(() => {
    if (!selectedCollege) {
      const all: string[] = [];
      COLLEGES.forEach(c => all.push(...c.departments));
      return Array.from(new Set(all)).sort();
    }
    const colObj = COLLEGES.find(c => c.name === selectedCollege);
    return colObj ? colObj.departments : [];
  }, [selectedCollege]);

  // Filtered resources list
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (selectedCollege && res.college !== selectedCollege) return false;
      if (selectedDepartment && res.department !== selectedDepartment) return false;
      if (selectedSemester && res.semester !== selectedSemester) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchTitle = res.title.toLowerCase().includes(query);
        const matchSubject = res.subject.toLowerCase().includes(query);
        const matchDesc = res.description ? res.description.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchSubject && !matchDesc) return false;
      }
      return true;
    });
  }, [resources, selectedCollege, selectedDepartment, selectedSemester, searchTerm]);

  const handleReset = () => {
    setSelectedCollege('');
    setSelectedDepartment('');
    setSelectedSemester('');
    setSearchTerm('');
    onResetFilters();
  };

  return (
    <div style={{ fontFamily: 'Arial, Verdana, sans-serif', fontSize: '13px' }}>

      {/* Filter Control Box */}
      <fieldset style={{ border: '1px solid #777777', padding: '12px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
        <legend style={{ fontWeight: 'bold', fontSize: '12px', padding: '0 5px' }}>
          Repository Catalog Filter Controls
        </legend>
        <table border={0} cellPadding={4} cellSpacing={0} style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ width: '15%', fontWeight: 'bold' }}>1. College:</td>
              <td style={{ width: '35%' }}>
                <select
                  value={selectedCollege}
                  onChange={(e) => {
                    setSelectedCollege(e.target.value);
                    setSelectedDepartment('');
                  }}
                  style={{ width: '95%', padding: '2px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                >
                  <option value="">-- All Colleges --</option>
                  {COLLEGES.map((col, idx) => (
                    <option key={idx} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </td>
              <td style={{ width: '15%', fontWeight: 'bold' }}>2. Department:</td>
              <td style={{ width: '35%' }}>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  style={{ width: '95%', padding: '2px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                >
                  <option value="">-- All Departments --</option>
                  {availableDepartments.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>3. Semester:</td>
              <td>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  style={{ width: '95%', padding: '2px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                >
                  <option value="">-- All Semesters --</option>
                  {SEMESTERS.map((sem, idx) => (
                    <option key={idx} value={sem}>{sem}</option>
                  ))}
                </select>
              </td>
              <td style={{ fontWeight: 'bold' }}>4. Search Query:</td>
              <td>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Keyword search..."
                  style={{ width: '90%', padding: '2px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={{ textAlign: 'right', paddingTop: '6px' }}>
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: '#eeeeee',
                    border: '1px solid #666666',
                    padding: '2px 8px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  [ Clear All Filters ]
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </fieldset>

      {/* Counter Summary */}
      <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: '#333333' }}>
        Found {filteredResources.length} document(s) matching your filter criteria:
      </div>

      {/* Results Table */}
      <table border={1} cellPadding={6} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#777777' }}>
        <thead>
          <tr style={{ backgroundColor: '#e0e0e0', textAlign: 'left' }}>
            <th style={{ width: '30%' }}>Document Title & Subject</th>
            <th style={{ width: '22%' }}>College</th>
            <th style={{ width: '20%' }}>Department & Semester</th>
            <th style={{ width: '10%', textAlign: 'center' }}>Rating</th>
            <th style={{ width: '18%', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredResources.map((res) => (
            <tr key={res.id} style={{ borderBottom: '1px solid #cccccc' }}>
              <td>
                <a
                  href={`#doc-${res.id}`}
                  onClick={(e) => { e.preventDefault(); if (res.id) onSelectResource(res.id); }}
                  style={{ color: '#0000ee', fontWeight: 'bold' }}
                >
                  {res.title}
                </a>
                <div style={{ fontSize: '11px', color: '#555555', marginTop: '2px' }}>
                  Subject: <strong>{res.subject}</strong>
                </div>
              </td>
              <td style={{ fontSize: '11px' }}>{res.college}</td>
              <td style={{ fontSize: '11px' }}>
                <div>{res.department}</div>
                <div style={{ color: '#666' }}>{res.semester}</div>
              </td>
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
                  style={{ color: '#0000ee', textDecoration: 'underline', marginRight: '6px' }}
                >
                  [ View Details ]
                </a>
                <a
                  href={res.fileUrl || `/api/download/${res.fileKey}?download=true`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#006600', textDecoration: 'underline' }}
                >
                  [ Download PDF ]
                </a>
              </td>
            </tr>
          ))}

          {filteredResources.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '15px', color: '#666666' }}>
                No academic documents match the selected filters. Try clearing the filter choices.
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
};
