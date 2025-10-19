import React from 'react';

export default function Lankar() {
  const links = [
    { url: 'https://www.svk.se', label: 'Svensk vårdkommitté (exempel)' },
    { url: 'https://www.labmedicin.se', label: 'Laboratoriemedicin (exempel)' },
  ];

  return (
    <div>
      <h2>Länkar</h2>
      <ul>
        {links.map(l => (
          <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer">{l.label}</a></li>
        ))}
      </ul>
    </div>
  );
}