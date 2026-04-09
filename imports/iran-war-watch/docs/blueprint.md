# **App Name**: Iran War Watch

## Core Features:

- News Article Ingestion: Fetch and ingest relevant news articles from a news API, initially integrating with NewsAPI and designed for future expansion to GDELT.
- Keyword Watchlist Management: Allow users to create, categorize (Conflict, Nuclear, Maritime/Energy), and manage keyword watchlists for article filtering and relevance scoring.
- Dynamic Article Dashboard: Display ingested articles in a clean, scrollable dashboard, providing a quick overview of recent and significant developments.
- AI-Powered Article Scoring & Signal Level: Automatically score each article based on keyword matches, recency, trusted source weighting, duplicate detection, and use an AI tool for classifying event significance, assigning a 'Signal Level' (low, medium, high, critical).
- AI-Generated 'Why Flagged' Explanations: Provide a concise, AI-generated explanation detailing why an article was flagged, its assigned score, and signal level based on keyword matches, source, and AI assessment.
- Advanced Filtering and Sorting: Enable users to filter articles by score range, specific news sources, keyword group, and time window, along with sorting options.
- Configuration Settings Panel: An administrative interface for users to define trusted news sources, adjust scoring weights, and update or refine keyword lists.

## Style Guidelines:

- Primary interactive color: A professional and vibrant blue (#478BEB) for accents, buttons, and key informational elements, to provide clarity in a dark interface.
- Background color: A very dark desaturated bluish-gray (#1F252E) to establish a clean and calm 'dark mode' environment suitable for an analyst dashboard.
- Accent color: A sophisticated lavender purple (#8C85E0) used sparingly for notifications, highlights, or secondary interactive elements, providing a harmonious contrast.
- Headline font: 'Space Grotesk' (sans-serif) for its modern, slightly techy feel, enhancing the dashboard's analytical aesthetic.
- Body font: 'Inter' (sans-serif) for clear readability and a compact appearance, essential for presenting detailed news content efficiently.
- Utilize a consistent set of clean, simple line-art icons that complement the professional and modern aesthetic of an analyst's dashboard, ensuring quick visual comprehension.
- Implement a responsive, card-based layout for articles, optimizing for readability on both large screens (multi-column or master-detail) and mobile devices. A collapsible sidebar should house filtering and configuration controls.
- Subtle and purposeful animations for transitions, data updates, and interactive elements, ensuring a fluid user experience without distracting from critical information.