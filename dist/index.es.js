function e(e,t){return function(e,t){return Object.keys(e.dataset).filter(e=>0===e.indexOf(t))}(e,t).length>0}function t(e){return e.charAt(0).toUpperCase()+e.slice(1)}function r(e){try{return JSON.parse(e)}catch(e){}return e}function o({prefix:e,scope:t,views:r}){Object.keys(r).forEach(o=>{const n=`data-${e}-${s=o,s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`;var s;let c=Array.prototype.slice.call(t.querySelectorAll(`[${n}]`));t.hasAttribute(n)&&(c=[t].concat(c)),c.forEach(t=>{a(t,e,r,o)})})}function a(e,o,a,n){if(e._defoUpdate&&e._defoUpdate[n])return;const s=a[n],c=function(e,r){return`${o=e,o.replace(/^[_.\- ]+/,"").toLowerCase().replace(/[_.\- ]+(\w|$)/g,(e,t)=>t.toUpperCase()).replace(/\d+(\w|$)/g,e=>e.toUpperCase())}${t(r)}`;var o}(o,n);if(!s||!(c in e.dataset))return;const i=s(e,r(e.dataset[c]));e._defoUpdate=e._defoUpdate||{},e._defoDestroy=e._defoDestroy||{},e._defoUpdate[n]=function(e){return function(t,o){t=t?r(t):t,o=o?r(o):o,Promise.resolve(e).then(e=>{e.update&&e.update(t,o)})}}(i),e._defoDestroy[n]=function(e,t,r){return function(){Promise.resolve(e).then(e=>{e.destroy&&(e.destroy(),delete t._defoUpdate[r],delete t._defoDestroy[r])})}}(i,e,n)}function n({prefix:r,scope:n,views:s}){const c=new MutationObserver(n=>{n.forEach(n=>{const c=n.target;if("attributes"===n.type&&function(e,t){return 0===e.indexOf(`data-${t}-`)}(n.attributeName,r)){const e=n.attributeName.split("-").slice(2).map((e,r)=>r>0?t(e):e).join("");c.hasAttribute(n.attributeName)?null!==n.oldValue?c._defoUpdate[e](c.getAttribute(n.attributeName),n.oldValue):a(c,r,s,e):c._defoDestroy[e]()}else"childList"===n.type&&(Array.prototype.slice.call(n.removedNodes).filter(e=>e.nodeType===e.ELEMENT_NODE).filter(t=>e(t,r)).forEach(e=>{Object.keys(e._defoDestroy).forEach(t=>{e._defoDestroy[t]()})}),Array.prototype.slice.call(n.addedNodes).filter(e=>e.nodeType===e.ELEMENT_NODE).forEach(e=>{Promise.resolve(e).then(e=>{o({prefix:r,scope:e,views:s})})}))})});return c.observe(n,{attributes:!0,attributeOldValue:!0,childList:!0,characterData:!1,subtree:!0}),o({prefix:r,scope:n,views:s}),c}export default function({prefix:e="defo",scope:t=document.documentElement,views:r={}}={}){const o=n({prefix:e,scope:t,views:r});return{destroy:()=>{o.disconnect()}}}
