/**
 * RSS 2.0 feed for the daily case corpus (/rss.xml).
 *
 * Generated from the same data as /{lang}/briefs/, so the feed can never
 * drift from the pages. English titles are used because the feed is a single
 * channel; every item links to the English case page.
 */

import type { APIRoute } from 'astro';
import briefs from '../data/daily-briefs.json';
import { briefHeading } from '../../scripts/lib/daily-briefs.mjs';

const SITE = 'https://www.jevcode.ai';
const FEED_SIZE = 100;

/** Minimal XML escaping for text nodes and attributes. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** published is YYYY-MM-DD; give it a stable UTC timestamp. */
function pubDate(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export const GET: APIRoute = () => {
  const rows = [...briefs]
    .sort((a, b) => String(b.published).localeCompare(String(a.published)))
    .slice(0, FEED_SIZE);

  const items = rows
    .map((row) => {
      const url = `${SITE}/en/briefs/${row.id}/`;
      const title = briefHeading(row, 'en') || row.id;
      return [
        '    <item>',
        `      <title>${esc(title)}</title>`,
        `      <link>${esc(url)}</link>`,
        `      <guid isPermaLink="true">${esc(url)}</guid>`,
        `      <pubDate>${pubDate(row.published)}</pubDate>`,
        `      <description>${esc(row.question)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const latest = rows[0]?.published;
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>JevCode — Daily cases</title>',
    `    <link>${SITE}/en/briefs/</link>`,
    `    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />`,
    '    <description>New structured-judgment cases published for the clavue-jev model.</description>',
    '    <language>en</language>',
    latest ? `    <lastBuildDate>${pubDate(latest)}</lastBuildDate>` : null,
    items,
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
