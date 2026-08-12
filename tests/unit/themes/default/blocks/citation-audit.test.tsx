/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  CitationAudit,
  analyzeCitationAudit,
} from '@/themes/default/blocks/citation-audit';

const section = {
  id: 'audit-demo',
  title: 'Citation truth check',
  label: 'MVP demo',
  description: 'Paste a manuscript and inspect its bibliography.',
  input_label: 'Manuscript text',
  input_placeholder: 'Paste your paper with references...',
  sample_button: 'Load sample',
  analyze_button: 'Analyze references',
  clear_button: 'Clear',
  empty_state: 'Paste a manuscript first.',
  summary_title: 'Diagnostic report',
  score_label: 'Trust score',
  references_label: 'References found',
  sample_manuscript:
    'References\nSmith, J. (2024). Verified citation. Journal of AI, 12(2), 30-44. https://doi.org/10.1000/demo',
};

const manuscript = `This study cites Smith (2024), Wang (n.d.), and Patel (2020).

References
[1] Smith, J. (2024). Verified citation. Journal of AI, 12(2), 30-44. https://doi.org/10.1000/demo
[2] Wang, L. (n.d.). AI assisted writing habits. Retrieved from example.com
[3] Patel, R. (2020). Missing source trail for a citation.`;

describe('analyzeCitationAudit', () => {
  it('classifies references by available source trail evidence', () => {
    const report = analyzeCitationAudit(manuscript);

    expect(report.total).toBe(3);
    expect(report.trusted).toBe(1);
    expect(report.review).toBe(1);
    expect(report.risky).toBe(1);
    expect(report.references.map((item) => item.status)).toEqual([
      'trusted',
      'risky',
      'review',
    ]);
  });
});

describe('CitationAudit', () => {
  it('guides users through a manuscript citation audit', async () => {
    const user = userEvent.setup();
    render(<CitationAudit section={section} />);

    expect(
      screen.getByRole('heading', { name: /citation truth check/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /analyze references/i }));
    expect(screen.getByText('Paste a manuscript first.')).toBeInTheDocument();

    const input = screen.getByLabelText(/manuscript text/i);
    await user.click(input);
    await user.paste(manuscript);
    await user.click(screen.getByRole('button', { name: /analyze references/i }));

    expect(screen.getByText('Diagnostic report')).toBeInTheDocument();
    expect(screen.getByText('Trust score')).toBeInTheDocument();
    expect(screen.getByText('References found')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
    const findings = screen.getByLabelText(/citation findings/i);
    expect(within(findings).getByText(/Verified citation/i)).toBeInTheDocument();
    expect(
      within(findings).getByText(/AI assisted writing habits/i)
    ).toBeInTheDocument();
    expect(
      within(findings).getByText(/Missing source trail/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/manuscript text/i)).toHaveValue('');
    });
  });
});
