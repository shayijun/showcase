'use client';

import { ChangeEvent, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileText,
  SearchCheck,
  UploadCloud,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type CitationStatus = 'trusted' | 'review' | 'risky';

type CitationStatusLabels = Record<CitationStatus, string>;

export interface CitationReference {
  id: string;
  raw: string;
  title: string;
  status: CitationStatus;
  evidence: string[];
}

export interface CitationAuditReport {
  score: number;
  total: number;
  trusted: number;
  review: number;
  risky: number;
  references: CitationReference[];
}

const defaultStatusLabels: CitationStatusLabels = {
  trusted: 'Source trail complete',
  review: 'Needs review',
  risky: 'High risk',
};

const defaultSampleManuscript = `This draft discusses retrieval-augmented writing and cites Smith (2024), Wang (n.d.), and Patel (2020).

References
[1] Smith, J. (2024). Verified citation. Journal of AI, 12(2), 30-44. https://doi.org/10.1000/demo
[2] Wang, L. (n.d.). AI assisted writing habits. Retrieved from example.com
[3] Patel, R. (2020). Missing source trail for a citation.`;

function getReferenceLines(manuscript: string): string[] {
  const lines = manuscript
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const markerIndex = lines.findIndex((line) =>
    /^(references|bibliography|works cited|参考文献|引用文献)\b/i.test(
      line.replace(/[:：]$/, '')
    )
  );

  const candidateLines =
    markerIndex >= 0
      ? lines.slice(markerIndex + 1)
      : lines.filter((line) =>
          /^(\[\d+\]|\d+\.|[-*])\s+/.test(line) ||
          /\bdoi\b|https?:\/\/|\((?:19|20)\d{2}\)/i.test(line)
        );

  const references: string[] = [];
  let current = '';

  for (const line of candidateLines) {
    const startsNewReference =
      /^(\[\d+\]|\d+\.|[-*])\s+/.test(line) ||
      (!current && /\((?:19|20)\d{2}|n\.d\.\)/i.test(line));

    if (startsNewReference && current) {
      references.push(current);
      current = line;
      continue;
    }

    current = current ? `${current} ${line}` : line;
  }

  if (current) {
    references.push(current);
  }

  return references.map((line) => line.replace(/^(\[\d+\]|\d+\.|[-*])\s+/, ''));
}

function extractReferenceTitle(reference: string): string {
  const titleMatch = reference.match(
    /\((?:19|20)\d{2}|n\.d\.\)\.?\s*([^.;]+)/i
  );

  if (titleMatch?.[1]) {
    return titleMatch[1].trim();
  }

  const parts = reference.split('.').map((part) => part.trim());
  return parts.find((part) => part.length > 12) || reference.slice(0, 90);
}

function scoreReference(reference: string): {
  status: CitationStatus;
  evidence: string[];
} {
  const hasDoi = /\bdoi\b|doi\.org|10\.\d{4,9}\//i.test(reference);
  const hasUrl = /https?:\/\/|www\./i.test(reference);
  const hasYear = /\((?:19|20)\d{2}\)|\b(?:19|20)\d{2}\b/.test(reference);
  const hasNoDate = /\bn\.d\.|no date|日期不详/i.test(reference);
  const hasVenue =
    /\b(journal|proceedings|conference|review|transactions|press|学报|期刊|会议|出版社)\b/i.test(
      reference
    ) || /,\s*\d+\s*\(\d+\)/.test(reference);
  const hasPages = /\b\d{1,4}\s*[-–]\s*\d{1,4}\b|pp\./i.test(reference);

  const evidence: string[] = [];

  if (hasDoi || hasUrl) {
    evidence.push('Source link present');
  } else {
    evidence.push('Missing DOI or URL');
  }

  if (hasYear && !hasNoDate) {
    evidence.push('Publication year present');
  } else {
    evidence.push('Publication date needs verification');
  }

  if (hasVenue) {
    evidence.push('Venue signal detected');
  } else {
    evidence.push('Venue signal unclear');
  }

  if (hasPages) {
    evidence.push('Page or volume detail present');
  }

  if (hasNoDate || !hasYear) {
    return { status: 'risky', evidence };
  }

  if (!(hasDoi || hasUrl) || !hasVenue) {
    return { status: 'review', evidence };
  }

  return { status: 'trusted', evidence };
}

export function analyzeCitationAudit(
  manuscript: string
): CitationAuditReport {
  const references = getReferenceLines(manuscript).map((reference, index) => {
    const result = scoreReference(reference);

    return {
      id: `ref-${index + 1}`,
      raw: reference,
      title: extractReferenceTitle(reference),
      status: result.status,
      evidence: result.evidence,
    };
  });

  const trusted = references.filter((item) => item.status === 'trusted').length;
  const review = references.filter((item) => item.status === 'review').length;
  const risky = references.filter((item) => item.status === 'risky').length;
  const total = references.length;
  const score =
    total === 0
      ? 0
      : Math.max(24, Math.round(100 - risky * 28 - review * 14));

  return {
    score,
    total,
    trusted,
    review,
    risky,
    references,
  };
}

function getStatusClasses(status: CitationStatus): string {
  if (status === 'trusted') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  }

  if (status === 'risky') {
    return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300';
  }

  return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
}

