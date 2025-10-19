import React from 'react';
import { Link } from 'react-router-dom';

export default function Fall() {
  const cases = [
    { id: 'case-001', title: 'Fall 001 — Hyperglykemi' },
    { id: 'case-002', title: 'Fall 002 — Anemiutredning' },
  ];

  return (
    <div>
      <h2>Fall</h2>
      <ul>
        {cases.map(c => (
          <li key={c.id}><Link to={`/fall/${c.id}`}>{c.title}</Link></li>
        ))}
      </ul>
    </div>
  );
}