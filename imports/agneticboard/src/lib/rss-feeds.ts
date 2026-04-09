export interface RssFeed {
    id: string;
    name: string;
    url: string;
    category: string;
}

export const rssFeedRegistry: RssFeed[] = [
    {
        id: 'reuters-world',
        name: 'Reuters World News',
        url: 'https://www.reuters.com/arc/outboundfeeds/rss/category/world/',
        category: 'World',
    },
    {
        id: 'ap-top-news',
        name: 'Associated Press Top News',
        url: 'https://apnews.com/hub/ap-top-news/rss',
        category: 'World',
    }
];