function getStatusIcon(status: CitationStatus) {
  if (status === 'trusted') {
    return CheckCircle2;
  }

  if (status === 'risky') {
    return AlertTriangle;
  }

  return SearchCheck;
}

export function CitationAudit({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const [manuscript, setManuscript] = useState('');
  const [report, setReport] = useState<CitationAuditReport | null>(null);
  const [notice, setNotice] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);

  const statusLabels: CitationStatusLabels = {
    ...defaultStatusLabels,
    ...(section.status_labels || {}),
  };
  const sampleManuscript =
    section.sample_manuscript || defaultSampleManuscript;
  const fileInputId = `${section.id || 'citation-audit'}-file`;

  const handleAnalyze = (value = manuscript) => {
    if (!value.trim()) {
      setReport(null);
      setNotice(section.empty_state || 'Paste a manuscript first.');
      return;
    }

    setNotice('');
    setReport(analyzeCitationAudit(value));
  };

  const handleSample = () => {
    setManuscript(sampleManuscript);
    handleAnalyze(sampleManuscript);
  };

  const handleClear = () => {
    setManuscript('');
    setReport(null);
    setNotice('');
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsReadingFile(true);

    try {
      const text = await file.text();
      setManuscript(text);
      handleAnalyze(text);
    } catch {
      setNotice(section.file_error || 'Could not read this file.');
    } finally {
      setIsReadingFile(false);
      event.target.value = '';
    }
  };

  const metrics = [
    {
      label: statusLabels.trusted,
      value: report?.trusted ?? 0,
      className: 'text-emerald-600 dark:text-emerald-300',
    },
    {
      label: statusLabels.review,
      value: report?.review ?? 0,
      className: 'text-amber-600 dark:text-amber-300',
    },
    {
      label: statusLabels.risky,
      value: report?.risky ?? 0,
      className: 'text-rose-600 dark:text-rose-300',
    },
  ];

  return (
    <section
      id={section.id}
      className={cn('bg-background py-16 md:py-24', section.className, className)}
    >
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-5">
              {section.label && (
                <Badge
                  variant="outline"
                  className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                >
                  <FileSearch className="size-3.5" />
                  {section.label}
                </Badge>
              )}
              <div className="max-w-xl space-y-4">
                <h2 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="text-muted-foreground text-base leading-7">
                    {section.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(section.items || []).slice(0, 3).map((item, index) => (
                <div
                  className="rounded-md border p-4"
                  key={item.title || item.label || index}
                >
                  <p className="text-muted-foreground text-xs">
                    {item.label || item.title}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  <p className="text-muted-foreground mt-2 text-xs leading-5">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-md border bg-muted/40 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardCheck className="text-sky-600 size-5 dark:text-sky-300" />
                <h3 className="text-sm font-medium">
                  {section.checklist_title || 'What the MVP checks'}
                </h3>
              </div>
              <div className="space-y-3">
                {(
                  section.checklist || [
                    'Extract the References section',
                    'Flag missing DOI or URL evidence',
                    'Spot unknown publication dates',
                  ]
                ).map((item: string) => (
                  <div className="flex items-start gap-3 text-sm" key={item}>
                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-background shadow-sm">
            <div className="border-b p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {section.input_label || 'Manuscript text'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {section.input_help ||
                      'Paste your draft or upload a plain text manuscript.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    accept=".txt,.md,.rtf,text/plain,text/markdown"
                    className="sr-only"
                    id={fileInputId}
                    onChange={handleFileUpload}
                    type="file"
                  />
                  <Button asChild size="sm" variant="outline">
                    <label htmlFor={fileInputId}>
                      <UploadCloud className="size-4" />
                      {isReadingFile
                        ? section.uploading_label || 'Reading'
                        : section.upload_button || 'Upload'}
                    </label>
                  </Button>
                  <Button onClick={handleSample} size="sm" variant="outline">
                    <FileText className="size-4" />
                    {section.sample_button || 'Load sample'}
                  </Button>
                  <Button onClick={handleClear} size="sm" variant="ghost">
                    <XCircle className="size-4" />
                    {section.clear_button || 'Clear'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
              <div className="border-b p-4 lg:border-r lg:border-b-0">
                <label
                  className="sr-only"
                  htmlFor={`${section.id || 'citation-audit'}-manuscript`}
                >
                  {section.input_label || 'Manuscript text'}
                </label>
                <Textarea
                  className="min-h-[360px] resize-none border-0 bg-muted/35 text-sm leading-6 shadow-none focus-visible:ring-1"
                  id={`${section.id || 'citation-audit'}-manuscript`}
                  onChange={(event) => setManuscript(event.target.value)}
                  placeholder={
                    section.input_placeholder ||
                    'Paste your paper with references...'
                  }
                  value={manuscript}
                />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-muted-foreground text-xs">
                    {manuscript.length.toLocaleString()} chars
                  </p>
                  <Button onClick={() => handleAnalyze()}>
                    <SearchCheck className="size-4" />
                    {section.analyze_button || 'Analyze references'}
                  </Button>
                </div>
                {notice && (
                  <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                    {notice}
                  </p>
                )}
              </div>

              <div className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {section.summary_title || 'Diagnostic report'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {section.summary_description ||
                        'A first-pass signal before manual review.'}
                    </p>
                  </div>
                  <FileSearch className="text-muted-foreground size-5" />
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="mb-3 flex items-end justify-between">
                      <span className="text-muted-foreground text-xs">
                        {section.score_label || 'Trust score'}
                      </span>
                      <span className="text-3xl font-semibold">
                        {report?.score ?? 0}
                      </span>
                    </div>
                    <Progress value={report?.score ?? 0} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs">
                        {section.references_label || 'References found'}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {report?.total ?? 0}
                      </p>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs">
                        {section.risk_label || 'Risk flags'}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-300">
                        {report?.risky ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {metrics.map((metric) => (
                      <div className="rounded-md bg-muted/45 p-3" key={metric.label}>
                        <p className={cn('text-lg font-semibold', metric.className)}>
                          {metric.value}
                        </p>
                        <p className="text-muted-foreground mt-1 text-[11px] leading-4">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    aria-label={section.findings_label || 'Citation findings'}
                    className="max-h-[310px] space-y-3 overflow-auto pr-1"
                  >
                    {report?.references.length ? (
                      report.references.map((reference, index) => {
                        const StatusIcon = getStatusIcon(reference.status);

                        return (
                          <div className="rounded-md border p-3" key={reference.id}>
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-medium">
                                  Ref #{index + 1}
                                </p>
                                <p className="mt-1 text-sm leading-5">
                                  {reference.title}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={getStatusClasses(reference.status)}
                              >
                                <StatusIcon className="size-3.5" />
                                {statusLabels[reference.status]}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {reference.evidence.map((item) => (
                                <span
                                  className="bg-muted rounded px-2 py-1 text-[11px] text-muted-foreground"
                                  key={item}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-md border border-dashed p-6 text-center">
                        <SearchCheck className="text-muted-foreground mx-auto mb-3 size-6" />
                        <p className="text-muted-foreground text-sm">
                          {section.report_empty ||
                            'Run an audit to see citation-level findings.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
