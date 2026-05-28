import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthNavigatorView } from '../MonthNavigator.view';

const defaultProps = {
  year: 2026,
  month: 4, // Maio (0-indexed)
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onChange: vi.fn(),
};

describe('MonthNavigatorView', () => {
  it('renders the correct month and year label', () => {
    render(<MonthNavigatorView {...defaultProps} />);
    expect(screen.getByText('Maio 2026')).toBeInTheDocument();
  });

  it('renders January correctly', () => {
    render(<MonthNavigatorView {...defaultProps} month={0} year={2025} />);
    expect(screen.getByText('Janeiro 2025')).toBeInTheDocument();
  });

  it('renders December correctly', () => {
    render(<MonthNavigatorView {...defaultProps} month={11} year={2024} />);
    expect(screen.getByText('Dezembro 2024')).toBeInTheDocument();
  });

  it('calls onPrev when previous button is clicked', async () => {
    const onPrev = vi.fn();
    render(<MonthNavigatorView {...defaultProps} onPrev={onPrev} />);

    await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNext when next button is clicked', async () => {
    const onNext = vi.fn();
    render(<MonthNavigatorView {...defaultProps} onNext={onNext} />);

    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(onNext).toHaveBeenCalledOnce();
  });

  it('has accessible month picker input', () => {
    render(<MonthNavigatorView {...defaultProps} />);
    expect(screen.getByLabelText('Selecionar mês e ano')).toBeInTheDocument();
  });

  it('picker input has correct value for the selected month', () => {
    render(<MonthNavigatorView {...defaultProps} year={2026} month={4} />);
    const input = screen.getByLabelText('Selecionar mês e ano') as HTMLInputElement;
    expect(input.value).toBe('2026-05');
  });
});
