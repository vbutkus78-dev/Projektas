var Ht=Object.defineProperty;var rt=e=>{throw TypeError(e)};var Mt=(e,t,r)=>t in e?Ht(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var h=(e,t,r)=>Mt(e,typeof t!="symbol"?t+"":t,r),Ge=(e,t,r)=>t.has(e)||rt("Cannot "+r);var c=(e,t,r)=>(Ge(e,t,"read from private field"),r?r.call(e):t.get(e)),v=(e,t,r)=>t.has(e)?rt("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,r),g=(e,t,r,s)=>(Ge(e,t,"write to private field"),s?s.call(e,r):t.set(e,r),r),b=(e,t,r)=>(Ge(e,t,"access private method"),r);var st=(e,t,r,s)=>({set _(a){g(e,t,a,r)},get _(){return c(e,t,s)}});var at=(e,t,r)=>(s,a)=>{let n=-1;return i(0);async function i(d){if(d<=n)throw new Error("next() called multiple times");n=d;let u,o=!1,l;if(e[d]?(l=e[d][0][0],s.req.routeIndex=d):l=d===e.length&&a||void 0,l)try{u=await l(s,()=>i(d+1))}catch(p){if(p instanceof Error&&t)s.error=p,u=await t(p,s),o=!0;else throw p}else s.finalized===!1&&r&&(u=await r(s));return u&&(s.finalized===!1||o)&&(s.res=u),s}},Wt=Symbol(),Jt=async(e,t=Object.create(null))=>{const{all:r=!1,dot:s=!1}=t,n=(e instanceof wt?e.raw.headers:e.headers).get("Content-Type");return n!=null&&n.startsWith("multipart/form-data")||n!=null&&n.startsWith("application/x-www-form-urlencoded")?Vt(e,{all:r,dot:s}):{}};async function Vt(e,t){const r=await e.formData();return r?zt(r,t):{}}function zt(e,t){const r=Object.create(null);return e.forEach((s,a)=>{t.all||a.endsWith("[]")?Gt(r,a,s):r[a]=s}),t.dot&&Object.entries(r).forEach(([s,a])=>{s.includes(".")&&(Yt(r,s,a),delete r[s])}),r}var Gt=(e,t,r)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(r):e[t]=[e[t],r]:t.endsWith("[]")?e[t]=[r]:e[t]=r},Yt=(e,t,r)=>{let s=e;const a=t.split(".");a.forEach((n,i)=>{i===a.length-1?s[n]=r:((!s[n]||typeof s[n]!="object"||Array.isArray(s[n])||s[n]instanceof File)&&(s[n]=Object.create(null)),s=s[n])})},yt=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},Kt=e=>{const{groups:t,path:r}=Qt(e),s=yt(r);return Xt(s,t)},Qt=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(r,s)=>{const a=`@${s}`;return t.push([a,r]),a}),{groups:t,path:e}},Xt=(e,t)=>{for(let r=t.length-1;r>=0;r--){const[s]=t[r];for(let a=e.length-1;a>=0;a--)if(e[a].includes(s)){e[a]=e[a].replace(s,t[r][1]);break}}return e},$e={},Zt=(e,t)=>{if(e==="*")return"*";const r=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const s=`${e}#${t}`;return $e[s]||(r[2]?$e[s]=t&&t[0]!==":"&&t[0]!=="*"?[s,r[1],new RegExp(`^${r[2]}(?=/${t})`)]:[e,r[1],new RegExp(`^${r[2]}$`)]:$e[s]=[e,r[1],!0]),$e[s]}return null},We=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return t(r)}catch{return r}})}},er=e=>We(e,decodeURI),Et=e=>{const t=e.url,r=t.indexOf("/",t.indexOf(":")+4);let s=r;for(;s<t.length;s++){const a=t.charCodeAt(s);if(a===37){const n=t.indexOf("?",s),i=t.slice(r,n===-1?void 0:n);return er(i.includes("%25")?i.replace(/%25/g,"%2525"):i)}else if(a===63)break}return t.slice(r,s)},tr=e=>{const t=Et(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},me=(e,t,...r)=>(r.length&&(t=me(t,...r)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),_t=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),r=[];let s="";return t.forEach(a=>{if(a!==""&&!/\:/.test(a))s+="/"+a;else if(/\:/.test(a))if(/\?/.test(a)){r.length===0&&s===""?r.push("/"):r.push(s);const n=a.replace("?","");s+="/"+n,r.push(s)}else s+="/"+a}),r.filter((a,n,i)=>i.indexOf(a)===n)},Ye=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?We(e,et):e):e,bt=(e,t,r)=>{let s;if(!r&&t&&!/[%+]/.test(t)){let i=e.indexOf(`?${t}`,8);for(i===-1&&(i=e.indexOf(`&${t}`,8));i!==-1;){const d=e.charCodeAt(i+t.length+1);if(d===61){const u=i+t.length+2,o=e.indexOf("&",u);return Ye(e.slice(u,o===-1?void 0:o))}else if(d==38||isNaN(d))return"";i=e.indexOf(`&${t}`,i+1)}if(s=/[%+]/.test(e),!s)return}const a={};s??(s=/[%+]/.test(e));let n=e.indexOf("?",8);for(;n!==-1;){const i=e.indexOf("&",n+1);let d=e.indexOf("=",n);d>i&&i!==-1&&(d=-1);let u=e.slice(n+1,d===-1?i===-1?void 0:i:d);if(s&&(u=Ye(u)),n=i,u==="")continue;let o;d===-1?o="":(o=e.slice(d+1,i===-1?void 0:i),s&&(o=Ye(o))),r?(a[u]&&Array.isArray(a[u])||(a[u]=[]),a[u].push(o)):a[u]??(a[u]=o)}return t?a[t]:a},rr=bt,sr=(e,t)=>bt(e,t,!0),et=decodeURIComponent,nt=e=>We(e,et),ge,C,W,St,Rt,Xe,G,dt,wt=(dt=class{constructor(e,t="/",r=[[]]){v(this,W);h(this,"raw");v(this,ge);v(this,C);h(this,"routeIndex",0);h(this,"path");h(this,"bodyCache",{});v(this,G,e=>{const{bodyCache:t,raw:r}=this,s=t[e];if(s)return s;const a=Object.keys(t)[0];return a?t[a].then(n=>(a==="json"&&(n=JSON.stringify(n)),new Response(n)[e]())):t[e]=r[e]()});this.raw=e,this.path=t,g(this,C,r),g(this,ge,{})}param(e){return e?b(this,W,St).call(this,e):b(this,W,Rt).call(this)}query(e){return rr(this.url,e)}queries(e){return sr(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((r,s)=>{t[s]=r}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Jt(this,e))}json(){return c(this,G).call(this,"text").then(e=>JSON.parse(e))}text(){return c(this,G).call(this,"text")}arrayBuffer(){return c(this,G).call(this,"arrayBuffer")}blob(){return c(this,G).call(this,"blob")}formData(){return c(this,G).call(this,"formData")}addValidatedData(e,t){c(this,ge)[e]=t}valid(e){return c(this,ge)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Wt](){return c(this,C)}get matchedRoutes(){return c(this,C)[0].map(([[,e]])=>e)}get routePath(){return c(this,C)[0].map(([[,e]])=>e)[this.routeIndex].path}},ge=new WeakMap,C=new WeakMap,W=new WeakSet,St=function(e){const t=c(this,C)[0][this.routeIndex][1][e],r=b(this,W,Xe).call(this,t);return r?/\%/.test(r)?nt(r):r:void 0},Rt=function(){const e={},t=Object.keys(c(this,C)[0][this.routeIndex][1]);for(const r of t){const s=b(this,W,Xe).call(this,c(this,C)[0][this.routeIndex][1][r]);s&&typeof s=="string"&&(e[r]=/\%/.test(s)?nt(s):s)}return e},Xe=function(e){return c(this,C)[1]?c(this,C)[1][e]:e},G=new WeakMap,dt),ar={Stringify:1},qt=async(e,t,r,s,a)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const n=e.callbacks;return n!=null&&n.length?(a?a[0]+=e:a=[e],Promise.all(n.map(d=>d({phase:t,buffer:a,context:s}))).then(d=>Promise.all(d.filter(Boolean).map(u=>qt(u,t,!1,s,a))).then(()=>a[0]))):Promise.resolve(e)},nr="text/plain; charset=UTF-8",Ke=(e,t)=>({"Content-Type":e,...t}),je,xe,B,ve,U,I,Oe,ye,Ee,ne,Ie,ke,Y,he,lt,ir=(lt=class{constructor(e,t){v(this,Y);v(this,je);v(this,xe);h(this,"env",{});v(this,B);h(this,"finalized",!1);h(this,"error");v(this,ve);v(this,U);v(this,I);v(this,Oe);v(this,ye);v(this,Ee);v(this,ne);v(this,Ie);v(this,ke);h(this,"render",(...e)=>(c(this,ye)??g(this,ye,t=>this.html(t)),c(this,ye).call(this,...e)));h(this,"setLayout",e=>g(this,Oe,e));h(this,"getLayout",()=>c(this,Oe));h(this,"setRenderer",e=>{g(this,ye,e)});h(this,"header",(e,t,r)=>{this.finalized&&g(this,I,new Response(c(this,I).body,c(this,I)));const s=c(this,I)?c(this,I).headers:c(this,ne)??g(this,ne,new Headers);t===void 0?s.delete(e):r!=null&&r.append?s.append(e,t):s.set(e,t)});h(this,"status",e=>{g(this,ve,e)});h(this,"set",(e,t)=>{c(this,B)??g(this,B,new Map),c(this,B).set(e,t)});h(this,"get",e=>c(this,B)?c(this,B).get(e):void 0);h(this,"newResponse",(...e)=>b(this,Y,he).call(this,...e));h(this,"body",(e,t,r)=>b(this,Y,he).call(this,e,t,r));h(this,"text",(e,t,r)=>!c(this,ne)&&!c(this,ve)&&!t&&!r&&!this.finalized?new Response(e):b(this,Y,he).call(this,e,t,Ke(nr,r)));h(this,"json",(e,t,r)=>b(this,Y,he).call(this,JSON.stringify(e),t,Ke("application/json",r)));h(this,"html",(e,t,r)=>{const s=a=>b(this,Y,he).call(this,a,t,Ke("text/html; charset=UTF-8",r));return typeof e=="object"?qt(e,ar.Stringify,!1,{}).then(s):s(e)});h(this,"redirect",(e,t)=>{const r=String(e);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,t??302)});h(this,"notFound",()=>(c(this,Ee)??g(this,Ee,()=>new Response),c(this,Ee).call(this,this)));g(this,je,e),t&&(g(this,U,t.executionCtx),this.env=t.env,g(this,Ee,t.notFoundHandler),g(this,ke,t.path),g(this,Ie,t.matchResult))}get req(){return c(this,xe)??g(this,xe,new wt(c(this,je),c(this,ke),c(this,Ie))),c(this,xe)}get event(){if(c(this,U)&&"respondWith"in c(this,U))return c(this,U);throw Error("This context has no FetchEvent")}get executionCtx(){if(c(this,U))return c(this,U);throw Error("This context has no ExecutionContext")}get res(){return c(this,I)||g(this,I,new Response(null,{headers:c(this,ne)??g(this,ne,new Headers)}))}set res(e){if(c(this,I)&&e){e=new Response(e.body,e);for(const[t,r]of c(this,I).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const s=c(this,I).headers.getSetCookie();e.headers.delete("set-cookie");for(const a of s)e.headers.append("set-cookie",a)}else e.headers.set(t,r)}g(this,I,e),this.finalized=!0}get var(){return c(this,B)?Object.fromEntries(c(this,B)):{}}},je=new WeakMap,xe=new WeakMap,B=new WeakMap,ve=new WeakMap,U=new WeakMap,I=new WeakMap,Oe=new WeakMap,ye=new WeakMap,Ee=new WeakMap,ne=new WeakMap,Ie=new WeakMap,ke=new WeakMap,Y=new WeakSet,he=function(e,t,r){const s=c(this,I)?new Headers(c(this,I).headers):c(this,ne)??new Headers;if(typeof t=="object"&&"headers"in t){const n=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[i,d]of n)i.toLowerCase()==="set-cookie"?s.append(i,d):s.set(i,d)}if(r)for(const[n,i]of Object.entries(r))if(typeof i=="string")s.set(n,i);else{s.delete(n);for(const d of i)s.append(n,d)}const a=typeof t=="number"?t:(t==null?void 0:t.status)??c(this,ve);return new Response(e,{status:a,headers:s})},lt),T="ALL",or="all",ur=["get","post","put","delete","options","patch"],Tt="Can not add a route since the matcher is already built.",Dt=class extends Error{},dr="__COMPOSED_HANDLER",lr=e=>e.text("404 Not Found",404),it=(e,t)=>{if("getResponse"in e){const r=e.getResponse();return t.newResponse(r.body,r)}return console.error(e),t.text("Internal Server Error",500)},A,D,xt,$,se,Pe,Le,ct,jt=(ct=class{constructor(t={}){v(this,D);h(this,"get");h(this,"post");h(this,"put");h(this,"delete");h(this,"options");h(this,"patch");h(this,"all");h(this,"on");h(this,"use");h(this,"router");h(this,"getPath");h(this,"_basePath","/");v(this,A,"/");h(this,"routes",[]);v(this,$,lr);h(this,"errorHandler",it);h(this,"onError",t=>(this.errorHandler=t,this));h(this,"notFound",t=>(g(this,$,t),this));h(this,"fetch",(t,...r)=>b(this,D,Le).call(this,t,r[1],r[0],t.method));h(this,"request",(t,r,s,a)=>t instanceof Request?this.fetch(r?new Request(t,r):t,s,a):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${me("/",t)}`,r),s,a)));h(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(b(this,D,Le).call(this,t.request,t,void 0,t.request.method))})});[...ur,or].forEach(n=>{this[n]=(i,...d)=>(typeof i=="string"?g(this,A,i):b(this,D,se).call(this,n,c(this,A),i),d.forEach(u=>{b(this,D,se).call(this,n,c(this,A),u)}),this)}),this.on=(n,i,...d)=>{for(const u of[i].flat()){g(this,A,u);for(const o of[n].flat())d.map(l=>{b(this,D,se).call(this,o.toUpperCase(),c(this,A),l)})}return this},this.use=(n,...i)=>(typeof n=="string"?g(this,A,n):(g(this,A,"*"),i.unshift(n)),i.forEach(d=>{b(this,D,se).call(this,T,c(this,A),d)}),this);const{strict:s,...a}=t;Object.assign(this,a),this.getPath=s??!0?t.getPath??Et:tr}route(t,r){const s=this.basePath(t);return r.routes.map(a=>{var i;let n;r.errorHandler===it?n=a.handler:(n=async(d,u)=>(await at([],r.errorHandler)(d,()=>a.handler(d,u))).res,n[dr]=a.handler),b(i=s,D,se).call(i,a.method,a.path,n)}),this}basePath(t){const r=b(this,D,xt).call(this);return r._basePath=me(this._basePath,t),r}mount(t,r,s){let a,n;s&&(typeof s=="function"?n=s:(n=s.optionHandler,s.replaceRequest===!1?a=u=>u:a=s.replaceRequest));const i=n?u=>{const o=n(u);return Array.isArray(o)?o:[o]}:u=>{let o;try{o=u.executionCtx}catch{}return[u.env,o]};a||(a=(()=>{const u=me(this._basePath,t),o=u==="/"?0:u.length;return l=>{const p=new URL(l.url);return p.pathname=p.pathname.slice(o)||"/",new Request(p,l)}})());const d=async(u,o)=>{const l=await r(a(u.req.raw),...i(u));if(l)return l;await o()};return b(this,D,se).call(this,T,me(t,"*"),d),this}},A=new WeakMap,D=new WeakSet,xt=function(){const t=new jt({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,g(t,$,c(this,$)),t.routes=this.routes,t},$=new WeakMap,se=function(t,r,s){t=t.toUpperCase(),r=me(this._basePath,r);const a={basePath:this._basePath,path:r,method:t,handler:s};this.router.add(t,r,[s,a]),this.routes.push(a)},Pe=function(t,r){if(t instanceof Error)return this.errorHandler(t,r);throw t},Le=function(t,r,s,a){if(a==="HEAD")return(async()=>new Response(null,await b(this,D,Le).call(this,t,r,s,"GET")))();const n=this.getPath(t,{env:s}),i=this.router.match(a,n),d=new ir(t,{path:n,matchResult:i,env:s,executionCtx:r,notFoundHandler:c(this,$)});if(i[0].length===1){let o;try{o=i[0][0][0][0](d,async()=>{d.res=await c(this,$).call(this,d)})}catch(l){return b(this,D,Pe).call(this,l,d)}return o instanceof Promise?o.then(l=>l||(d.finalized?d.res:c(this,$).call(this,d))).catch(l=>b(this,D,Pe).call(this,l,d)):o??c(this,$).call(this,d)}const u=at(i[0],this.errorHandler,c(this,$));return(async()=>{try{const o=await u(d);if(!o.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return o.res}catch(o){return b(this,D,Pe).call(this,o,d)}})()},ct),Ue="[^/]+",qe=".*",Te="(?:|/.*)",fe=Symbol(),cr=new Set(".\\+*[^]$()");function pr(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===qe||e===Te?1:t===qe||t===Te?-1:e===Ue?1:t===Ue?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var ie,oe,P,pt,Ze=(pt=class{constructor(){v(this,ie);v(this,oe);v(this,P,Object.create(null))}insert(t,r,s,a,n){if(t.length===0){if(c(this,ie)!==void 0)throw fe;if(n)return;g(this,ie,r);return}const[i,...d]=t,u=i==="*"?d.length===0?["","",qe]:["","",Ue]:i==="/*"?["","",Te]:i.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let o;if(u){const l=u[1];let p=u[2]||Ue;if(l&&u[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw fe;if(o=c(this,P)[p],!o){if(Object.keys(c(this,P)).some(m=>m!==qe&&m!==Te))throw fe;if(n)return;o=c(this,P)[p]=new Ze,l!==""&&g(o,oe,a.varIndex++)}!n&&l!==""&&s.push([l,c(o,oe)])}else if(o=c(this,P)[i],!o){if(Object.keys(c(this,P)).some(l=>l.length>1&&l!==qe&&l!==Te))throw fe;if(n)return;o=c(this,P)[i]=new Ze}o.insert(d,r,s,a,n)}buildRegExpStr(){const r=Object.keys(c(this,P)).sort(pr).map(s=>{const a=c(this,P)[s];return(typeof c(a,oe)=="number"?`(${s})@${c(a,oe)}`:cr.has(s)?`\\${s}`:s)+a.buildRegExpStr()});return typeof c(this,ie)=="number"&&r.unshift(`#${c(this,ie)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},ie=new WeakMap,oe=new WeakMap,P=new WeakMap,pt),Me,Ne,mt,mr=(mt=class{constructor(){v(this,Me,{varIndex:0});v(this,Ne,new Ze)}insert(e,t,r){const s=[],a=[];for(let i=0;;){let d=!1;if(e=e.replace(/\{[^}]+\}/g,u=>{const o=`@\\${i}`;return a[i]=[o,u],i++,d=!0,o}),!d)break}const n=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let i=a.length-1;i>=0;i--){const[d]=a[i];for(let u=n.length-1;u>=0;u--)if(n[u].indexOf(d)!==-1){n[u]=n[u].replace(d,a[i][1]);break}}return c(this,Ne).insert(n,t,s,c(this,Me),r),s}buildRegExp(){let e=c(this,Ne).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const r=[],s=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(a,n,i)=>n!==void 0?(r[++t]=Number(n),"$()"):(i!==void 0&&(s[Number(i)]=++t),"")),[new RegExp(`^${e}`),r,s]}},Me=new WeakMap,Ne=new WeakMap,mt),Ot=[],hr=[/^$/,[],Object.create(null)],Be=Object.create(null);function It(e){return Be[e]??(Be[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function fr(){Be=Object.create(null)}function gr(e){var o;const t=new mr,r=[];if(e.length===0)return hr;const s=e.map(l=>[!/\*|\/:/.test(l[0]),...l]).sort(([l,p],[m,f])=>l?1:m?-1:p.length-f.length),a=Object.create(null);for(let l=0,p=-1,m=s.length;l<m;l++){const[f,w,y]=s[l];f?a[w]=[y.map(([S])=>[S,Object.create(null)]),Ot]:p++;let E;try{E=t.insert(w,p,f)}catch(S){throw S===fe?new Dt(w):S}f||(r[p]=y.map(([S,q])=>{const j=Object.create(null);for(q-=1;q>=0;q--){const[k,L]=E[q];j[k]=L}return[S,j]}))}const[n,i,d]=t.buildRegExp();for(let l=0,p=r.length;l<p;l++)for(let m=0,f=r[l].length;m<f;m++){const w=(o=r[l][m])==null?void 0:o[1];if(!w)continue;const y=Object.keys(w);for(let E=0,S=y.length;E<S;E++)w[y[E]]=d[w[y[E]]]}const u=[];for(const l in i)u[l]=r[i[l]];return[n,u,a]}function pe(e,t){if(e){for(const r of Object.keys(e).sort((s,a)=>a.length-s.length))if(It(r).test(t))return[...e[r]]}}var K,Q,be,kt,Nt,ht,vr=(ht=class{constructor(){v(this,be);h(this,"name","RegExpRouter");v(this,K);v(this,Q);g(this,K,{[T]:Object.create(null)}),g(this,Q,{[T]:Object.create(null)})}add(e,t,r){var d;const s=c(this,K),a=c(this,Q);if(!s||!a)throw new Error(Tt);s[e]||[s,a].forEach(u=>{u[e]=Object.create(null),Object.keys(u[T]).forEach(o=>{u[e][o]=[...u[T][o]]})}),t==="/*"&&(t="*");const n=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const u=It(t);e===T?Object.keys(s).forEach(o=>{var l;(l=s[o])[t]||(l[t]=pe(s[o],t)||pe(s[T],t)||[])}):(d=s[e])[t]||(d[t]=pe(s[e],t)||pe(s[T],t)||[]),Object.keys(s).forEach(o=>{(e===T||e===o)&&Object.keys(s[o]).forEach(l=>{u.test(l)&&s[o][l].push([r,n])})}),Object.keys(a).forEach(o=>{(e===T||e===o)&&Object.keys(a[o]).forEach(l=>u.test(l)&&a[o][l].push([r,n]))});return}const i=_t(t)||[t];for(let u=0,o=i.length;u<o;u++){const l=i[u];Object.keys(a).forEach(p=>{var m;(e===T||e===p)&&((m=a[p])[l]||(m[l]=[...pe(s[p],l)||pe(s[T],l)||[]]),a[p][l].push([r,n-o+u+1]))})}}match(e,t){fr();const r=b(this,be,kt).call(this);return this.match=(s,a)=>{const n=r[s]||r[T],i=n[2][a];if(i)return i;const d=a.match(n[0]);if(!d)return[[],Ot];const u=d.indexOf("",1);return[n[1][u],d]},this.match(e,t)}},K=new WeakMap,Q=new WeakMap,be=new WeakSet,kt=function(){const e=Object.create(null);return Object.keys(c(this,Q)).concat(Object.keys(c(this,K))).forEach(t=>{e[t]||(e[t]=b(this,be,Nt).call(this,t))}),g(this,K,g(this,Q,void 0)),e},Nt=function(e){const t=[];let r=e===T;return[c(this,K),c(this,Q)].forEach(s=>{const a=s[e]?Object.keys(s[e]).map(n=>[n,s[e][n]]):[];a.length!==0?(r||(r=!0),t.push(...a)):e!==T&&t.push(...Object.keys(s[T]).map(n=>[n,s[T][n]]))}),r?gr(t):null},ht),X,H,ft,yr=(ft=class{constructor(e){h(this,"name","SmartRouter");v(this,X,[]);v(this,H,[]);g(this,X,e.routers)}add(e,t,r){if(!c(this,H))throw new Error(Tt);c(this,H).push([e,t,r])}match(e,t){if(!c(this,H))throw new Error("Fatal error");const r=c(this,X),s=c(this,H),a=r.length;let n=0,i;for(;n<a;n++){const d=r[n];try{for(let u=0,o=s.length;u<o;u++)d.add(...s[u]);i=d.match(e,t)}catch(u){if(u instanceof Dt)continue;throw u}this.match=d.match.bind(d),g(this,X,[d]),g(this,H,void 0);break}if(n===a)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,i}get activeRouter(){if(c(this,H)||c(this,X).length!==1)throw new Error("No active router has been determined yet.");return c(this,X)[0]}},X=new WeakMap,H=new WeakMap,ft),Re=Object.create(null),Z,O,ue,_e,x,M,ae,gt,Ct=(gt=class{constructor(e,t,r){v(this,M);v(this,Z);v(this,O);v(this,ue);v(this,_e,0);v(this,x,Re);if(g(this,O,r||Object.create(null)),g(this,Z,[]),e&&t){const s=Object.create(null);s[e]={handler:t,possibleKeys:[],score:0},g(this,Z,[s])}g(this,ue,[])}insert(e,t,r){g(this,_e,++st(this,_e)._);let s=this;const a=Kt(t),n=[];for(let i=0,d=a.length;i<d;i++){const u=a[i],o=a[i+1],l=Zt(u,o),p=Array.isArray(l)?l[0]:u;if(p in c(s,O)){s=c(s,O)[p],l&&n.push(l[1]);continue}c(s,O)[p]=new Ct,l&&(c(s,ue).push(l),n.push(l[1])),s=c(s,O)[p]}return c(s,Z).push({[e]:{handler:r,possibleKeys:n.filter((i,d,u)=>u.indexOf(i)===d),score:c(this,_e)}}),s}search(e,t){var d;const r=[];g(this,x,Re);let a=[this];const n=yt(t),i=[];for(let u=0,o=n.length;u<o;u++){const l=n[u],p=u===o-1,m=[];for(let f=0,w=a.length;f<w;f++){const y=a[f],E=c(y,O)[l];E&&(g(E,x,c(y,x)),p?(c(E,O)["*"]&&r.push(...b(this,M,ae).call(this,c(E,O)["*"],e,c(y,x))),r.push(...b(this,M,ae).call(this,E,e,c(y,x)))):m.push(E));for(let S=0,q=c(y,ue).length;S<q;S++){const j=c(y,ue)[S],k=c(y,x)===Re?{}:{...c(y,x)};if(j==="*"){const z=c(y,O)["*"];z&&(r.push(...b(this,M,ae).call(this,z,e,c(y,x))),g(z,x,k),m.push(z));continue}const[L,Ae,V]=j;if(!l&&!(V instanceof RegExp))continue;const F=c(y,O)[L],Ut=n.slice(u).join("/");if(V instanceof RegExp){const z=V.exec(Ut);if(z){if(k[Ae]=z[0],r.push(...b(this,M,ae).call(this,F,e,c(y,x),k)),Object.keys(c(F,O)).length){g(F,x,k);const ze=((d=z[0].match(/\//))==null?void 0:d.length)??0;(i[ze]||(i[ze]=[])).push(F)}continue}}(V===!0||V.test(l))&&(k[Ae]=l,p?(r.push(...b(this,M,ae).call(this,F,e,k,c(y,x))),c(F,O)["*"]&&r.push(...b(this,M,ae).call(this,c(F,O)["*"],e,k,c(y,x)))):(g(F,x,k),m.push(F)))}}a=m.concat(i.shift()??[])}return r.length>1&&r.sort((u,o)=>u.score-o.score),[r.map(({handler:u,params:o})=>[u,o])]}},Z=new WeakMap,O=new WeakMap,ue=new WeakMap,_e=new WeakMap,x=new WeakMap,M=new WeakSet,ae=function(e,t,r,s){const a=[];for(let n=0,i=c(e,Z).length;n<i;n++){const d=c(e,Z)[n],u=d[t]||d[T],o={};if(u!==void 0&&(u.params=Object.create(null),a.push(u),r!==Re||s&&s!==Re))for(let l=0,p=u.possibleKeys.length;l<p;l++){const m=u.possibleKeys[l],f=o[u.score];u.params[m]=s!=null&&s[m]&&!f?s[m]:r[m]??(s==null?void 0:s[m]),o[u.score]=!0}}return a},gt),de,vt,Er=(vt=class{constructor(){h(this,"name","TrieRouter");v(this,de);g(this,de,new Ct)}add(e,t,r){const s=_t(t);if(s){for(let a=0,n=s.length;a<n;a++)c(this,de).insert(e,s[a],r);return}c(this,de).insert(e,t,r)}match(e,t){return c(this,de).search(e,t)}},de=new WeakMap,vt),te=class extends jt{constructor(e={}){super(e),this.router=e.router??new yr({routers:[new vr,new Er]})}},_r=e=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},s=(n=>typeof n=="string"?n==="*"?()=>n:i=>n===i?i:null:typeof n=="function"?n:i=>n.includes(i)?i:null)(r.origin),a=(n=>typeof n=="function"?n:Array.isArray(n)?()=>n:()=>[])(r.allowMethods);return async function(i,d){var l;function u(p,m){i.res.headers.set(p,m)}const o=await s(i.req.header("origin")||"",i);if(o&&u("Access-Control-Allow-Origin",o),r.origin!=="*"){const p=i.req.header("Vary");p?u("Vary",p):u("Vary","Origin")}if(r.credentials&&u("Access-Control-Allow-Credentials","true"),(l=r.exposeHeaders)!=null&&l.length&&u("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),i.req.method==="OPTIONS"){r.maxAge!=null&&u("Access-Control-Max-Age",r.maxAge.toString());const p=await a(i.req.header("origin")||"",i);p.length&&u("Access-Control-Allow-Methods",p.join(","));let m=r.allowHeaders;if(!(m!=null&&m.length)){const f=i.req.header("Access-Control-Request-Headers");f&&(m=f.split(/\s*,\s*/))}return m!=null&&m.length&&(u("Access-Control-Allow-Headers",m.join(",")),i.res.headers.append("Vary","Access-Control-Request-Headers")),i.res.headers.delete("Content-Length"),i.res.headers.delete("Content-Type"),new Response(null,{headers:i.res.headers,status:204,statusText:"No Content"})}await d()}},br=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,ot=(e,t=Sr)=>{const r=/\.([a-zA-Z0-9]+?)$/,s=e.match(r);if(!s)return;let a=t[s[1]];return a&&a.startsWith("text")&&(a+="; charset=utf-8"),a},wr={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},Sr=wr,Rr=(...e)=>{let t=e.filter(a=>a!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const r=t.split("/"),s=[];for(const a of r)a===".."&&s.length>0&&s.at(-1)!==".."?s.pop():a!=="."&&s.push(a);return s.join("/")||"."},Ft={br:".br",zstd:".zst",gzip:".gz"},qr=Object.keys(Ft),Tr="index.html",Dr=e=>{const t=e.root??"./",r=e.path,s=e.join??Rr;return async(a,n)=>{var l,p,m,f;if(a.finalized)return n();let i;if(e.path)i=e.path;else try{if(i=decodeURIComponent(a.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(i))throw new Error}catch{return await((l=e.onNotFound)==null?void 0:l.call(e,a.req.path,a)),n()}let d=s(t,!r&&e.rewriteRequestPath?e.rewriteRequestPath(i):i);e.isDir&&await e.isDir(d)&&(d=s(d,Tr));const u=e.getContent;let o=await u(d,a);if(o instanceof Response)return a.newResponse(o.body,o);if(o){const w=e.mimes&&ot(d,e.mimes)||ot(d);if(a.header("Content-Type",w||"application/octet-stream"),e.precompressed&&(!w||br.test(w))){const y=new Set((p=a.req.header("Accept-Encoding"))==null?void 0:p.split(",").map(E=>E.trim()));for(const E of qr){if(!y.has(E))continue;const S=await u(d+Ft[E],a);if(S){o=S,a.header("Content-Encoding",E),a.header("Vary","Accept-Encoding",{append:!0});break}}}return await((m=e.onFound)==null?void 0:m.call(e,d,a)),a.body(o)}await((f=e.onNotFound)==null?void 0:f.call(e,d,a)),await n()}},jr=async(e,t)=>{let r;t&&t.manifest?typeof t.manifest=="string"?r=JSON.parse(t.manifest):r=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?r=JSON.parse(__STATIC_CONTENT_MANIFEST):r=__STATIC_CONTENT_MANIFEST;let s;t&&t.namespace?s=t.namespace:s=__STATIC_CONTENT;const a=r[e]||e;if(!a)return null;const n=await s.get(a,{type:"stream"});return n||null},xr=e=>async function(r,s){return Dr({...e,getContent:async n=>jr(n,{manifest:e.manifest,namespace:e.namespace?e.namespace:r.env?r.env.__STATIC_CONTENT:void 0})})(r,s)},Or=e=>xr(e),At=e=>e,Ir=/^[\w!#$%&'*.^`|~+-]+$/,kr=/^[ !#-:<-[\]-~]*$/,Nr=(e,t)=>{if(e.indexOf(t)===-1)return{};const r=e.trim().split(";"),s={};for(let a of r){a=a.trim();const n=a.indexOf("=");if(n===-1)continue;const i=a.substring(0,n).trim();if(t!==i||!Ir.test(i))continue;let d=a.substring(n+1).trim();if(d.startsWith('"')&&d.endsWith('"')&&(d=d.slice(1,-1)),kr.test(d)){s[i]=d.indexOf("%")!==-1?We(d,et):d;break}}return s},Cr=(e,t,r={})=>{let s=`${e}=${t}`;if(e.startsWith("__Secure-")&&!r.secure)throw new Error("__Secure- Cookie must have Secure attributes");if(e.startsWith("__Host-")){if(!r.secure)throw new Error("__Host- Cookie must have Secure attributes");if(r.path!=="/")throw new Error('__Host- Cookie must have Path attributes with "/"');if(r.domain)throw new Error("__Host- Cookie must not have Domain attributes")}if(r&&typeof r.maxAge=="number"&&r.maxAge>=0){if(r.maxAge>3456e4)throw new Error("Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration.");s+=`; Max-Age=${r.maxAge|0}`}if(r.domain&&r.prefix!=="host"&&(s+=`; Domain=${r.domain}`),r.path&&(s+=`; Path=${r.path}`),r.expires){if(r.expires.getTime()-Date.now()>3456e7)throw new Error("Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future.");s+=`; Expires=${r.expires.toUTCString()}`}if(r.httpOnly&&(s+="; HttpOnly"),r.secure&&(s+="; Secure"),r.sameSite&&(s+=`; SameSite=${r.sameSite.charAt(0).toUpperCase()+r.sameSite.slice(1)}`),r.priority&&(s+=`; Priority=${r.priority.charAt(0).toUpperCase()+r.priority.slice(1)}`),r.partitioned){if(!r.secure)throw new Error("Partitioned Cookie must have Secure attributes");s+="; Partitioned"}return s},Qe=(e,t,r)=>(t=encodeURIComponent(t),Cr(e,t,r)),Fr=(e,t,r)=>{const s=e.req.raw.headers.get("Cookie");{if(!s)return;let a=t;return Nr(s,a)[a]}},Ar=(e,t,r)=>{let s;return(r==null?void 0:r.prefix)==="secure"?s=Qe("__Secure-"+e,t,{path:"/",...r,secure:!0}):(r==null?void 0:r.prefix)==="host"?s=Qe("__Host-"+e,t,{...r,path:"/",secure:!0,domain:void 0}):s=Qe(e,t,{path:"/",...r}),s},tt=(e,t,r,s)=>{const a=Ar(t,r,s);e.header("Set-Cookie",a,{append:!0})};const $t="your-super-secret-jwt-key-change-in-production";function $r(e){let t=0;for(let r=0;r<e.length;r++){const s=e.charCodeAt(r);t=(t<<5)-t+s,t=t&t}return Math.abs(t).toString(16).padStart(8,"0")+"deadbeef123456789abcdef123456789abcdef"}async function Pr(e){return $r(e+"salt")}async function Lr(e,t){return await Pr(e)===t}function Pt(e){const t={alg:"HS256",typ:"JWT"},r=Math.floor(Date.now()/1e3),s={...e,iat:r,exp:r+86400},a=btoa(JSON.stringify(t)),n=btoa(JSON.stringify(s)),i=btoa(`${a}.${n}.${$t}`);return`${a}.${n}.${i}`}function Br(e){try{const t=e.split(".");if(t.length!==3)return null;const r=JSON.parse(atob(t[1])),s=btoa(`${t[0]}.${t[1]}.${$t}`);return t[2]!==s||r.exp<Math.floor(Date.now()/1e3)?null:r}catch{return null}}function Ur(e,t){return t.includes(e)}function Hr(e,t,r){return e==="admin"||e==="supervisor"||e==="manager"||e==="accounting"?!0:t===r}async function Lt(e,t){return await e.prepare("SELECT * FROM users WHERE email = ? AND active = 1").bind(t).first()||null}async function Mr(e,t){return await e.prepare("SELECT * FROM users WHERE id = ? AND active = 1").bind(t).first()||null}async function le(e,t){const r=await e.prepare("SELECT * FROM requests WHERE id = ?").bind(t).first();if(!r)return null;const s=await e.prepare("SELECT id, email, name, role, department FROM users WHERE id = ?").bind(r.requester_id).first();s&&(r.requester=s);const a=await e.prepare(`
    SELECT rl.*, s.name as supplier_name, c.name as category_name
    FROM request_lines rl
    LEFT JOIN suppliers s ON rl.supplier_id = s.id
    LEFT JOIN categories c ON rl.category_id = c.id
    WHERE rl.request_id = ?
    ORDER BY rl.id
  `).bind(t).all();r.lines=a.results.map(d=>({...d,supplier:d.supplier_name?{id:d.supplier_id,name:d.supplier_name}:void 0,category:d.category_name?{id:d.category_id,name:d.category_name}:void 0}));const n=await e.prepare(`
    SELECT a.*, u.name as approver_name, u.role as approver_role
    FROM approvals a
    LEFT JOIN users u ON a.approver_id = u.id
    WHERE a.request_id = ?
    ORDER BY a.created_at
  `).bind(t).all();r.approvals=n.results.map(d=>({...d,approver:{id:d.approver_id,name:d.approver_name,role:d.approver_role}}));const i=await e.prepare("SELECT * FROM attachments WHERE entity_type = ? AND entity_id = ? ORDER BY created_at").bind("request",t).all();return r.attachments=i.results,r}async function He(e,t){const r=await e.prepare("SELECT * FROM orders WHERE id = ?").bind(t).first();if(!r)return null;if(r.supplier_id){const n=await e.prepare("SELECT * FROM suppliers WHERE id = ?").bind(r.supplier_id).first();n&&(r.supplier=n)}const s=await le(e,r.request_id);s&&(r.request=s);const a=await e.prepare("SELECT * FROM invoices WHERE order_id = ? ORDER BY created_at").bind(t).all();return r.invoices=a.results,r}async function J(e,t,r,s,a,n,i,d,u){await e.prepare(`
    INSERT INTO audit_log (entity, entity_id, action, actor_id, old_values, new_values, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(t,r,s,a,n?JSON.stringify(n):null,i?JSON.stringify(i):null,d,u).run()}async function ee(e,t,r,s,a,n,i){await e.prepare(`
    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(t,r,s,a,n,i).run()}async function Wr(e,t){const r=await e.prepare(`
    SELECT SUM(COALESCE(total_price, quantity * COALESCE(unit_price, 0))) as total
    FROM request_lines 
    WHERE request_id = ?
  `).bind(t).first(),s=(r==null?void 0:r.total)||0;await e.prepare("UPDATE requests SET total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(s,t).run()}const _=At(async(e,t)=>{let r=e.req.header("Authorization");if(r&&r.startsWith("Bearer ")?r=r.substring(7):r=Fr(e,"auth_token"),!r)return e.json({error:"Unauthorized",message:"No token provided"},401);const s=Br(r);if(!s)return e.json({error:"Unauthorized",message:"Invalid token"},401);const a=await Mr(e.env.DB,s.userId);if(!a||!a.active)return e.json({error:"Unauthorized",message:"User not found or inactive"},401);e.set("user",{...s,id:s.userId,...a}),e.set("userId",s.userId),await t()}),N=e=>{const t=Array.isArray(e)?e:[e];return At(async(r,s)=>{const a=r.get("user");if(!a)return r.json({error:"Unauthorized",message:"Authentication required"},401);if(!Ur(a.role,t))return r.json({error:"Forbidden",message:`Access denied. Required roles: ${t.join(", ")}`},403);await s()})},Je=N(["manager","supervisor","admin"]),Ce=new te;Ce.post("/login",async e=>{try{const t=await e.req.json(),{email:r,password:s}=t;if(!r||!s)return e.json({error:"Validation Error",message:"Email and password are required"},400);const a=await Lt(e.env.DB,r);if(!a)return e.json({error:"Authentication Failed",message:"Invalid email or password"},401);if(!await Lr(s,a.password_hash))return e.json({error:"Authentication Failed",message:"Invalid email or password"},401);const i=Pt({userId:a.id,email:a.email,role:a.role});tt(e,"auth_token",i,{httpOnly:!0,secure:!0,sameSite:"Strict",maxAge:86400});const{password_hash:d,...u}=a;return e.json({token:i,user:u})}catch(t){return console.error("Login error:",t),e.json({error:"Internal Server Error",message:"An error occurred during login"},500)}});Ce.post("/logout",e=>(tt(e,"auth_token","",{httpOnly:!0,secure:!0,sameSite:"Strict",maxAge:0}),e.json({message:"Logged out successfully"})));Ce.get("/me",_,async e=>{try{const t=e.get("user"),r=await Lt(e.env.DB,t.email);if(!r)return e.json({error:"User Not Found",message:"User no longer exists"},404);const{password_hash:s,...a}=r;return e.json(a)}catch(t){return console.error("Get user error:",t),e.json({error:"Internal Server Error",message:"Failed to fetch user information"},500)}});Ce.post("/refresh",_,e=>{const t=e.get("user"),r=Pt({userId:t.userId,email:t.email,role:t.role});return tt(e,"auth_token",r,{httpOnly:!0,secure:!0,sameSite:"Strict",maxAge:86400}),e.json({token:r})});class Jr{constructor(t,r="noreply@company.com",s="Prekių užsakymų sistema"){h(this,"apiKey");h(this,"fromEmail");h(this,"fromName");h(this,"baseUrl");this.apiKey=t,this.fromEmail=r,this.fromName=s,this.baseUrl="https://api.sendgrid.com/v3/mail/send"}async sendEmail(t){try{const r={personalizations:[{to:[{email:t.to}],subject:t.subject}],from:{email:this.fromEmail,name:this.fromName},content:[{type:"text/plain",value:t.text},{type:"text/html",value:t.html}]};return(await fetch(this.baseUrl,{method:"POST",headers:{Authorization:`Bearer ${this.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify(r)})).ok}catch(r){return console.error("Email sending failed:",r),!1}}async sendRequestStatusNotification(t,r,s,a,n,i="https://your-app.pages.dev"){const u={submitted:"pateiktas peržiūrai",under_review:"peržiūrimas",pending_approval:"laukia patvirtinimo",approved:"patvirtintas",rejected:"atmestas",ordered:"užsakytas",delivered:"pristatytas",completed:"užbaigtas"}[a]||a,o=`${i}#/requests/${s}`,l=`Prašymo #${s} būsena pasikeitė`,p=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${l}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status { padding: 10px; border-radius: 5px; margin: 15px 0; }
          .status.approved { background: #D1FAE5; color: #065F46; }
          .status.rejected { background: #FEE2E2; color: #991B1B; }
          .status.default { background: #DBEAFE; color: #1E40AF; }
          .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Prekių užsakymų sistema</h1>
          </div>
          <div class="content">
            <h2>Sveiki, ${r}!</h2>
            <p>Jūsų prašymo būsena pasikeitė:</p>
            
            <div class="status ${a==="approved"?"approved":a==="rejected"?"rejected":"default"}">
              <strong>Prašymas #${s}</strong> dabar yra <strong>${u}</strong>
            </div>
            
            ${n?`
            <div style="margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #3B82F6;">
              <strong>Komentaras:</strong><br>
              ${n}
            </div>
            `:""}
            
            <a href="${o}" class="button">Peržiūrėti prašymą</a>
            
            <p>Dėkojame, kad naudojatės mūsų sistema!</p>
          </div>
          <div class="footer">
            <p>Šis pranešimas išsiųstas automatiškai. Neatsakykite į šį laišką.</p>
          </div>
        </div>
      </body>
      </html>
    `,m=`
Sveiki, ${r}!

Jūsų prašymo būsena pasikeitė:
Prašymas #${s} dabar yra ${u}

${n?`Komentaras: ${n}`:""}

Peržiūrėkite prašymą: ${o}

Dėkojame, kad naudojatės mūsų sistema!
    `;return this.sendEmail({to:t,subject:l,html:p,text:m})}async sendOrderStatusNotification(t,r,s,a,n,i="https://your-app.pages.dev"){const u={pending:"laukia apdorojimo",sent:"išsiųstas tiekėjui",confirmed:"patvirtintas",delivered:"pristatytas",completed:"užbaigtas"}[a]||a,o=`${i}#/orders/${s}`,l=`Užsakymo #${s} būsena pasikeitė`,p=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${l}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status { padding: 10px; border-radius: 5px; margin: 15px 0; background: #D1FAE5; color: #065F46; }
          .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Prekių užsakymų sistema</h1>
          </div>
          <div class="content">
            <h2>Sveiki, ${r}!</h2>
            <p>Užsakymo būsena pasikeitė:</p>
            
            <div class="status">
              <strong>Užsakymas #${s}</strong> dabar yra <strong>${u}</strong>
            </div>
            
            ${n?`
            <div style="margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #059669;">
              <strong>Komentaras:</strong><br>
              ${n}
            </div>
            `:""}
            
            <a href="${o}" class="button">Peržiūrėti užsakymą</a>
            
            <p>Dėkojame už kantrybę!</p>
          </div>
          <div class="footer">
            <p>Šis pranešimas išsiųstas automatiškai. Neatsakykite į šį laišką.</p>
          </div>
        </div>
      </body>
      </html>
    `,m=`
Sveiki, ${r}!

Užsakymo būsena pasikeitė:
Užsakymas #${s} dabar yra ${u}

${n?`Komentaras: ${n}`:""}

Peržiūrėkite užsakymą: ${o}

Dėkojame už kantrybę!
    `;return this.sendEmail({to:t,subject:l,html:p,text:m})}async sendInvoicePaymentNotification(t,r,s,a,n,i="https://your-app.pages.dev"){let d,u,o;switch(n){case"payment_received":d=`Mokėjimas gautas - Sąskaita ${s}`,u="#059669",o="Jūsų mokėjimas sėkmingai gautas ir apdorotas.";break;case"payment_reminder":d=`Mokėjimo priminimas - Sąskaita ${s}`,u="#D97706",o="Primename apie neapmokėtą sąskaitą faktūrą.";break;case"payment_overdue":d=`SKUBU: Mokėjimo terminas praėjęs - Sąskaita ${s}`,u="#DC2626",o="DĖMESIO: Mokėjimo terminas jau praėjęs.";break}const l=`${i}#/invoices`,p=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${d}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${u}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .invoice-details { padding: 15px; background: white; border-radius: 5px; margin: 15px 0; }
          .amount { font-size: 24px; font-weight: bold; color: ${u}; }
          .button { display: inline-block; padding: 12px 24px; background: ${u}; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Prekių užsakymų sistema</h1>
          </div>
          <div class="content">
            <h2>Sveiki, ${r}!</h2>
            <p>${o}</p>
            
            <div class="invoice-details">
              <strong>Sąskaitos numeris:</strong> ${s}<br>
              <strong>Suma:</strong> <span class="amount">€${a.toFixed(2)}</span>
            </div>
            
            <a href="${l}" class="button">Peržiūrėti sąskaitą</a>
            
            ${n==="payment_received"?"<p>Dėkojame už mokėjimą!</p>":"<p>Prašome apmokėti šią sąskaitą arba susisiekti su mumis dėl klausimų.</p>"}
          </div>
          <div class="footer">
            <p>Šis pranešimas išsiųstas automatiškai. Neatsakykite į šį laišką.</p>
          </div>
        </div>
      </body>
      </html>
    `,m=`
Sveiki, ${r}!

${o}

Sąskaitos numeris: ${s}
Suma: €${a.toFixed(2)}

Peržiūrėkite sąskaitą: ${l}

${n==="payment_received"?"Dėkojame už mokėjimą!":"Prašome apmokėti šią sąskaitą arba susisiekti su mumis dėl klausimų."}
    `;return this.sendEmail({to:t,subject:d,html:p,text:m})}async sendWelcomeEmail(t,r,s,a="https://your-app.pages.dev"){const n="Sveiki atvykę į prekių užsakymų sistemą",i=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${n}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .credentials { padding: 15px; background: #FEF3C7; border-left: 4px solid #D97706; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Prekių užsakymų sistema</h1>
          </div>
          <div class="content">
            <h2>Sveiki, ${r}!</h2>
            <p>Jums buvo sukurta paskyra prekių užsakymų valdymo sistemoje.</p>
            
            <div class="credentials">
              <strong>Jūsų prisijungimo duomenys:</strong><br>
              El. paštas: <strong>${t}</strong><br>
              Laikinas slaptažodis: <strong>${s}</strong>
            </div>
            
            <p><strong>SVARBU:</strong> Pirmą kartą prisijungę, prašome pakeisti slaptažodį.</p>
            
            <a href="${a}" class="button">Prisijungti į sistemą</a>
            
            <p>Jei turite klausimų, susisiekite su administratoriumi.</p>
          </div>
          <div class="footer">
            <p>Šis pranešimas išsiųstas automatiškai. Neatsakykite į šį laišką.</p>
          </div>
        </div>
      </body>
      </html>
    `,d=`
Sveiki, ${r}!

Jums buvo sukurta paskyra prekių užsakymų valdymo sistemoje.

Jūsų prisijungimo duomenys:
El. paštas: ${t}
Laikinas slaptažodis: ${s}

SVARBU: Pirmą kartą prisijungę, prašome pakeisti slaptažodį.

Prisijungti į sistemą: ${a}

Jei turite klausimų, susisiekite su administratoriumi.
    `;return this.sendEmail({to:t,subject:n,html:i,text:d})}}function De(e){const t=e.SENDGRID_API_KEY,r=e.FROM_EMAIL||"noreply@company.com",s=e.FROM_NAME||"Prekių užsakymų sistema";return t?new Jr(t,r,s):(console.warn("SendGrid API key not configured. Email notifications will be disabled."),null)}const we=new te;we.get("/",_,async e=>{try{const t=e.get("user"),{status:r,department:s,requester_id:a,date_from:n,date_to:i,page:d="1",limit:u="20",sort:o="created_at",order:l="desc"}=e.req.query(),p=(parseInt(d)-1)*parseInt(u);let m=[],f=[];t.role==="employee"&&(m.push("r.requester_id = ?"),f.push(t.userId)),r&&(m.push("r.status = ?"),f.push(r)),s&&(m.push("r.department = ?"),f.push(s)),a&&t.role!=="employee"&&(m.push("r.requester_id = ?"),f.push(parseInt(a))),n&&(m.push("DATE(r.created_at) >= ?"),f.push(n)),i&&(m.push("DATE(r.created_at) <= ?"),f.push(i));const w=m.length>0?"WHERE "+m.join(" AND "):"",y=`
      SELECT COUNT(*) as total
      FROM requests r
      ${w}
    `,E=await e.env.DB.prepare(y).bind(...f).first(),S=(E==null?void 0:E.total)||0,q=`
      SELECT r.*, u.name as requester_name, u.department as requester_department
      FROM requests r
      LEFT JOIN users u ON r.requester_id = u.id
      ${w}
      ORDER BY r.${o} ${l.toUpperCase()}
      LIMIT ? OFFSET ?
    `,k={data:(await e.env.DB.prepare(q).bind(...f,parseInt(u),p).all()).results.map(L=>({...L,requester:{id:L.requester_id,name:L.requester_name,department:L.requester_department}})),pagination:{page:parseInt(d),limit:parseInt(u),total:S,total_pages:Math.ceil(S/parseInt(u)),has_next:p+parseInt(u)<S,has_prev:parseInt(d)>1}};return e.json(k)}catch(t){return console.error("Get requests error:",t),e.json({error:"Internal Server Error",message:"Failed to fetch requests"},500)}});we.get("/:id",_,async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id"));if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid request ID"},400);const s=await le(e.env.DB,r);return s?Hr(t.role,t.userId,s.requester_id)?e.json(s):e.json({error:"Forbidden",message:"You do not have permission to view this request"},403):e.json({error:"Not Found",message:"Request not found"},404)}catch(t){return console.error("Get request error:",t),e.json({error:"Internal Server Error",message:"Failed to fetch request"},500)}});we.post("/",_,async e=>{try{const t=e.get("user"),r=await e.req.json();if(!r.department||!r.lines||r.lines.length===0)return e.json({error:"Validation Error",message:"Department and at least one line item are required"},400);for(const i of r.lines)if(!i.item_name||i.quantity<=0)return e.json({error:"Validation Error",message:"All line items must have a name and positive quantity"},400);const a=(await e.env.DB.prepare(`
      INSERT INTO requests (requester_id, department, priority, justification, needed_by_date)
      VALUES (?, ?, ?, ?, ?)
    `).bind(t.userId,r.department,r.priority||"normal",r.justification||null,r.needed_by_date||null).run()).meta.last_row_id;for(const i of r.lines){const d=i.unit_price?i.quantity*i.unit_price:null;await e.env.DB.prepare(`
        INSERT INTO request_lines (request_id, item_name, category_id, quantity, unit, unit_price, total_price, supplier_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(a,i.item_name,i.category_id||null,i.quantity,i.unit||"vnt.",i.unit_price||null,d,i.supplier_id||null,i.notes||null).run()}await Wr(e.env.DB,a),await J(e.env.DB,"request",a,"created",t.userId,null,{department:r.department,priority:r.priority},e.req.header("CF-Connecting-IP"),e.req.header("User-Agent"));const n=await le(e.env.DB,a);return e.json(n,201)}catch(t){return console.error("Create request error:",t),e.json({error:"Internal Server Error",message:"Failed to create request"},500)}});we.post("/:id/submit",_,async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id"));if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid request ID"},400);const s=await le(e.env.DB,r);if(!s)return e.json({error:"Not Found",message:"Request not found"},404);if(s.requester_id!==t.userId)return e.json({error:"Forbidden",message:"Only the requester can submit this request"},403);if(s.status!=="draft")return e.json({error:"Bad Request",message:"Only draft requests can be submitted"},400);await e.env.DB.prepare("UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind("submitted",r).run(),await J(e.env.DB,"request",r,"submitted",t.userId,{status:"draft"},{status:"submitted"});const a=await e.env.DB.prepare("SELECT id, email, name FROM users WHERE role = 'manager' AND active = 1").all();for(const d of a.results)await ee(e.env.DB,d.id,"request_submitted","Naujas prašymas peržiūrai",`${t.email} pateikė naują prašymą #${r}`,"request",r);const n=De(e.env);if(n){const d=e.env.APP_URL||"https://your-app.pages.dev";for(const u of a.results)try{await n.sendRequestStatusNotification(u.email,u.name,r,"submitted",`Darbuotojas ${t.name} pateikė naują prašymą peržiūrai.`,d)}catch(o){console.error("Failed to send email to manager:",o)}}const i=await le(e.env.DB,r);return e.json(i)}catch(t){return console.error("Submit request error:",t),e.json({error:"Internal Server Error",message:"Failed to submit request"},500)}});we.post("/:id/approve",_,Je,async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id")),s=await e.req.json();if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid request ID"},400);if(!s.decision||!["approved","rejected","needs_info"].includes(s.decision))return e.json({error:"Validation Error",message:"Valid decision is required (approved, rejected, needs_info)"},400);const a=await le(e.env.DB,r);if(!a)return e.json({error:"Not Found",message:"Request not found"},404);let n,i;if(a.status==="submitted"&&t.role==="manager")n="manager_review",s.decision==="approved"?i="pending_approval":s.decision==="rejected"?i="rejected":i="draft";else if(a.status==="pending_approval"&&(t.role==="supervisor"||t.role==="admin"))n="supervisor_approval",s.decision==="approved"?i="approved":s.decision==="rejected"?i="rejected":i="under_review";else return e.json({error:"Bad Request",message:"Request is not in a state that allows this approval action"},400);if(await e.env.DB.prepare(`
      INSERT INTO approvals (request_id, approver_id, stage, decision, comment, decided_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(r,t.userId,n,s.decision,s.comment||null).run(),await e.env.DB.prepare("UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(i,r).run(),s.decision==="approved"&&n==="supervisor_approval"){const o=(await e.env.DB.prepare(`
        INSERT INTO orders (request_id, order_date, status)
        VALUES (?, DATE('now'), 'pending')
      `).bind(r).run()).meta.last_row_id,l=`PO-${new Date().getFullYear()}-${o.toString().padStart(4,"0")}`;await e.env.DB.prepare("UPDATE orders SET po_number = ? WHERE id = ?").bind(l,o).run(),await e.env.DB.prepare("UPDATE requests SET status = ? WHERE id = ?").bind("ordered",r).run()}if(await J(e.env.DB,"request",r,`${n}_${s.decision}`,t.userId,{status:a.status},{status:i,decision:s.decision,comment:s.comment}),s.decision==="approved"&&n==="manager_review"){const u=await e.env.DB.prepare("SELECT id, email, name FROM users WHERE role IN ('supervisor', 'admin') AND active = 1").all();for(const l of u.results)await ee(e.env.DB,l.id,"request_approval_needed","Prašymas laukia patvirtinimo",`${t.email} rekomendavo patvirtinti prašymą #${r}`,"request",r);const o=De(e.env);if(o){const l=e.env.APP_URL||"https://your-app.pages.dev";for(const p of u.results)try{await o.sendRequestStatusNotification(p.email,p.name,r,"pending_approval",`Vadybininkas ${t.name} rekomendavo patvirtinti šį prašymą.`,l)}catch(m){console.error("Failed to send email to supervisor:",m)}}}else{await ee(e.env.DB,a.requester_id,"request_decision",`Prašymas ${s.decision==="approved"?"patvirtintas":s.decision==="rejected"?"atmesta":"grąžintas patikslinti"}`,s.comment||`Jūsų prašymas #${r} buvo ${s.decision}`,"request",r);const u=De(e.env);if(u){const o=e.env.APP_URL||"https://your-app.pages.dev";try{await u.sendRequestStatusNotification(a.requester_email,a.requester_name,r,i,s.comment,o)}catch(l){console.error("Failed to send email to requester:",l)}}}const d=await le(e.env.DB,r);return e.json(d)}catch(t){return console.error("Approve request error:",t),e.json({error:"Internal Server Error",message:"Failed to process approval"},500)}});const Ve=new te;Ve.get("/",_,Je,async e=>{try{const{status:t,supplier_id:r,date_from:s,date_to:a,page:n="1",limit:i="20",sort:d="created_at",order:u="desc"}=e.req.query(),o=(parseInt(n)-1)*parseInt(i);let l=[],p=[];t&&(l.push("o.status = ?"),p.push(t)),r&&(l.push("o.supplier_id = ?"),p.push(parseInt(r))),s&&(l.push("DATE(o.order_date) >= ?"),p.push(s)),a&&(l.push("DATE(o.order_date) <= ?"),p.push(a));const m=l.length>0?"WHERE "+l.join(" AND "):"",f=`
      SELECT COUNT(*) as total
      FROM orders o
      ${m}
    `,w=await e.env.DB.prepare(f).bind(...p).first(),y=(w==null?void 0:w.total)||0,E=`
      SELECT 
        o.*,
        r.total_amount,
        r.requester_id,
        u.name as requester_name,
        s.name as supplier_name
      FROM orders o
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      ${m}
      ORDER BY o.${d} ${u.toUpperCase()}
      LIMIT ? OFFSET ?
    `,q={data:(await e.env.DB.prepare(E).bind(...p,parseInt(i),o).all()).results.map(j=>({...j,request:{id:j.request_id,total_amount:j.total_amount,requester:{id:j.requester_id,name:j.requester_name}},supplier:j.supplier_name?{id:j.supplier_id,name:j.supplier_name}:null})),pagination:{page:parseInt(n),limit:parseInt(i),total:y,total_pages:Math.ceil(y/parseInt(i)),has_next:o+parseInt(i)<y,has_prev:parseInt(n)>1}};return e.json(q)}catch(t){return console.error("Get orders error:",t),e.json({error:"Internal Server Error",message:"Failed to fetch orders"},500)}});Ve.get("/:id",_,Je,async e=>{try{const t=parseInt(e.req.param("id"));if(isNaN(t))return e.json({error:"Bad Request",message:"Invalid order ID"},400);const r=await He(e.env.DB,t);return r?e.json(r):e.json({error:"Not Found",message:"Order not found"},404)}catch(t){return console.error("Get order error:",t),e.json({error:"Internal Server Error",message:"Failed to fetch order"},500)}});Ve.put("/:id",_,Je,async e=>{var t,r;try{const s=e.get("user"),a=parseInt(e.req.param("id")),n=await e.req.json();if(isNaN(a))return e.json({error:"Bad Request",message:"Invalid order ID"},400);const i=await He(e.env.DB,a);if(!i)return e.json({error:"Not Found",message:"Order not found"},404);const d=[],u=[];if(n.supplier_id!==void 0&&(d.push("supplier_id = ?"),u.push(n.supplier_id)),n.expected_delivery!==void 0&&(d.push("expected_delivery = ?"),u.push(n.expected_delivery)),n.status!==void 0){if(!["pending","sent","confirmed","delivered","completed"].includes(n.status))return e.json({error:"Validation Error",message:"Invalid status"},400);d.push("status = ?"),u.push(n.status)}if(n.notes!==void 0&&(d.push("notes = ?"),u.push(n.notes)),d.length===0)return e.json({error:"Bad Request",message:"No valid fields to update"},400);d.push("updated_at = CURRENT_TIMESTAMP"),u.push(a);const o=`UPDATE orders SET ${d.join(", ")} WHERE id = ?`;if(await e.env.DB.prepare(o).bind(...u).run(),n.status==="delivered"&&await e.env.DB.prepare("UPDATE requests SET status = ? WHERE id = ?").bind("delivered",i.request_id).run(),n.status==="completed"&&await e.env.DB.prepare("UPDATE requests SET status = ? WHERE id = ?").bind("completed",i.request_id).run(),await J(e.env.DB,"order",a,"updated",s.userId,{supplier_id:i.supplier_id,status:i.status,expected_delivery:i.expected_delivery},n),n.status&&n.status!==i.status){await ee(e.env.DB,(t=i.request)==null?void 0:t.requester_id,"order_status_change","Užsakymo būsena pasikeitė",`Jūsų užsakymo ${i.po_number} būsena pasikeitė į ${n.status}`,"order",a);const p=De(e.env);if(p&&((r=i.request)!=null&&r.requester_email)){const m=e.env.APP_URL||"https://your-app.pages.dev";try{await p.sendOrderStatusNotification(i.request.requester_email,i.request.requester_name,a,n.status,n.notes,m)}catch(f){console.error("Failed to send order status email:",f)}}}const l=await He(e.env.DB,a);return e.json(l)}catch(s){return console.error("Update order error:",s),e.json({error:"Internal Server Error",message:"Failed to update order"},500)}});const Fe=new te;Fe.post("/upload",_,async e=>{try{const t=e.get("user"),r=await e.req.formData(),s=r.get("file"),a=r.get("entity_type"),n=parseInt(r.get("entity_id")),i=r.get("title")||s.name;if(!s)return e.json({error:"Validation Error",message:"File is required"},400);if(!a||!n)return e.json({error:"Validation Error",message:"Entity type and ID are required"},400);const d=["image/jpeg","image/png","application/pdf"],u=10*1024*1024;if(!d.includes(s.type))return e.json({error:"Validation Error",message:"Only JPEG, PNG, and PDF files are allowed"},400);if(s.size>u)return e.json({error:"Validation Error",message:"File size must be less than 10MB"},400);const o=Date.now(),l=Math.random().toString(36).substring(2),p=s.name.split(".").pop(),m=`${a}/${n}/${o}-${l}.${p}`,f=await s.arrayBuffer();await e.env.BUCKET.put(m,f,{httpMetadata:{contentType:s.type},customMetadata:{originalName:s.name,uploadedBy:t.userId.toString(),entityType:a,entityId:n.toString()}});const y=(await e.env.DB.prepare(`
      INSERT INTO attachments (entity_type, entity_id, title, file_url, file_type, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(a,n,i,m,s.type,s.size,t.userId).run()).meta.last_row_id;await J(e.env.DB,"attachment",y,"uploaded",t.userId,null,{fileName:m,entityType:a,entityId:n,fileSize:s.size},e.req.header("CF-Connecting-IP"),e.req.header("User-Agent"));const E=await e.env.DB.prepare(`
      SELECT * FROM attachments WHERE id = ?
    `).bind(y).first();return e.json(E,201)}catch(t){return console.error("File upload error:",t),e.json({error:"Internal Server Error",message:"Failed to upload file"},500)}});Fe.get("/:id",_,async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id"));if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid attachment ID"},400);const s=await e.env.DB.prepare(`
      SELECT a.*, 
             CASE a.entity_type
               WHEN 'request' THEN r.requester_id
               WHEN 'order' THEN req.requester_id
               ELSE NULL
             END as owner_id
      FROM attachments a
      LEFT JOIN requests r ON a.entity_type = 'request' AND a.entity_id = r.id
      LEFT JOIN orders o ON a.entity_type = 'order' AND a.entity_id = o.id
      LEFT JOIN requests req ON o.request_id = req.id
      WHERE a.id = ?
    `).bind(r).first();if(!s)return e.json({error:"Not Found",message:"Attachment not found"},404);if(!(t.role==="admin"||t.role==="supervisor"||t.role==="manager"||t.role==="accounting"||t.userId===s.owner_id||t.userId===s.uploaded_by))return e.json({error:"Forbidden",message:"You do not have permission to access this file"},403);const n=await e.env.BUCKET.get(s.file_url);return n?new Response(n.body,{headers:{"Content-Type":s.file_type||"application/octet-stream","Content-Disposition":`inline; filename="${s.title}"`,"Cache-Control":"public, max-age=3600"}}):e.json({error:"Not Found",message:"File not found in storage"},404)}catch(t){return console.error("File get error:",t),e.json({error:"Internal Server Error",message:"Failed to retrieve file"},500)}});Fe.delete("/:id",_,async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id"));if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid attachment ID"},400);const s=await e.env.DB.prepare(`
      SELECT a.*, 
             CASE a.entity_type
               WHEN 'request' THEN r.requester_id
               WHEN 'order' THEN req.requester_id
               ELSE NULL
             END as owner_id
      FROM attachments a
      LEFT JOIN requests r ON a.entity_type = 'request' AND a.entity_id = r.id
      LEFT JOIN orders o ON a.entity_type = 'order' AND a.entity_id = o.id
      LEFT JOIN requests req ON o.request_id = req.id
      WHERE a.id = ?
    `).bind(r).first();return s?t.role==="admin"||t.role==="manager"||t.userId===s.uploaded_by?(await e.env.BUCKET.delete(s.file_url),await e.env.DB.prepare(`
      DELETE FROM attachments WHERE id = ?
    `).bind(r).run(),await J(e.env.DB,"attachment",r,"deleted",t.userId,{fileName:s.file_url,title:s.title},null,e.req.header("CF-Connecting-IP"),e.req.header("User-Agent")),e.json({success:!0},204)):e.json({error:"Forbidden",message:"You do not have permission to delete this file"},403):e.json({error:"Not Found",message:"Attachment not found"},404)}catch(t){return console.error("File delete error:",t),e.json({error:"Internal Server Error",message:"Failed to delete file"},500)}});Fe.get("/entity/:type/:id",_,async e=>{try{const t=e.req.param("type"),r=parseInt(e.req.param("id"));if(!["request","order","invoice"].includes(t))return e.json({error:"Bad Request",message:"Invalid entity type"},400);if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid entity ID"},400);const s=await e.env.DB.prepare(`
      SELECT a.*, u.name as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.entity_type = ? AND a.entity_id = ?
      ORDER BY a.created_at DESC
    `).bind(t,r).all();return e.json(s.results)}catch(t){return console.error("List files error:",t),e.json({error:"Internal Server Error",message:"Failed to list files"},500)}});const ce=new te;ce.get("/",_,N(["manager","supervisor","accounting","admin"]),async e=>{try{const{order_id:t,type:r,paid:s,page:a="1",limit:n="20",sort:i="created_at",order:d="desc"}=e.req.query(),u=(parseInt(a)-1)*parseInt(n);let o=[],l=[];t&&(o.push("i.order_id = ?"),l.push(parseInt(t))),r&&(o.push("i.type = ?"),l.push(r)),s!==void 0&&(o.push("i.paid = ?"),l.push(s==="true"?1:0));const p=o.length>0?"WHERE "+o.join(" AND "):"",m=`
      SELECT COUNT(*) as total
      FROM invoices i
      ${p}
    `,f=await e.env.DB.prepare(m).bind(...l).first(),w=(f==null?void 0:f.total)||0,y=`
      SELECT 
        i.*,
        o.po_number,
        r.requester_id,
        u.name as requester_name
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      ${p}
      ORDER BY i.${i} ${d.toUpperCase()}
      LIMIT ? OFFSET ?
    `,S={data:(await e.env.DB.prepare(y).bind(...l,parseInt(n),u).all()).results.map(q=>({...q,order:{id:q.order_id,po_number:q.po_number,requester:{id:q.requester_id,name:q.requester_name}}})),pagination:{page:parseInt(a),limit:parseInt(n),total:w,total_pages:Math.ceil(w/parseInt(n)),has_next:u+parseInt(n)<w,has_prev:parseInt(a)>1}};return e.json(S)}catch(t){return console.error("Get invoices error:",t),e.json({error:"Internal Server Error",message:"Failed to fetch invoices"},500)}});ce.post("/",_,N(["manager","accounting","admin"]),async e=>{var t,r;try{const s=e.get("user"),a=await e.req.formData(),n=parseInt(a.get("order_id")),i=a.get("type"),d=a.get("invoice_number"),u=parseFloat(a.get("amount")||"0"),o=a.get("currency")||"EUR",l=a.get("issue_date"),p=a.get("due_date"),m=a.get("file");if(!n||!i)return e.json({error:"Validation Error",message:"Order ID and type are required"},400);if(!["proforma","final","vat"].includes(i))return e.json({error:"Validation Error",message:"Invalid invoice type"},400);const f=await He(e.env.DB,n);if(!f)return e.json({error:"Not Found",message:"Order not found"},404);let w=null;if(m){if(!["application/pdf","image/jpeg","image/png"].includes(m.type))return e.json({error:"Validation Error",message:"Only PDF, JPEG, and PNG files are allowed"},400);if(m.size>10485760)return e.json({error:"Validation Error",message:"File size must be less than 10MB"},400);const k=Date.now(),L=Math.random().toString(36).substring(2),Ae=m.name.split(".").pop(),V=`invoices/${n}/${i}/${k}-${L}.${Ae}`,F=await m.arrayBuffer();await e.env.BUCKET.put(V,F,{httpMetadata:{contentType:m.type},customMetadata:{originalName:m.name,uploadedBy:s.userId.toString(),orderId:n.toString(),invoiceType:i}}),w=V}const E=(await e.env.DB.prepare(`
      INSERT INTO invoices (order_id, type, file_url, invoice_number, amount, currency, issue_date, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(n,i,w,d||null,u||null,o,l||null,p||null).run()).meta.last_row_id;if(i==="proforma"?await e.env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind("confirmed",n).run():i==="final"&&(await e.env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind("delivered",n).run(),await e.env.DB.prepare("UPDATE requests SET status = ? WHERE id = ?").bind("delivered",f.request_id).run()),await J(e.env.DB,"invoice",E,"created",s.userId,null,{orderId:n,type:i,amount:u,invoiceNumber:d,hasFile:!!w},e.req.header("CF-Connecting-IP"),e.req.header("User-Agent")),i==="proforma")await ee(e.env.DB,(t=f.request)==null?void 0:t.requester_id,"invoice_proforma","Gauta išankstinė sąskaita",`Jūsų užsakymo ${f.po_number} išankstinė sąskaita yra paruošta`,"order",n);else if(i==="final"){await ee(e.env.DB,(r=f.request)==null?void 0:r.requester_id,"order_delivered","Užsakymas pristatytas",`Jūsų užsakymas ${f.po_number} buvo pristatytas`,"order",n);const q=await e.env.DB.prepare("SELECT id FROM users WHERE role = 'accounting' AND active = 1").all();for(const j of q.results)await ee(e.env.DB,j.id,"invoice_payment_needed","Reikalingas mokėjimas",`Užsakymas ${f.po_number} laukia apmokėjimo`,"order",n)}const S=await e.env.DB.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).bind(E).first();return e.json(S,201)}catch(s){return console.error("Create invoice error:",s),e.json({error:"Internal Server Error",message:"Failed to create invoice"},500)}});ce.get("/:id",_,N(["manager","supervisor","accounting","admin"]),async e=>{try{const t=parseInt(e.req.param("id"));if(isNaN(t))return e.json({error:"Bad Request",message:"Invalid invoice ID"},400);const r=await e.env.DB.prepare(`
      SELECT 
        i.*,
        o.po_number,
        o.order_date,
        r.requester_id,
        u.name as requester_name,
        s.name as supplier_name
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      WHERE i.id = ?
    `).bind(t).first();return r?e.json({...r,order:{id:r.order_id,po_number:r.po_number,order_date:r.order_date,requester:{id:r.requester_id,name:r.requester_name},supplier:{name:r.supplier_name}}}):e.json({error:"Not Found",message:"Invoice not found"},404)}catch(t){return console.error("Get invoice error:",t),e.json({error:"Internal Server Error",message:"Failed to fetch invoice"},500)}});ce.patch("/:id",_,N(["accounting","admin"]),async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id")),s=await e.req.json();if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid invoice ID"},400);const a=await e.env.DB.prepare(`
      SELECT i.*, o.request_id, o.po_number
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      WHERE i.id = ?
    `).bind(r).first();if(!a)return e.json({error:"Not Found",message:"Invoice not found"},404);const n=[],i=[];if(s.paid!==void 0&&(n.push("paid = ?"),i.push(s.paid?1:0)),s.paid_date!==void 0&&(n.push("paid_date = ?"),i.push(s.paid_date)),s.amount!==void 0&&(n.push("amount = ?"),i.push(s.amount)),s.invoice_number!==void 0&&(n.push("invoice_number = ?"),i.push(s.invoice_number)),s.due_date!==void 0&&(n.push("due_date = ?"),i.push(s.due_date)),n.length===0)return e.json({error:"Bad Request",message:"No valid fields to update"},400);n.push("updated_at = CURRENT_TIMESTAMP"),i.push(r);const d=`UPDATE invoices SET ${n.join(", ")} WHERE id = ?`;if(await e.env.DB.prepare(d).bind(...i).run(),s.paid===!0&&a.type==="final"){await e.env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind("completed",a.order_id).run(),await e.env.DB.prepare("UPDATE requests SET status = ? WHERE id = ?").bind("completed",a.request_id).run();const o=await e.env.DB.prepare(`
        SELECT requester_id, r.requester_email, r.requester_name 
        FROM requests r WHERE id = ?
      `).bind(a.request_id).first();if(o){await ee(e.env.DB,o.requester_id,"order_completed","Užsakymas užbaigtas",`Jūsų užsakymas ${a.po_number} buvo sėkmingai užbaigtas`,"order",a.order_id);const l=De(e.env);if(l&&o.requester_email){const p=e.env.APP_URL||"https://your-app.pages.dev";try{await l.sendInvoicePaymentNotification(o.requester_email,o.requester_name,a.invoice_number,a.amount,"payment_received",p)}catch(m){console.error("Failed to send payment notification email:",m)}}}}await J(e.env.DB,"invoice",r,"updated",t.userId,{paid:a.paid,paid_date:a.paid_date,amount:a.amount},s,e.req.header("CF-Connecting-IP"),e.req.header("User-Agent"));const u=await e.env.DB.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).bind(r).first();return e.json(u)}catch(t){return console.error("Update invoice error:",t),e.json({error:"Internal Server Error",message:"Failed to update invoice"},500)}});ce.get("/:id/file",_,async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id"));if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid invoice ID"},400);const s=await e.env.DB.prepare(`
      SELECT 
        i.*,
        r.requester_id
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN requests r ON o.request_id = r.id
      WHERE i.id = ?
    `).bind(r).first();if(!s)return e.json({error:"Not Found",message:"Invoice not found"},404);if(!s.file_url)return e.json({error:"Not Found",message:"No file attached to this invoice"},404);if(!(t.role==="admin"||t.role==="supervisor"||t.role==="manager"||t.role==="accounting"||t.userId===s.requester_id))return e.json({error:"Forbidden",message:"You do not have permission to access this file"},403);const n=await e.env.BUCKET.get(s.file_url);if(!n)return e.json({error:"Not Found",message:"File not found in storage"},404);const i=`invoice-${s.type}-${s.id}.pdf`;return new Response(n.body,{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="${i}"`,"Cache-Control":"private, max-age=3600"}})}catch(t){return console.error("Get invoice file error:",t),e.json({error:"Internal Server Error",message:"Failed to retrieve invoice file"},500)}});ce.delete("/:id",_,N(["admin"]),async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id"));if(isNaN(r))return e.json({error:"Bad Request",message:"Invalid invoice ID"},400);const s=await e.env.DB.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).bind(r).first();return s?(s.file_url&&await e.env.BUCKET.delete(s.file_url),await e.env.DB.prepare(`
      DELETE FROM invoices WHERE id = ?
    `).bind(r).run(),await J(e.env.DB,"invoice",r,"deleted",t.userId,{type:s.type,amount:s.amount,invoiceNumber:s.invoice_number},null,e.req.header("CF-Connecting-IP"),e.req.header("User-Agent")),e.json({success:!0},204)):e.json({error:"Not Found",message:"Invoice not found"},404)}catch(t){return console.error("Delete invoice error:",t),e.json({error:"Internal Server Error",message:"Failed to delete invoice"},500)}});class Se{constructor(t){h(this,"db");this.db=t}async generateRequestsReport(t={}){let r=["1=1"],s=[];t.date_from&&(r.push("DATE(r.created_at) >= ?"),s.push(t.date_from)),t.date_to&&(r.push("DATE(r.created_at) <= ?"),s.push(t.date_to)),t.status&&(r.push("r.status = ?"),s.push(t.status)),t.department&&(r.push("r.department = ?"),s.push(t.department)),t.requester_id&&(r.push("r.requester_id = ?"),s.push(t.requester_id));const a=`
      SELECT 
        r.id,
        r.created_at,
        r.status,
        r.department,
        r.priority,
        r.justification,
        r.needed_by_date,
        r.total_amount,
        u.name as requester_name,
        u.email as requester_email,
        (SELECT COUNT(*) FROM request_lines rl WHERE rl.request_id = r.id) as items_count
      FROM requests r
      LEFT JOIN users u ON r.requester_id = u.id
      WHERE ${r.join(" AND ")}
      ORDER BY r.created_at DESC
    `,n=await this.db.prepare(a).bind(...s).all(),i=["ID","Sukurta","Būsena","Skyrius","Prioritetas","Pagrindimas","Reikia iki","Suma (€)","Prašytojas","El. paštas","Prekių skaičius"],d=n.results.map(o=>[o.id,new Date(o.created_at).toLocaleDateString("lt-LT"),this.getStatusLabel(o.status),o.department,this.getPriorityLabel(o.priority),o.justification,o.needed_by_date?new Date(o.needed_by_date).toLocaleDateString("lt-LT"):"",parseFloat(o.total_amount||"0").toFixed(2),o.requester_name,o.requester_email,o.items_count]),u=`prasymai_${t.date_from||"visi"}_${t.date_to||new Date().toISOString().split("T")[0]}.csv`;return{headers:i,rows:d,filename:u}}async generateOrdersReport(t={}){let r=["1=1"],s=[];t.date_from&&(r.push("DATE(o.created_at) >= ?"),s.push(t.date_from)),t.date_to&&(r.push("DATE(o.created_at) <= ?"),s.push(t.date_to)),t.status&&(r.push("o.status = ?"),s.push(t.status)),t.supplier_id&&(r.push("o.supplier_id = ?"),s.push(t.supplier_id));const a=`
      SELECT 
        o.id,
        o.po_number,
        o.order_date,
        o.status,
        o.expected_delivery,
        o.notes,
        s.name as supplier_name,
        r.department,
        r.total_amount,
        u.name as requester_name
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      WHERE ${r.join(" AND ")}
      ORDER BY o.created_at DESC
    `,n=await this.db.prepare(a).bind(...s).all(),i=["ID","Užsakymo Nr.","Užsakymo data","Būsena","Tikėtinas pristatymas","Tiekėjas","Skyrius","Suma (€)","Prašytojas","Pastabos"],d=n.results.map(o=>[o.id,o.po_number,new Date(o.order_date).toLocaleDateString("lt-LT"),this.getOrderStatusLabel(o.status),o.expected_delivery?new Date(o.expected_delivery).toLocaleDateString("lt-LT"):"",o.supplier_name,o.department,parseFloat(o.total_amount||"0").toFixed(2),o.requester_name,o.notes||""]),u=`uzsakymai_${t.date_from||"visi"}_${t.date_to||new Date().toISOString().split("T")[0]}.csv`;return{headers:i,rows:d,filename:u}}async generateInvoicesReport(t={}){let r=["1=1"],s=[];t.date_from&&(r.push("DATE(i.created_at) >= ?"),s.push(t.date_from)),t.date_to&&(r.push("DATE(i.created_at) <= ?"),s.push(t.date_to)),t.type&&(r.push("i.type = ?"),s.push(t.type));const a=`
      SELECT 
        i.id,
        i.invoice_number,
        i.type,
        i.amount,
        i.due_date,
        i.paid,
        i.paid_date,
        i.created_at,
        o.po_number,
        s.name as supplier_name,
        r.department,
        u.name as requester_name
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      WHERE ${r.join(" AND ")}
      ORDER BY i.created_at DESC
    `,n=await this.db.prepare(a).bind(...s).all(),i=["ID","Sąskaitos Nr.","Tipas","Suma (€)","Terminas","Apmokėta","Mokėjimo data","Sukurta","Užsakymas","Tiekėjas","Skyrius","Prašytojas"],d=n.results.map(o=>[o.id,o.invoice_number,this.getInvoiceTypeLabel(o.type),parseFloat(o.amount).toFixed(2),o.due_date?new Date(o.due_date).toLocaleDateString("lt-LT"):"",o.paid?"Taip":"Ne",o.paid_date?new Date(o.paid_date).toLocaleDateString("lt-LT"):"",new Date(o.created_at).toLocaleDateString("lt-LT"),o.po_number,o.supplier_name,o.department,o.requester_name]),u=`saskaitos_${t.date_from||"visos"}_${t.date_to||new Date().toISOString().split("T")[0]}.csv`;return{headers:i,rows:d,filename:u}}async generateFinancialSummaryReport(t={}){let r=["1=1"],s=[];t.date_from&&(r.push("DATE(r.created_at) >= ?"),s.push(t.date_from)),t.date_to&&(r.push("DATE(r.created_at) <= ?"),s.push(t.date_to));const a=`
      SELECT 
        r.department,
        r.status,
        COUNT(*) as count,
        SUM(r.total_amount) as total_amount,
        AVG(r.total_amount) as avg_amount
      FROM requests r
      WHERE ${r.join(" AND ")}
      GROUP BY r.department, r.status
      ORDER BY r.department, r.status
    `,n=await this.db.prepare(a).bind(...s).all(),i=["Skyrius","Būsena","Prašymų skaičius","Bendra suma (€)","Vidutinė suma (€)"],d=n.results.map(o=>[o.department,this.getStatusLabel(o.status),o.count,parseFloat(o.total_amount||"0").toFixed(2),parseFloat(o.avg_amount||"0").toFixed(2)]),u=`finansu_suvestine_${t.date_from||"visi"}_${t.date_to||new Date().toISOString().split("T")[0]}.csv`;return{headers:i,rows:d,filename:u}}async generateUsersReport(t={}){let r=["u.active = 1"],s=[];t.role&&(r.push("u.role = ?"),s.push(t.role));const a=`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.department,
        u.created_at,
        u.last_login,
        COUNT(DISTINCT r.id) as requests_count,
        COALESCE(SUM(r.total_amount), 0) as total_requested_amount
      FROM users u
      LEFT JOIN requests r ON u.id = r.requester_id 
        ${t.date_from?"AND DATE(r.created_at) >= ?":""}
        ${t.date_to?"AND DATE(r.created_at) <= ?":""}
      WHERE ${r.join(" AND ")}
      GROUP BY u.id, u.name, u.email, u.role, u.department, u.created_at, u.last_login
      ORDER BY u.name
    `;t.date_from&&s.push(t.date_from),t.date_to&&s.push(t.date_to);const n=await this.db.prepare(a).bind(...s).all(),i=["ID","Vardas","El. paštas","Rolė","Skyrius","Sukurta","Paskutinis prisijungimas","Prašymų skaičius","Bendrai prašyta (€)"],d=n.results.map(o=>[o.id,o.name,o.email,this.getRoleLabel(o.role),o.department,new Date(o.created_at).toLocaleDateString("lt-LT"),o.last_login?new Date(o.last_login).toLocaleDateString("lt-LT"):"Niekada",o.requests_count,parseFloat(o.total_requested_amount).toFixed(2)]),u=`vartotojai_${t.date_from||"visi"}_${t.date_to||new Date().toISOString().split("T")[0]}.csv`;return{headers:i,rows:d,filename:u}}generateCSV(t){const{headers:r,rows:s}=t,a=r.join(","),n=s.map(i=>i.map(d=>{const u=String(d||"");return u.includes(",")||u.includes('"')||u.includes(`
`)?'"'+u.replace(/"/g,'""')+'"':u}).join(",")).join(`
`);return a+`
`+n}generateTSV(t){const{headers:r,rows:s}=t,a=r.join("	"),n=s.map(i=>i.map(d=>String(d||"")).join("	")).join(`
`);return a+`
`+n}getStatusLabel(t){return{draft:"Juodraštis",submitted:"Pateiktas",under_review:"Peržiūrimas",pending_approval:"Laukia patvirtinimo",approved:"Patvirtintas",rejected:"Atmestas",ordered:"Užsakytas",delivered:"Pristatytas",completed:"Užbaigtas",archived:"Archyvuotas"}[t]||t}getOrderStatusLabel(t){return{pending:"Laukia apdorojimo",sent:"Išsiųstas",confirmed:"Patvirtintas",delivered:"Pristatytas",completed:"Užbaigtas"}[t]||t}getInvoiceTypeLabel(t){return{proforma:"Proforma",final:"Galutinė",vat:"PVM"}[t]||t}getPriorityLabel(t){return{low:"Žemas",normal:"Normalus",high:"Aukštas",urgent:"Skubus"}[t]||t}getRoleLabel(t){return{employee:"Darbuotojas",manager:"Vadybininkas",supervisor:"Vadovas",accounting:"Buhalterė",admin:"Administratorius"}[t]||t}}const re=new te;re.get("/",_,N(["manager","supervisor","accounting","admin"]),async e=>{const t=e.get("user"),s=[{id:"requests",name:"Prašymų ataskaita",description:"Visų prašymų sąrašas su detalėmis",roles:["manager","supervisor","accounting","admin"]},{id:"orders",name:"Užsakymų ataskaita",description:"Visų užsakymų sąrašas su būsenomis",roles:["manager","supervisor","accounting","admin"]},{id:"invoices",name:"Sąskaitų ataskaita",description:"Sąskaitų faktūrų ir mokėjimų ataskaita",roles:["accounting","admin"]},{id:"financial-summary",name:"Finansų suvestinė",description:"Išlaidų suvestinė pagal skyrius ir būsenas",roles:["supervisor","accounting","admin"]},{id:"users",name:"Vartotojų aktyvumas",description:"Vartotojų aktyvumo ir prašymų statistikos",roles:["admin"]}].filter(a=>a.roles.includes(t.role));return e.json({reports:s})});re.get("/requests",_,N(["manager","supervisor","accounting","admin"]),async e=>{try{const{format:t="csv",date_from:r,date_to:s,status:a,department:n,requester_id:i}=e.req.query(),d=new Se(e.env.DB),u=await d.generateRequestsReport({date_from:r,date_to:s,status:a,department:n,requester_id:i?parseInt(i):void 0});let o,l,p;return t==="tsv"||t==="excel"?(o=d.generateTSV(u),l="text/tab-separated-values",p=u.filename.replace(".csv",".tsv")):(o=d.generateCSV(u),l="text/csv",p=u.filename),new Response(o,{headers:{"Content-Type":l,"Content-Disposition":`attachment; filename="${p}"`,"Access-Control-Expose-Headers":"Content-Disposition"}})}catch(t){return console.error("Generate requests report error:",t),e.json({error:"Internal Server Error",message:"Failed to generate requests report"},500)}});re.get("/orders",_,N(["manager","supervisor","accounting","admin"]),async e=>{try{const{format:t="csv",date_from:r,date_to:s,status:a,supplier_id:n}=e.req.query(),i=new Se(e.env.DB),d=await i.generateOrdersReport({date_from:r,date_to:s,status:a,supplier_id:n?parseInt(n):void 0});let u,o,l;return t==="tsv"||t==="excel"?(u=i.generateTSV(d),o="text/tab-separated-values",l=d.filename.replace(".csv",".tsv")):(u=i.generateCSV(d),o="text/csv",l=d.filename),new Response(u,{headers:{"Content-Type":o,"Content-Disposition":`attachment; filename="${l}"`,"Access-Control-Expose-Headers":"Content-Disposition"}})}catch(t){return console.error("Generate orders report error:",t),e.json({error:"Internal Server Error",message:"Failed to generate orders report"},500)}});re.get("/invoices",_,N(["accounting","admin"]),async e=>{try{const{format:t="csv",date_from:r,date_to:s,type:a}=e.req.query(),n=new Se(e.env.DB),i=await n.generateInvoicesReport({date_from:r,date_to:s,type:a});let d,u,o;return t==="tsv"||t==="excel"?(d=n.generateTSV(i),u="text/tab-separated-values",o=i.filename.replace(".csv",".tsv")):(d=n.generateCSV(i),u="text/csv",o=i.filename),new Response(d,{headers:{"Content-Type":u,"Content-Disposition":`attachment; filename="${o}"`,"Access-Control-Expose-Headers":"Content-Disposition"}})}catch(t){return console.error("Generate invoices report error:",t),e.json({error:"Internal Server Error",message:"Failed to generate invoices report"},500)}});re.get("/financial-summary",_,N(["supervisor","accounting","admin"]),async e=>{try{const{format:t="csv",date_from:r,date_to:s}=e.req.query(),a=new Se(e.env.DB),n=await a.generateFinancialSummaryReport({date_from:r,date_to:s});let i,d,u;return t==="tsv"||t==="excel"?(i=a.generateTSV(n),d="text/tab-separated-values",u=n.filename.replace(".csv",".tsv")):(i=a.generateCSV(n),d="text/csv",u=n.filename),new Response(i,{headers:{"Content-Type":d,"Content-Disposition":`attachment; filename="${u}"`,"Access-Control-Expose-Headers":"Content-Disposition"}})}catch(t){return console.error("Generate financial summary report error:",t),e.json({error:"Internal Server Error",message:"Failed to generate financial summary report"},500)}});re.get("/users",_,N(["admin"]),async e=>{try{const{format:t="csv",date_from:r,date_to:s,role:a}=e.req.query(),n=new Se(e.env.DB),i=await n.generateUsersReport({date_from:r,date_to:s,role:a});let d,u,o;return t==="tsv"||t==="excel"?(d=n.generateTSV(i),u="text/tab-separated-values",o=i.filename.replace(".csv",".tsv")):(d=n.generateCSV(i),u="text/csv",o=i.filename),new Response(d,{headers:{"Content-Type":u,"Content-Disposition":`attachment; filename="${o}"`,"Access-Control-Expose-Headers":"Content-Disposition"}})}catch(t){return console.error("Generate users report error:",t),e.json({error:"Internal Server Error",message:"Failed to generate users report"},500)}});re.get("/:type/preview",_,N(["manager","supervisor","accounting","admin"]),async e=>{try{const t=e.get("user"),r=e.req.param("type"),{date_from:s,date_to:a,status:n,department:i,requester_id:d,supplier_id:u,type:o,role:l}=e.req.query(),p=new Se(e.env.DB);let m;switch(r){case"requests":if(!["manager","supervisor","accounting","admin"].includes(t.role))return e.json({error:"Forbidden"},403);m=await p.generateRequestsReport({date_from:s,date_to:a,status:n,department:i,requester_id:d?parseInt(d):void 0});break;case"orders":if(!["manager","supervisor","accounting","admin"].includes(t.role))return e.json({error:"Forbidden"},403);m=await p.generateOrdersReport({date_from:s,date_to:a,status:n,supplier_id:u?parseInt(u):void 0});break;case"invoices":if(!["accounting","admin"].includes(t.role))return e.json({error:"Forbidden"},403);m=await p.generateInvoicesReport({date_from:s,date_to:a,type:o});break;case"financial-summary":if(!["supervisor","accounting","admin"].includes(t.role))return e.json({error:"Forbidden"},403);m=await p.generateFinancialSummaryReport({date_from:s,date_to:a});break;case"users":if(t.role!=="admin")return e.json({error:"Forbidden"},403);m=await p.generateUsersReport({date_from:s,date_to:a,role:l});break;default:return e.json({error:"Bad Request",message:"Invalid report type"},400)}const f={headers:m.headers,rows:m.rows.slice(0,10),total_rows:m.rows.length,filename:m.filename};return e.json(f)}catch(t){return console.error("Generate report preview error:",t),e.json({error:"Internal Server Error",message:"Failed to generate report preview"},500)}});const R=new te;R.use("/api/*",_r({origin:["http://localhost:3000","https://*.pages.dev"],allowMethods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],allowHeaders:["Content-Type","Authorization"],credentials:!0}));R.use("/static/*",Or({root:"./public"}));R.route("/api/v1/auth",Ce);R.route("/api/v1/requests",we);R.route("/api/v1/orders",Ve);R.route("/api/v1/files",Fe);R.route("/api/v1/invoices",ce);R.route("/api/v1/reports",re);R.get("/api/health",e=>e.json({status:"ok",timestamp:new Date().toISOString(),version:"1.0.0"}));R.get("/api/v1",e=>e.json({name:"Prekių užsakymų valdymo API",version:"1.0.0",endpoints:{auth:"/api/v1/auth",requests:"/api/v1/requests",orders:"/api/v1/orders",invoices:"/api/v1/invoices",files:"/api/v1/files",reports:"/api/v1/reports",health:"/api/health"}}));R.get("/api/v1/suppliers",_,async e=>{try{const{active:t="true",search:r}=e.req.query();let s="SELECT * FROM suppliers";const a=[];t==="true"&&(s+=" WHERE active = 1"),r&&(s+=t==="true"?" AND":" WHERE",s+=" name LIKE ?",a.push(`%${r}%`)),s+=" ORDER BY name";const n=await e.env.DB.prepare(s).bind(...a).all();return e.json(n.results)}catch{return e.json({error:"Failed to fetch suppliers"},500)}});R.get("/api/v1/categories",_,async e=>{try{const t=await e.env.DB.prepare(`
      SELECT * FROM categories 
      WHERE active = 1 
      ORDER BY parent_id, name
    `).all();return e.json(t.results)}catch{return e.json({error:"Failed to fetch categories"},500)}});R.get("/api/v1/notifications",_,async e=>{try{const t=e.get("user"),{read:r}=e.req.query();let s="SELECT * FROM notifications WHERE user_id = ?";const a=[t.userId];r!==void 0&&(s+=" AND read = ?",a.push(r==="true"?1:0)),s+=" ORDER BY created_at DESC LIMIT 50";const n=await e.env.DB.prepare(s).bind(...a).all();return e.json(n.results)}catch{return e.json({error:"Failed to fetch notifications"},500)}});R.patch("/api/v1/notifications/:id/read",_,async e=>{try{const t=e.get("user"),r=parseInt(e.req.param("id"));return await e.env.DB.prepare(`
      UPDATE notifications 
      SET read = 1 
      WHERE id = ? AND user_id = ?
    `).bind(r,t.userId).run(),e.json({success:!0})}catch{return e.json({error:"Failed to update notification"},500)}});R.get("/api/v1/dashboard/stats",_,async e=>{try{const t=e.get("user");let r="",s=[];t.role==="employee"&&(r="WHERE requester_id = ?",s=[t.userId]);const a=await e.env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM requests
      ${r}
      GROUP BY status
    `).bind(...s).all(),n=await e.env.DB.prepare(`
      SELECT SUM(total_amount) as total
      FROM requests
      ${r?r+" AND":"WHERE"} 
      DATE(created_at) >= DATE('now', 'start of month')
    `).bind(...s).first(),i=await e.env.DB.prepare(`
      SELECT r.*, u.name as requester_name
      FROM requests r
      LEFT JOIN users u ON r.requester_id = u.id
      ${r}
      ORDER BY r.created_at DESC
      LIMIT 10
    `).bind(...s).all();return e.json({status_counts:a.results,monthly_total:(n==null?void 0:n.total)||0,recent_requests:i.results})}catch(t){return console.error("Dashboard stats error:",t),e.json({error:"Failed to fetch dashboard stats"},500)}});R.get("/",e=>e.html(`
<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prekių užsakymų valdymo sistema</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .loading {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 8px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app">
        <!-- Loading state -->
        <div id="loading" class="min-h-screen flex items-center justify-center">
            <div class="text-center">
                <div class="loading mx-auto mb-4"></div>
                <p class="text-gray-600">Kraunama...</p>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
    <script src="/static/app.js"><\/script>
</body>
</html>
  `));R.notFound(e=>e.req.url.includes("/api/")?e.json({error:"Not Found",message:"API endpoint not found"},404):R.fetch(new Request(e.req.url.replace(e.req.path,"/"))));R.onError((e,t)=>(console.error("App error:",e),t.req.url.includes("/api/")?t.json({error:"Internal Server Error",message:"An unexpected error occurred"},500):t.html(`
    <html>
      <body>
        <h1>Klaida</h1>
        <p>Įvyko nenumatyta klaida. Bandykite atnaujinti puslapį.</p>
      </body>
    </html>
  `,500)));const ut=new te,Vr=Object.assign({"/src/index.tsx":R});let Bt=!1;for(const[,e]of Object.entries(Vr))e&&(ut.route("/",e),ut.notFound(e.notFoundHandler),Bt=!0);if(!Bt)throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");export{ut as default};
