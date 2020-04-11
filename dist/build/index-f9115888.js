import{N as t,O as n,P as e}from"./main-55bc5519.js";function a(t){const n=t-1;return n*n*n+1}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */function r(t,{delay:n=0,duration:a=400,easing:r=e}){const o=+getComputedStyle(t).opacity;return{delay:n,duration:a,easing:r,css:t=>"opacity: "+t*o}}function o(t,{delay:n=0,duration:e=400,easing:r=a,x:o=0,y:s=0,opacity:i=0}){const c=getComputedStyle(t),l=+c.opacity,y="none"===c.transform?"":c.transform,p=l*(1-i);return{delay:n,duration:e,easing:r,css:(t,n)=>`\n\t\t\ttransform: ${y} translate(${(1-t)*o}px, ${(1-t)*s}px);\n\t\t\topacity: ${l-p*n}`}}function s(t,{delay:n=0,duration:e=400,easing:r=a,start:o=0,opacity:s=0}){const i=getComputedStyle(t),c=+i.opacity,l="none"===i.transform?"":i.transform,y=1-o,p=c*(1-s);return{delay:n,duration:e,easing:r,css:(t,n)=>`\n\t\t\ttransform: ${l} scale(${1-y*n});\n\t\t\topacity: ${c-p*n}\n\t\t`}}function i(e){var{fallback:r}=e,o=function(t,n){var e={};for(var a in t)Object.prototype.hasOwnProperty.call(t,a)&&n.indexOf(a)<0&&(e[a]=t[a]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(a=Object.getOwnPropertySymbols(t);r<a.length;r++)n.indexOf(a[r])<0&&Object.prototype.propertyIsEnumerable.call(t,a[r])&&(e[a[r]]=t[a[r]])}return e}(e,["fallback"]);const s=new Map,i=new Map;function c(e,s,i){return(c,l)=>(e.set(l.key,{rect:c.getBoundingClientRect()}),()=>{if(s.has(l.key)){const{rect:e}=s.get(l.key);return s.delete(l.key),function(e,r,s){const{delay:i=0,duration:c=(t=>30*Math.sqrt(t)),easing:l=a}=n(n({},o),s),y=r.getBoundingClientRect(),p=e.left-y.left,u=e.top-y.top,f=e.width/y.width,d=e.height/y.height,g=Math.sqrt(p*p+u*u),m=getComputedStyle(r),$="none"===m.transform?"":m.transform,h=+m.opacity;return{delay:i,duration:t(c)?c(g):c,easing:l,css:(t,n)=>`\n\t\t\t\topacity: ${t*h};\n\t\t\t\ttransform-origin: top left;\n\t\t\t\ttransform: ${$} translate(${n*p}px,${n*u}px) scale(${t+(1-t)*f}, ${t+(1-t)*d});\n\t\t\t`}}(e,c,l)}return e.delete(l.key),r&&r(c,l,i)})}return[c(i,s,!1),c(s,i,!0)]}export{o as a,i as c,r as f,s};
//# sourceMappingURL=index-f9115888.js.map
