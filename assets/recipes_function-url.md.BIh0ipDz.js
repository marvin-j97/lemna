import{_ as s,c as a,o as i,a4 as e}from"./chunks/framework.ZZgEQSCk.js";const E=JSON.parse('{"title":"Using Lambda function URL","description":"","frontmatter":{},"headers":[],"relativePath":"recipes/function-url.md","filePath":"recipes/function-url.md"}'),n={name:"recipes/function-url.md"},t=e(`<h1 id="using-lambda-function-url" tabindex="-1">Using Lambda function URL <a class="header-anchor" href="#using-lambda-function-url" aria-label="Permalink to &quot;Using Lambda function URL&quot;">​</a></h1><p>Use <code>function.url</code> to automatically configure a <a href="https://aws.amazon.com/de/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/" target="_blank" rel="noreferrer">Lambda function URL</a>. When deploying your function, the function URL will be printed to the console.</p><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><h3 id="authtype" tabindex="-1"><code>authType</code> <a class="header-anchor" href="#authtype" aria-label="Permalink to &quot;\`authType\`&quot;">​</a></h3><p>Can be <code>none</code> or <code>iam</code>.</p><h3 id="cors" tabindex="-1"><code>cors</code> <a class="header-anchor" href="#cors" aria-label="Permalink to &quot;\`cors\`&quot;">​</a></h3><p>CORS configuration. You can also use <code>cors: true</code> to set up a all-star &quot;don&#39;t care&quot; CORS config.</p><h3 id="invokemode" tabindex="-1"><code>invokeMode</code> <a class="header-anchor" href="#invokemode" aria-label="Permalink to &quot;\`invokeMode\`&quot;">​</a></h3><p>Can be <code>buffered</code> or <code>stream</code>. <code>buffered</code> is the default behaviour.</p><p><code>stream</code> uses <a href="https://aws.amazon.com/de/blogs/compute/introducing-aws-lambda-response-streaming/" target="_blank" rel="noreferrer">AWS Lambda response streaming</a>.</p><h2 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to &quot;Example&quot;">​</a></h2><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  &quot;function&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;url&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;authType&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;none&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;invokeMode&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;buffered&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">      &quot;cors&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;origins&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;*&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;methods&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;POST&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,12),o=[t];function l(r,h,p,d,c,k){return i(),a("div",null,o)}const g=s(n,[["render",l]]);export{E as __pageData,g as default};
