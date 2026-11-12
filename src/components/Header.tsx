import React from 'react';

interface HeaderProps {
  currentTab: 'home' | 'browse' | 'detail' | 'upload' | 'setup';
  setCurrentTab: (tab: 'home' | 'browse' | 'detail' | 'upload' | 'setup') => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onSignIn,
  onSignOut
}) => {
  return (
    <header style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #000000', paddingBottom: '10px', marginBottom: '15px' }}>
      {/* Top University Header Banner */}
      <table border={0} cellPadding={0} cellSpacing={0} style={{ width: '100%', marginBottom: '8px' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'middle' }}>
              <div style={{ fontFamily: 'Times New Roman, Georgia, serif', fontSize: '24px', fontWeight: 'bold', color: '#000066', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                CampusVault Academic Repository
              </div>
              <div style={{ fontFamily: 'Arial, Verdana, sans-serif', fontSize: '11px', color: '#444444', fontStyle: 'italic', marginTop: '2px' }}>
                Open-Access University Courseware, Lecture Notes & PDF Archives — Established 2005
              </div>
            </td>
            <td style={{ textAlign: 'right', verticalAlign: 'middle', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
              {user ? (
                <span>
                  User: <strong>{user.email || user.displayName || 'Member'}</strong> &nbsp;|&nbsp;
                  <button
                    onClick={onSignOut}
                    style={{
                      background: '#eeeeee',
                      border: '1px solid #666666',
                      padding: '2px 6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'Arial, sans-serif'
                    }}
                  >
                    Sign Out
                  </button>
                </span>
              ) : (
                <button
                  onClick={onSignIn}
                  style={{
                    background: '#e6f0fa',
                    border: '1px solid #003399',
                    color: '#003399',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  [ Sign In with Google to Upload ]
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Navigation Menu Bar */}
      <div style={{ backgroundColor: '#f4f4f4', border: '1px solid #888888', padding: '6px 10px', fontFamily: 'Arial, Verdana, sans-serif', fontSize: '12px' }}>
        <strong>Navigation Directory:</strong> &nbsp;&nbsp;
        <a
          href="#home"
          onClick={(e) => { e.preventDefault(); setCurrentTab('home'); }}
          style={{
            color: currentTab === 'home' ? '#000000' : '#0000ee',
            fontWeight: currentTab === 'home' ? 'bold' : 'normal',
            textDecoration: currentTab === 'home' ? 'none' : 'underline'
          }}
        >
          [ 1. Home & Index ]
        </a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a
          href="#browse"
          onClick={(e) => { e.preventDefault(); setCurrentTab('browse'); }}
          style={{
            color: currentTab === 'browse' ? '#000000' : '#0000ee',
            fontWeight: currentTab === 'browse' ? 'bold' : 'normal',
            textDecoration: currentTab === 'browse' ? 'none' : 'underline'
          }}
        >
          [ 2. Browse Resources ]
        </a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a
          href="#upload"
          onClick={(e) => { e.preventDefault(); setCurrentTab('upload'); }}
          style={{
            color: currentTab === 'upload' ? '#000000' : '#0000ee',
            fontWeight: currentTab === 'upload' ? 'bold' : 'normal',
            textDecoration: currentTab === 'upload' ? 'none' : 'underline'
          }}
        >
          [ 3. Upload Document ]
        </a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a
          href="#setup"
          onClick={(e) => { e.preventDefault(); setCurrentTab('setup'); }}
          style={{
            color: currentTab === 'setup' ? '#000000' : '#0000ee',
            fontWeight: currentTab === 'setup' ? 'bold' : 'normal',
            textDecoration: currentTab === 'setup' ? 'none' : 'underline'
          }}
        >
          [ 4. Cloudflare R2 & Setup Guide ]
        </a>
      </div>
    </header>
  );
};
