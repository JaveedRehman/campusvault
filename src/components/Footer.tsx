import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid #777777', marginTop: '30px', paddingTop: '10px', fontSize: '11px', fontFamily: 'Arial, Verdana, sans-serif', color: '#555555', textAlign: 'center' }}>
      <p style={{ margin: '3px 0' }}>
        <strong>CampusVault Academic PDF Repository</strong> — Public University Open Courseware Archive
      </p>
      <p style={{ margin: '3px 0' }}>
        Hosted on Cloudflare Pages & R2 Object Storage | Index powered by Cloud Firestore & Firebase Auth
      </p>
      <p style={{ margin: '3px 0', fontSize: '10px', color: '#777777' }}>
        Best viewed in Internet Explorer 6.0+, Mozilla Firefox 1.5, or Safari 2.0 at 1024x768 resolution. No JavaScript framework overhead.
      </p>
    </footer>
  );
};
