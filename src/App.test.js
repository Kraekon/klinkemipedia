import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Klinkemipedia application', () => {
  render(<App />);
  const navElement = screen.getAllByText(/Klinkemipedia/i)[0];
  expect(navElement).toBeInTheDocument();
});
