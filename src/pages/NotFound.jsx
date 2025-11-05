// src/pages/NotFound.jsx
import React from 'react';

const NotFound = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2 style={{ color: 'red', fontSize: '2em' }}>ERROR 404: Page Not Found!</h2>
      <p>The page you are looking for does not exist in the competition system.</p>
    </div>
  );
};

export default NotFound;