import{d as i,v as s,a4 as u,u as c,j as l,z as f,a5 as d,a6 as m,a7 as h,a8 as A,a9 as g,aa as v,ab as P,ac as y,ad as C,ae as w,af as _,ag as b,ah as E,Y as R}from"./chunks/framework.GeVTwKgC.js";import{t as D}from"./chunks/theme.B_zxh3wj.js";function p(e){if(e.extends){const a=p(e.extends);return{...a,...e,async enhanceApp(t){a.enhanceApp&&await a.enhanceApp(t),e.enhanceApp&&await e.enhanceApp(t)}}}return e}const o=p(D),j=i({name:"VitePressApp",setup(){const{site:e}=c();return l(()=>{f(()=>{document.documentElement.lang=e.value.lang,document.documentElement.dir=e.value.dir})}),e.value.router.prefetchLinks&&d(),m(),h(),o.setup&&o.setup(),()=>A(o.Layout)}});async function L(){const e=S(),a=O();a.provide(g,e);const t=v(e.route);return a.provide(P,t),a.component("Content",y),a.component("ClientOnly",C),Object.defineProperties(a.config.globalProperties,{$frontmatter:{get(){return t.frontmatter.value}},$params:{get(){return t.page.value.params}}}),o.enhanceApp&&await o.enhanceApp({app:a,router:e,siteData:w}),{app:a,router:e,data:t}}function O(){return _(j)}function S(){let e=s,a;return b(t=>{let n=E(t),r=null;return n&&(e&&(a=n),(e||a===n)&&(n=n.replace(/\.js$/,".lean.js")),r=R(()=>import(n),__vite__mapDeps([]))),s&&(e=!1),r},o.NotFound)}s&&L().then(({app:e,router:a,data:t})=>{a.go().then(()=>{u(a.route,t.site),e.mount("#app")})});export{L as createApp};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}