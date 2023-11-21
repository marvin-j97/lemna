import{_ as s,c as n,o as a,R as o}from"./chunks/framework.GeVTwKgC.js";const d=JSON.parse('{"title":"IAM policies","description":"","frontmatter":{},"headers":[],"relativePath":"recipes/iam.md","filePath":"recipes/iam.md"}'),l={name:"recipes/iam.md"},p=o(`<h1 id="iam-policies" tabindex="-1">IAM policies <a class="header-anchor" href="#iam-policies" aria-label="Permalink to &quot;IAM policies&quot;">​</a></h1><h2 id="used-aws-policies" tabindex="-1">Used AWS policies <a class="header-anchor" href="#used-aws-policies" aria-label="Permalink to &quot;Used AWS policies&quot;">​</a></h2><h3 id="required" tabindex="-1">Required <a class="header-anchor" href="#required" aria-label="Permalink to &quot;Required&quot;">​</a></h3><ul><li>iam:PassRole</li><li>lambda:GetFunction</li><li>lambda:CreateFunction</li><li>lambda:UpdateFunctionCode</li><li>lambda:GetFunctionConfiguration</li><li>lambda:UpdateFunctionConfiguration</li><li>lambda:GetFunctionUrlConfig</li><li>lambda:CreateFunctionUrlConfig</li><li>lambda:UpdateFunctionUrlConfig</li><li>lambda:DeleteFunctionUrlConfig</li></ul><h3 id="optional" tabindex="-1">Optional <a class="header-anchor" href="#optional" aria-label="Permalink to &quot;Optional&quot;">​</a></h3><ul><li>lambda:ListFunctions (for <code>ls</code> command)</li><li>lambda:DeleteFunction (for <code>rm</code> command)</li><li>lambda:AddPermission (for creating Function URL with AuthType: <code>NONE</code>)</li></ul><h2 id="example-aws-policy" tabindex="-1">Example AWS policy <a class="header-anchor" href="#example-aws-policy" aria-label="Permalink to &quot;Example AWS policy&quot;">​</a></h2><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#E1E4E8;">{</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#79B8FF;">&quot;Version&quot;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&quot;2012-10-17&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#79B8FF;">&quot;Statement&quot;</span><span style="color:#E1E4E8;">: [</span></span>
<span class="line"><span style="color:#E1E4E8;">    {</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#79B8FF;">&quot;Sid&quot;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&quot;1&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#79B8FF;">&quot;Effect&quot;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&quot;Allow&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#79B8FF;">&quot;Action&quot;</span><span style="color:#E1E4E8;">: [</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:GetFunction&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:CreateFunction&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:UpdateFunctionCode&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:DeleteFunction&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:UpdateFunctionConfiguration&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:GetFunctionConfiguration&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:GetFunctionUrlConfig&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:CreateFunctionUrlConfig&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:UpdateFunctionUrlConfig&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:DeleteFunctionUrlConfig&quot;</span></span>
<span class="line"><span style="color:#E1E4E8;">      ],</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#79B8FF;">&quot;Resource&quot;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&quot;arn:aws:lambda:REGION:ACCOUNT_ID:function:NAME_PATTERN&quot;</span></span>
<span class="line"><span style="color:#E1E4E8;">    },</span></span>
<span class="line"><span style="color:#E1E4E8;">    {</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#79B8FF;">&quot;Sid&quot;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&quot;2&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#79B8FF;">&quot;Effect&quot;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&quot;Allow&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#79B8FF;">&quot;Action&quot;</span><span style="color:#E1E4E8;">: [</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;iam:PassRole&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:ListFunctions&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;lambda:AddPermission&quot;</span></span>
<span class="line"><span style="color:#E1E4E8;">      ],</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#79B8FF;">&quot;Resource&quot;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&quot;*&quot;</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">  ]</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">{</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#005CC5;">&quot;Version&quot;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&quot;2012-10-17&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#005CC5;">&quot;Statement&quot;</span><span style="color:#24292E;">: [</span></span>
<span class="line"><span style="color:#24292E;">    {</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#005CC5;">&quot;Sid&quot;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&quot;1&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#005CC5;">&quot;Effect&quot;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&quot;Allow&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#005CC5;">&quot;Action&quot;</span><span style="color:#24292E;">: [</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:GetFunction&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:CreateFunction&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:UpdateFunctionCode&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:DeleteFunction&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:UpdateFunctionConfiguration&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:GetFunctionConfiguration&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:GetFunctionUrlConfig&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:CreateFunctionUrlConfig&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:UpdateFunctionUrlConfig&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:DeleteFunctionUrlConfig&quot;</span></span>
<span class="line"><span style="color:#24292E;">      ],</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#005CC5;">&quot;Resource&quot;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&quot;arn:aws:lambda:REGION:ACCOUNT_ID:function:NAME_PATTERN&quot;</span></span>
<span class="line"><span style="color:#24292E;">    },</span></span>
<span class="line"><span style="color:#24292E;">    {</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#005CC5;">&quot;Sid&quot;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&quot;2&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#005CC5;">&quot;Effect&quot;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&quot;Allow&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#005CC5;">&quot;Action&quot;</span><span style="color:#24292E;">: [</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;iam:PassRole&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:ListFunctions&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;lambda:AddPermission&quot;</span></span>
<span class="line"><span style="color:#24292E;">      ],</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#005CC5;">&quot;Resource&quot;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&quot;*&quot;</span></span>
<span class="line"><span style="color:#24292E;">    }</span></span>
<span class="line"><span style="color:#24292E;">  ]</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre></div>`,8),t=[p];function e(c,r,E,i,u,y){return a(),n("div",null,t)}const F=s(l,[["render",e]]);export{d as __pageData,F as default};
