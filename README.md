# Purpose

A small command line tool to convert Markdown files into HTML formatted for WordPress configured with the [WP-GeSHi-Highlight](https://wordpress.org/plugins/wp-geshi-highlight/) plugin.

# Installation

1. Install [Node.js](https://nodejs.org). Version 14 is confirmed to work with macOS 11.0 and Windows 10 20H2.
2. Run `npm install`

# Usage

1. Write the Markdown file you want to convert to HTML
2. Run `node /path/to/md2wphtml.js /path/to/input.md /path/to/output.html`

The output HTML is now in `/path/to/output.html` and has been copied to the clipboard so it can be pasted into WordPress.
