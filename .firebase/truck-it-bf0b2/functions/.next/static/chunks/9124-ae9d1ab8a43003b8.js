"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9124],{8809:function(e,t,n){n.d(t,{O:function(){return L}});var r,s,o,i=n(7294),a=n(1363),l=n(3781),u=n(9946),c=n(6723),h=n(3855);function d(e){var t;if(e.type)return e.type;let n=null!=(t=e.as)?t:"button";if("string"==typeof n&&"button"===n.toLowerCase())return"button"}var p=n(3784),f=n(4879),_=n(6045);function g({onFocus:e}){let[t,n]=(0,i.useState)(!0),r=(0,f.t)();return t?i.createElement(_._,{as:"button",type:"button",features:_.A.Focusable,onFocus:t=>{t.preventDefault();let s,o=50;s=requestAnimationFrame(function t(){if(o--<=0){s&&cancelAnimationFrame(s);return}if(e()){if(cancelAnimationFrame(s),!r.current)return;n(!1);return}s=requestAnimationFrame(t)})}}):null}var b=n(4575),m=n(2984),T=n(1021),w=n(5466),R=n(2351);let E=i.createContext(null);function v({children:e}){let t=i.useRef({groups:new Map,get(e,t){var n;let r=this.groups.get(e);r||(r=new Map,this.groups.set(e,r));let s=null!=(n=r.get(t))?n:0;return r.set(t,s+1),[Array.from(r.keys()).indexOf(t),function(){let e=r.get(t);e>1?r.set(t,e-1):r.delete(t)}]}});return i.createElement(E.Provider,{value:t},e)}function y(e){let t=i.useContext(E);if(!t)throw Error("You must wrap your component in a <StableCollection>");let n=function(){var e,t,n;let r=null!=(n=null==(t=null==(e=i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED)?void 0:e.ReactCurrentOwner)?void 0:t.current)?n:null;if(!r)return Symbol();let s=[],o=r;for(;o;)s.push(o.index),o=o.return;return"$."+s.join(".")}(),[r,s]=t.current.get(e,n);return i.useEffect(()=>s,[]),r}var A=((r=A||{})[r.Forwards=0]="Forwards",r[r.Backwards=1]="Backwards",r),x=((s=x||{})[s.Less=-1]="Less",s[s.Equal=0]="Equal",s[s.Greater=1]="Greater",s),I=((o=I||{})[o.SetSelectedIndex=0]="SetSelectedIndex",o[o.RegisterTab=1]="RegisterTab",o[o.UnregisterTab=2]="UnregisterTab",o[o.RegisterPanel=3]="RegisterPanel",o[o.UnregisterPanel=4]="UnregisterPanel",o);let O={0(e,t){var n;let r=(0,b.z2)(e.tabs,e=>e.current),s=(0,b.z2)(e.panels,e=>e.current),o=r.filter(e=>{var t;return!(null!=(t=e.current)&&t.hasAttribute("disabled"))}),i={...e,tabs:r,panels:s};if(t.index<0||t.index>r.length-1){let n=(0,m.E)(Math.sign(t.index-e.selectedIndex),{[-1]:()=>1,0:()=>(0,m.E)(Math.sign(t.index),{[-1]:()=>0,0:()=>0,1:()=>1}),1:()=>0});if(0===o.length)return i;let s=(0,m.E)(n,{0:()=>r.indexOf(o[0]),1:()=>r.indexOf(o[o.length-1])});return{...i,selectedIndex:-1===s?e.selectedIndex:s}}let a=r.slice(0,t.index),l=[...r.slice(t.index),...a].find(e=>o.includes(e));if(!l)return i;let u=null!=(n=r.indexOf(l))?n:e.selectedIndex;return -1===u&&(u=e.selectedIndex),{...i,selectedIndex:u}},1(e,t){var n;if(e.tabs.includes(t.tab))return e;let r=e.tabs[e.selectedIndex],s=(0,b.z2)([...e.tabs,t.tab],e=>e.current),o=null!=(n=s.indexOf(r))?n:e.selectedIndex;return -1===o&&(o=e.selectedIndex),{...e,tabs:s,selectedIndex:o}},2:(e,t)=>({...e,tabs:e.tabs.filter(e=>e!==t.tab)}),3:(e,t)=>e.panels.includes(t.panel)?e:{...e,panels:(0,b.z2)([...e.panels,t.panel],e=>e.current)},4:(e,t)=>({...e,panels:e.panels.filter(e=>e!==t.panel)})},k=(0,i.createContext)(null);function N(e){let t=(0,i.useContext)(k);if(null===t){let t=Error(`<${e} /> is missing a parent <Tab.Group /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(t,N),t}return t}k.displayName="TabsDataContext";let U=(0,i.createContext)(null);function C(e){let t=(0,i.useContext)(U);if(null===t){let t=Error(`<${e} /> is missing a parent <Tab.Group /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(t,C),t}return t}function P(e,t){return(0,m.E)(t.type,O,e,t)}U.displayName="TabsActionsContext";let D=i.Fragment,S=R.AN.RenderStrategy|R.AN.Static,L=Object.assign((0,R.yV)(function(e,t){var n,r;let s=(0,u.M)(),{id:o=`headlessui-tabs-tab-${s}`,...h}=e,{orientation:f,activation:_,selectedIndex:g,tabs:E,panels:v}=N("Tab"),A=C("Tab"),x=N("Tab"),I=(0,i.useRef)(null),O=(0,p.T)(I,t);(0,c.e)(()=>A.registerTab(I),[A,I]);let k=y("tabs"),U=E.indexOf(I);-1===U&&(U=k);let P=U===g,D=(0,l.z)(e=>{var t;let n=e();if(n===b.fE.Success&&"auto"===_){let e=null==(t=(0,w.r)(I))?void 0:t.activeElement,n=x.tabs.findIndex(t=>t.current===e);-1!==n&&A.change(n)}return n}),S=(0,l.z)(e=>{let t=E.map(e=>e.current).filter(Boolean);if(e.key===a.R.Space||e.key===a.R.Enter){e.preventDefault(),e.stopPropagation(),A.change(U);return}switch(e.key){case a.R.Home:case a.R.PageUp:return e.preventDefault(),e.stopPropagation(),D(()=>(0,b.jA)(t,b.TO.First));case a.R.End:case a.R.PageDown:return e.preventDefault(),e.stopPropagation(),D(()=>(0,b.jA)(t,b.TO.Last))}if(D(()=>(0,m.E)(f,{vertical:()=>e.key===a.R.ArrowUp?(0,b.jA)(t,b.TO.Previous|b.TO.WrapAround):e.key===a.R.ArrowDown?(0,b.jA)(t,b.TO.Next|b.TO.WrapAround):b.fE.Error,horizontal:()=>e.key===a.R.ArrowLeft?(0,b.jA)(t,b.TO.Previous|b.TO.WrapAround):e.key===a.R.ArrowRight?(0,b.jA)(t,b.TO.Next|b.TO.WrapAround):b.fE.Error}))===b.fE.Success)return e.preventDefault()}),L=(0,i.useRef)(!1),B=(0,l.z)(()=>{var e;L.current||(L.current=!0,null==(e=I.current)||e.focus({preventScroll:!0}),A.change(U),(0,T.Y)(()=>{L.current=!1}))}),F=(0,l.z)(e=>{e.preventDefault()}),M=(0,i.useMemo)(()=>({selected:P}),[P]),z={ref:O,onKeyDown:S,onMouseDown:F,onClick:B,id:o,role:"tab",type:function(e,t){let[n,r]=(0,i.useState)(()=>d(e));return(0,c.e)(()=>{r(d(e))},[e.type,e.as]),(0,c.e)(()=>{n||t.current&&t.current instanceof HTMLButtonElement&&!t.current.hasAttribute("type")&&r("button")},[n,t]),n}(e,I),"aria-controls":null==(r=null==(n=v[U])?void 0:n.current)?void 0:r.id,"aria-selected":P,tabIndex:P?0:-1};return(0,R.sY)({ourProps:z,theirProps:h,slot:M,defaultTag:"button",name:"Tabs.Tab"})}),{Group:(0,R.yV)(function(e,t){let{defaultIndex:n=0,vertical:r=!1,manual:s=!1,onChange:o,selectedIndex:a=null,...u}=e,d=r?"vertical":"horizontal",f=s?"manual":"auto",_=null!==a,m=(0,p.T)(t),[T,w]=(0,i.useReducer)(P,{selectedIndex:null!=a?a:n,tabs:[],panels:[]}),E=(0,i.useMemo)(()=>({selectedIndex:T.selectedIndex}),[T.selectedIndex]),y=(0,h.E)(o||(()=>{})),A=(0,h.E)(T.tabs),x=(0,i.useMemo)(()=>({orientation:d,activation:f,...T}),[d,f,T]),I=(0,l.z)(e=>(w({type:1,tab:e}),()=>w({type:2,tab:e}))),O=(0,l.z)(e=>(w({type:3,panel:e}),()=>w({type:4,panel:e}))),N=(0,l.z)(e=>{C.current!==e&&y.current(e),_||w({type:0,index:e})}),C=(0,h.E)(_?e.selectedIndex:T.selectedIndex),S=(0,i.useMemo)(()=>({registerTab:I,registerPanel:O,change:N}),[]);return(0,c.e)(()=>{w({type:0,index:null!=a?a:n})},[a]),(0,c.e)(()=>{if(void 0===C.current||T.tabs.length<=0)return;let e=(0,b.z2)(T.tabs,e=>e.current);e.some((e,t)=>T.tabs[t]!==e)&&N(e.indexOf(T.tabs[C.current]))}),i.createElement(v,null,i.createElement(U.Provider,{value:S},i.createElement(k.Provider,{value:x},x.tabs.length<=0&&i.createElement(g,{onFocus:()=>{var e,t;for(let n of A.current)if((null==(e=n.current)?void 0:e.tabIndex)===0)return null==(t=n.current)||t.focus(),!0;return!1}}),(0,R.sY)({ourProps:{ref:m},theirProps:u,slot:E,defaultTag:D,name:"Tabs"}))))}),List:(0,R.yV)(function(e,t){let{orientation:n,selectedIndex:r}=N("Tab.List"),s=(0,p.T)(t);return(0,R.sY)({ourProps:{ref:s,role:"tablist","aria-orientation":n},theirProps:e,slot:{selectedIndex:r},defaultTag:"div",name:"Tabs.List"})}),Panels:(0,R.yV)(function(e,t){let{selectedIndex:n}=N("Tab.Panels"),r=(0,p.T)(t),s=(0,i.useMemo)(()=>({selectedIndex:n}),[n]);return(0,R.sY)({ourProps:{ref:r},theirProps:e,slot:s,defaultTag:"div",name:"Tabs.Panels"})}),Panel:(0,R.yV)(function(e,t){var n,r,s,o;let a=(0,u.M)(),{id:l=`headlessui-tabs-panel-${a}`,tabIndex:h=0,...d}=e,{selectedIndex:f,tabs:g,panels:b}=N("Tab.Panel"),m=C("Tab.Panel"),T=(0,i.useRef)(null),w=(0,p.T)(T,t);(0,c.e)(()=>m.registerPanel(T),[m,T]);let E=y("panels"),v=b.indexOf(T);-1===v&&(v=E);let A=v===f,x=(0,i.useMemo)(()=>({selected:A}),[A]),I={ref:w,id:l,role:"tabpanel","aria-labelledby":null==(r=null==(n=g[v])?void 0:n.current)?void 0:r.id,tabIndex:A?h:-1};return A||null!=(s=d.unmount)&&!s||null!=(o=d.static)&&o?(0,R.sY)({ourProps:I,theirProps:d,slot:x,defaultTag:"div",features:S,visible:A,name:"Tabs.Panel"}):i.createElement(_._,{as:"span","aria-hidden":"true",...I})})})},6650:function(e,t,n){n.d(t,{Jt:function(){return en},cF:function(){return es},iH:function(){return er},KV:function(){return et}});var r,s,o,i,a=n(2238),l=n(4444),u=n(8463);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let c="firebasestorage.googleapis.com",h="storageBucket";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d extends l.ZR{constructor(e,t,n=0){super(p(e),`Firebase Storage: ${t} (${p(e)})`),this.status_=n,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,d.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return p(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}function p(e){return"storage/"+e}function f(){return new d(o.UNKNOWN,"An unknown error occurred, please check the error payload for server response.")}function _(e){return new d(o.INVALID_ARGUMENT,e)}function g(){return new d(o.APP_DELETED,"The Firebase app was deleted.")}function b(e,t){return new d(o.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function m(e){throw new d(o.INTERNAL_ERROR,"Internal error: "+e)}(r=o||(o={})).UNKNOWN="unknown",r.OBJECT_NOT_FOUND="object-not-found",r.BUCKET_NOT_FOUND="bucket-not-found",r.PROJECT_NOT_FOUND="project-not-found",r.QUOTA_EXCEEDED="quota-exceeded",r.UNAUTHENTICATED="unauthenticated",r.UNAUTHORIZED="unauthorized",r.UNAUTHORIZED_APP="unauthorized-app",r.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",r.INVALID_CHECKSUM="invalid-checksum",r.CANCELED="canceled",r.INVALID_EVENT_NAME="invalid-event-name",r.INVALID_URL="invalid-url",r.INVALID_DEFAULT_BUCKET="invalid-default-bucket",r.NO_DEFAULT_BUCKET="no-default-bucket",r.CANNOT_SLICE_BLOB="cannot-slice-blob",r.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",r.NO_DOWNLOAD_URL="no-download-url",r.INVALID_ARGUMENT="invalid-argument",r.INVALID_ARGUMENT_COUNT="invalid-argument-count",r.APP_DELETED="app-deleted",r.INVALID_ROOT_OPERATION="invalid-root-operation",r.INVALID_FORMAT="invalid-format",r.INTERNAL_ERROR="internal-error",r.UNSUPPORTED_ENVIRONMENT="unsupported-environment";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class T{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return 0===this.path.length}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let n;try{n=T.makeFromUrl(e,t)}catch(t){return new T(e,"")}if(""===n.path)return n;throw new d(o.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}static makeFromUrl(e,t){let n=null,r="([A-Za-z0-9.\\-_]+)",s=RegExp("^gs://"+r+"(/(.*))?$","i");function i(e){e.path_=decodeURIComponent(e.path)}let a=t.replace(/[.]/g,"\\."),l=[{regex:s,indices:{bucket:1,path:3},postModify:function(e){"/"===e.path.charAt(e.path.length-1)&&(e.path_=e.path_.slice(0,-1))}},{regex:RegExp(`^https?://${a}/v[A-Za-z0-9_]+/b/${r}/o(/([^?#]*).*)?$`,"i"),indices:{bucket:1,path:3},postModify:i},{regex:RegExp(`^https?://${t===c?"(?:storage.googleapis.com|storage.cloud.google.com)":t}/${r}/([^?#]*)`,"i"),indices:{bucket:1,path:2},postModify:i}];for(let t=0;t<l.length;t++){let r=l[t],s=r.regex.exec(e);if(s){let e=s[r.indices.bucket],t=s[r.indices.path];t||(t=""),n=new T(e,t),r.postModify(n);break}}if(null==n)throw new d(o.INVALID_URL,"Invalid URL '"+e+"'.");return n}}class w{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}function R(e){return"string"==typeof e||e instanceof String}function E(e){return v()&&e instanceof Blob}function v(){return"undefined"!=typeof Blob}function y(e,t,n,r){if(r<t)throw _(`Invalid value for '${e}'. Expected ${t} or greater.`);if(r>n)throw _(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function A(e,t,n){let r=t;return null==n&&(r=`https://${t}`),`${n}://${r}/v0${e}`}function x(e){let t=encodeURIComponent,n="?";for(let r in e)e.hasOwnProperty(r)&&(n=n+(t(r)+"=")+t(e[r])+"&");return n.slice(0,-1)}(s=i||(i={}))[s.NO_ERROR=0]="NO_ERROR",s[s.NETWORK_ERROR=1]="NETWORK_ERROR",s[s.ABORT=2]="ABORT";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I{constructor(e,t,n,r,s,o,i,a,l,u,c,h=!0){this.url_=e,this.method_=t,this.headers_=n,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=o,this.callback_=i,this.errorCallback_=a,this.timeout_=l,this.progressCallback_=u,this.connectionFactory_=c,this.retry=h,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((e,t)=>{this.resolve_=e,this.reject_=t,this.start_()})}start_(){let e=(e,t)=>{let n=this.resolve_,r=this.reject_,s=t.connection;if(t.wasSuccessCode)try{let e=this.callback_(s,s.getResponse());void 0!==e?n(e):n()}catch(e){r(e)}else if(null!==s){let e=f();e.serverResponse=s.getErrorText(),r(this.errorCallback_?this.errorCallback_(s,e):e)}else r(t.canceled?this.appDelete_?g():new d(o.CANCELED,"User canceled the upload/download."):new d(o.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again."))};this.canceled_?e(!1,new O(!1,null,!0)):this.backoffId_=/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e,t,n){let r=1,s=null,o=null,i=!1,a=0,l=!1;function u(...e){l||(l=!0,t.apply(null,e))}function c(t){s=setTimeout(()=>{s=null,e(d,2===a)},t)}function h(){o&&clearTimeout(o)}function d(e,...t){let n;if(l){h();return}if(e||2===a||i){h(),u.call(null,e,...t);return}r<64&&(r*=2),1===a?(a=2,n=0):n=(r+Math.random())*1e3,c(n)}let p=!1;function f(e){!p&&(p=!0,h(),!l&&(null!==s?(e||(a=2),clearTimeout(s),c(0)):e||(a=1)))}return c(0),o=setTimeout(()=>{i=!0,f(!0)},n),f}((e,t)=>{if(t){e(!1,new O(!1,null,!0));return}let n=this.connectionFactory_();this.pendingConnection_=n;let r=e=>{let t=e.loaded,n=e.lengthComputable?e.total:-1;null!==this.progressCallback_&&this.progressCallback_(t,n)};null!==this.progressCallback_&&n.addUploadProgressListener(r),n.send(this.url_,this.method_,this.body_,this.headers_).then(()=>{null!==this.progressCallback_&&n.removeUploadProgressListener(r),this.pendingConnection_=null;let t=n.getErrorCode()===i.NO_ERROR,s=n.getStatus();if(!t||/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e,t){let n=e>=500&&e<600,r=-1!==[408,429].indexOf(e),s=-1!==t.indexOf(e);return n||r||s}(s,this.additionalRetryCodes_)&&this.retry){e(!1,new O(!1,null,n.getErrorCode()===i.ABORT));return}e(!0,new O(-1!==this.successCodes_.indexOf(s),n))})},e,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,null!==this.backoffId_&&(0,this.backoffId_)(!1),null!==this.pendingConnection_&&this.pendingConnection_.abort()}}class O{constructor(e,t,n){this.wasSuccessCode=e,this.connection=t,this.canceled=!!n}}function k(...e){let t="undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof WebKitBlobBuilder?WebKitBlobBuilder:void 0;if(void 0!==t){let n=new t;for(let t=0;t<e.length;t++)n.append(e[t]);return n.getBlob()}if(v())return new Blob(e);throw new d(o.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let N={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class U{constructor(e,t){this.data=e,this.contentType=t||null}}function C(e){let t=[];for(let n=0;n<e.length;n++){let r=e.charCodeAt(n);r<=127?t.push(r):r<=2047?t.push(192|r>>6,128|63&r):(64512&r)==55296?n<e.length-1&&(64512&e.charCodeAt(n+1))==56320?(r=65536|(1023&r)<<10|1023&e.charCodeAt(++n),t.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|63&r)):t.push(239,191,189):(64512&r)==56320?t.push(239,191,189):t.push(224|r>>12,128|r>>6&63,128|63&r)}return new Uint8Array(t)}function P(e,t){let n;switch(e){case N.BASE64:{let n=-1!==t.indexOf("-"),r=-1!==t.indexOf("_");if(n||r)throw b(e,"Invalid character '"+(n?"-":"_")+"' found: is it base64url encoded?");break}case N.BASE64URL:{let n=-1!==t.indexOf("+"),r=-1!==t.indexOf("/");if(n||r)throw b(e,"Invalid character '"+(n?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/")}}try{n=/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){if("undefined"==typeof atob)throw new d(o.UNSUPPORTED_ENVIRONMENT,"base-64 is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.");return atob(e)}(t)}catch(t){if(t.message.includes("polyfill"))throw t;throw b(e,"Invalid character found")}let r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}class D{constructor(e){var t;this.base64=!1,this.contentType=null;let n=e.match(/^data:([^,]+)?,/);if(null===n)throw b(N.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");let r=n[1]||null;null!=r&&(this.base64=(t=";base64",r.length>=t.length&&r.substring(r.length-t.length)===t),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S{constructor(e,t){let n=0,r="";E(e)?(this.data_=e,n=e.size,r=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),n=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),n=e.length),this.size_=n,this.type_=r}size(){return this.size_}type(){return this.type_}slice(e,t){if(!E(this.data_))return new S(new Uint8Array(this.data_.buffer,e,t-e),!0);{var n;let r=(n=this.data_).webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null;return null===r?null:new S(r)}}static getBlob(...e){if(v()){let t=e.map(e=>e instanceof S?e.data_:e);return new S(k.apply(null,t))}{let t=e.map(e=>R(e)?function(e,t){switch(e){case N.RAW:return new U(C(t));case N.BASE64:case N.BASE64URL:return new U(P(e,t));case N.DATA_URL:return new U(function(e){let t=new D(e);return t.base64?P(N.BASE64,t.rest):function(e){let t;try{t=decodeURIComponent(e)}catch(e){throw b(N.DATA_URL,"Malformed data URL.")}return C(t)}(t.rest)}(t),new D(t).contentType)}throw f()}(N.RAW,e).data:e.data_),n=0;t.forEach(e=>{n+=e.byteLength});let r=new Uint8Array(n),s=0;return t.forEach(e=>{for(let t=0;t<e.length;t++)r[s++]=e[t]}),new S(r,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L(e){var t;let n;try{n=JSON.parse(e)}catch(e){return null}return"object"!=typeof(t=n)||Array.isArray(t)?null:n}function B(e){let t=e.lastIndexOf("/",e.length-2);return -1===t?e:e.slice(t+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F(e,t){return t}class M{constructor(e,t,n,r){this.server=e,this.local=t||e,this.writable=!!n,this.xform=r||F}}let z=null;function V(){if(z)return z;let e=[];e.push(new M("bucket")),e.push(new M("generation")),e.push(new M("metageneration")),e.push(new M("name","fullPath",!0));let t=new M("name");t.xform=function(e,t){return!R(t)||t.length<2?t:B(t)},e.push(t);let n=new M("size");return n.xform=function(e,t){return void 0!==t?Number(t):t},e.push(n),e.push(new M("timeCreated")),e.push(new M("updated")),e.push(new M("md5Hash",null,!0)),e.push(new M("cacheControl",null,!0)),e.push(new M("contentDisposition",null,!0)),e.push(new M("contentEncoding",null,!0)),e.push(new M("contentLanguage",null,!0)),e.push(new M("contentType",null,!0)),e.push(new M("metadata","customMetadata",!0)),z=e}function j(e,t,n){let r=L(t);return null===r?null:function(e,t,n){let r={};r.type="file";let s=n.length;for(let e=0;e<s;e++){let s=n[e];r[s.local]=s.xform(r,t[s.server])}return Object.defineProperty(r,"ref",{get:function(){let t=new T(r.bucket,r.fullPath);return e._makeStorageReference(t)}}),r}(e,r,n)}class ${constructor(e,t,n,r){this.url=e,this.method=t,this.handler=n,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q(e){if(!e)throw f()}function W(e){return function(t,n){var r,s;let i;return 401===t.getStatus()?i=t.getErrorText().includes("Firebase App Check token is invalid")?new d(o.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project."):new d(o.UNAUTHENTICATED,"User is not authenticated, please authenticate using Firebase Authentication and try again."):402===t.getStatus()?(r=e.bucket,i=new d(o.QUOTA_EXCEEDED,"Quota for bucket '"+r+"' exceeded, please view quota on https://firebase.google.com/pricing/.")):403===t.getStatus()?(s=e.path,i=new d(o.UNAUTHORIZED,"User does not have permission to access '"+s+"'.")):i=n,i.status=t.getStatus(),i.serverResponse=n.serverResponse,i}}class H{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=i.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=i.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=i.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,n,r){if(this.sent_)throw m("cannot .send() more than once");if(this.sent_=!0,this.xhr_.open(t,e,!0),void 0!==r)for(let e in r)r.hasOwnProperty(e)&&this.xhr_.setRequestHeader(e,r[e].toString());return void 0!==n?this.xhr_.send(n):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw m("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw m("cannot .getStatus() before sending");try{return this.xhr_.status}catch(e){return -1}}getResponse(){if(!this.sent_)throw m("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw m("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){null!=this.xhr_.upload&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){null!=this.xhr_.upload&&this.xhr_.upload.removeEventListener("progress",e)}}class K extends H{initXhr(){this.xhr_.responseType="text"}}function X(){return new K}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{constructor(e,t){this._service=e,t instanceof T?this._location=t:this._location=T.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new G(e,t)}get root(){let e=new T(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return B(this._location.path)}get storage(){return this._service}get parent(){let e=/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){if(0===e.length)return null;let t=e.lastIndexOf("/");return -1===t?"":e.slice(0,t)}(this._location.path);if(null===e)return null;let t=new T(this._location.bucket,e);return new G(this._service,t)}_throwIfRoot(e){if(""===this._location.path)throw new d(o.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}}function Y(e,t){let n=null==t?void 0:t[h];return null==n?null:T.makeFromBucketSpec(n,e)}class Z{constructor(e,t,n,r,s){this.app=e,this._authProvider=t,this._appCheckProvider=n,this._url=r,this._firebaseVersion=s,this._bucket=null,this._host=c,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=12e4,this._maxUploadRetryTime=6e5,this._requests=new Set,null!=r?this._bucket=T.makeFromBucketSpec(r,this._host):this._bucket=Y(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,null!=this._url?this._bucket=T.makeFromBucketSpec(this._url,e):this._bucket=Y(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){y("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){y("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let t=await e.getToken();if(null!==t)return t.accessToken}return null}async _getAppCheckToken(){let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new G(this,e)}_makeRequest(e,t,n,r,s=!0){if(this._deleted)return new w(g());{let o=function(e,t,n,r,s,o,i=!0){let a=x(e.urlParams),l=e.url+a,u=Object.assign({},e.headers);return t&&(u["X-Firebase-GMPID"]=t),null!==n&&n.length>0&&(u.Authorization="Firebase "+n),u["X-Firebase-Storage-Version"]="webjs/"+(null!=o?o:"AppManager"),null!==r&&(u["X-Firebase-AppCheck"]=r),new I(l,e.method,u,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,s,i)}(e,this._appId,n,r,t,this._firebaseVersion,s);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){let[n,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,n,r).getPromise()}}let J="@firebase/storage",Q="0.12.2",ee="storage";function et(e,t,n){return function(e,t,n){e._throwIfRoot("uploadBytes");let r=function(e,t,n,r,s){let i=t.bucketOnlyServerUrl(),a={"X-Goog-Upload-Protocol":"multipart"},l=function(){let e="";for(let t=0;t<2;t++)e+=Math.random().toString().slice(2);return e}();a["Content-Type"]="multipart/related; boundary="+l;let u=function(e,t,n){let r=Object.assign({},n);return r.fullPath=e.path,r.size=t.size(),!r.contentType&&(r.contentType=t&&t.type()||"application/octet-stream"),r}(t,r,s),c="--"+l+"\r\nContent-Type: application/json; charset=utf-8\r\n\r\n"+function(e,t){let n={},r=t.length;for(let s=0;s<r;s++){let r=t[s];r.writable&&(n[r.server]=e[r.local])}return JSON.stringify(n)}(u,n)+"\r\n--"+l+"\r\nContent-Type: "+u.contentType+"\r\n\r\n",h=S.getBlob(c,r,"\r\n--"+l+"--");if(null===h)throw new d(o.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.");let p={name:u.fullPath},f=new $(A(i,e.host,e._protocol),"POST",function(t,r){let s=j(e,r,n);return q(null!==s),s},e.maxUploadRetryTime);return f.urlParams=p,f.headers=a,f.body=h.uploadData(),f.errorHandler=W(t),f}(e.storage,e._location,V(),new S(t,!0),n);return e.storage.makeRequestWithTokens(r,X).then(t=>({metadata:t,ref:e}))}(e=(0,l.m9)(e),t,n)}function en(e){return function(e){e._throwIfRoot("getDownloadURL");let t=function(e,t,n){let r=new $(A(t.fullServerUrl(),e.host,e._protocol),"GET",function(t,r){let s=j(e,r,n);return q(null!==s),function(e,t,n,r){let s=L(t);if(null===s||!R(s.downloadTokens))return null;let o=s.downloadTokens;if(0===o.length)return null;let i=encodeURIComponent;return o.split(",").map(t=>{let s=e.bucket,o=e.fullPath;return A("/b/"+i(s)+"/o/"+i(o),n,r)+x({alt:"media",token:t})})[0]}(s,r,e.host,e._protocol)},e.maxOperationRetryTime);return r.errorHandler=function(e){let t=W(e);return function(n,r){let s=t(n,r);if(404===n.getStatus()){var i;i=e.path,s=new d(o.OBJECT_NOT_FOUND,"Object '"+i+"' does not exist.")}return s.serverResponse=r.serverResponse,s}}(t),r}(e.storage,e._location,V());return e.storage.makeRequestWithTokens(t,X).then(e=>{if(null===e)throw new d(o.NO_DOWNLOAD_URL,"The given file does not have any download URLs.");return e})}(e=(0,l.m9)(e))}function er(e,t){return function(e,t){if(!(t&&/^[A-Za-z]+:\/\//.test(t)))return function e(t,n){if(t instanceof Z){if(null==t._bucket)throw new d(o.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+h+"' property when initializing the app?");let r=new G(t,t._bucket);return null!=n?e(r,n):r}return void 0!==n?function(e,t){let n=function(e,t){let n=t.split("/").filter(e=>e.length>0).join("/");return 0===e.length?n:e+"/"+n}(e._location.path,t),r=new T(e._location.bucket,n);return new G(e.storage,r)}(t,n):t}(e,t);if(e instanceof Z)return new G(e,t);throw _("To use ref(service, url), the first argument must be a Storage instance.")}(e=(0,l.m9)(e),t)}function es(e=(0,a.Mq)(),t){e=(0,l.m9)(e);let n=(0,a.qX)(e,ee).getImmediate({identifier:t}),r=(0,l.P0)("storage");return r&&function(e,t,n,r={}){!function(e,t,n,r={}){e.host=`${t}:${n}`,e._protocol="http";let{mockUserToken:s}=r;s&&(e._overrideAuthToken="string"==typeof s?s:(0,l.Sg)(s,e.app.options.projectId))}(e,t,n,r)}(n,...r),n}(0,a.Xd)(new u.wA(ee,function(e,{instanceIdentifier:t}){return new Z(e.getProvider("app").getImmediate(),e.getProvider("auth-internal"),e.getProvider("app-check-internal"),t,a.Jn)},"PUBLIC").setMultipleInstances(!0)),(0,a.KN)(J,Q,""),(0,a.KN)(J,Q,"esm2017")}}]);