import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  // TODO: replace with real search logic / API call
  return (
    <div>
      <h2>Sökresultat</h2>
      <p>Du sökte: <strong>{q}</strong></p>

      <h3>Exempelresultat</h3>
      <ul>
        <li><Link to="/artiklar/glukos">Glukos — tolkning och klinisk användning</Link></li>
        <li><Link to="/fall/case-001">Fall 001 — Hyperglykemi</Link></li>
      </ul>
    </div>
  );
}