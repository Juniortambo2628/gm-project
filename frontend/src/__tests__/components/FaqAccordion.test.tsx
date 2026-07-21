import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqAccordion } from '@/components/FaqAccordion';

describe('FaqAccordion', () => {
  const faqs = [
    { question: 'What is MBA coaching?', answer: 'MBA coaching helps you get into top business schools.' },
    { question: 'How long is the program?', answer: 'The program lasts 6-8 weeks.' },
  ];

  it('renders all FAQ questions', () => {
    render(<FaqAccordion faqs={faqs} />);
    expect(screen.getByText('What is MBA coaching?')).toBeInTheDocument();
    expect(screen.getByText('How long is the program?')).toBeInTheDocument();
  });

  it('shows empty state when no FAQs', () => {
    render(<FaqAccordion faqs={[]} />);
    expect(screen.getByText(/No FAQs available/)).toBeInTheDocument();
  });

  it('expands and shows answer on click', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion faqs={faqs} />);
    
    await user.click(screen.getByText('What is MBA coaching?'));
    
    expect(screen.getByText(/MBA coaching helps you get into top business schools/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FaqAccordion faqs={faqs} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
