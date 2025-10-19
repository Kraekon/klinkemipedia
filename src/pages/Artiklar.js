import React from 'react';
import { Link } from 'react-router-dom';

export default function Artiklar() {
  // placeholder list - later load from API or markdown files
  const items = [
    { id: 'glukos', title: 'Glukos — tolkning och klinisk användning' },
    { id: 'hb', title: 'Hemoglobin — referensintervall och analyser' },
  ];

  return (
    <div>
      <h2>Artiklar</h2>
      <ul>
        {items.map(i => (
          <li key={i.id}><Link to={`/artiklar/${i.id}`}>{i.title}</Link></li>
        ))}
      </ul>
    </div>
  );
}