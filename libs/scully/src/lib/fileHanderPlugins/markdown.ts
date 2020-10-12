import { registerPlugin } from '../pluginManagement/pluginRepository';
import { getConfig, setConfig } from '../pluginManagement/pluginConfig';
import marked from 'marked';

// ------------------------------
// Syntax Highlighting

const Prism = require('prismjs');
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

export interface MarkedConfig {
  enableSyntaxHighlighting: boolean;
}

const renderer = new marked.Renderer();
// wrap code block the way Prism.js expects it
renderer.code = function (code, lang, escaped) {
  code = this.options.highlight(code, lang);
  let formattedCode: string;
  if (!lang) {
    formattedCode = '<pre><code>' + code + '</code></pre>';
  } else {
    // e.g. "language-js"
    const langClass = 'language-' + lang;
    formattedCode = '<pre class="' + langClass + '"><code class="' + langClass + '">' + code + '</code></pre>';
  }
  return `<div class="scully-code-snippet" style="position:relative">${formattedCode}</div>`;
};
// ------------------------------

const markdownPlugin = async (raw: string) => {
  const config = getConfig<MarkedConfig>(markdownPlugin);
  if (config.enableSyntaxHighlighting) {
    marked.setOptions({
      renderer,
      highlight: (code, lang) => {
        lang = lang || 'typescript';
        if (!Prism.languages[lang]) {
          console.error(`Language '${lang}' is not available in Prism.js, ignoring syntax highlighting for this code block.`);
          return code;
        }
        return Prism.highlight(code, Prism.languages[lang]);
      },
      pedantic: false,
      gfm: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false,
    });
  }

  return marked(raw);
};

setConfig(markdownPlugin, {
  enableSyntaxHighlighting: false,
});

registerPlugin('fileHandler', 'md', markdownPlugin, ['markdown']);
