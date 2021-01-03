const fs = require('fs');
const showdown = require('showdown');
const clipboardy = require('clipboardy');

////////////////////////////////////////////////////////////////////////////////
// Parse command line options
////////////////////////////////////////////////////////////////////////////////

const [mdPath, htmlPath] = process.argv.slice(2);
if (!mdPath || !htmlPath) {
  console.error('Paths not specified');
  console.error('Usage');
  console.error('  node md2wphtml.js /path/to/input.md /path/to/output.html');
  process.exit(1);
}

////////////////////////////////////////////////////////////////////////////////
// Read Markdown file
////////////////////////////////////////////////////////////////////////////////

const markdown = fs.readFileSync(mdPath, 'utf8');

////////////////////////////////////////////////////////////////////////////////
// Convert Markdown to HTML (first pass only)
////////////////////////////////////////////////////////////////////////////////

const converter = new showdown.Converter({
  ghCodeBlocks: true, // outputs GitHub code block HTML
  noHeaderId: true, // disables 'id' attribute in <h*>
  strikethrough: true, // enables strikethrough
  tables: true, // enables tables
});
let html = converter.makeHtml(markdown);

////////////////////////////////////////////////////////////////////////////////
// Change GitHub code block HTML into WP-GeSHi-Highlight code block HTML
// GitHub code block HTML looks like this:
//   <pre><code class="cs language-cs">void Foo()
//   {
//   }
//   </code></pre>
// WP-GeSHi-Highlight code block HTML looks like this:
//   
//   <pre lang="cs">
//   void Foo()
//   {
//   }
//   </pre>
// Also, prefix and postfix with a newline
////////////////////////////////////////////////////////////////////////////////

// Before:
//   <pre><code class="cs language-cs">void Foo()
// After:
//   
//   <pre lang="cs language-cs">void Foo()
html = html.replace(/\<pre\>\<code class=\"/g, '\n\<pre lang=\"');

// Before:
//   <pre lang="cs language-cs">void Foo()
// After:
//   <pre lang="cs">
//   void Foo()
html = html.replace(/ language-[a-z]*\"\>/g, '\"\>\n');

// Before:
//   </code></pre>
// After:
//   </pre>
//   
html = html.replace(/\<\/code\>\<\/pre\>/g, '</pre>\n');

////////////////////////////////////////////////////////////////////////////////
// Replace <p> with a newline and remove </p>
////////////////////////////////////////////////////////////////////////////////

// Before:
//   <p>
// After:
//   
//  
html = html.replace(/\<p\>/g, '\n');

// Before:
//   </p>
// After:
//   
html = html.replace(/\<\/p\>/g, '');

////////////////////////////////////////////////////////////////////////////////
// Replace HTML character subsitutions (e.g. &lt;)
// with real characters (e.g. <) in <pre>...</pre>
////////////////////////////////////////////////////////////////////////////////
let insidePre = false;
let lines = html.split('\n');
lines.forEach((line, index) => {
  if (line.includes('<pre')) {
    insidePre = true;
  } else if (line.includes('</pre')) {
    insidePre = false;
  } else if (insidePre) {
    lines[index] =
      line
      .split('&lt;').join('<')
      .split('&gt;').join('>')
      .split('&amp;').join('&')
      .split('&quot;').join('"')
      .split('&apos;').join('\'');
  }
});
html = lines.join('\n');

////////////////////////////////////////////////////////////////////////////////
// Add a newline before <!--more-->
////////////////////////////////////////////////////////////////////////////////

// Before:
//   <!--more-->
// After:
//   
//   <!--more-->
html = html.replace(/\<!--more--\>/g, '\n<!--more-->');

////////////////////////////////////////////////////////////////////////////////
// Strip leading and trailing newlines
////////////////////////////////////////////////////////////////////////////////

lines = html.split('\n');
while (lines[lines.length - 1].trim().length === 0) {
  lines.pop();
}
while (lines[0].trim().length === 0) {
  lines.shift();
}
html = lines.join('\n');

////////////////////////////////////////////////////////////////////////////////
// Output HTML to file and clipboard
////////////////////////////////////////////////////////////////////////////////

fs.writeFileSync(htmlPath, html, 'utf-8');
clipboardy.writeSync(html);
