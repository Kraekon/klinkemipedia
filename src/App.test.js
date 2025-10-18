import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Klinkemipedia navbar', () => {
  render(<App />);
  const navElement = screen.getByText(/Klinkemipedia/i);
  expect(navElement).toBeInTheDocument();
});
