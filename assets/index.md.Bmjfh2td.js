import{_ as a,c as n,o as e,a4 as i}from"./chunks/framework.ZZgEQSCk.js";const h=JSON.parse('{"title":"Lemna","description":"","frontmatter":{},"headers":[],"relativePath":"index.md","filePath":"index.md"}'),l={name:"index.md"},s=i(`<h1 id="lemna" tabindex="-1">Lemna <a class="header-anchor" href="#lemna" aria-label="Permalink to &quot;Lemna&quot;">​</a></h1><p>Quickly scaffold and deploy AWS Lambda handlers powered by Typescript.</p><p>No more tedious code deploying to Lambda, Lemna handles for you:</p><ul><li>Scaffolding new functions with TypeScript</li><li>Transpiling &amp; bundling only necessary dependencies (using <a href="https://esbuild.github.io" target="_blank" rel="noreferrer">esbuild</a>)</li><li>Zipping &amp; uploading code</li><li>Updating function configuration</li><li>Optionally setting up function URL</li></ul><h2 id="scaffold-new-lambda-function" tabindex="-1">Scaffold new Lambda function <a class="header-anchor" href="#scaffold-new-lambda-function" aria-label="Permalink to &quot;Scaffold new Lambda function&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>pnpm lemna init</span></span>
<span class="line"><span>yarn lemna init</span></span>
<span class="line"><span>npx lemna init</span></span></code></pre></div><p>This will setup a function folder with:</p><ul><li>package.json</li><li>Typescript (+ tsconfig)</li><li>Lambda typings (@types/aws-lambda)</li><li>Basic Lambda handler (src/index.ts)</li><li>Lemna config (lemna.config.mjs)</li></ul>`,8),t=[s];function o(d,p,c,r,f,m){return e(),n("div",null,t)}const _=a(l,[["render",o]]);export{h as __pageData,_ as default};
