import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { rssFeedRegistry } from '@/lib/rss-feeds';

// Force dynamic execution and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type FeedItem = {
  source: string;
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  guid?: string;
};

export async function GET() {
  const parser = new Parser();
  let combinedItems: FeedItem[] = [];
  const errors: { source: string; error: string }[] = [];

  for (const feedInfo of rssFeedRegistry) {
    try {
      const feed = await parser.parseURL(feedInfo.url);
      if (feed.items) {
        const items: FeedItem[] = feed.items.map(item => ({
          source: feedInfo.name,
          title: item.title || 'No Title',
          link: item.link || '',
          pubDate: item.pubDate,
          content: item.contentSnippet || item.content || '',
          guid: item.guid || item.link, // Use link as fallback guid
        }));
        combinedItems.push(...items);
      }
    } catch (error) {
      console.error(`Failed to fetch or parse RSS feed: ${feedInfo.name}`, error);
      errors.push({ source: feedInfo.name, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Sort by date, most recent first
  combinedItems.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });

  return NextResponse.json({
    items: combinedItems,
    errors: errors,
  });
}
