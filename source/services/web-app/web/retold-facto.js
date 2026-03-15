"use strict";(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else{var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else{g=this;}g.retoldFacto=f();}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a;}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r);},p,p.exports,r,e,n,t);}return n[i].exports;}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o;}return r;}()({1:[function(require,module,exports){module.exports={"name":"fable-serviceproviderbase","version":"3.0.19","description":"Simple base classes for fable services.","main":"source/Fable-ServiceProviderBase.js","scripts":{"start":"node source/Fable-ServiceProviderBase.js","test":"npx quack test","tests":"npx quack test -g","coverage":"npx quack coverage","build":"npx quack build","types":"tsc -p ./tsconfig.build.json","check":"tsc -p . --noEmit"},"types":"types/source/Fable-ServiceProviderBase.d.ts","mocha":{"diff":true,"extension":["js"],"package":"./package.json","reporter":"spec","slow":"75","timeout":"5000","ui":"tdd","watch-files":["source/**/*.js","test/**/*.js"],"watch-ignore":["lib/vendor"]},"repository":{"type":"git","url":"https://github.com/stevenvelozo/fable-serviceproviderbase.git"},"keywords":["entity","behavior"],"author":"Steven Velozo <steven@velozo.com> (http://velozo.com/)","license":"MIT","bugs":{"url":"https://github.com/stevenvelozo/fable-serviceproviderbase/issues"},"homepage":"https://github.com/stevenvelozo/fable-serviceproviderbase","devDependencies":{"@types/mocha":"^10.0.10","fable":"^3.1.62","quackage":"^1.0.58","typescript":"^5.9.3"}};},{}],2:[function(require,module,exports){/**
* Fable Service Base
* @author <steven@velozo.com>
*/const libPackage=require('../package.json');class FableServiceProviderBase{/**
	 * The constructor can be used in two ways:
	 * 1) With a fable, options object and service hash (the options object and service hash are optional)a
	 * 2) With an object or nothing as the first parameter, where it will be treated as the options object
	 *
	 * @param {import('fable')|Record<string, any>} [pFable] - (optional) The fable instance, or the options object if there is no fable
	 * @param {Record<string, any>|string} [pOptions] - (optional) The options object, or the service hash if there is no fable
	 * @param {string} [pServiceHash] - (optional) The service hash to identify this service instance
	 */constructor(pFable,pOptions,pServiceHash){/** @type {import('fable')} */this.fable;/** @type {string} */this.UUID;/** @type {Record<string, any>} */this.options;/** @type {Record<string, any>} */this.services;/** @type {Record<string, any>} */this.servicesMap;// Check if a fable was passed in; connect it if so
if(typeof pFable==='object'&&pFable.isFable){this.connectFable(pFable);}else{this.fable=false;}// Initialize the services map if it wasn't passed in
/** @type {Record<string, any>} */this._PackageFableServiceProvider=libPackage;// initialize options and UUID based on whether the fable was passed in or not.
if(this.fable){this.UUID=pFable.getUUID();this.options=typeof pOptions==='object'?pOptions:{};}else{// With no fable, check to see if there was an object passed into either of the first two
// Parameters, and if so, treat it as the options object
this.options=typeof pFable==='object'&&!pFable.isFable?pFable:typeof pOptions==='object'?pOptions:{};this.UUID=`CORE-SVC-${Math.floor(Math.random()*(99999-10000)+10000)}`;}// It's expected that the deriving class will set this
this.serviceType=`Unknown-${this.UUID}`;// The service hash is used to identify the specific instantiation of the service in the services map
this.Hash=typeof pServiceHash==='string'?pServiceHash:!this.fable&&typeof pOptions==='string'?pOptions:`${this.UUID}`;}/**
	 * @param {import('fable')} pFable
	 */connectFable(pFable){if(typeof pFable!=='object'||!pFable.isFable){let tmpErrorMessage=`Fable Service Provider Base: Cannot connect to Fable, invalid Fable object passed in.  The pFable parameter was a [${typeof pFable}].}`;console.log(tmpErrorMessage);return new Error(tmpErrorMessage);}if(!this.fable){this.fable=pFable;}if(!this.log){this.log=this.fable.Logging;}if(!this.services){this.services=this.fable.services;}if(!this.servicesMap){this.servicesMap=this.fable.servicesMap;}return true;}static isFableService=true;}module.exports=FableServiceProviderBase;// This is left here in case we want to go back to having different code/base class for "core" services
module.exports.CoreServiceProviderBase=FableServiceProviderBase;},{"../package.json":1}],3:[function(require,module,exports){!function(t,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define("Navigo",[],n):"object"==typeof exports?exports.Navigo=n():t.Navigo=n();}("undefined"!=typeof self?self:this,function(){return function(){"use strict";var t={407:function(t,n,e){e.d(n,{default:function(){return N;}});var o=/([:*])(\w+)/g,r=/\*/g,i=/\/\?/g;function a(t){return void 0===t&&(t="/"),v()?location.pathname+location.search+location.hash:t;}function s(t){return t.replace(/\/+$/,"").replace(/^\/+/,"");}function c(t){return"string"==typeof t;}function u(t){return t&&t.indexOf("#")>=0&&t.split("#").pop()||"";}function h(t){var n=s(t).split(/\?(.*)?$/);return[s(n[0]),n.slice(1).join("")];}function f(t){for(var n={},e=t.split("&"),o=0;o<e.length;o++){var r=e[o].split("=");if(""!==r[0]){var i=decodeURIComponent(r[0]);n[i]?(Array.isArray(n[i])||(n[i]=[n[i]]),n[i].push(decodeURIComponent(r[1]||""))):n[i]=decodeURIComponent(r[1]||"");}}return n;}function l(t,n){var e,a=h(s(t.currentLocationPath)),l=a[0],p=a[1],d=""===p?null:f(p),v=[];if(c(n.path)){if(e="(?:/^|^)"+s(n.path).replace(o,function(t,n,e){return v.push(e),"([^/]+)";}).replace(r,"?(?:.*)").replace(i,"/?([^/]+|)")+"$",""===s(n.path)&&""===s(l))return{url:l,queryString:p,hashString:u(t.to),route:n,data:null,params:d};}else e=n.path;var g=new RegExp(e,""),m=l.match(g);if(m){var y=c(n.path)?function(t,n){return 0===n.length?null:t?t.slice(1,t.length).reduce(function(t,e,o){return null===t&&(t={}),t[n[o]]=decodeURIComponent(e),t;},null):null;}(m,v):m.groups?m.groups:m.slice(1);return{url:s(l.replace(new RegExp("^"+t.instance.root),"")),queryString:p,hashString:u(t.to),route:n,data:y,params:d};}return!1;}function p(){return!("undefined"==typeof window||!window.history||!window.history.pushState);}function d(t,n){return void 0===t[n]||!0===t[n];}function v(){return"undefined"!=typeof window;}function g(t,n){return void 0===t&&(t=[]),void 0===n&&(n={}),t.filter(function(t){return t;}).forEach(function(t){["before","after","already","leave"].forEach(function(e){t[e]&&(n[e]||(n[e]=[]),n[e].push(t[e]));});}),n;}function m(t,n,e){var o=n||{},r=0;!function n(){t[r]?Array.isArray(t[r])?(t.splice.apply(t,[r,1].concat(t[r][0](o)?t[r][1]:t[r][2])),n()):t[r](o,function(t){void 0===t||!0===t?(r+=1,n()):e&&e(o);}):e&&e(o);}();}function y(t,n){void 0===t.currentLocationPath&&(t.currentLocationPath=t.to=a(t.instance.root)),t.currentLocationPath=t.instance._checkForAHash(t.currentLocationPath),n();}function _(t,n){for(var e=0;e<t.instance.routes.length;e++){var o=l(t,t.instance.routes[e]);if(o&&(t.matches||(t.matches=[]),t.matches.push(o),"ONE"===t.resolveOptions.strategy))return void n();}n();}function k(t,n){t.navigateOptions&&(void 0!==t.navigateOptions.shouldResolve&&console.warn('"shouldResolve" is deprecated. Please check the documentation.'),void 0!==t.navigateOptions.silent&&console.warn('"silent" is deprecated. Please check the documentation.')),n();}function O(t,n){!0===t.navigateOptions.force?(t.instance._setCurrent([t.instance._pathToMatchObject(t.to)]),n(!1)):n();}m.if=function(t,n,e){return Array.isArray(n)||(n=[n]),Array.isArray(e)||(e=[e]),[t,n,e];};var w=v(),L=p();function b(t,n){if(d(t.navigateOptions,"updateBrowserURL")){var e=("/"+t.to).replace(/\/\//g,"/"),o=w&&t.resolveOptions&&!0===t.resolveOptions.hash;L?(history[t.navigateOptions.historyAPIMethod||"pushState"](t.navigateOptions.stateObj||{},t.navigateOptions.title||"",o?"#"+e:e),location&&location.hash&&(t.instance.__freezeListening=!0,setTimeout(function(){if(!o){var n=location.hash;location.hash="",location.hash=n;}t.instance.__freezeListening=!1;},1))):w&&(window.location.href=t.to);}n();}function A(t,n){var e=t.instance;e.lastResolved()?m(e.lastResolved().map(function(n){return function(e,o){if(n.route.hooks&&n.route.hooks.leave){var r=!1,i=t.instance.matchLocation(n.route.path,t.currentLocationPath,!1);r="*"!==n.route.path?!i:!(t.matches&&t.matches.find(function(t){return n.route.path===t.route.path;})),d(t.navigateOptions,"callHooks")&&r?m(n.route.hooks.leave.map(function(n){return function(e,o){return n(function(n){!1===n?t.instance.__markAsClean(t):o();},t.matches&&t.matches.length>0?1===t.matches.length?t.matches[0]:t.matches:void 0);};}).concat([function(){return o();}])):o();}else o();};}),{},function(){return n();}):n();}function P(t,n){d(t.navigateOptions,"updateState")&&t.instance._setCurrent(t.matches),n();}var R=[function(t,n){var e=t.instance.lastResolved();if(e&&e[0]&&e[0].route===t.match.route&&e[0].url===t.match.url&&e[0].queryString===t.match.queryString)return e.forEach(function(n){n.route.hooks&&n.route.hooks.already&&d(t.navigateOptions,"callHooks")&&n.route.hooks.already.forEach(function(n){return n(t.match);});}),void n(!1);n();},function(t,n){t.match.route.hooks&&t.match.route.hooks.before&&d(t.navigateOptions,"callHooks")?m(t.match.route.hooks.before.map(function(n){return function(e,o){return n(function(n){!1===n?t.instance.__markAsClean(t):o();},t.match);};}).concat([function(){return n();}])):n();},function(t,n){d(t.navigateOptions,"callHandler")&&t.match.route.handler(t.match),t.instance.updatePageLinks(),n();},function(t,n){t.match.route.hooks&&t.match.route.hooks.after&&d(t.navigateOptions,"callHooks")&&t.match.route.hooks.after.forEach(function(n){return n(t.match);}),n();}],S=[A,function(t,n){var e=t.instance._notFoundRoute;if(e){t.notFoundHandled=!0;var o=h(t.currentLocationPath),r=o[0],i=o[1],a=u(t.to);e.path=s(r);var c={url:e.path,queryString:i,hashString:a,data:null,route:e,params:""!==i?f(i):null};t.matches=[c],t.match=c;}n();},m.if(function(t){return t.notFoundHandled;},R.concat([P]),[function(t,n){t.resolveOptions&&!1!==t.resolveOptions.noMatchWarning&&void 0!==t.resolveOptions.noMatchWarning||console.warn('Navigo: "'+t.currentLocationPath+"\" didn't match any of the registered routes."),n();},function(t,n){t.instance._setCurrent(null),n();}])];function E(){return(E=Object.assign||function(t){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);}return t;}).apply(this,arguments);}function x(t,n){var e=0;A(t,function o(){e!==t.matches.length?m(R,E({},t,{match:t.matches[e]}),function(){e+=1,o();}):P(t,n);});}function H(t){t.instance.__markAsClean(t);}function j(){return(j=Object.assign||function(t){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);}return t;}).apply(this,arguments);}var C="[data-navigo]";function N(t,n){var e,o=n||{strategy:"ONE",hash:!1,noMatchWarning:!1,linksSelector:C},r=this,i="/",d=null,w=[],L=!1,A=p(),P=v();function R(t){return t.indexOf("#")>=0&&(t=!0===o.hash?t.split("#")[1]||"/":t.split("#")[0]),t;}function E(t){return s(i+"/"+s(t));}function N(t,n,e,o){return t=c(t)?E(t):t,{name:o||s(String(t)),path:t,handler:n,hooks:g(e)};}function U(t,n){if(!r.__dirty){r.__dirty=!0,t=t?s(i)+"/"+s(t):void 0;var e={instance:r,to:t,currentLocationPath:t,navigateOptions:{},resolveOptions:j({},o,n)};return m([y,_,m.if(function(t){var n=t.matches;return n&&n.length>0;},x,S)],e,H),!!e.matches&&e.matches;}r.__waiting.push(function(){return r.resolve(t,n);});}function q(t,n){if(r.__dirty)r.__waiting.push(function(){return r.navigate(t,n);});else{r.__dirty=!0,t=s(i)+"/"+s(t);var e={instance:r,to:t,navigateOptions:n||{},resolveOptions:n&&n.resolveOptions?n.resolveOptions:o,currentLocationPath:R(t)};m([k,O,_,m.if(function(t){var n=t.matches;return n&&n.length>0;},x,S),b,H],e,H);}}function F(){if(P)return(P?[].slice.call(document.querySelectorAll(o.linksSelector||C)):[]).forEach(function(t){"false"!==t.getAttribute("data-navigo")&&"_blank"!==t.getAttribute("target")?t.hasListenerAttached||(t.hasListenerAttached=!0,t.navigoHandler=function(n){if((n.ctrlKey||n.metaKey)&&"a"===n.target.tagName.toLowerCase())return!1;var e=t.getAttribute("href");if(null==e)return!1;if(e.match(/^(http|https)/)&&"undefined"!=typeof URL)try{var o=new URL(e);e=o.pathname+o.search;}catch(t){}var i=function(t){if(!t)return{};var n,e=t.split(","),o={};return e.forEach(function(t){var e=t.split(":").map(function(t){return t.replace(/(^ +| +$)/g,"");});switch(e[0]){case"historyAPIMethod":o.historyAPIMethod=e[1];break;case"resolveOptionsStrategy":n||(n={}),n.strategy=e[1];break;case"resolveOptionsHash":n||(n={}),n.hash="true"===e[1];break;case"updateBrowserURL":case"callHandler":case"updateState":case"force":o[e[0]]="true"===e[1];}}),n&&(o.resolveOptions=n),o;}(t.getAttribute("data-navigo-options"));L||(n.preventDefault(),n.stopPropagation(),r.navigate(s(e),i));},t.addEventListener("click",t.navigoHandler)):t.hasListenerAttached&&t.removeEventListener("click",t.navigoHandler);}),r;}function I(t,n,e){var o=w.find(function(n){return n.name===t;}),r=null;if(o){if(r=o.path,n)for(var a in n)r=r.replace(":"+a,n[a]);r=r.match(/^\//)?r:"/"+r;}return r&&e&&!e.includeRoot&&(r=r.replace(new RegExp("^/"+i),"")),r;}function M(t){var n=h(s(t)),o=n[0],r=n[1],i=""===r?null:f(r);return{url:o,queryString:r,hashString:u(t),route:N(o,function(){},[e],o),data:null,params:i};}function T(t,n,e){return"string"==typeof n&&(n=z(n)),n?(n.hooks[t]||(n.hooks[t]=[]),n.hooks[t].push(e),function(){n.hooks[t]=n.hooks[t].filter(function(t){return t!==e;});}):(console.warn("Route doesn't exists: "+n),function(){});}function z(t){return"string"==typeof t?w.find(function(n){return n.name===E(t);}):w.find(function(n){return n.handler===t;});}t?i=s(t):console.warn('Navigo requires a root path in its constructor. If not provided will use "/" as default.'),this.root=i,this.routes=w,this.destroyed=L,this.current=d,this.__freezeListening=!1,this.__waiting=[],this.__dirty=!1,this.__markAsClean=function(t){t.instance.__dirty=!1,t.instance.__waiting.length>0&&t.instance.__waiting.shift()();},this.on=function(t,n,o){var r=this;return"object"!=typeof t||t instanceof RegExp?("function"==typeof t&&(o=n,n=t,t=i),w.push(N(t,n,[e,o])),this):(Object.keys(t).forEach(function(n){if("function"==typeof t[n])r.on(n,t[n]);else{var o=t[n],i=o.uses,a=o.as,s=o.hooks;w.push(N(n,i,[e,s],a));}}),this);},this.off=function(t){return this.routes=w=w.filter(function(n){return c(t)?s(n.path)!==s(t):"function"==typeof t?t!==n.handler:String(n.path)!==String(t);}),this;},this.resolve=U,this.navigate=q,this.navigateByName=function(t,n,e){var o=I(t,n);return null!==o&&(q(o.replace(new RegExp("^/?"+i),""),e),!0);},this.destroy=function(){this.routes=w=[],A&&window.removeEventListener("popstate",this.__popstateListener),this.destroyed=L=!0;},this.notFound=function(t,n){return r._notFoundRoute=N("*",t,[e,n],"__NOT_FOUND__"),this;},this.updatePageLinks=F,this.link=function(t){return"/"+i+"/"+s(t);},this.hooks=function(t){return e=t,this;},this.extractGETParameters=function(t){return h(R(t));},this.lastResolved=function(){return d;},this.generate=I,this.getLinkPath=function(t){return t.getAttribute("href");},this.match=function(t){var n={instance:r,currentLocationPath:t,to:t,navigateOptions:{},resolveOptions:o};return _(n,function(){}),!!n.matches&&n.matches;},this.matchLocation=function(t,n,e){void 0===n||void 0!==e&&!e||(n=E(n));var o={instance:r,to:n,currentLocationPath:n};return y(o,function(){}),"string"==typeof t&&(t=void 0===e||e?E(t):t),l(o,{name:String(t),path:t,handler:function(){},hooks:{}})||!1;},this.getCurrentLocation=function(){return M(s(a(i)).replace(new RegExp("^"+i),""));},this.addBeforeHook=T.bind(this,"before"),this.addAfterHook=T.bind(this,"after"),this.addAlreadyHook=T.bind(this,"already"),this.addLeaveHook=T.bind(this,"leave"),this.getRoute=z,this._pathToMatchObject=M,this._clean=s,this._checkForAHash=R,this._setCurrent=function(t){return d=r.current=t;},function(){A&&(this.__popstateListener=function(){r.__freezeListening||U();},window.addEventListener("popstate",this.__popstateListener));}.call(this),F.call(this);}}},n={};function e(o){if(n[o])return n[o].exports;var r=n[o]={exports:{}};return t[o](r,r.exports,e),r.exports;}return e.d=function(t,n){for(var o in n)e.o(n,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:n[o]});},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n);},e(407);}().default;});},{}],4:[function(require,module,exports){module.exports={"name":"pict-application","version":"1.0.33","description":"Application base class for a pict view-based application","main":"source/Pict-Application.js","scripts":{"test":"npx quack test","start":"node source/Pict-Application.js","coverage":"npx quack coverage","build":"npx quack build","docker-dev-build":"docker build ./ -f Dockerfile_LUXURYCode -t pict-application-image:local","docker-dev-run":"docker run -it -d --name pict-application-dev -p 30001:8080 -p 38086:8086 -v \"$PWD/.config:/home/coder/.config\"  -v \"$PWD:/home/coder/pict-application\" -u \"$(id -u):$(id -g)\" -e \"DOCKER_USER=$USER\" pict-application-image:local","docker-dev-shell":"docker exec -it pict-application-dev /bin/bash","tests":"npx quack test -g","lint":"eslint source/**","types":"tsc -p ."},"types":"types/source/Pict-Application.d.ts","repository":{"type":"git","url":"git+https://github.com/stevenvelozo/pict-application.git"},"author":"steven velozo <steven@velozo.com>","license":"MIT","bugs":{"url":"https://github.com/stevenvelozo/pict-application/issues"},"homepage":"https://github.com/stevenvelozo/pict-application#readme","devDependencies":{"@eslint/js":"^9.28.0","browser-env":"^3.3.0","eslint":"^9.28.0","pict":"^1.0.348","pict-provider":"^1.0.10","pict-view":"^1.0.66","quackage":"^1.0.58","typescript":"^5.9.3"},"mocha":{"diff":true,"extension":["js"],"package":"./package.json","reporter":"spec","slow":"75","timeout":"5000","ui":"tdd","watch-files":["source/**/*.js","test/**/*.js"],"watch-ignore":["lib/vendor"]},"dependencies":{"fable-serviceproviderbase":"^3.0.19"}};},{}],5:[function(require,module,exports){const libFableServiceBase=require('fable-serviceproviderbase');const libPackage=require('../package.json');const defaultPictSettings={Name:'DefaultPictApplication',// The main "viewport" is the view that is used to host our application
MainViewportViewIdentifier:'Default-View',MainViewportRenderableHash:false,MainViewportDestinationAddress:false,MainViewportDefaultDataAddress:false,// Whether or not we should automatically render the main viewport and other autorender views after we initialize the pict application
AutoSolveAfterInitialize:true,AutoRenderMainViewportViewAfterInitialize:true,AutoRenderViewsAfterInitialize:false,AutoLoginAfterInitialize:false,AutoLoadDataAfterLogin:false,ConfigurationOnlyViews:[],Manifests:{},// The prefix to prepend on all template destination hashes
IdentifierAddressPrefix:'PICT-'};/**
 * Base class for pict applications.
 */class PictApplication extends libFableServiceBase{/**
	 * @param {import('fable')} pFable
	 * @param {Record<string, any>} [pOptions]
	 * @param {string} [pServiceHash]
	 */constructor(pFable,pOptions,pServiceHash){let tmpCarryOverConfiguration=typeof pFable.settings.PictApplicationConfiguration==='object'?pFable.settings.PictApplicationConfiguration:{};let tmpOptions=Object.assign({},JSON.parse(JSON.stringify(defaultPictSettings)),tmpCarryOverConfiguration,pOptions);super(pFable,tmpOptions,pServiceHash);/** @type {any} */this.options;/** @type {any} */this.log;/** @type {import('pict') & import('fable')} */this.fable;/** @type {string} */this.UUID;/** @type {string} */this.Hash;/**
		 * @type {{ [key: string]: any }}
		 */this.servicesMap;this.serviceType='PictApplication';/** @type {Record<string, any>} */this._Package=libPackage;// Convenience and consistency naming
this.pict=this.fable;// Wire in the essential Pict state
/** @type {Record<string, any>} */this.AppData=this.fable.AppData;/** @type {Record<string, any>} */this.Bundle=this.fable.Bundle;/** @type {number} */this.initializeTimestamp;/** @type {number} */this.lastSolvedTimestamp;/** @type {number} */this.lastLoginTimestamp;/** @type {number} */this.lastMarshalFromViewsTimestamp;/** @type {number} */this.lastMarshalToViewsTimestamp;/** @type {number} */this.lastAutoRenderTimestamp;/** @type {number} */this.lastLoadDataTimestamp;// Load all the manifests for the application
let tmpManifestKeys=Object.keys(this.options.Manifests);if(tmpManifestKeys.length>0){for(let i=0;i<tmpManifestKeys.length;i++){// Load each manifest
let tmpManifestKey=tmpManifestKeys[i];this.fable.instantiateServiceProvider('Manifest',this.options.Manifests[tmpManifestKey],tmpManifestKey);}}}/* -------------------------------------------------------------------------- *//*                     Code Section: Solve All Views                          *//* -------------------------------------------------------------------------- *//**
	 * @return {boolean}
	 */onPreSolve(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onPreSolve:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onPreSolveAsync(fCallback){this.onPreSolve();return fCallback();}/**
	 * @return {boolean}
	 */onBeforeSolve(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeSolve:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onBeforeSolveAsync(fCallback){this.onBeforeSolve();return fCallback();}/**
	 * @return {boolean}
	 */onSolve(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onSolve:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onSolveAsync(fCallback){this.onSolve();return fCallback();}/**
	 * @return {boolean}
	 */solve(){if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} executing solve() function...`);}// Walk through any loaded providers and solve them as well.
let tmpLoadedProviders=Object.keys(this.pict.providers);let tmpProvidersToSolve=[];for(let i=0;i<tmpLoadedProviders.length;i++){let tmpProvider=this.pict.providers[tmpLoadedProviders[i]];if(tmpProvider.options.AutoSolveWithApp){tmpProvidersToSolve.push(tmpProvider);}}// Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpProvidersToSolve.sort((a,b)=>{return a.options.AutoSolveOrdinal-b.options.AutoSolveOrdinal;});for(let i=0;i<tmpProvidersToSolve.length;i++){tmpProvidersToSolve[i].solve(tmpProvidersToSolve[i]);}this.onBeforeSolve();// Now walk through any loaded views and initialize them as well.
let tmpLoadedViews=Object.keys(this.pict.views);let tmpViewsToSolve=[];for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];if(tmpView.options.AutoInitialize){tmpViewsToSolve.push(tmpView);}}// Sort the views by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpViewsToSolve.sort((a,b)=>{return a.options.AutoInitializeOrdinal-b.options.AutoInitializeOrdinal;});for(let i=0;i<tmpViewsToSolve.length;i++){tmpViewsToSolve[i].solve();}this.onSolve();this.onAfterSolve();this.lastSolvedTimestamp=this.fable.log.getTimeStamp();return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */solveAsync(fCallback){let tmpAnticipate=this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');tmpAnticipate.anticipate(this.onBeforeSolveAsync.bind(this));// Allow the callback to be passed in as the last parameter no matter what
let tmpCallback=typeof fCallback==='function'?fCallback:false;if(!tmpCallback){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync Auto Callback Error: ${pError}`,pError);}};}// Walk through any loaded providers and solve them as well.
let tmpLoadedProviders=Object.keys(this.pict.providers);let tmpProvidersToSolve=[];for(let i=0;i<tmpLoadedProviders.length;i++){let tmpProvider=this.pict.providers[tmpLoadedProviders[i]];if(tmpProvider.options.AutoSolveWithApp){tmpProvidersToSolve.push(tmpProvider);}}// Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpProvidersToSolve.sort((a,b)=>{return a.options.AutoSolveOrdinal-b.options.AutoSolveOrdinal;});for(let i=0;i<tmpProvidersToSolve.length;i++){tmpAnticipate.anticipate(tmpProvidersToSolve[i].solveAsync.bind(tmpProvidersToSolve[i]));}// Walk through any loaded views and solve them as well.
let tmpLoadedViews=Object.keys(this.pict.views);let tmpViewsToSolve=[];for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];if(tmpView.options.AutoSolveWithApp){tmpViewsToSolve.push(tmpView);}}// Sort the views by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpViewsToSolve.sort((a,b)=>{return a.options.AutoSolveOrdinal-b.options.AutoSolveOrdinal;});for(let i=0;i<tmpViewsToSolve.length;i++){tmpAnticipate.anticipate(tmpViewsToSolve[i].solveAsync.bind(tmpViewsToSolve[i]));}tmpAnticipate.anticipate(this.onSolveAsync.bind(this));tmpAnticipate.anticipate(this.onAfterSolveAsync.bind(this));tmpAnticipate.wait(pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync() complete.`);}this.lastSolvedTimestamp=this.fable.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * @return {boolean}
	 */onAfterSolve(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterSolve:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onAfterSolveAsync(fCallback){this.onAfterSolve();return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Application Login                        *//* -------------------------------------------------------------------------- *//**
	 * @param {(error?: Error) => void} fCallback
	 */onBeforeLoginAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeLoginAsync:`);}return fCallback();}/**
	 * @param {(error?: Error) => void} fCallback
	 */onLoginAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onLoginAsync:`);}return fCallback();}/**
	 * @param {(error?: Error) => void} fCallback
	 */loginAsync(fCallback){const tmpAnticipate=this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');let tmpCallback=fCallback;if(typeof tmpCallback!=='function'){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loginAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loginAsync Auto Callback Error: ${pError}`,pError);}};}tmpAnticipate.anticipate(this.onBeforeLoginAsync.bind(this));tmpAnticipate.anticipate(this.onLoginAsync.bind(this));tmpAnticipate.anticipate(this.onAfterLoginAsync.bind(this));// check and see if we should automatically trigger a data load
if(this.options.AutoLoadDataAfterLogin){tmpAnticipate.anticipate(fNext=>{if(!this.isLoggedIn()){return fNext();}if(this.pict.LogNoisiness>1){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto loading data after login...`);}//TODO: should data load errors funnel here? this creates a weird coupling between login and data load callbacks
this.loadDataAsync(pError=>{fNext(pError);});});}tmpAnticipate.wait(pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loginAsync() complete.`);}this.lastLoginTimestamp=this.fable.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * Check if the application state is logged in. Defaults to true. Override this method in your application based on login requirements.
	 *
	 * @return {boolean}
	 */isLoggedIn(){return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onAfterLoginAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterLoginAsync:`);}return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Application LoadData                     *//* -------------------------------------------------------------------------- *//**
	 * @param {(error?: Error) => void} fCallback
	 */onBeforeLoadDataAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeLoadDataAsync:`);}return fCallback();}/**
	 * @param {(error?: Error) => void} fCallback
	 */onLoadDataAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onLoadDataAsync:`);}return fCallback();}/**
	 * @param {(error?: Error) => void} fCallback
	 */loadDataAsync(fCallback){const tmpAnticipate=this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');let tmpCallback=fCallback;if(typeof tmpCallback!=='function'){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loadDataAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loadDataAsync Auto Callback Error: ${pError}`,pError);}};}tmpAnticipate.anticipate(this.onBeforeLoadDataAsync.bind(this));// Walk through any loaded providers and load their data as well.
let tmpLoadedProviders=Object.keys(this.pict.providers);let tmpProvidersToLoadData=[];for(let i=0;i<tmpLoadedProviders.length;i++){let tmpProvider=this.pict.providers[tmpLoadedProviders[i]];if(tmpProvider.options.AutoLoadDataWithApp){tmpProvidersToLoadData.push(tmpProvider);}}// Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpProvidersToLoadData.sort((a,b)=>{return a.options.AutoLoadDataOrdinal-b.options.AutoLoadDataOrdinal;});for(const tmpProvider of tmpProvidersToLoadData){tmpAnticipate.anticipate(tmpProvider.onBeforeLoadDataAsync.bind(tmpProvider));}tmpAnticipate.anticipate(this.onLoadDataAsync.bind(this));//TODO: think about ways to parallelize these
for(const tmpProvider of tmpProvidersToLoadData){tmpAnticipate.anticipate(tmpProvider.onLoadDataAsync.bind(tmpProvider));}tmpAnticipate.anticipate(this.onAfterLoadDataAsync.bind(this));for(const tmpProvider of tmpProvidersToLoadData){tmpAnticipate.anticipate(tmpProvider.onAfterLoadDataAsync.bind(tmpProvider));}tmpAnticipate.wait(/** @param {Error} [pError] */pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loadDataAsync() complete.`);}this.lastLoadDataTimestamp=this.fable.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * @param {(error?: Error) => void} fCallback
	 */onAfterLoadDataAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterLoadDataAsync:`);}return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Application SaveData                     *//* -------------------------------------------------------------------------- *//**
	 * @param {(error?: Error) => void} fCallback
	 */onBeforeSaveDataAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeSaveDataAsync:`);}return fCallback();}/**
	 * @param {(error?: Error) => void} fCallback
	 */onSaveDataAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onSaveDataAsync:`);}return fCallback();}/**
	 * @param {(error?: Error) => void} fCallback
	 */saveDataAsync(fCallback){const tmpAnticipate=this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');let tmpCallback=fCallback;if(typeof tmpCallback!=='function'){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} saveDataAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} saveDataAsync Auto Callback Error: ${pError}`,pError);}};}tmpAnticipate.anticipate(this.onBeforeSaveDataAsync.bind(this));// Walk through any loaded providers and load their data as well.
let tmpLoadedProviders=Object.keys(this.pict.providers);let tmpProvidersToSaveData=[];for(let i=0;i<tmpLoadedProviders.length;i++){let tmpProvider=this.pict.providers[tmpLoadedProviders[i]];if(tmpProvider.options.AutoSaveDataWithApp){tmpProvidersToSaveData.push(tmpProvider);}}// Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpProvidersToSaveData.sort((a,b)=>{return a.options.AutoSaveDataOrdinal-b.options.AutoSaveDataOrdinal;});for(const tmpProvider of tmpProvidersToSaveData){tmpAnticipate.anticipate(tmpProvider.onBeforeSaveDataAsync.bind(tmpProvider));}tmpAnticipate.anticipate(this.onSaveDataAsync.bind(this));//TODO: think about ways to parallelize these
for(const tmpProvider of tmpProvidersToSaveData){tmpAnticipate.anticipate(tmpProvider.onSaveDataAsync.bind(tmpProvider));}tmpAnticipate.anticipate(this.onAfterSaveDataAsync.bind(this));for(const tmpProvider of tmpProvidersToSaveData){tmpAnticipate.anticipate(tmpProvider.onAfterSaveDataAsync.bind(tmpProvider));}tmpAnticipate.wait(/** @param {Error} [pError] */pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} saveDataAsync() complete.`);}this.lastSaveDataTimestamp=this.fable.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * @param {(error?: Error) => void} fCallback
	 */onAfterSaveDataAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterSaveDataAsync:`);}return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Initialize Application                   *//* -------------------------------------------------------------------------- *//**
	 * @return {boolean}
	 */onBeforeInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeInitialize:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onBeforeInitializeAsync(fCallback){this.onBeforeInitialize();return fCallback();}/**
	 * @return {boolean}
	 */onInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onInitialize:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onInitializeAsync(fCallback){this.onInitialize();return fCallback();}/**
	 * @return {boolean}
	 */initialize(){if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} initialize:`);}if(!this.initializeTimestamp){this.onBeforeInitialize();if('ConfigurationOnlyViews'in this.options){// Load all the configuration only views
for(let i=0;i<this.options.ConfigurationOnlyViews.length;i++){let tmpViewIdentifier=typeof this.options.ConfigurationOnlyViews[i].ViewIdentifier==='undefined'?`AutoView-${this.fable.getUUID()}`:this.options.ConfigurationOnlyViews[i].ViewIdentifier;this.log.info(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} adding configuration only view: ${tmpViewIdentifier}`);this.pict.addView(tmpViewIdentifier,this.options.ConfigurationOnlyViews[i]);}}this.onInitialize();// Walk through any loaded providers and initialize them as well.
let tmpLoadedProviders=Object.keys(this.pict.providers);let tmpProvidersToInitialize=[];for(let i=0;i<tmpLoadedProviders.length;i++){let tmpProvider=this.pict.providers[tmpLoadedProviders[i]];if(tmpProvider.options.AutoInitialize){tmpProvidersToInitialize.push(tmpProvider);}}// Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpProvidersToInitialize.sort((a,b)=>{return a.options.AutoInitializeOrdinal-b.options.AutoInitializeOrdinal;});for(let i=0;i<tmpProvidersToInitialize.length;i++){tmpProvidersToInitialize[i].initialize();}// Now walk through any loaded views and initialize them as well.
let tmpLoadedViews=Object.keys(this.pict.views);let tmpViewsToInitialize=[];for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];if(tmpView.options.AutoInitialize){tmpViewsToInitialize.push(tmpView);}}// Sort the views by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpViewsToInitialize.sort((a,b)=>{return a.options.AutoInitializeOrdinal-b.options.AutoInitializeOrdinal;});for(let i=0;i<tmpViewsToInitialize.length;i++){tmpViewsToInitialize[i].initialize();}this.onAfterInitialize();if(this.options.AutoSolveAfterInitialize){if(this.pict.LogNoisiness>1){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto solving after initialization...`);}// Solve the template synchronously
this.solve();}// Now check and see if we should automatically render as well
if(this.options.AutoRenderMainViewportViewAfterInitialize){if(this.pict.LogNoisiness>1){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto rendering after initialization...`);}// Render the template synchronously
this.render();}this.initializeTimestamp=this.fable.log.getTimeStamp();this.onCompletionOfInitialize();return true;}else{this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initialize called but initialization is already completed.  Aborting.`);return false;}}/**
	 * @param {(error?: Error) => void} fCallback
	 */initializeAsync(fCallback){if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} initializeAsync:`);}// Allow the callback to be passed in as the last parameter no matter what
let tmpCallback=typeof fCallback==='function'?fCallback:false;if(!tmpCallback){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initializeAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initializeAsync Auto Callback Error: ${pError}`,pError);}};}if(!this.initializeTimestamp){let tmpAnticipate=this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} beginning initialization...`);}if('ConfigurationOnlyViews'in this.options){// Load all the configuration only views
for(let i=0;i<this.options.ConfigurationOnlyViews.length;i++){let tmpViewIdentifier=typeof this.options.ConfigurationOnlyViews[i].ViewIdentifier==='undefined'?`AutoView-${this.fable.getUUID()}`:this.options.ConfigurationOnlyViews[i].ViewIdentifier;this.log.info(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} adding configuration only view: ${tmpViewIdentifier}`);this.pict.addView(tmpViewIdentifier,this.options.ConfigurationOnlyViews[i]);}}tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));// Walk through any loaded providers and solve them as well.
let tmpLoadedProviders=Object.keys(this.pict.providers);let tmpProvidersToInitialize=[];for(let i=0;i<tmpLoadedProviders.length;i++){let tmpProvider=this.pict.providers[tmpLoadedProviders[i]];if(tmpProvider.options.AutoInitialize){tmpProvidersToInitialize.push(tmpProvider);}}// Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
tmpProvidersToInitialize.sort((a,b)=>{return a.options.AutoInitializeOrdinal-b.options.AutoInitializeOrdinal;});for(let i=0;i<tmpProvidersToInitialize.length;i++){tmpAnticipate.anticipate(tmpProvidersToInitialize[i].initializeAsync.bind(tmpProvidersToInitialize[i]));}// Now walk through any loaded views and initialize them as well.
// TODO: Some optimization cleverness could be gained by grouping them into a parallelized async operation, by ordinal.
let tmpLoadedViews=Object.keys(this.pict.views);let tmpViewsToInitialize=[];for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];if(tmpView.options.AutoInitialize){tmpViewsToInitialize.push(tmpView);}}// Sort the views by their priority
// If they are all the default priority 0, it will end up being add order due to JSON Object Property Key order stuff
tmpViewsToInitialize.sort((a,b)=>{return a.options.AutoInitializeOrdinal-b.options.AutoInitializeOrdinal;});for(let i=0;i<tmpViewsToInitialize.length;i++){let tmpView=tmpViewsToInitialize[i];tmpAnticipate.anticipate(tmpView.initializeAsync.bind(tmpView));}tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));if(this.options.AutoLoginAfterInitialize){if(this.pict.LogNoisiness>1){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto login (asynchronously) after initialization...`);}tmpAnticipate.anticipate(this.loginAsync.bind(this));}if(this.options.AutoSolveAfterInitialize){if(this.pict.LogNoisiness>1){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto solving (asynchronously) after initialization...`);}tmpAnticipate.anticipate(this.solveAsync.bind(this));}if(this.options.AutoRenderMainViewportViewAfterInitialize){if(this.pict.LogNoisiness>1){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto rendering (asynchronously) after initialization...`);}tmpAnticipate.anticipate(this.renderMainViewportAsync.bind(this));}tmpAnticipate.wait(pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initializeAsync Error: ${pError.message||pError}`,{stack:pError.stack});}this.initializeTimestamp=this.fable.log.getTimeStamp();if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initialization complete.`);}return tmpCallback();});}else{this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} async initialize called but initialization is already completed.  Aborting.`);// TODO: Should this be an error?
return this.onCompletionOfInitializeAsync(tmpCallback);}}/**
	 * @return {boolean}
	 */onAfterInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterInitialize:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onAfterInitializeAsync(fCallback){this.onAfterInitialize();return fCallback();}/**
	 * @return {boolean}
	 */onCompletionOfInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onCompletionOfInitialize:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onCompletionOfInitializeAsync(fCallback){this.onCompletionOfInitialize();return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Marshal Data From All Views              *//* -------------------------------------------------------------------------- *//**
	 * @return {boolean}
	 */onBeforeMarshalFromViews(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeMarshalFromViews:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onBeforeMarshalFromViewsAsync(fCallback){this.onBeforeMarshalFromViews();return fCallback();}/**
	 * @return {boolean}
	 */onMarshalFromViews(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onMarshalFromViews:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onMarshalFromViewsAsync(fCallback){this.onMarshalFromViews();return fCallback();}/**
	 * @return {boolean}
	 */marshalFromViews(){if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} executing marshalFromViews() function...`);}this.onBeforeMarshalFromViews();// Now walk through any loaded views and initialize them as well.
let tmpLoadedViews=Object.keys(this.pict.views);let tmpViewsToMarshalFromViews=[];for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];tmpViewsToMarshalFromViews.push(tmpView);}for(let i=0;i<tmpViewsToMarshalFromViews.length;i++){tmpViewsToMarshalFromViews[i].marshalFromView();}this.onMarshalFromViews();this.onAfterMarshalFromViews();this.lastMarshalFromViewsTimestamp=this.fable.log.getTimeStamp();return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */marshalFromViewsAsync(fCallback){let tmpAnticipate=this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');// Allow the callback to be passed in as the last parameter no matter what
let tmpCallback=typeof fCallback==='function'?fCallback:false;if(!tmpCallback){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewsAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewsAsync Auto Callback Error: ${pError}`,pError);}};}tmpAnticipate.anticipate(this.onBeforeMarshalFromViewsAsync.bind(this));// Walk through any loaded views and marshalFromViews them as well.
let tmpLoadedViews=Object.keys(this.pict.views);let tmpViewsToMarshalFromViews=[];for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];tmpViewsToMarshalFromViews.push(tmpView);}for(let i=0;i<tmpViewsToMarshalFromViews.length;i++){tmpAnticipate.anticipate(tmpViewsToMarshalFromViews[i].marshalFromViewAsync.bind(tmpViewsToMarshalFromViews[i]));}tmpAnticipate.anticipate(this.onMarshalFromViewsAsync.bind(this));tmpAnticipate.anticipate(this.onAfterMarshalFromViewsAsync.bind(this));tmpAnticipate.wait(pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewsAsync() complete.`);}this.lastMarshalFromViewsTimestamp=this.fable.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * @return {boolean}
	 */onAfterMarshalFromViews(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterMarshalFromViews:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onAfterMarshalFromViewsAsync(fCallback){this.onAfterMarshalFromViews();return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Marshal Data To All Views                *//* -------------------------------------------------------------------------- *//**
	 * @return {boolean}
	 */onBeforeMarshalToViews(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeMarshalToViews:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onBeforeMarshalToViewsAsync(fCallback){this.onBeforeMarshalToViews();return fCallback();}/**
	 * @return {boolean}
	 */onMarshalToViews(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onMarshalToViews:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onMarshalToViewsAsync(fCallback){this.onMarshalToViews();return fCallback();}/**
	 * @return {boolean}
	 */marshalToViews(){if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} executing marshalToViews() function...`);}this.onBeforeMarshalToViews();// Now walk through any loaded views and initialize them as well.
let tmpLoadedViews=Object.keys(this.pict.views);let tmpViewsToMarshalToViews=[];for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];tmpViewsToMarshalToViews.push(tmpView);}for(let i=0;i<tmpViewsToMarshalToViews.length;i++){tmpViewsToMarshalToViews[i].marshalToView();}this.onMarshalToViews();this.onAfterMarshalToViews();this.lastMarshalToViewsTimestamp=this.fable.log.getTimeStamp();return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */marshalToViewsAsync(fCallback){let tmpAnticipate=this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');// Allow the callback to be passed in as the last parameter no matter what
let tmpCallback=typeof fCallback==='function'?fCallback:false;if(!tmpCallback){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewsAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewsAsync Auto Callback Error: ${pError}`,pError);}};}tmpAnticipate.anticipate(this.onBeforeMarshalToViewsAsync.bind(this));// Walk through any loaded views and marshalToViews them as well.
let tmpLoadedViews=Object.keys(this.pict.views);let tmpViewsToMarshalToViews=[];for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];tmpViewsToMarshalToViews.push(tmpView);}for(let i=0;i<tmpViewsToMarshalToViews.length;i++){tmpAnticipate.anticipate(tmpViewsToMarshalToViews[i].marshalToViewAsync.bind(tmpViewsToMarshalToViews[i]));}tmpAnticipate.anticipate(this.onMarshalToViewsAsync.bind(this));tmpAnticipate.anticipate(this.onAfterMarshalToViewsAsync.bind(this));tmpAnticipate.wait(pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewsAsync() complete.`);}this.lastMarshalToViewsTimestamp=this.fable.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * @return {boolean}
	 */onAfterMarshalToViews(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterMarshalToViews:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onAfterMarshalToViewsAsync(fCallback){this.onAfterMarshalToViews();return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Render View                              *//* -------------------------------------------------------------------------- *//**
	 * @return {boolean}
	 */onBeforeRender(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeRender:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onBeforeRenderAsync(fCallback){this.onBeforeRender();return fCallback();}/**
	 * @param {string} [pViewIdentifier] - The hash of the view to render. By default, the main viewport view is rendered.
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string} [pTemplateDataAddress] - The address where the data for the template is stored.
	 *
	 * TODO: Should we support objects for pTemplateDataAddress for parity with pict-view?
	 */render(pViewIdentifier,pRenderableHash,pRenderDestinationAddress,pTemplateDataAddress){let tmpViewIdentifier=typeof pViewIdentifier!=='string'?this.options.MainViewportViewIdentifier:pViewIdentifier;let tmpRenderableHash=typeof pRenderableHash!=='string'?this.options.MainViewportRenderableHash:pRenderableHash;let tmpRenderDestinationAddress=typeof pRenderDestinationAddress!=='string'?this.options.MainViewportDestinationAddress:pRenderDestinationAddress;let tmpTemplateDataAddress=typeof pTemplateDataAddress!=='string'?this.options.MainViewportDefaultDataAddress:pTemplateDataAddress;if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} VIEW Renderable[${tmpRenderableHash}] Destination[${tmpRenderDestinationAddress}] TemplateDataAddress[${tmpTemplateDataAddress}] render:`);}this.onBeforeRender();// Now get the view (by hash) from the loaded views
let tmpView=typeof tmpViewIdentifier==='string'?this.servicesMap.PictView[tmpViewIdentifier]:false;if(!tmpView){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} could not render from View ${tmpViewIdentifier} because it is not a valid view.`);return false;}this.onRender();tmpView.render(tmpRenderableHash,tmpRenderDestinationAddress,tmpTemplateDataAddress);this.onAfterRender();return true;}/**
	 * @return {boolean}
	 */onRender(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onRender:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onRenderAsync(fCallback){this.onRender();return fCallback();}/**
	 * @param {string|((error?: Error) => void)} pViewIdentifier - The hash of the view to render. By default, the main viewport view is rendered. (or the callback)
	 * @param {string|((error?: Error) => void)} [pRenderableHash] - The hash of the renderable to render. (or the callback)
	 * @param {string|((error?: Error) => void)} [pRenderDestinationAddress] - The address where the renderable will be rendered. (or the callback)
	 * @param {string|((error?: Error) => void)} [pTemplateDataAddress] - The address where the data for the template is stored. (or the callback)
	 * @param {(error?: Error) => void} [fCallback] - The callback, if all other parameters are provided.
	 *
	 * TODO: Should we support objects for pTemplateDataAddress for parity with pict-view?
	 */renderAsync(pViewIdentifier,pRenderableHash,pRenderDestinationAddress,pTemplateDataAddress,fCallback){let tmpViewIdentifier=typeof pViewIdentifier!=='string'?this.options.MainViewportViewIdentifier:pViewIdentifier;let tmpRenderableHash=typeof pRenderableHash!=='string'?this.options.MainViewportRenderableHash:pRenderableHash;let tmpRenderDestinationAddress=typeof pRenderDestinationAddress!=='string'?this.options.MainViewportDestinationAddress:pRenderDestinationAddress;let tmpTemplateDataAddress=typeof pTemplateDataAddress!=='string'?this.options.MainViewportDefaultDataAddress:pTemplateDataAddress;// Allow the callback to be passed in as the last parameter no matter what
let tmpCallback=typeof fCallback==='function'?fCallback:typeof pTemplateDataAddress==='function'?pTemplateDataAddress:typeof pRenderDestinationAddress==='function'?pRenderDestinationAddress:typeof pRenderableHash==='function'?pRenderableHash:typeof pViewIdentifier==='function'?pViewIdentifier:false;if(!tmpCallback){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync Auto Callback Error: ${pError}`,pError);}};}if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} VIEW Renderable[${tmpRenderableHash}] Destination[${tmpRenderDestinationAddress}] TemplateDataAddress[${tmpTemplateDataAddress}] renderAsync:`);}let tmpRenderAnticipate=this.fable.newAnticipate();tmpRenderAnticipate.anticipate(this.onBeforeRenderAsync.bind(this));let tmpView=typeof tmpViewIdentifier==='string'?this.servicesMap.PictView[tmpViewIdentifier]:false;if(!tmpView){let tmpErrorMessage=`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} could not asynchronously render from View ${tmpViewIdentifier} because it is not a valid view.`;if(this.pict.LogNoisiness>3){this.log.error(tmpErrorMessage);}return tmpCallback(new Error(tmpErrorMessage));}tmpRenderAnticipate.anticipate(this.onRenderAsync.bind(this));tmpRenderAnticipate.anticipate(fNext=>{tmpView.renderAsync.call(tmpView,tmpRenderableHash,tmpRenderDestinationAddress,tmpTemplateDataAddress,fNext);});tmpRenderAnticipate.anticipate(this.onAfterRenderAsync.bind(this));return tmpRenderAnticipate.wait(tmpCallback);}/**
	 * @return {boolean}
	 */onAfterRender(){if(this.pict.LogNoisiness>3){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterRender:`);}return true;}/**
	 * @param {(error?: Error) => void} fCallback
	 */onAfterRenderAsync(fCallback){this.onAfterRender();return fCallback();}/**
	 * @return {boolean}
	 */renderMainViewport(){if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderMainViewport:`);}return this.render();}/**
	 * @param {(error?: Error) => void} fCallback
	 */renderMainViewportAsync(fCallback){if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderMainViewportAsync:`);}return this.renderAsync(fCallback);}/**
	 * @return {void}
	 */renderAutoViews(){if(this.pict.LogNoisiness>0){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} beginning renderAutoViews...`);}// Now walk through any loaded views and sort them by the AutoRender ordinal
let tmpLoadedViews=Object.keys(this.pict.views);// Sort the views by their priority
// If they are all the default priority 0, it will end up being add order due to JSON Object Property Key order stuff
tmpLoadedViews.sort((a,b)=>{return this.pict.views[a].options.AutoRenderOrdinal-this.pict.views[b].options.AutoRenderOrdinal;});for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];if(tmpView.options.AutoRender){tmpView.render();}}if(this.pict.LogNoisiness>0){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAutoViewsAsync complete.`);}}/**
	 * @param {(error?: Error) => void} fCallback
	 */renderAutoViewsAsync(fCallback){let tmpAnticipate=this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');// Allow the callback to be passed in as the last parameter no matter what
let tmpCallback=typeof fCallback==='function'?fCallback:false;if(!tmpCallback){this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAutoViewsAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAutoViewsAsync Auto Callback Error: ${pError}`,pError);}};}if(this.pict.LogNoisiness>0){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} beginning renderAutoViewsAsync...`);}// Now walk through any loaded views and sort them by the AutoRender ordinal
// TODO: Some optimization cleverness could be gained by grouping them into a parallelized async operation, by ordinal.
let tmpLoadedViews=Object.keys(this.pict.views);// Sort the views by their priority
// If they are all the default priority 0, it will end up being add order due to JSON Object Property Key order stuff
tmpLoadedViews.sort((a,b)=>{return this.pict.views[a].options.AutoRenderOrdinal-this.pict.views[b].options.AutoRenderOrdinal;});for(let i=0;i<tmpLoadedViews.length;i++){let tmpView=this.pict.views[tmpLoadedViews[i]];if(tmpView.options.AutoRender){tmpAnticipate.anticipate(tmpView.renderAsync.bind(tmpView));}}tmpAnticipate.wait(pError=>{this.lastAutoRenderTimestamp=this.fable.log.getTimeStamp();if(this.pict.LogNoisiness>0){this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAutoViewsAsync complete.`);}return tmpCallback(pError);});}/**
	 * @return {boolean}
	 */get isPictApplication(){return true;}}module.exports=PictApplication;},{"../package.json":4,"fable-serviceproviderbase":2}],6:[function(require,module,exports){module.exports={"name":"pict-provider","version":"1.0.12","description":"Pict Provider Base Class","main":"source/Pict-Provider.js","scripts":{"start":"node source/Pict-Provider.js","test":"npx quack test","tests":"npx quack test -g","coverage":"npx quack coverage","build":"npx quack build","docker-dev-build":"docker build ./ -f Dockerfile_LUXURYCode -t pict-provider-image:local","docker-dev-run":"docker run -it -d --name pict-provider-dev -p 24125:8080 -p 30027:8086 -v \"$PWD/.config:/home/coder/.config\"  -v \"$PWD:/home/coder/pict-provider\" -u \"$(id -u):$(id -g)\" -e \"DOCKER_USER=$USER\" pict-provider-image:local","docker-dev-shell":"docker exec -it pict-provider-dev /bin/bash","lint":"eslint source/**","types":"tsc -p ."},"types":"types/source/Pict-Provider.d.ts","repository":{"type":"git","url":"git+https://github.com/stevenvelozo/pict-provider.git"},"author":"steven velozo <steven@velozo.com>","license":"MIT","bugs":{"url":"https://github.com/stevenvelozo/pict-provider/issues"},"homepage":"https://github.com/stevenvelozo/pict-provider#readme","devDependencies":{"@eslint/js":"^9.39.1","eslint":"^9.39.1","pict":"^1.0.351","quackage":"^1.0.58","typescript":"^5.9.3"},"dependencies":{"fable-serviceproviderbase":"^3.0.19"},"mocha":{"diff":true,"extension":["js"],"package":"./package.json","reporter":"spec","slow":"75","timeout":"5000","ui":"tdd","watch-files":["source/**/*.js","test/**/*.js"],"watch-ignore":["lib/vendor"]}};},{}],7:[function(require,module,exports){const libFableServiceBase=require('fable-serviceproviderbase');const libPackage=require('../package.json');const defaultPictProviderSettings={ProviderIdentifier:false,// If this is set to true, when the App initializes this will.
// After the App initializes, initialize will be called as soon as it's added.
AutoInitialize:true,AutoInitializeOrdinal:0,AutoLoadDataWithApp:true,AutoLoadDataOrdinal:0,AutoSolveWithApp:true,AutoSolveOrdinal:0,Manifests:{},Templates:[]};class PictProvider extends libFableServiceBase{/**
	 * @param {import('fable')} pFable - The Fable instance.
	 * @param {Record<string, any>} [pOptions] - The options for the provider.
	 * @param {string} [pServiceHash] - The service hash for the provider.
	 */constructor(pFable,pOptions,pServiceHash){// Intersect default options, parent constructor, service information
let tmpOptions=Object.assign({},JSON.parse(JSON.stringify(defaultPictProviderSettings)),pOptions);super(pFable,tmpOptions,pServiceHash);/** @type {import('fable') & import('pict') & { instantiateServiceProviderWithoutRegistration(pServiceType: string, pOptions?: Record<string, any>, pCustomServiceHash?: string): any }} */this.fable;/** @type {import('fable') & import('pict') & { instantiateServiceProviderWithoutRegistration(pServiceType: string, pOptions?: Record<string, any>, pCustomServiceHash?: string): any }} */this.pict;/** @type {any} */this.log;/** @type {Record<string, any>} */this.options;/** @type {string} */this.UUID;/** @type {string} */this.Hash;if(!this.options.ProviderIdentifier){this.options.ProviderIdentifier=`AutoProviderID-${this.fable.getUUID()}`;}this.serviceType='PictProvider';/** @type {Record<string, any>} */this._Package=libPackage;// Convenience and consistency naming
this.pict=this.fable;// Wire in the essential Pict application state
/** @type {Record<string, any>} */this.AppData=this.pict.AppData;/** @type {Record<string, any>} */this.Bundle=this.pict.Bundle;this.initializeTimestamp=false;this.lastSolvedTimestamp=false;for(let i=0;i<this.options.Templates.length;i++){let tmpDefaultTemplate=this.options.Templates[i];if(!tmpDefaultTemplate.hasOwnProperty('Postfix')||!tmpDefaultTemplate.hasOwnProperty('Template')){this.log.error(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} could not load Default Template ${i} in the options array.`,tmpDefaultTemplate);}else{if(!tmpDefaultTemplate.Source){tmpDefaultTemplate.Source=`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} options object.`;}this.pict.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix,tmpDefaultTemplate.Postfix,tmpDefaultTemplate.Template,tmpDefaultTemplate.Source);}}}/* -------------------------------------------------------------------------- *//*                        Code Section: Initialization                        *//* -------------------------------------------------------------------------- */onBeforeInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onBeforeInitialize:`);}return true;}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after pre-pinitialization.
	 *
	 * @return {void}
	 */onBeforeInitializeAsync(fCallback){this.onBeforeInitialize();return fCallback();}onInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onInitialize:`);}return true;}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after initialization.
	 *
	 * @return {void}
	 */onInitializeAsync(fCallback){this.onInitialize();return fCallback();}initialize(){if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow PROVIDER [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initialize:`);}if(!this.initializeTimestamp){this.onBeforeInitialize();this.onInitialize();this.onAfterInitialize();this.initializeTimestamp=this.pict.log.getTimeStamp();return true;}else{this.log.warn(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initialize called but initialization is already completed.  Aborting.`);return false;}}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after initialization.
	 *
	 * @return {void}
	 */initializeAsync(fCallback){if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow PROVIDER [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initializeAsync:`);}if(!this.initializeTimestamp){let tmpAnticipate=this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');if(this.pict.LogNoisiness>0){this.log.info(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} beginning initialization...`);}tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));tmpAnticipate.wait(pError=>{this.initializeTimestamp=this.pict.log.getTimeStamp();if(pError){this.log.error(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initialization failed: ${pError.message||pError}`,{Stack:pError.stack});}else if(this.pict.LogNoisiness>0){this.log.info(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initialization complete.`);}return fCallback();});}else{this.log.warn(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} async initialize called but initialization is already completed.  Aborting.`);// TODO: Should this be an error?
return fCallback();}}onAfterInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onAfterInitialize:`);}return true;}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after initialization.
	 *
	 * @return {void}
	 */onAfterInitializeAsync(fCallback){this.onAfterInitialize();return fCallback();}onPreRender(){if(this.pict.LogNoisiness>3){this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onPreRender:`);}return true;}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after pre-render.
	 *
	 * @return {void}
	 */onPreRenderAsync(fCallback){this.onPreRender();return fCallback();}render(){return this.onPreRender();}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after render.
	 *
	 * @return {void}
	 */renderAsync(fCallback){this.onPreRender();return fCallback();}onPreSolve(){if(this.pict.LogNoisiness>3){this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onPreSolve:`);}return true;}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after pre-solve.
	 *
	 * @return {void}
	 */onPreSolveAsync(fCallback){this.onPreSolve();return fCallback();}solve(){return this.onPreSolve();}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after solve.
	 *
	 * @return {void}
	 */solveAsync(fCallback){this.onPreSolve();return fCallback();}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after the data pre-load.
	 */onBeforeLoadDataAsync(fCallback){return fCallback();}/**
	 * Hook to allow the provider to load data during application data load.
	 *
	 * @param {(pError?: Error) => void} fCallback - The callback to call after the data load.
	 */onLoadDataAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onLoadDataAsync:`);}return fCallback();}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after the data post-load.
	 */onAfterLoadDataAsync(fCallback){return fCallback();}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after the data pre-load.
	 *
	 * @return {void}
	 */onBeforeSaveDataAsync(fCallback){return fCallback();}/**
	 * Hook to allow the provider to load data during application data load.
	 *
	 * @param {(pError?: Error) => void} fCallback - The callback to call after the data load.
	 *
	 * @return {void}
	 */onSaveDataAsync(fCallback){if(this.pict.LogNoisiness>3){this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onSaveDataAsync:`);}return fCallback();}/**
	 * @param {(pError?: Error) => void} fCallback - The callback to call after the data post-load.
	 *
	 * @return {void}
	 */onAfterSaveDataAsync(fCallback){return fCallback();}}module.exports=PictProvider;},{"../package.json":6,"fable-serviceproviderbase":2}],8:[function(require,module,exports){const libPictProvider=require('pict-provider');const libNavigo=require('navigo');const _DEFAULT_PROVIDER_CONFIGURATION={ProviderIdentifier:'Pict-Router',AutoInitialize:true,AutoInitializeOrdinal:0,// When true, addRoute() will NOT auto-resolve after each route is added.
// This is useful in auth-gated SPAs where routes should only resolve after
// the DOM is ready (e.g. after login).  Can also be set globally via
// pict.settings.RouterSkipRouteResolveOnAdd — either one enables the skip.
SkipRouteResolveOnAdd:false};class PictRouter extends libPictProvider{constructor(pFable,pOptions,pServiceHash){let tmpOptions=Object.assign({},_DEFAULT_PROVIDER_CONFIGURATION,pOptions);super(pFable,tmpOptions,pServiceHash);// Initialize the navigo router and set the base path to '/'
this.router=new libNavigo('/',{strategy:'ONE',hash:true});if(this.options.Routes){for(let i=0;i<this.options.Routes.length;i++){if(this.options.Routes[i].path&&this.options.Routes[i].template){this.addRoute(this.options.Routes[i].path,this.options.Routes[i].template);}else if(this.options.Routes[i].path&&this.options.Routes[i].render){this.addRoute(this.options.Routes[i].path,this.options.Routes[i].render);}else{this.pict.log.warn(`Route ${i} is missing a render function or template string.`);}}}// This is the route to render after load
this.afterPersistView='/Manyfest/Overview';}get currentScope(){return this.AppData?.ManyfestRecord?.Scope??'Default';}forwardToScopedRoute(pData){this.navigate(`${pData.url}/${this.currentScope}`);}onInitializeAsync(fCallback){return super.onInitializeAsync(fCallback);}/**
	 * Add a route to the router.
	 */addRoute(pRoute,pRenderable){if(typeof pRenderable==='function'){this.router.on(pRoute,pRenderable);}else if(typeof pRenderable==='string'){// Run this as a template, allowing some whack things with functions in template expressions.
this.router.on(pRoute,pData=>{this.pict.parseTemplate(pRenderable,pData,null,this.pict);});}else{// renderable isn't usable!
this.pict.log.warn(`Route ${pRoute} has an invalid renderable.`);return;}// By default, resolve after each route is added (legacy behavior).
// Applications can skip this by setting SkipRouteResolveOnAdd: true in
// the provider config JSON, or globally via
// pict.settings.RouterSkipRouteResolveOnAdd.  Either one will prevent
// premature route resolution before views are rendered.
if(!this.options.SkipRouteResolveOnAdd&&!this.pict.settings.RouterSkipRouteResolveOnAdd){this.resolve();}}/**
	 * Navigate to a given route (set the browser URL string, add to history, trigger router)
	 * 
	 * @param {string} pRoute - The route to navigate to
	 */navigate(pRoute){this.router.navigate(pRoute);}/**
	 * Navigate to the route currently in the browser's location hash.
	 *
	 * This is useful in auth-gated SPAs: when the user pastes a deep-link
	 * (e.g. #/Books) and then logs in, calling navigateCurrent() will force
	 * the router to fire the handler for whatever hash is already in the URL.
	 * Unlike resolve(), navigate() always triggers the handler even if Navigo
	 * has already "consumed" that URL.
	 *
	 * If the hash is empty or just "#/", this is a no-op and returns false.
	 *
	 * @returns {boolean} true if a route was navigated to, false otherwise
	 */navigateCurrent(){let tmpHash=typeof window!=='undefined'&&window.location?window.location.hash:'';if(tmpHash&&tmpHash.length>2&&tmpHash!=='#/'){let tmpRoute=tmpHash.replace(/^#/,'');this.navigate(tmpRoute);return true;}return false;}/**
	 * Trigger the router resolving logic; this is expected to be called after all routes are added (to go to the default route).
	 *
	 */resolve(){this.router.resolve();}}module.exports=PictRouter;module.exports.default_configuration=_DEFAULT_PROVIDER_CONFIGURATION;},{"navigo":3,"pict-provider":7}],9:[function(require,module,exports){/**
 * Simple syntax highlighter for use with CodeJar.
 *
 * Provides basic keyword/string/number/comment highlighting for common languages.
 * Can be replaced with Prism.js or highlight.js for more sophisticated highlighting
 * by passing a custom highlight function to the view options.
 *
 * @module Pict-Code-Highlighter
 */// Language definition map
const _LanguageDefinitions={'javascript':{// Combined regex to tokenize: comments, strings, template literals, regex, then everything else
tokenizer:/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(["'])(?:(?!\2|\\).|\\.)*?\2|(`(?:[^`\\]|\\.)*?`)|(\/(?![/*])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\\\n])+\/[gimsuvy]*)/g,keywords:/\b(async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|get|if|import|in|instanceof|let|new|of|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/g,builtins:/\b(true|false|null|undefined|NaN|Infinity|console|window|document|Math|JSON|Array|Object|String|Number|Boolean|Date|RegExp|Map|Set|Promise|Error|Symbol|parseInt|parseFloat|require|module|exports)\b/g,numbers:/\b(\d+\.?\d*(?:e[+-]?\d+)?|0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g},'json':{tokenizer:/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*")/g,keywords:/\b(true|false|null)\b/g,numbers:/-?\b\d+\.?\d*(?:e[+-]?\d+)?\b/g},'html':{// Tokenizer captures: (1) comments, (2) strings, (3) tags with attributes
tokenizer:/(<!--[\s\S]*?-->)|(["'])(?:(?!\2|\\).|\\.)*?\2|(<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s+[a-zA-Z-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*))?)*\s*\/?>)/g,// tagToken group index for identifying tag matches
tagGroupIndex:3},'css':{tokenizer:/(\/\*[\s\S]*?\*\/)|(["'])(?:(?!\2|\\).|\\.)*?\2/g,selectors:/([.#]?[a-zA-Z_][\w-]*(?:\s*[>+~]\s*[.#]?[a-zA-Z_][\w-]*)*)\s*\{/g,properties:/\b([a-zA-Z-]+)\s*:/g,numbers:/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms|deg|fr)?\b/g,keywords:/\b(important|inherit|initial|unset|none|auto|block|inline|flex|grid)\b/g},'sql':{tokenizer:/(--[^\n]*|\/\*[\s\S]*?\*\/)|(["'])(?:(?!\2|\\).|\\.)*?\2/g,keywords:/\b(SELECT|FROM|WHERE|AND|OR|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|ADD|COLUMN|INDEX|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|COUNT|SUM|AVG|MIN|MAX|NOT|NULL|IS|IN|BETWEEN|LIKE|EXISTS|CASE|WHEN|THEN|ELSE|END|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|CASCADE|GRANT|REVOKE|COMMIT|ROLLBACK|BEGIN|TRANSACTION|INT|VARCHAR|DATETIME|AUTO_INCREMENT|CURRENT_TIMESTAMP)\b/gi,numbers:/\b\d+\.?\d*\b/g}};// Alias some common language names
_LanguageDefinitions['js']=_LanguageDefinitions['javascript'];_LanguageDefinitions['htm']=_LanguageDefinitions['html'];/**
 * Escape HTML special characters to prevent XSS when inserting into innerHTML.
 *
 * @param {string} pString - The string to escape
 * @returns {string} The escaped string
 */function escapeHTML(pString){return pString.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}/**
 * Highlight a segment of code that is NOT inside a string or comment.
 * This applies keyword, number, and structural highlighting.
 *
 * @param {string} pCode - The code segment to highlight (already HTML-escaped)
 * @param {object} pLanguageDef - The language definition
 * @returns {string} The highlighted HTML
 */function highlightCodeSegment(pCode,pLanguageDef){let tmpResult=pCode;// CSS selectors
if(pLanguageDef.selectors){pLanguageDef.selectors.lastIndex=0;tmpResult=tmpResult.replace(pLanguageDef.selectors,'<span class="function-name">$1</span>{');}// CSS properties
if(pLanguageDef.properties){pLanguageDef.properties.lastIndex=0;tmpResult=tmpResult.replace(pLanguageDef.properties,'<span class="property">$1</span>:');}// Keywords
if(pLanguageDef.keywords){pLanguageDef.keywords.lastIndex=0;tmpResult=tmpResult.replace(pLanguageDef.keywords,'<span class="keyword">$1</span>');}// Builtins
if(pLanguageDef.builtins){pLanguageDef.builtins.lastIndex=0;tmpResult=tmpResult.replace(pLanguageDef.builtins,'<span class="keyword">$1</span>');}// Numbers (CSS numbers may have units as a capture group, others do not)
if(pLanguageDef.numbers){pLanguageDef.numbers.lastIndex=0;tmpResult=tmpResult.replace(pLanguageDef.numbers,pMatch=>{return`<span class="number">${pMatch}</span>`;});}return tmpResult;}/**
 * Highlight an HTML tag token, applying tag name, attribute name, and attribute value colors.
 *
 * The approach: parse the raw tag into structured pieces first, then build the
 * highlighted output from those pieces. This avoids mixing raw text with HTML span
 * tags, which would cause regex replacements to match span attributes on subsequent passes.
 *
 * @param {string} pTag - The raw (unescaped) tag string
 * @returns {string} The highlighted HTML
 */function highlightHTMLTag(pTag){let tmpResult='';let tmpRest=pTag;// 1. Extract the opening bracket and tag name: < or </  followed by tagname
let tmpTagNameMatch=tmpRest.match(/^(<\/?)([a-zA-Z][a-zA-Z0-9-]*)/);if(!tmpTagNameMatch){// Not a recognizable tag, just escape the whole thing
return escapeHTML(pTag);}tmpResult+=escapeHTML(tmpTagNameMatch[1]);tmpResult+='<span class="tag">'+escapeHTML(tmpTagNameMatch[2])+'</span>';tmpRest=tmpRest.substring(tmpTagNameMatch[0].length);// 2. Parse attributes from the remaining text (before the closing > or />)
// Repeatedly match: whitespace + attr-name + optional =value
let tmpAttrRegex=/^(\s+)([a-zA-Z-]+)(?:(\s*=\s*)(["'])([^"']*?)\4)?/;let tmpAttrMatch;while((tmpAttrMatch=tmpRest.match(tmpAttrRegex))!==null){// Whitespace before the attribute
tmpResult+=tmpAttrMatch[1];// Attribute name
tmpResult+='<span class="attr-name">'+escapeHTML(tmpAttrMatch[2])+'</span>';// If there's an = value part
if(tmpAttrMatch[3]){tmpResult+=escapeHTML(tmpAttrMatch[3]);tmpResult+='<span class="attr-value">'+escapeHTML(tmpAttrMatch[4])+escapeHTML(tmpAttrMatch[5])+escapeHTML(tmpAttrMatch[4])+'</span>';}tmpRest=tmpRest.substring(tmpAttrMatch[0].length);}// 3. Whatever remains (whitespace, />, >) — escape it all
tmpResult+=escapeHTML(tmpRest);return tmpResult;}/**
 * Create a highlight function for a given language.
 *
 * The approach: use a single tokenizer regex to split the code into protected tokens
 * (comments, strings) and code segments. Process each segment independently.
 * This avoids placeholder/sentinel issues entirely.
 *
 * @param {string} pLanguage - The language identifier (e.g. "javascript", "json", "html")
 * @returns {function} A function that takes an element and highlights its textContent
 */function createHighlighter(pLanguage){return function highlightElement(pElement){let tmpCode=pElement.textContent;let tmpLanguageName=typeof pLanguage==='string'?pLanguage.toLowerCase():'javascript';let tmpLanguageDef=_LanguageDefinitions[tmpLanguageName];if(!tmpLanguageDef){// No highlighting rules for this language; just escape and return
pElement.innerHTML=escapeHTML(tmpCode);return;}if(!tmpLanguageDef.tokenizer){// No tokenizer; just escape and apply keyword highlighting
pElement.innerHTML=highlightCodeSegment(escapeHTML(tmpCode),tmpLanguageDef);return;}// Split the code into tokens using the tokenizer regex.
// The tokenizer captures comments and strings as groups.
// We process everything between matches as code.
let tmpResult='';let tmpLastIndex=0;let tmpTagGroupIndex=tmpLanguageDef.tagGroupIndex||0;tmpLanguageDef.tokenizer.lastIndex=0;let tmpMatch;while((tmpMatch=tmpLanguageDef.tokenizer.exec(tmpCode))!==null){// Add the code segment before this match
if(tmpMatch.index>tmpLastIndex){let tmpSegment=tmpCode.substring(tmpLastIndex,tmpMatch.index);tmpResult+=highlightCodeSegment(escapeHTML(tmpSegment),tmpLanguageDef);}let tmpFullMatch=tmpMatch[0];// Determine token type from capture groups
// Group 1 is always comments, Group 2+ are strings/template literals/regex
if(tmpMatch[1]){// Comment
tmpResult+=`<span class="comment">${escapeHTML(tmpFullMatch)}</span>`;}else if(tmpTagGroupIndex>0&&tmpMatch[tmpTagGroupIndex]){// HTML tag — highlight tag name, attributes, and values
tmpResult+=highlightHTMLTag(tmpFullMatch);}else{// String, template literal, or regex
tmpResult+=`<span class="string">${escapeHTML(tmpFullMatch)}</span>`;}tmpLastIndex=tmpLanguageDef.tokenizer.lastIndex;}// Add any remaining code after the last match
if(tmpLastIndex<tmpCode.length){let tmpSegment=tmpCode.substring(tmpLastIndex);tmpResult+=highlightCodeSegment(escapeHTML(tmpSegment),tmpLanguageDef);}pElement.innerHTML=tmpResult;};}module.exports=createHighlighter;module.exports.LanguageDefinitions=_LanguageDefinitions;},{}],10:[function(require,module,exports){module.exports={"RenderOnLoad":true,"DefaultRenderable":"CodeEditor-Wrap","DefaultDestinationAddress":"#CodeEditor-Container-Div","Templates":[{"Hash":"CodeEditor-Container","Template":"<!-- CodeEditor-Container Rendering Soon -->"}],"Renderables":[{"RenderableHash":"CodeEditor-Wrap","TemplateHash":"CodeEditor-Container","DestinationAddress":"#CodeEditor-Container-Div"}],"TargetElementAddress":"#CodeEditor-Container-Div",// Address in AppData or other Pict address space to read/write code content
"CodeDataAddress":false,// The language for syntax highlighting (e.g. "javascript", "html", "css", "json")
"Language":"javascript",// Whether the editor is read-only
"ReadOnly":false,// Tab character: use tab or spaces
"Tab":"\t",// Whether to indent with the same whitespace as the previous line
"IndentOn":/[({[]$/,// Whether to add a closing bracket/paren/brace
"MoveToNewLine":/^[)}\]]/,// Whether to handle the closing character
"AddClosing":true,// Whether to preserve indentation on new lines
"CatchTab":true,// Whether to show line numbers
"LineNumbers":true,// Default code content if no address is provided
"DefaultCode":"// Enter your code here\n",// CSS for the code editor
"CSS":`.pict-code-editor-wrap
{
	display: flex;
	font-family: 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
	font-size: 14px;
	line-height: 1.5;
	border: 1px solid #D0D0D0;
	border-radius: 4px;
	overflow: auto;
}
.pict-code-editor-wrap .pict-code-line-numbers
{
	position: sticky;
	left: 0;
	width: 40px;
	min-width: 40px;
	padding: 10px 0;
	text-align: right;
	background: #F5F5F5;
	border-right: 1px solid #D0D0D0;
	color: #999;
	font-size: 13px;
	line-height: 1.5;
	user-select: none;
	pointer-events: none;
	box-sizing: border-box;
	z-index: 1;
}
.pict-code-editor-wrap .pict-code-line-numbers span
{
	display: block;
	padding: 0 8px 0 0;
}
.pict-code-editor-wrap .pict-code-editor
{
	margin: 0;
	padding: 10px 10px 10px 8px;
	min-height: 100px;
	flex: 1;
	min-width: 0;
	outline: none;
	tab-size: 4;
	white-space: pre;
	overflow-wrap: normal;
	color: #383A42;
	background: #FAFAFA;
	caret-color: #526FFF;
	border-radius: 0 4px 4px 0;
}
.pict-code-editor-wrap .pict-code-editor.pict-code-no-line-numbers
{
	padding-left: 10px;
	border-radius: 4px;
}
.pict-code-editor-wrap .pict-code-editor .keyword { color: #A626A4; }
.pict-code-editor-wrap .pict-code-editor .string { color: #50A14F; }
.pict-code-editor-wrap .pict-code-editor .number { color: #986801; }
.pict-code-editor-wrap .pict-code-editor .comment { color: #A0A1A7; font-style: italic; }
.pict-code-editor-wrap .pict-code-editor .operator { color: #0184BC; }
.pict-code-editor-wrap .pict-code-editor .punctuation { color: #383A42; }
.pict-code-editor-wrap .pict-code-editor .function-name { color: #4078F2; }
.pict-code-editor-wrap .pict-code-editor .property { color: #E45649; }
.pict-code-editor-wrap .pict-code-editor .tag { color: #E45649; }
.pict-code-editor-wrap .pict-code-editor .attr-name { color: #986801; }
.pict-code-editor-wrap .pict-code-editor .attr-value { color: #50A14F; }
`};},{}],11:[function(require,module,exports){const libPictViewClass=require('pict-view');const libCreateHighlighter=require('./Pict-Code-Highlighter.js');const _DefaultConfiguration=require('./Pict-Section-Code-DefaultConfiguration.js');class PictSectionCode extends libPictViewClass{constructor(pFable,pOptions,pServiceHash){let tmpOptions=Object.assign({},_DefaultConfiguration,pOptions);super(pFable,tmpOptions,pServiceHash);this.initialRenderComplete=false;// The CodeJar instance
this.codeJar=null;// The highlight function (can be overridden)
this._highlightFunction=null;// The current language
this._language=this.options.Language||'javascript';}onBeforeInitialize(){super.onBeforeInitialize();this._codeJarPrototype=null;this.targetElement=false;// Build the default highlight function for the configured language
this._highlightFunction=libCreateHighlighter(this._language);return super.onBeforeInitialize();}/**
	 * Connect the CodeJar prototype.  If not passed explicitly, try to find it
	 * as a global (window.CodeJar) or require it from the npm package.
	 *
	 * @param {function} [pCodeJarPrototype] - The CodeJar constructor function
	 * @returns {boolean|void}
	 */connectCodeJarPrototype(pCodeJarPrototype){if(typeof pCodeJarPrototype==='function'){this._codeJarPrototype=pCodeJarPrototype;return;}// Try to find CodeJar in global scope
if(typeof window!=='undefined'){if(typeof window.CodeJar==='function'){this.log.trace(`PICT-Code Found CodeJar in window.CodeJar.`);this._codeJarPrototype=window.CodeJar;return;}}this.log.error(`PICT-Code No CodeJar prototype found. Include codejar via script tag or call connectCodeJarPrototype(CodeJar) explicitly.`);return false;}onAfterRender(pRenderable){// Ensure the CSS from all registered views is injected into the DOM
this.pict.CSSMap.injectCSS();if(!this.initialRenderComplete){this.onAfterInitialRender();this.initialRenderComplete=true;}return super.onAfterRender(pRenderable);}onAfterInitialRender(){// Resolve the CodeJar prototype if not already set
if(!this._codeJarPrototype){this.connectCodeJarPrototype();}if(!this._codeJarPrototype){this.log.error(`PICT-Code Cannot initialize editor; no CodeJar prototype available.`);return false;}if(this.codeJar){this.log.error(`PICT-Code editor is already initialized!`);return false;}// Find the target element
let tmpTargetElementSet=this.services.ContentAssignment.getElement(this.options.TargetElementAddress);if(!tmpTargetElementSet||tmpTargetElementSet.length<1){this.log.error(`PICT-Code Could not find target element [${this.options.TargetElementAddress}]!`);this.targetElement=false;return false;}this.targetElement=tmpTargetElementSet[0];// Build the editor DOM structure
this._buildEditorDOM();// Get initial code content
let tmpCode=this._resolveCodeContent();// Create the CodeJar options
let tmpCodeJarOptions={};if(this.options.Tab){tmpCodeJarOptions.tab=this.options.Tab;}if(this.options.IndentOn){tmpCodeJarOptions.indentOn=this.options.IndentOn;}if(this.options.MoveToNewLine){tmpCodeJarOptions.moveToNewLine=this.options.MoveToNewLine;}if(typeof this.options.AddClosing!=='undefined'){tmpCodeJarOptions.addClosing=this.options.AddClosing;}if(typeof this.options.CatchTab!=='undefined'){tmpCodeJarOptions.catchTab=this.options.CatchTab;}this.customConfigureEditorOptions(tmpCodeJarOptions);// Instantiate CodeJar on the editor element
let tmpEditorElement=this._editorElement;this.codeJar=this._codeJarPrototype(tmpEditorElement,this._highlightFunction,tmpCodeJarOptions);// CodeJar forces white-space:pre-wrap and overflow-wrap:break-word
// via inline styles, which causes line wrapping that breaks the
// line-number alignment.  Override back to non-wrapping so the
// wrap container scrolls horizontally instead.
this._resetEditorWrapStyles();// Set the initial code
if(tmpCode){this.codeJar.updateCode(tmpCode);}// Wire up the change handler
this.codeJar.onUpdate(pCode=>{this._updateLineNumbers();this.onCodeChange(pCode);});// Initial line number render
this._updateLineNumbers();// Handle read-only
if(this.options.ReadOnly){tmpEditorElement.setAttribute('contenteditable','false');}}/**
	 * Build the editor DOM elements inside the target container.
	 */_buildEditorDOM(){// Clear the target
this.targetElement.innerHTML='';// Create wrapper
let tmpWrap=document.createElement('div');tmpWrap.className='pict-code-editor-wrap';// Create line numbers container
if(this.options.LineNumbers){let tmpLineNumbers=document.createElement('div');tmpLineNumbers.className='pict-code-line-numbers';tmpWrap.appendChild(tmpLineNumbers);this._lineNumbersElement=tmpLineNumbers;}// Create the editor element (CodeJar needs a pre or div)
let tmpEditor=document.createElement('div');tmpEditor.className='pict-code-editor language-'+this._language;if(!this.options.LineNumbers){tmpEditor.className+=' pict-code-no-line-numbers';}tmpWrap.appendChild(tmpEditor);this.targetElement.appendChild(tmpWrap);this._editorElement=tmpEditor;this._wrapElement=tmpWrap;}/**
	 * Update the line numbers display based on current code content.
	 */_updateLineNumbers(){if(!this.options.LineNumbers||!this._lineNumbersElement||!this._editorElement){return;}let tmpCode=this._editorElement.textContent||'';let tmpLineCount=tmpCode.split('\n').length;let tmpHTML='';for(let i=1;i<=tmpLineCount;i++){tmpHTML+=`<span>${i}</span>`;}this._lineNumbersElement.innerHTML=tmpHTML;}/**
	 * Reset inline styles that CodeJar sets on the editor element.
	 *
	 * CodeJar forces white-space:pre-wrap and overflow-wrap:break-word so
	 * long lines wrap visually.  That breaks line-number alignment because
	 * each wrapped visual row is not a logical line.  Resetting to pre /
	 * normal makes the outer .pict-code-editor-wrap scroll horizontally.
	 */_resetEditorWrapStyles(){if(!this._editorElement){return;}this._editorElement.style.whiteSpace='pre';this._editorElement.style.overflowWrap='normal';}/**
	 * Resolve the initial code content from address or default.
	 *
	 * @returns {string} The code content
	 */_resolveCodeContent(){if(this.options.CodeDataAddress){const tmpAddressSpace={Fable:this.fable,Pict:this.fable,AppData:this.AppData,Bundle:this.Bundle,Options:this.options};let tmpAddressedData=this.fable.manifest.getValueByHash(tmpAddressSpace,this.options.CodeDataAddress);if(typeof tmpAddressedData==='string'){return tmpAddressedData;}else{this.log.warn(`PICT-Code Address [${this.options.CodeDataAddress}] did not return a string; it was ${typeof tmpAddressedData}.`);}}return this.options.DefaultCode||'';}/**
	 * Hook for subclasses to customize CodeJar options before instantiation.
	 *
	 * @param {object} pOptions - The CodeJar options object to modify
	 */customConfigureEditorOptions(pOptions){// Override in subclass to tweak options
}/**
	 * Called when the code content changes.  Override in subclasses to handle changes.
	 *
	 * @param {string} pCode - The new code content
	 */onCodeChange(pCode){// Write back to data address if configured
if(this.options.CodeDataAddress){const tmpAddressSpace={Fable:this.fable,Pict:this.fable,AppData:this.AppData,Bundle:this.Bundle,Options:this.options};this.fable.manifest.setValueByHash(tmpAddressSpace,this.options.CodeDataAddress,pCode);}}// -- Public API Methods --
/**
	 * Get the current code content.
	 *
	 * @returns {string} The current code
	 */getCode(){if(!this.codeJar){this.log.warn('PICT-Code getCode called before editor initialized.');return'';}return this.codeJar.toString();}/**
	 * Set the code content.
	 *
	 * @param {string} pCode - The code to set
	 */setCode(pCode){if(!this.codeJar){this.log.warn('PICT-Code setCode called before editor initialized.');return;}this.codeJar.updateCode(pCode);this._updateLineNumbers();}/**
	 * Change the editor language and re-highlight.
	 *
	 * @param {string} pLanguage - The language identifier
	 */setLanguage(pLanguage){this._language=pLanguage;this._highlightFunction=libCreateHighlighter(pLanguage);if(this._editorElement){// Update the class
this._editorElement.className='pict-code-editor language-'+pLanguage;if(!this.options.LineNumbers){this._editorElement.className+=' pict-code-no-line-numbers';}}if(this.codeJar){// Re-create the editor with the new highlight function
let tmpCode=this.codeJar.toString();this.codeJar.destroy();this.codeJar=this._codeJarPrototype(this._editorElement,this._highlightFunction,{tab:this.options.Tab,catchTab:this.options.CatchTab,addClosing:this.options.AddClosing});this._resetEditorWrapStyles();this.codeJar.updateCode(tmpCode);this.codeJar.onUpdate(pCode=>{this._updateLineNumbers();this.onCodeChange(pCode);});}}/**
	 * Set a custom highlight function to replace the built-in highlighter.
	 * Useful for integrating Prism.js, highlight.js, or any other library.
	 *
	 * @param {function} pHighlightFunction - A function that takes a DOM element and highlights its textContent
	 */setHighlightFunction(pHighlightFunction){if(typeof pHighlightFunction!=='function'){this.log.error('PICT-Code setHighlightFunction requires a function.');return;}this._highlightFunction=pHighlightFunction;if(this.codeJar){let tmpCode=this.codeJar.toString();this.codeJar.destroy();this.codeJar=this._codeJarPrototype(this._editorElement,this._highlightFunction,{tab:this.options.Tab,catchTab:this.options.CatchTab,addClosing:this.options.AddClosing});this._resetEditorWrapStyles();this.codeJar.updateCode(tmpCode);this.codeJar.onUpdate(pCode=>{this._updateLineNumbers();this.onCodeChange(pCode);});}}/**
	 * Set the read-only state of the editor.
	 *
	 * @param {boolean} pReadOnly - Whether the editor should be read-only
	 */setReadOnly(pReadOnly){this.options.ReadOnly=pReadOnly;if(this._editorElement){this._editorElement.setAttribute('contenteditable',pReadOnly?'false':'true');}}/**
	 * Destroy the editor and clean up.
	 */destroy(){if(this.codeJar){this.codeJar.destroy();this.codeJar=null;}}/**
	 * Marshal code content from the data address into the view.
	 */marshalToView(){super.marshalToView();if(this.codeJar&&this.options.CodeDataAddress){let tmpCode=this._resolveCodeContent();if(typeof tmpCode==='string'){this.codeJar.updateCode(tmpCode);this._updateLineNumbers();}}}/**
	 * Marshal the current code content back to the data address.
	 */marshalFromView(){super.marshalFromView();if(this.codeJar&&this.options.CodeDataAddress){this.onCodeChange(this.codeJar.toString());}}}module.exports=PictSectionCode;module.exports.default_configuration=_DefaultConfiguration;module.exports.createHighlighter=libCreateHighlighter;},{"./Pict-Code-Highlighter.js":9,"./Pict-Section-Code-DefaultConfiguration.js":10,"pict-view":33}],12:[function(require,module,exports){// The container for all the Pict-Section-Content related code.
// The main content view class
module.exports=require('./views/Pict-View-Content.js');// The content provider (markdown parsing, HTML escaping)
module.exports.PictContentProvider=require('./providers/Pict-Provider-Content.js');},{"./providers/Pict-Provider-Content.js":13,"./views/Pict-View-Content.js":14}],13:[function(require,module,exports){const libPictProvider=require('pict-provider');const libCreateHighlighter=require('pict-section-code').createHighlighter;/**
 * Content Provider for Pict Section Content
 *
 * A general-purpose markdown-to-HTML parser with support for:
 * - Headings, paragraphs, lists, blockquotes, horizontal rules
 * - Fenced code blocks with language tags (nested fence support)
 * - Syntax highlighting and line numbers for code blocks (via pict-section-code)
 * - Tables (GFM pipe syntax)
 * - Mermaid diagram blocks
 * - KaTeX math (inline and display)
 * - Bold, italic, inline code, links, images
 *
 * Link resolution is customizable via an optional callback.
 */class PictContentProvider extends libPictProvider{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}/**
	 * Highlight a code string using pict-section-code's syntax highlighter.
	 * Uses a mock element to interface with the highlighter's DOM-based API.
	 *
	 * @param {string} pCode - The raw code string
	 * @param {string} pLanguage - The language identifier (e.g. "javascript", "html")
	 * @returns {string} The syntax-highlighted HTML
	 */highlightCode(pCode,pLanguage){if(!pCode){return'';}let tmpHighlighter=libCreateHighlighter(pLanguage);// Create a mock element to interface with the highlighter
let tmpMockElement={textContent:pCode,innerHTML:''};tmpHighlighter(tmpMockElement);return tmpMockElement.innerHTML;}/**
	 * Generate line number HTML for a code block.
	 *
	 * @param {string} pCode - The raw code string
	 * @returns {string} HTML string with line number spans
	 */generateLineNumbers(pCode){if(!pCode){return'<span>1</span>';}let tmpLineCount=pCode.split('\n').length;let tmpHTML='';for(let i=1;i<=tmpLineCount;i++){tmpHTML+='<span>'+i+'</span>';}return tmpHTML;}/**
	 * Parse a markdown string into HTML.
	 *
	 * @param {string} pMarkdown - The raw markdown text
	 * @param {Function} [pLinkResolver] - Optional callback for link resolution: (pHref, pLinkText) => { href, target, rel } or null
	 * @param {Function} [pImageResolver] - Optional callback for image URL resolution: (pSrc, pAlt) => resolvedSrc or null
	 * @returns {string} The parsed HTML
	 */parseMarkdown(pMarkdown,pLinkResolver,pImageResolver){if(!pMarkdown){return'';}let tmpLines=pMarkdown.split('\n');let tmpHTML=[];let tmpInCodeBlock=false;let tmpCodeFenceLength=0;let tmpCodeLang='';let tmpCodeLines=[];let tmpInList=false;let tmpListType='';let tmpInBlockquote=false;let tmpBlockquoteLines=[];let tmpInMathBlock=false;let tmpMathLines=[];let tmpParagraphLines=[];// Helper to flush accumulated paragraph lines into a single <p> tag
let fFlushParagraph=()=>{if(tmpParagraphLines.length>0){tmpHTML.push('<p>'+tmpParagraphLines.map(pLine=>{return this.parseInline(pLine,pLinkResolver,pImageResolver);}).join(' ')+'</p>');tmpParagraphLines=[];}};for(let i=0;i<tmpLines.length;i++){let tmpLine=tmpLines[i];// Display math blocks ($$...$$) — skip if inside a code block
if(!tmpInCodeBlock&&tmpLine.trim().match(/^\$\$/)){if(tmpInMathBlock){// End math block
tmpHTML.push('<div class="pict-content-katex-display">'+tmpMathLines.join('\n')+'</div>');tmpInMathBlock=false;tmpMathLines=[];}else{// Flush any pending paragraph
fFlushParagraph();// Close any open list or blockquote
if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');tmpInList=false;}if(tmpInBlockquote){tmpHTML.push('<blockquote>'+this.parseMarkdown(tmpBlockquoteLines.join('\n'),pLinkResolver,pImageResolver)+'</blockquote>');tmpInBlockquote=false;tmpBlockquoteLines=[];}tmpInMathBlock=true;}continue;}if(tmpInMathBlock){tmpMathLines.push(tmpLine);continue;}// Code blocks (fenced) — track fence length so ````x```` nests around ```y```
let tmpFenceMatch=tmpLine.match(/^(`{3,})/);if(tmpFenceMatch){let tmpFenceLen=tmpFenceMatch[1].length;if(tmpInCodeBlock){// Only close if the closing fence is at least as long as the opening
if(tmpFenceLen>=tmpCodeFenceLength&&tmpLine.trim()===tmpFenceMatch[1]){// End code block
if(tmpCodeLang==='mermaid'){// Mermaid diagrams: output raw content for client-side rendering
tmpHTML.push('<pre class="mermaid">'+tmpCodeLines.join('\n')+'</pre>');}else{let tmpCodeText=tmpCodeLines.join('\n');let tmpHighlightedCode=this.highlightCode(tmpCodeText,tmpCodeLang);let tmpLineNumbersHTML=this.generateLineNumbers(tmpCodeText);tmpHTML.push('<div class="pict-content-code-wrap"><div class="pict-content-code-line-numbers">'+tmpLineNumbersHTML+'</div><pre><code class="language-'+this.escapeHTML(tmpCodeLang)+'">'+tmpHighlightedCode+'</code></pre></div>');}tmpInCodeBlock=false;tmpCodeFenceLength=0;tmpCodeLang='';tmpCodeLines=[];continue;}else{// Inner fence with fewer backticks — treat as content
tmpCodeLines.push(tmpLine);continue;}}else{// Flush any pending paragraph
fFlushParagraph();// Close any open list or blockquote
if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');tmpInList=false;}if(tmpInBlockquote){tmpHTML.push('<blockquote>'+this.parseMarkdown(tmpBlockquoteLines.join('\n'),pLinkResolver,pImageResolver)+'</blockquote>');tmpInBlockquote=false;tmpBlockquoteLines=[];}// Start code block — record fence length
tmpCodeFenceLength=tmpFenceLen;tmpCodeLang=tmpLine.replace(/^`{3,}/,'').trim();tmpInCodeBlock=true;continue;}}if(tmpInCodeBlock){tmpCodeLines.push(tmpLine);continue;}// Blockquotes
if(tmpLine.match(/^>\s?/)){if(!tmpInBlockquote){// Flush any pending paragraph
fFlushParagraph();// Close any open list
if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');tmpInList=false;}tmpInBlockquote=true;tmpBlockquoteLines=[];}tmpBlockquoteLines.push(tmpLine.replace(/^>\s?/,''));continue;}else if(tmpInBlockquote){tmpHTML.push('<blockquote>'+this.parseMarkdown(tmpBlockquoteLines.join('\n'),pLinkResolver,pImageResolver)+'</blockquote>');tmpInBlockquote=false;tmpBlockquoteLines=[];}// Horizontal rule
if(tmpLine.match(/^(-{3,}|\*{3,}|_{3,})\s*$/)){fFlushParagraph();if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');tmpInList=false;}tmpHTML.push('<hr>');continue;}// Headings
let tmpHeadingMatch=tmpLine.match(/^(#{1,6})\s+(.+)/);if(tmpHeadingMatch){fFlushParagraph();if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');tmpInList=false;}let tmpLevel=tmpHeadingMatch[1].length;let tmpText=this.parseInline(tmpHeadingMatch[2],pLinkResolver,pImageResolver);let tmpID=tmpHeadingMatch[2].toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-');tmpHTML.push('<h'+tmpLevel+' id="'+tmpID+'">'+tmpText+'</h'+tmpLevel+'>');continue;}// Unordered list items
let tmpULMatch=tmpLine.match(/^(\s*)[-*+]\s+(.*)/);if(tmpULMatch){fFlushParagraph();if(!tmpInList||tmpListType!=='ul'){if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');}tmpHTML.push('<ul>');tmpInList=true;tmpListType='ul';}tmpHTML.push('<li>'+this.parseInline(tmpULMatch[2],pLinkResolver,pImageResolver)+'</li>');continue;}// Ordered list items
let tmpOLMatch=tmpLine.match(/^(\s*)\d+\.\s+(.*)/);if(tmpOLMatch){fFlushParagraph();if(!tmpInList||tmpListType!=='ol'){if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');}tmpHTML.push('<ol>');tmpInList=true;tmpListType='ol';}tmpHTML.push('<li>'+this.parseInline(tmpOLMatch[2],pLinkResolver,pImageResolver)+'</li>');continue;}// Close list if we've left list items
if(tmpInList&&tmpLine.trim()!==''){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');tmpInList=false;}// Empty line — flush any accumulated paragraph
if(tmpLine.trim()===''){fFlushParagraph();continue;}// Table detection
if(tmpLine.match(/^\|/)&&i+1<tmpLines.length&&tmpLines[i+1].match(/^\|[\s-:|]+\|/)){fFlushParagraph();// Close any open list
if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');tmpInList=false;}let tmpTableHTML='<table>';// Header row
let tmpHeaders=tmpLine.split('|').filter(pCell=>{return pCell.trim()!=='';});tmpTableHTML+='<thead><tr>';for(let h=0;h<tmpHeaders.length;h++){tmpTableHTML+='<th>'+this.parseInline(tmpHeaders[h].trim(),pLinkResolver,pImageResolver)+'</th>';}tmpTableHTML+='</tr></thead>';// Skip separator row
i++;// Body rows
tmpTableHTML+='<tbody>';while(i+1<tmpLines.length&&tmpLines[i+1].match(/^\|/)){i++;let tmpCells=tmpLines[i].split('|').filter(pCell=>{return pCell.trim()!=='';});tmpTableHTML+='<tr>';for(let c=0;c<tmpCells.length;c++){tmpTableHTML+='<td>'+this.parseInline(tmpCells[c].trim(),pLinkResolver,pImageResolver)+'</td>';}tmpTableHTML+='</tr>';}tmpTableHTML+='</tbody></table>';tmpHTML.push(tmpTableHTML);continue;}// Accumulate paragraph lines — consecutive non-blank text lines
// will be joined into a single <p> tag when flushed
tmpParagraphLines.push(tmpLine);}// Flush any remaining accumulated paragraph
fFlushParagraph();// Close any trailing open elements
if(tmpInList){tmpHTML.push(tmpListType==='ul'?'</ul>':'</ol>');}if(tmpInBlockquote){tmpHTML.push('<blockquote>'+this.parseMarkdown(tmpBlockquoteLines.join('\n'),pLinkResolver,pImageResolver)+'</blockquote>');}if(tmpInCodeBlock){let tmpCodeText=tmpCodeLines.join('\n');let tmpHighlightedCode=this.highlightCode(tmpCodeText,tmpCodeLang);let tmpLineNumbersHTML=this.generateLineNumbers(tmpCodeText);tmpHTML.push('<div class="pict-content-code-wrap"><div class="pict-content-code-line-numbers">'+tmpLineNumbersHTML+'</div><pre><code>'+tmpHighlightedCode+'</code></pre></div>');}return tmpHTML.join('\n');}/**
	 * Parse inline markdown elements (bold, italic, code, links, images, KaTeX).
	 *
	 * @param {string} pText - The text to parse
	 * @param {Function} [pLinkResolver] - Optional callback: (pHref, pLinkText) => { href, target, rel } or null
	 * @param {Function} [pImageResolver] - Optional callback: (pSrc, pAlt) => resolvedSrc or null
	 * @returns {string} HTML with inline elements
	 */parseInline(pText,pLinkResolver,pImageResolver){if(!pText){return'';}let tmpResult=pText;// Extract inline code spans into placeholders so bold/italic regexes don't mangle their contents
let tmpCodeSpans=[];tmpResult=tmpResult.replace(/`([^`]+)`/g,(pMatch,pCode)=>{let tmpIndex=tmpCodeSpans.length;tmpCodeSpans.push('<code>'+pCode+'</code>');return'\x00CODEINLINE'+tmpIndex+'\x00';});// Inline LaTeX equations ($...$) — must be processed before other inline patterns
// Match single $ delimiters that aren't adjacent to spaces (to avoid false positives with currency)
tmpResult=tmpResult.replace(/\$([^\$\s][^\$]*?[^\$\s])\$/g,'<span class="pict-content-katex-inline">$1</span>');// Also match single-character inline math like $x$
tmpResult=tmpResult.replace(/\$([^\$\s])\$/g,'<span class="pict-content-katex-inline">$1</span>');// Images
tmpResult=tmpResult.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(pMatch,pAlt,pSrc)=>{let tmpSrc=pSrc;if(typeof pImageResolver==='function'){let tmpResolved=pImageResolver(pSrc,pAlt);if(tmpResolved){tmpSrc=tmpResolved;}}return'<img src="'+tmpSrc+'" alt="'+pAlt+'">';});// Links
tmpResult=tmpResult.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(pMatch,pLinkText,pHref)=>{if(typeof pLinkResolver==='function'){let tmpResolved=pLinkResolver(pHref,pLinkText);if(tmpResolved){let tmpTarget=tmpResolved.target?' target="'+tmpResolved.target+'"':'';let tmpRel=tmpResolved.rel?' rel="'+tmpResolved.rel+'"':'';return'<a href="'+tmpResolved.href+'"'+tmpTarget+tmpRel+'>'+pLinkText+'</a>';}}// Default behavior: external links open in new tab
if(pHref.match(/^https?:\/\//)){return'<a href="'+pHref+'" target="_blank" rel="noopener">'+pLinkText+'</a>';}return'<a href="'+pHref+'">'+pLinkText+'</a>';});// Bold
tmpResult=tmpResult.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');tmpResult=tmpResult.replace(/__([^_]+)__/g,'<strong>$1</strong>');// Italic
tmpResult=tmpResult.replace(/\*([^*]+)\*/g,'<em>$1</em>');tmpResult=tmpResult.replace(/_([^_]+)_/g,'<em>$1</em>');// Restore inline code spans from placeholders
tmpResult=tmpResult.replace(/\x00CODEINLINE(\d+)\x00/g,(pMatch,pIndex)=>{return tmpCodeSpans[parseInt(pIndex)];});return tmpResult;}/**
	 * Escape HTML special characters.
	 *
	 * @param {string} pText - The text to escape
	 * @returns {string} The escaped text
	 */escapeHTML(pText){if(!pText){return'';}return pText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}}module.exports=PictContentProvider;module.exports.default_configuration={ProviderIdentifier:"Pict-Content",AutoInitialize:true,AutoInitializeOrdinal:0};},{"pict-provider":7,"pict-section-code":11}],14:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Pict-Content",DefaultRenderable:"Pict-Content-Display",DefaultDestinationAddress:"#Pict-Content-Container",AutoRender:false,CSS:/*css*/`
		.pict-content {
			padding: 2em 3em;
			max-width: 900px;
			margin: 0 auto;
		}
		.pict-content-loading {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 200px;
			color: #8A7F72;
			font-size: 1em;
		}
		.pict-content h1 {
			font-size: 2em;
			color: #3D3229;
			border-bottom: 1px solid #DDD6CA;
			padding-bottom: 0.3em;
			margin-top: 0;
		}
		.pict-content h2 {
			font-size: 1.5em;
			color: #3D3229;
			border-bottom: 1px solid #EAE3D8;
			padding-bottom: 0.25em;
			margin-top: 1.5em;
		}
		.pict-content h3 {
			font-size: 1.25em;
			color: #3D3229;
			margin-top: 1.25em;
		}
		.pict-content h4, .pict-content h5, .pict-content h6 {
			color: #5E5549;
			margin-top: 1em;
		}
		.pict-content p {
			line-height: 1.7;
			color: #423D37;
			margin: 0.75em 0;
		}
		.pict-content a {
			color: #2E7D74;
			text-decoration: none;
		}
		.pict-content a:hover {
			text-decoration: underline;
		}
		.pict-content-code-wrap {
			position: relative;
			font-family: 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
			font-size: 14px;
			line-height: 1.5;
			border-radius: 6px;
			overflow: auto;
			margin: 1em 0;
			background: #3D3229;
		}
		.pict-content-code-wrap .pict-content-code-line-numbers {
			position: absolute;
			top: 0;
			left: 0;
			width: 40px;
			padding: 1.25em 0;
			text-align: right;
			background: #342A22;
			border-right: 1px solid #4A3F35;
			color: #8A7F72;
			font-size: 13px;
			line-height: 1.5;
			user-select: none;
			pointer-events: none;
			box-sizing: border-box;
		}
		.pict-content-code-wrap .pict-content-code-line-numbers span {
			display: block;
			padding: 0 8px 0 0;
		}
		.pict-content-code-wrap pre {
			margin: 0;
			background: #3D3229;
			color: #E8E0D4;
			padding: 1.25em 1.25em 1.25em 52px;
			border-radius: 6px;
			overflow-x: auto;
			line-height: 1.5;
			font-size: inherit;
		}
		.pict-content-code-wrap pre code {
			background: none;
			padding: 0;
			color: inherit;
			font-size: inherit;
			font-family: inherit;
		}
		.pict-content-code-wrap .keyword { color: #C678DD; }
		.pict-content-code-wrap .string { color: #98C379; }
		.pict-content-code-wrap .number { color: #D19A66; }
		.pict-content-code-wrap .comment { color: #7F848E; font-style: italic; }
		.pict-content-code-wrap .operator { color: #56B6C2; }
		.pict-content-code-wrap .punctuation { color: #E8E0D4; }
		.pict-content-code-wrap .function-name { color: #61AFEF; }
		.pict-content-code-wrap .property { color: #E06C75; }
		.pict-content-code-wrap .tag { color: #E06C75; }
		.pict-content-code-wrap .attr-name { color: #D19A66; }
		.pict-content-code-wrap .attr-value { color: #98C379; }
		.pict-content pre {
			background: #3D3229;
			color: #E8E0D4;
			padding: 1.25em;
			border-radius: 6px;
			overflow-x: auto;
			line-height: 1.5;
			font-size: 0.9em;
		}
		.pict-content code {
			background: #F0ECE4;
			padding: 0.15em 0.4em;
			border-radius: 3px;
			font-size: 0.9em;
			color: #9E6B47;
		}
		.pict-content pre code {
			background: none;
			padding: 0;
			color: inherit;
			font-size: inherit;
		}
		.pict-content blockquote {
			border-left: 4px solid #2E7D74;
			margin: 1em 0;
			padding: 0.5em 1em;
			background: #F7F5F0;
			color: #5E5549;
		}
		.pict-content blockquote p {
			margin: 0.25em 0;
		}
		.pict-content ul, .pict-content ol {
			padding-left: 2em;
			line-height: 1.8;
		}
		.pict-content li {
			margin: 0.25em 0;
			color: #423D37;
		}
		.pict-content hr {
			border: none;
			border-top: 1px solid #DDD6CA;
			margin: 2em 0;
		}
		.pict-content table {
			width: 100%;
			border-collapse: collapse;
			margin: 1em 0;
		}
		.pict-content table th {
			background: #F5F0E8;
			border: 1px solid #DDD6CA;
			padding: 0.6em 0.8em;
			text-align: left;
			font-weight: 600;
			color: #3D3229;
		}
		.pict-content table td {
			border: 1px solid #DDD6CA;
			padding: 0.5em 0.8em;
			color: #423D37;
		}
		.pict-content table tr:nth-child(even) {
			background: #F7F5F0;
		}
		.pict-content img {
			max-width: 100%;
			height: auto;
		}
		.pict-content pre.mermaid {
			background: #fff;
			color: #3D3229;
			text-align: center;
			padding: 1em;
		}
		.pict-content .pict-content-katex-display {
			text-align: center;
			margin: 1em 0;
			padding: 0.5em;
			overflow-x: auto;
		}
		.pict-content .pict-content-katex-inline {
			display: inline;
		}
	`,Templates:[{Hash:"Pict-Content-Template",Template:/*html*/`
<div class="pict-content" id="Pict-Content-Body">
	<div class="pict-content-loading">Loading content...</div>
</div>
`}],Renderables:[{RenderableHash:"Pict-Content-Display",TemplateHash:"Pict-Content-Template",DestinationAddress:"#Pict-Content-Container",RenderMethod:"replace"}]};class PictContentView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}/**
	 * Display parsed HTML content in the content area.
	 *
	 * @param {string} pHTMLContent - The HTML to display
	 * @param {string} [pContainerID] - The container element ID (defaults to 'Pict-Content-Body')
	 */displayContent(pHTMLContent,pContainerID){let tmpContainerID=pContainerID||'Pict-Content-Body';this.pict.ContentAssignment.assignContent('#'+tmpContainerID,pHTMLContent);// Scroll to top of content area
let tmpContentContainer=document.getElementById(tmpContainerID);if(tmpContentContainer&&tmpContentContainer.parentElement){tmpContentContainer.parentElement.scrollTop=0;}// Post-render: initialize Mermaid diagrams if mermaid is available
this.renderMermaidDiagrams(tmpContainerID);// Post-render: render KaTeX equations if katex is available
this.renderKaTeXEquations(tmpContainerID);}/**
	 * Render any Mermaid diagram blocks in the content area.
	 * Mermaid blocks are `<pre class="mermaid">` elements produced by parseMarkdown.
	 *
	 * @param {string} [pContainerID] - The container element ID (defaults to 'Pict-Content-Body')
	 */renderMermaidDiagrams(pContainerID){if(typeof mermaid==='undefined'){return;}let tmpContainerID=pContainerID||'Pict-Content-Body';let tmpContentBody=document.getElementById(tmpContainerID);if(!tmpContentBody){return;}let tmpMermaidElements=tmpContentBody.querySelectorAll('pre.mermaid');if(tmpMermaidElements.length<1){return;}// mermaid.run() will process all pre.mermaid elements in the container
try{mermaid.run({nodes:tmpMermaidElements});}catch(pError){this.log.error('Mermaid rendering error: '+pError.message);}}/**
	 * Render KaTeX inline and display math elements in the content area.
	 * Inline: `<span class="pict-content-katex-inline">`
	 * Display: `<div class="pict-content-katex-display">`
	 *
	 * @param {string} [pContainerID] - The container element ID (defaults to 'Pict-Content-Body')
	 */renderKaTeXEquations(pContainerID){if(typeof katex==='undefined'){return;}let tmpContainerID=pContainerID||'Pict-Content-Body';let tmpContentBody=document.getElementById(tmpContainerID);if(!tmpContentBody){return;}// Render inline math
let tmpInlineElements=tmpContentBody.querySelectorAll('.pict-content-katex-inline');for(let i=0;i<tmpInlineElements.length;i++){try{katex.render(tmpInlineElements[i].textContent,tmpInlineElements[i],{throwOnError:false,displayMode:false});}catch(pError){this.log.warn('KaTeX inline error: '+pError.message);}}// Render display math
let tmpDisplayElements=tmpContentBody.querySelectorAll('.pict-content-katex-display');for(let i=0;i<tmpDisplayElements.length;i++){try{katex.render(tmpDisplayElements[i].textContent,tmpDisplayElements[i],{throwOnError:false,displayMode:true});}catch(pError){this.log.warn('KaTeX display error: '+pError.message);}}}/**
	 * Show a loading indicator.
	 *
	 * @param {string} [pMessage] - Loading message (defaults to 'Loading content...')
	 * @param {string} [pContainerID] - The container element ID (defaults to 'Pict-Content-Body')
	 */showLoading(pMessage,pContainerID){let tmpContainerID=pContainerID||'Pict-Content-Body';let tmpMessage=pMessage||'Loading content...';this.pict.ContentAssignment.assignContent('#'+tmpContainerID,'<div class="pict-content-loading">'+tmpMessage+'</div>');}}module.exports=PictContentView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],15:[function(require,module,exports){/**
 * Pict-MDE-CodeMirror: Helper module for PictSectionMarkdownEditor
 *
 * Handles CodeMirror editor instance creation, extension configuration,
 * keyboard shortcuts, paste handling, and the data URI collapse extension.
 *//**
 * Attach CodeMirror editor creation methods to the view instance.
 *
 * @param {object} pView - The PictSectionMarkdownEditor instance
 */module.exports.attach=function attach(pView){/**
	 * Create a CodeMirror editor instance inside a container element.
	 *
	 * @param {HTMLElement} pContainer - The DOM element to mount the editor in
	 * @param {number} pSegmentIndex - The segment index
	 * @param {string} pContent - The initial content
	 */pView._createEditorInContainer=function _createEditorInContainer(pContainer,pSegmentIndex,pContent){let tmpCM=pView._codeMirrorModules;// Build the extensions array
let tmpExtensions=[];// Keyboard shortcuts for formatting, inter-segment navigation, and image paste handling
// IMPORTANT: Must be added BEFORE consumer extensions (e.g. basicSetup) so that
// our domEventHandlers fire before CM6's internal keymap handlers.
tmpExtensions.push(tmpCM.EditorView.domEventHandlers({keydown:(pEvent,pEditorView)=>{// Ctrl/Cmd + B = bold
if((pEvent.ctrlKey||pEvent.metaKey)&&pEvent.key==='b'){pEvent.preventDefault();pView.applyFormatting(pSegmentIndex,'bold');return true;}// Ctrl/Cmd + I = italic
if((pEvent.ctrlKey||pEvent.metaKey)&&pEvent.key==='i'){pEvent.preventDefault();pView.applyFormatting(pSegmentIndex,'italic');return true;}// Ctrl/Cmd + E = inline code
if((pEvent.ctrlKey||pEvent.metaKey)&&pEvent.key==='e'){pEvent.preventDefault();pView.applyFormatting(pSegmentIndex,'code');return true;}},paste:(pEvent,pEditorView)=>{// Check clipboard for image data
let tmpItems=pEvent.clipboardData&&pEvent.clipboardData.items;if(!tmpItems){return false;}for(let i=0;i<tmpItems.length;i++){if(tmpItems[i].type.startsWith('image/')){pEvent.preventDefault();let tmpFile=tmpItems[i].getAsFile();if(tmpFile){pView._processImageFile(tmpFile,pSegmentIndex);}return true;}}return false;},drop:(pEvent,pEditorView)=>{// Intercept image file drops at the CodeMirror level to prevent
// the browser from inserting the image as a raw DOM element.
// Without this, both CodeMirror's default drop behavior AND the
// container-level handler fire, causing rendering artifacts.
if(pView._dragSourceIndex>=0){return false;// segment-reorder drag, not a file drop
}if(!pEvent.dataTransfer||!pEvent.dataTransfer.files||pEvent.dataTransfer.files.length<1){return false;}let tmpFile=pEvent.dataTransfer.files[0];if(tmpFile.type&&tmpFile.type.startsWith('image/')){pEvent.preventDefault();pEvent.stopPropagation();pView._processImageFile(tmpFile,pSegmentIndex);// Clean up the dragover visual indicator on the container
let tmpContainer=pEditorView.dom.closest('.pict-mde-segment-editor');if(tmpContainer){tmpContainer.classList.remove('pict-mde-image-dragover');}return true;}return false;}}));// Add consumer-provided extensions (e.g. basicSetup, markdown())
if(tmpCM.extensions&&Array.isArray(tmpCM.extensions)){tmpExtensions=tmpExtensions.concat(tmpCM.extensions);}// Update listener for content changes, focus, and cursor tracking
tmpExtensions.push(tmpCM.EditorView.updateListener.of(pUpdate=>{if(pUpdate.docChanged){pView._onSegmentContentChange(pSegmentIndex,pUpdate.state.doc.toString());}// Track focus changes to toggle the active class
if(pUpdate.focusChanged){if(pUpdate.view.hasFocus){pView._setActiveSegment(pSegmentIndex);// Position sidebar at cursor on focus
pView._updateSidebarPosition(pSegmentIndex);}else{// Small delay so clicking a sidebar button doesn't immediately deactivate
setTimeout(()=>{if(pView._activeSegmentIndex===pSegmentIndex){// Check if focus moved to another segment or truly left
let tmpSegEl=document.getElementById(`PictMDE-Segment-${pSegmentIndex}`);if(tmpSegEl&&!tmpSegEl.contains(document.activeElement)){pView._clearActiveSegment(pSegmentIndex);pView._resetSidebarPosition(pSegmentIndex);}}},100);}}// Track cursor/selection changes to move the sidebar
if(pUpdate.selectionSet&&pUpdate.view.hasFocus){pView._updateSidebarPosition(pSegmentIndex);}}));// Collapse long data URIs in image markdown so the editor is readable
let tmpCollapseExtension=pView._buildDataURICollapseExtension();if(tmpCollapseExtension){tmpExtensions.push(tmpCollapseExtension);}// Make read-only if configured
if(pView.options.ReadOnly){tmpExtensions.push(tmpCM.EditorState.readOnly.of(true));tmpExtensions.push(tmpCM.EditorView.editable.of(false));}// Allow consumer to customize extensions
tmpExtensions=pView.customConfigureExtensions(tmpExtensions,pSegmentIndex);let tmpState=tmpCM.EditorState.create({doc:pContent||'',extensions:tmpExtensions});let tmpEditorView=new tmpCM.EditorView({state:tmpState,parent:pContainer});pView._segmentEditors[pSegmentIndex]=tmpEditorView;// -- Inter-segment arrow-key navigation --
// Use a capture-phase DOM listener so we intercept ArrowDown/ArrowUp
// BEFORE CodeMirror's internal keymap handlers process them.
tmpEditorView.contentDOM.addEventListener('keydown',function(pEvent){if(pEvent.key!=='ArrowDown'&&pEvent.key!=='ArrowUp'){return;}// Don't interfere if a modifier key is held (selection, etc.)
if(pEvent.shiftKey||pEvent.ctrlKey||pEvent.metaKey||pEvent.altKey){return;}let tmpState=tmpEditorView.state;let tmpCursorPos=tmpState.selection.main.head;let tmpLine=tmpState.doc.lineAt(tmpCursorPos);let tmpColumnOffset=tmpCursorPos-tmpLine.from;if(pEvent.key==='ArrowDown'){// Only navigate when cursor is on the very last line
if(tmpLine.to<tmpState.doc.length){return;// not on last line — let CM handle it
}// Find next segment
let tmpOrderedIndices=pView._getOrderedSegmentIndices();let tmpLogicalIndex=pView._getLogicalIndex(pSegmentIndex);if(tmpLogicalIndex<0||tmpLogicalIndex>=tmpOrderedIndices.length-1){return;// last segment — nowhere to go
}let tmpNextInternalIndex=tmpOrderedIndices[tmpLogicalIndex+1];let tmpNextEditor=pView._segmentEditors[tmpNextInternalIndex];if(!tmpNextEditor){return;}pEvent.preventDefault();pEvent.stopPropagation();// Focus the next editor and place cursor on the first line
let tmpFirstLine=tmpNextEditor.state.doc.line(1);let tmpTargetCol=Math.min(tmpColumnOffset,tmpFirstLine.to-tmpFirstLine.from);tmpNextEditor.focus();tmpNextEditor.dispatch({selection:{anchor:tmpFirstLine.from+tmpTargetCol}});pView._setActiveSegment(tmpNextInternalIndex);}else if(pEvent.key==='ArrowUp'){// Only navigate when cursor is on the very first line
if(tmpLine.number>1){return;// not on first line — let CM handle it
}// Find previous segment
let tmpOrderedIndices=pView._getOrderedSegmentIndices();let tmpLogicalIndex=pView._getLogicalIndex(pSegmentIndex);if(tmpLogicalIndex<=0){return;// first segment — nowhere to go
}let tmpPrevInternalIndex=tmpOrderedIndices[tmpLogicalIndex-1];let tmpPrevEditor=pView._segmentEditors[tmpPrevInternalIndex];if(!tmpPrevEditor){return;}pEvent.preventDefault();pEvent.stopPropagation();// Focus the previous editor and place cursor on the last line
let tmpLastLine=tmpPrevEditor.state.doc.line(tmpPrevEditor.state.doc.lines);let tmpTargetCol=Math.min(tmpColumnOffset,tmpLastLine.to-tmpLastLine.from);tmpPrevEditor.focus();tmpPrevEditor.dispatch({selection:{anchor:tmpLastLine.from+tmpTargetCol}});pView._setActiveSegment(tmpPrevInternalIndex);}},true);// <-- capture phase
// -- Capture-phase drop listener for image files --
// Safari processes native contenteditable drops before CodeMirror's
// bubble-phase domEventHandlers fire, which can insert a raw <img>
// element into the editor DOM.  A capture-phase listener fires first
// and lets us preventDefault() before the browser acts.
tmpEditorView.contentDOM.addEventListener('drop',function(pEvent){if(pView._dragSourceIndex>=0){return;// segment-reorder drag
}if(!pEvent.dataTransfer||!pEvent.dataTransfer.files||pEvent.dataTransfer.files.length<1){return;}let tmpFile=pEvent.dataTransfer.files[0];if(tmpFile.type&&tmpFile.type.startsWith('image/')){pEvent.preventDefault();pEvent.stopPropagation();pView._processImageFile(tmpFile,pSegmentIndex);// Clean up the dragover visual indicator
let tmpEditorEl=document.getElementById(`PictMDE-SegmentEditor-${pSegmentIndex}`);if(tmpEditorEl){tmpEditorEl.classList.remove('pict-mde-image-dragover');}}},true);// <-- capture phase
};/**
	 * Build a CodeMirror extension that visually collapses long data URIs
	 * inside markdown image syntax.
	 *
	 * The extension uses Decoration.replace() to hide the long base64 portion
	 * and show a compact widget instead, e.g. "data:image/jpeg;base64...28KB".
	 * The actual document content is unchanged -- only the visual display
	 * is affected.
	 *
	 * Returns null if the required CodeMirror modules (Decoration, ViewPlugin,
	 * WidgetType) are not available.
	 *
	 * @returns {object|null} A CodeMirror ViewPlugin extension, or null
	 */pView._buildDataURICollapseExtension=function _buildDataURICollapseExtension(){let tmpCM=pView._codeMirrorModules;// All three classes are required -- degrade gracefully if not available
if(!tmpCM||!tmpCM.Decoration||!tmpCM.ViewPlugin||!tmpCM.WidgetType){return null;}let tmpDecoration=tmpCM.Decoration;let tmpViewPlugin=tmpCM.ViewPlugin;let tmpWidgetType=tmpCM.WidgetType;// Minimum data URI length before collapsing (short URIs are left alone)
let tmpMinLength=200;// Widget class: renders the collapsed placeholder inline
class DataURIWidget extends tmpWidgetType{constructor(pLabel){super();this.label=pLabel;}toDOM(){let tmpSpan=document.createElement('span');tmpSpan.className='pict-mde-data-uri-collapsed';tmpSpan.textContent=this.label;tmpSpan.title='Data URI (click to expand in image preview below)';return tmpSpan;}eq(pOther){return this.label===pOther.label;}}/**
		 * Scan the visible ranges of the document for data URIs inside image
		 * markdown and build a DecorationSet that replaces the long portion.
		 *
		 * Pattern:  ![alt](data:image/TYPE;base64,LONGSTRING)
		 *
		 * We keep "![alt](data:image/TYPE;base64," visible and replace only the
		 * long base64 payload plus the closing ")" with a compact widget.
		 */function buildDecorations(pEditorView){let tmpDecorations=[];let tmpDoc=pEditorView.state.doc;for(let tmpVisRange of pEditorView.visibleRanges){let tmpFrom=tmpVisRange.from;let tmpTo=tmpVisRange.to;let tmpText=tmpDoc.sliceString(tmpFrom,tmpTo);// Match: ![...](data:image/...;base64,...) -- we need positions of the base64 payload
let tmpRegex=/!\[[^\]]*\]\(data:([^;]+);base64,/g;let tmpMatch;while((tmpMatch=tmpRegex.exec(tmpText))!==null){// tmpMatch[0] is "![alt](data:image/png;base64,"
// tmpMatch[1] is the MIME subtype, e.g. "image/png"
let tmpPayloadStart=tmpFrom+tmpMatch.index+tmpMatch[0].length;// Find the closing parenthesis -- scan forward from payloadStart
let tmpPayloadEnd=-1;let tmpSearchFrom=tmpPayloadStart;let tmpDocLength=tmpDoc.length;// Scan character by character in the document for the closing ')'
// We need to handle this carefully since the payload could be huge
// and span beyond the visible range.
// Search up to 5MB worth of characters (way more than any realistic image).
let tmpMaxScan=Math.min(tmpDocLength,tmpSearchFrom+5*1024*1024);let tmpChunkSize=4096;for(let tmpPos=tmpSearchFrom;tmpPos<tmpMaxScan;tmpPos+=tmpChunkSize){let tmpEnd=Math.min(tmpPos+tmpChunkSize,tmpMaxScan);let tmpChunk=tmpDoc.sliceString(tmpPos,tmpEnd);let tmpParenIdx=tmpChunk.indexOf(')');if(tmpParenIdx>=0){tmpPayloadEnd=tmpPos+tmpParenIdx;break;}}if(tmpPayloadEnd<0){// No closing paren found -- skip this match
continue;}// Calculate the payload length (base64 data between comma and closing paren)
let tmpPayloadLength=tmpPayloadEnd-tmpPayloadStart;if(tmpPayloadLength<tmpMinLength){// Too short to bother collapsing
continue;}// Build a human-readable size label
let tmpSizeBytes=Math.round(tmpPayloadLength*0.75);// base64 to bytes approx
let tmpSizeLabel;if(tmpSizeBytes>=1024*1024){tmpSizeLabel=(tmpSizeBytes/(1024*1024)).toFixed(1)+'MB';}else if(tmpSizeBytes>=1024){tmpSizeLabel=Math.round(tmpSizeBytes/1024)+'KB';}else{tmpSizeLabel=tmpSizeBytes+'B';}let tmpMimeType=tmpMatch[1]||'image';let tmpWidgetLabel=`\u2026${tmpSizeLabel})`;// Replace from the start of the base64 payload to after the closing paren
let tmpWidget=tmpDecoration.replace({widget:new DataURIWidget(tmpWidgetLabel)});tmpDecorations.push(tmpWidget.range(tmpPayloadStart,tmpPayloadEnd+1));}}return tmpDecoration.set(tmpDecorations,true);}// Create the ViewPlugin
let tmpPlugin=tmpViewPlugin.fromClass(class{constructor(pEditorView){this.decorations=buildDecorations(pEditorView);}update(pUpdate){if(pUpdate.docChanged||pUpdate.viewportChanged){this.decorations=buildDecorations(pUpdate.view);}}},{decorations:pPlugin=>pPlugin.decorations});return tmpPlugin;};};},{}],16:[function(require,module,exports){/**
 * Pict-MDE-DragAndReorder: Helper module for PictSectionMarkdownEditor
 *
 * Handles segment drag-and-drop reordering, active segment management,
 * sidebar cursor-tracking positioning, and hidden-preview state maintenance
 * across reorder operations.
 *//**
 * Attach drag/reorder and active-segment methods to the view instance.
 *
 * @param {object} pView - The PictSectionMarkdownEditor instance
 */module.exports.attach=function attach(pView){/**
	 * Wire drag-and-drop events on a segment element for reorder via the drag handle.
	 *
	 * @param {HTMLElement} pSegmentElement - The .pict-mde-segment element
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._wireSegmentDragEvents=function _wireSegmentDragEvents(pSegmentElement,pSegmentIndex){let tmpHandle=pSegmentElement.querySelector('.pict-mde-drag-handle');if(!tmpHandle){return;}// The drag handle is the draggable element
tmpHandle.addEventListener('dragstart',pEvent=>{pView._dragSourceIndex=pSegmentIndex;pEvent.dataTransfer.effectAllowed='move';pEvent.dataTransfer.setData('text/plain',String(pSegmentIndex));// Add a dragging class to the container so CSS can disable pointer-events
// on CodeMirror editors (preventing them from intercepting the drop event)
let tmpContainerEl=pView._getContainerElement();if(tmpContainerEl){tmpContainerEl.classList.add('pict-mde-dragging');}setTimeout(()=>{pSegmentElement.style.opacity='0.4';},0);});tmpHandle.addEventListener('dragend',()=>{pSegmentElement.style.opacity='';pView._dragSourceIndex=-1;pView._clearAllDropIndicators();// Remove the dragging class from the container
let tmpContainerEl=pView._getContainerElement();if(tmpContainerEl){tmpContainerEl.classList.remove('pict-mde-dragging');}});// Drop target: the whole segment row. We determine above/below from mouse Y.
pSegmentElement.addEventListener('dragover',pEvent=>{pEvent.preventDefault();pEvent.dataTransfer.dropEffect='move';// Clear all indicators first, then set the correct one
pView._clearAllDropIndicators();// Determine if cursor is in the top or bottom half of this segment
let tmpRect=pSegmentElement.getBoundingClientRect();let tmpMidY=tmpRect.top+tmpRect.height/2;if(pEvent.clientY<tmpMidY){pSegmentElement.classList.add('pict-mde-drag-over-top');}else{pSegmentElement.classList.add('pict-mde-drag-over-bottom');}});pSegmentElement.addEventListener('dragleave',pEvent=>{// Only clear if we're actually leaving the element (not entering a child)
if(!pSegmentElement.contains(pEvent.relatedTarget)){pSegmentElement.classList.remove('pict-mde-drag-over-top');pSegmentElement.classList.remove('pict-mde-drag-over-bottom');}});pSegmentElement.addEventListener('drop',pEvent=>{pEvent.preventDefault();let tmpDropBelow=pSegmentElement.classList.contains('pict-mde-drag-over-bottom');pView._clearAllDropIndicators();let tmpSourceIndex=pView._dragSourceIndex;if(tmpSourceIndex<0||tmpSourceIndex===pSegmentIndex){return;}pView._reorderSegment(tmpSourceIndex,pSegmentIndex,tmpDropBelow);});};/**
	 * Clear all drop indicator classes from all segments.
	 */pView._clearAllDropIndicators=function _clearAllDropIndicators(){let tmpContainer=pView._getContainerElement();if(!tmpContainer){return;}let tmpAllSegments=tmpContainer.querySelectorAll('.pict-mde-segment');for(let i=0;i<tmpAllSegments.length;i++){tmpAllSegments[i].classList.remove('pict-mde-drag-over-top');tmpAllSegments[i].classList.remove('pict-mde-drag-over-bottom');}};/**
	 * Reorder a segment from one position to another via drag.
	 *
	 * @param {number} pFromInternalIndex - The internal index of the dragged segment
	 * @param {number} pToInternalIndex - The internal index of the drop target
	 * @param {boolean} pDropBelow - Whether the drop was on the bottom half of the target
	 */pView._reorderSegment=function _reorderSegment(pFromInternalIndex,pToInternalIndex,pDropBelow){let tmpFromLogical=pView._getLogicalIndex(pFromInternalIndex);let tmpToLogical=pView._getLogicalIndex(pToInternalIndex);if(tmpFromLogical<0||tmpToLogical<0){pView.log.warn(`PICT-MarkdownEditor _reorderSegment: could not resolve logical indices (from=${tmpFromLogical}, to=${tmpToLogical}).`);return;}if(tmpFromLogical===tmpToLogical){return;}// Marshal all editor content back to data before manipulating the array
pView._marshalAllEditorsToData();let tmpSegments=pView._getSegmentsFromData();if(!tmpSegments||tmpSegments.length<2){return;}// Calculate the target insertion index
let tmpInsertAt=pDropBelow?tmpToLogical+1:tmpToLogical;// Adjust for the removal shifting indices down
if(tmpFromLogical<tmpInsertAt){tmpInsertAt--;}// If the insert position equals the source, no move needed
if(tmpInsertAt===tmpFromLogical){return;}// Perform the reorder: remove from old position, insert at new
let tmpMoved=tmpSegments.splice(tmpFromLogical,1)[0];tmpSegments.splice(tmpInsertAt,0,tmpMoved);// Explicitly write the reordered array back to the data address
pView._setSegmentsToData(tmpSegments);// Reorder per-segment hidden preview state to follow the moved segment
pView._reorderHiddenPreviewState(tmpFromLogical,tmpInsertAt);pView._buildEditorUI();};/**
	 * Reorder the hidden preview state after a splice-based move
	 * (remove from pFrom, insert at pTo).
	 *
	 * @param {number} pFrom - The logical index the segment was removed from
	 * @param {number} pTo - The logical index the segment was inserted at
	 */pView._reorderHiddenPreviewState=function _reorderHiddenPreviewState(pFrom,pTo){if(pFrom===pTo){return;}// Build an ordered array of hidden-state booleans
let tmpKeys=Object.keys(pView._hiddenPreviewSegments).map(k=>parseInt(k,10));if(tmpKeys.length===0){return;}let tmpMaxIndex=Math.max(...tmpKeys,pFrom,pTo);let tmpStates=[];for(let i=0;i<=tmpMaxIndex;i++){tmpStates.push(!!pView._hiddenPreviewSegments[i]);}// Perform the same splice on the states array
let tmpMovedState=tmpStates.splice(pFrom,1)[0];tmpStates.splice(pTo,0,tmpMovedState);// Rebuild the hidden map
pView._hiddenPreviewSegments={};for(let i=0;i<tmpStates.length;i++){if(tmpStates[i]){pView._hiddenPreviewSegments[i]=true;}}};/**
	 * Swap the hidden preview state of two logical indices.
	 * Used when moveSegmentUp/Down swaps adjacent segments.
	 *
	 * @param {number} pIndexA - First logical index
	 * @param {number} pIndexB - Second logical index
	 */pView._swapHiddenPreviewState=function _swapHiddenPreviewState(pIndexA,pIndexB){let tmpAHidden=!!pView._hiddenPreviewSegments[pIndexA];let tmpBHidden=!!pView._hiddenPreviewSegments[pIndexB];if(tmpBHidden){pView._hiddenPreviewSegments[pIndexA]=true;}else{delete pView._hiddenPreviewSegments[pIndexA];}if(tmpAHidden){pView._hiddenPreviewSegments[pIndexB]=true;}else{delete pView._hiddenPreviewSegments[pIndexB];}};// -- Active Segment Management --
/**
	 * Set a segment as the active (focused) segment.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._setActiveSegment=function _setActiveSegment(pSegmentIndex){// Clear previous active
if(pView._activeSegmentIndex>=0&&pView._activeSegmentIndex!==pSegmentIndex){let tmpPrevEl=document.getElementById(`PictMDE-Segment-${pView._activeSegmentIndex}`);if(tmpPrevEl){tmpPrevEl.classList.remove('pict-mde-active');}}pView._activeSegmentIndex=pSegmentIndex;let tmpSegEl=document.getElementById(`PictMDE-Segment-${pSegmentIndex}`);if(tmpSegEl){tmpSegEl.classList.add('pict-mde-active');}};/**
	 * Clear the active state from a segment (on blur).
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._clearActiveSegment=function _clearActiveSegment(pSegmentIndex){if(pView._activeSegmentIndex===pSegmentIndex){pView._activeSegmentIndex=-1;}let tmpSegEl=document.getElementById(`PictMDE-Segment-${pSegmentIndex}`);if(tmpSegEl){tmpSegEl.classList.remove('pict-mde-active');}// Reset sidebar back to sticky when segment is no longer active
pView._resetSidebarPosition(pSegmentIndex);};// -- Sidebar Cursor Tracking --
/**
	 * Update the sidebar formatting-buttons position so they float next to the
	 * cursor / selection in the active segment.
	 *
	 * When a segment is active and has a cursor, we switch the sidebar-actions
	 * from sticky positioning to absolute, offset to align with the cursor line.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._updateSidebarPosition=function _updateSidebarPosition(pSegmentIndex){let tmpSegmentEl=document.getElementById(`PictMDE-Segment-${pSegmentIndex}`);if(!tmpSegmentEl){return;}let tmpQuadrantTR=tmpSegmentEl.querySelector('.pict-mde-quadrant-tr');if(!tmpQuadrantTR){return;}let tmpEditor=pView._segmentEditors[pSegmentIndex];if(!tmpEditor){return;}// Get the cursor position in the editor
let tmpCursorPos=tmpEditor.state.selection.main.head;let tmpCursorCoords=tmpEditor.coordsAtPos(tmpCursorPos);if(!tmpCursorCoords){// If we can't get coords, revert to sticky
pView._resetSidebarPosition(pSegmentIndex);return;}// Calculate the offset relative to the segment element
let tmpSegmentRect=tmpSegmentEl.getBoundingClientRect();let tmpOffsetTop=tmpCursorCoords.top-tmpSegmentRect.top;// Clamp so the sidebar buttons don't go above the segment or below it
let tmpSidebarHeight=tmpQuadrantTR.offsetHeight||0;let tmpSegmentHeight=tmpSegmentEl.offsetHeight||0;let tmpMaxOffset=Math.max(0,tmpSegmentHeight-tmpSidebarHeight);tmpOffsetTop=Math.max(0,Math.min(tmpOffsetTop,tmpMaxOffset));// Apply the cursor-relative positioning
tmpQuadrantTR.classList.add('pict-mde-sidebar-at-cursor');tmpQuadrantTR.style.setProperty('--pict-mde-sidebar-top',`${tmpOffsetTop}px`);};/**
	 * Reset the sidebar back to default sticky positioning (no cursor tracking).
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._resetSidebarPosition=function _resetSidebarPosition(pSegmentIndex){let tmpSegmentEl=document.getElementById(`PictMDE-Segment-${pSegmentIndex}`);if(!tmpSegmentEl){return;}let tmpQuadrantTR=tmpSegmentEl.querySelector('.pict-mde-quadrant-tr');if(!tmpQuadrantTR){return;}tmpQuadrantTR.classList.remove('pict-mde-sidebar-at-cursor');tmpQuadrantTR.style.removeProperty('--pict-mde-sidebar-top');};};},{}],17:[function(require,module,exports){/**
 * Pict-MDE-Formatting: Helper module for PictSectionMarkdownEditor
 *
 * Handles markdown formatting operations (bold, italic, code, heading, link)
 * applied to selections or at the cursor position in CodeMirror editors.
 */// Markdown formatting definitions: wrapper characters for toggle-style formatting
const _FormattingMap={bold:{wrap:'**'},italic:{wrap:'*'},code:{wrap:'`'},heading:{prefix:'# '},link:{before:'[',after:'](url)'}};/**
 * Attach formatting methods to the view instance.
 *
 * @param {object} pView - The PictSectionMarkdownEditor instance
 */module.exports.attach=function attach(pView){/**
	 * Apply markdown formatting to the selection (or insert formatting at cursor)
	 * in a specific segment.
	 *
	 * If text is selected, wraps it.  If no selection, inserts the formatting
	 * markers and places the cursor between them.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 * @param {string} pFormatType - One of: 'bold', 'italic', 'code', 'heading', 'link'
	 */pView.applyFormatting=function applyFormatting(pSegmentIndex,pFormatType){let tmpEditor=pView._segmentEditors[pSegmentIndex];if(!tmpEditor){pView.log.warn(`PICT-MarkdownEditor applyFormatting: no editor for segment ${pSegmentIndex}.`);return;}let tmpFormat=_FormattingMap[pFormatType];if(!tmpFormat){pView.log.warn(`PICT-MarkdownEditor applyFormatting: unknown format type "${pFormatType}".`);return;}let tmpState=tmpEditor.state;let tmpSelection=tmpState.selection.main;let tmpFrom=tmpSelection.from;let tmpTo=tmpSelection.to;let tmpHasSelection=tmpFrom!==tmpTo;let tmpSelectedText=tmpHasSelection?tmpState.sliceDoc(tmpFrom,tmpTo):'';let tmpChanges;let tmpCursorPos;if(tmpFormat.wrap){// Toggle-style: wrap selection or insert empty wrapper
let tmpWrap=tmpFormat.wrap;if(tmpHasSelection){// Check if already wrapped — if so, unwrap
let tmpBefore=tmpState.sliceDoc(Math.max(0,tmpFrom-tmpWrap.length),tmpFrom);let tmpAfter=tmpState.sliceDoc(tmpTo,Math.min(tmpState.doc.length,tmpTo+tmpWrap.length));if(tmpBefore===tmpWrap&&tmpAfter===tmpWrap){// Unwrap
tmpChanges=[{from:tmpFrom-tmpWrap.length,to:tmpFrom,insert:''},{from:tmpTo,to:tmpTo+tmpWrap.length,insert:''}];tmpCursorPos=tmpFrom-tmpWrap.length;tmpEditor.dispatch({changes:tmpChanges,selection:{anchor:tmpCursorPos,head:tmpCursorPos+tmpSelectedText.length}});return;}// Wrap the selection
let tmpInsert=tmpWrap+tmpSelectedText+tmpWrap;tmpChanges={from:tmpFrom,to:tmpTo,insert:tmpInsert};tmpCursorPos=tmpFrom+tmpWrap.length;tmpEditor.dispatch({changes:tmpChanges,selection:{anchor:tmpCursorPos,head:tmpCursorPos+tmpSelectedText.length}});}else{// No selection: insert empty wrapper and place cursor inside
let tmpInsert=tmpWrap+tmpWrap;tmpChanges={from:tmpFrom,insert:tmpInsert};tmpCursorPos=tmpFrom+tmpWrap.length;tmpEditor.dispatch({changes:tmpChanges,selection:{anchor:tmpCursorPos}});}}else if(tmpFormat.prefix){// Line-prefix style (headings)
let tmpLine=tmpState.doc.lineAt(tmpFrom);let tmpLineText=tmpLine.text;// Toggle: if line already starts with the prefix, remove it; otherwise add
if(tmpLineText.startsWith(tmpFormat.prefix)){tmpChanges={from:tmpLine.from,to:tmpLine.from+tmpFormat.prefix.length,insert:''};}else{tmpChanges={from:tmpLine.from,insert:tmpFormat.prefix};}tmpEditor.dispatch({changes:tmpChanges});}else if(tmpFormat.before&&tmpFormat.after){// Surround style (links)
if(tmpHasSelection){let tmpInsert=tmpFormat.before+tmpSelectedText+tmpFormat.after;tmpChanges={from:tmpFrom,to:tmpTo,insert:tmpInsert};// Place cursor on the "url" part
tmpCursorPos=tmpFrom+tmpFormat.before.length+tmpSelectedText.length+2;tmpEditor.dispatch({changes:tmpChanges,selection:{anchor:tmpCursorPos,head:tmpCursorPos+3}});}else{let tmpInsert=tmpFormat.before+tmpFormat.after;tmpChanges={from:tmpFrom,insert:tmpInsert};tmpCursorPos=tmpFrom+tmpFormat.before.length;tmpEditor.dispatch({changes:tmpChanges,selection:{anchor:tmpCursorPos}});}}// Re-focus the editor after clicking a sidebar button
tmpEditor.focus();};};},{}],18:[function(require,module,exports){/**
 * Pict-MDE-ImageHandling: Helper module for PictSectionMarkdownEditor
 *
 * Handles image operations: file picker, file processing (hook or base64
 * fallback), markdown insertion, preview thumbnail rendering, and
 * drag-and-drop for image files onto the editor.
 *//**
 * Attach image handling methods to the view instance.
 *
 * @param {object} pView - The PictSectionMarkdownEditor instance
 */module.exports.attach=function attach(pView){/**
	 * Open a file picker to select an image for insertion into a segment.
	 * Called by the sidebar image button onclick handler.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView.openImagePicker=function openImagePicker(pSegmentIndex){let tmpFileInput=document.getElementById(`PictMDE-ImageInput-${pSegmentIndex}`);if(!tmpFileInput){pView.log.warn(`PICT-MarkdownEditor openImagePicker: file input not found for segment ${pSegmentIndex}.`);return;}// Wire the change handler fresh each time (in case it was already used)
tmpFileInput.onchange=()=>{if(tmpFileInput.files&&tmpFileInput.files.length>0){pView._processImageFile(tmpFileInput.files[0],pSegmentIndex);}// Reset the input so the same file can be re-selected
tmpFileInput.value='';};tmpFileInput.click();};/**
	 * Process an image File object from any input method (picker, drag, paste).
	 *
	 * If the consumer has overridden onImageUpload and it returns true, the
	 * consumer handles the upload and calls the callback with a URL.
	 * Otherwise, the image is converted to a base64 data URI inline.
	 *
	 * @param {File} pFile - The image File object
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._processImageFile=function _processImageFile(pFile,pSegmentIndex){if(!pFile||!pFile.type||!pFile.type.startsWith('image/')){pView.log.warn(`PICT-MarkdownEditor _processImageFile: not an image file (type: ${pFile?pFile.type:'null'}).`);return;}let tmpAltText=pFile.name?pFile.name.replace(/\.[^.]+$/,''):'image';// Check if the consumer wants to handle the upload
let tmpCallback=(pError,pURL)=>{if(pError){pView.log.error(`PICT-MarkdownEditor image upload error: ${pError}`);return;}if(pURL){pView._insertImageMarkdown(pSegmentIndex,pURL,tmpAltText);}};let tmpHandled=pView.onImageUpload(pFile,pSegmentIndex,tmpCallback);if(tmpHandled){// Consumer is handling the upload asynchronously
return;}// Default: convert to base64 data URI
if(typeof FileReader==='undefined'){pView.log.error(`PICT-MarkdownEditor _processImageFile: FileReader not available in this environment.`);return;}let tmpReader=new FileReader();tmpReader.onload=()=>{pView._insertImageMarkdown(pSegmentIndex,tmpReader.result,tmpAltText);};tmpReader.onerror=()=>{pView.log.error(`PICT-MarkdownEditor _processImageFile: FileReader error.`);};tmpReader.readAsDataURL(pFile);};/**
	 * Insert markdown image syntax at the cursor position in a segment editor.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 * @param {string} pURL - The image URL (data URI or remote URL)
	 * @param {string} [pAltText] - The alt text (default: 'image')
	 */pView._insertImageMarkdown=function _insertImageMarkdown(pSegmentIndex,pURL,pAltText){let tmpEditor=pView._segmentEditors[pSegmentIndex];if(!tmpEditor){pView.log.warn(`PICT-MarkdownEditor _insertImageMarkdown: no editor for segment ${pSegmentIndex}.`);return;}let tmpAlt=pAltText||'image';let tmpInsert=`![${tmpAlt}](${pURL})`;let tmpState=tmpEditor.state;let tmpCursorPos=tmpState.selection.main.head;tmpEditor.dispatch({changes:{from:tmpCursorPos,insert:tmpInsert},selection:{anchor:tmpCursorPos+tmpInsert.length}});tmpEditor.focus();// Update the image preview area for this segment
pView._updateImagePreviews(pSegmentIndex);};/**
	 * Scan the content of a segment for markdown image references and render
	 * preview thumbnails in the preview area below the editor.
	 *
	 * Matches the pattern ![alt](url) and creates <img> elements for each.
	 * The preview area is hidden when there are no images.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._updateImagePreviews=function _updateImagePreviews(pSegmentIndex){let tmpPreviewEl=document.getElementById(`PictMDE-ImagePreview-${pSegmentIndex}`);if(!tmpPreviewEl){return;}let tmpEditor=pView._segmentEditors[pSegmentIndex];if(!tmpEditor){tmpPreviewEl.innerHTML='';tmpPreviewEl.classList.remove('pict-mde-has-images');return;}let tmpContent=tmpEditor.state.doc.toString();// Match markdown image syntax: ![alt text](url)
let tmpImageRegex=/!\[([^\]]*)\]\(([^)]+)\)/g;let tmpMatches=[];let tmpMatch;while((tmpMatch=tmpImageRegex.exec(tmpContent))!==null){tmpMatches.push({alt:tmpMatch[1]||'image',url:tmpMatch[2]});}if(tmpMatches.length===0){tmpPreviewEl.innerHTML='';tmpPreviewEl.classList.remove('pict-mde-has-images');return;}// Build preview HTML
let tmpHTML='';for(let i=0;i<tmpMatches.length;i++){let tmpAlt=tmpMatches[i].alt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');let tmpResolvedURL=pView._resolveImageURL(tmpMatches[i].url);let tmpURL=tmpResolvedURL.replace(/&/g,'&amp;').replace(/"/g,'&quot;');tmpHTML+=`<div class="pict-mde-image-preview-item"><img src="${tmpURL}" alt="${tmpAlt}" /><span class="pict-mde-image-preview-label">${tmpAlt}</span></div>`;}tmpPreviewEl.innerHTML=tmpHTML;tmpPreviewEl.classList.add('pict-mde-has-images');};/**
	 * Wire drag-and-drop events for image files on a segment editor container.
	 *
	 * These events are separate from the segment-reorder drag events.
	 * File drags are distinguished from segment reorder drags by checking
	 * dataTransfer.types for 'Files' and ensuring _dragSourceIndex is -1.
	 *
	 * @param {HTMLElement} pEditorContainer - The .pict-mde-segment-editor element
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._wireImageDragEvents=function _wireImageDragEvents(pEditorContainer,pSegmentIndex){pEditorContainer.addEventListener('dragover',pEvent=>{// Only handle file drags, not segment-reorder drags
if(pView._dragSourceIndex>=0){return;}if(!pEvent.dataTransfer||!pEvent.dataTransfer.types||pEvent.dataTransfer.types.indexOf('Files')<0){return;}pEvent.preventDefault();pEvent.dataTransfer.dropEffect='copy';pEditorContainer.classList.add('pict-mde-image-dragover');});pEditorContainer.addEventListener('dragleave',pEvent=>{// Only clear if actually leaving the element
if(!pEditorContainer.contains(pEvent.relatedTarget)){pEditorContainer.classList.remove('pict-mde-image-dragover');}});pEditorContainer.addEventListener('drop',pEvent=>{pEditorContainer.classList.remove('pict-mde-image-dragover');// Only handle file drops, not segment-reorder drops
if(pView._dragSourceIndex>=0){return;}if(!pEvent.dataTransfer||!pEvent.dataTransfer.files||pEvent.dataTransfer.files.length<1){return;}let tmpFile=pEvent.dataTransfer.files[0];if(tmpFile.type&&tmpFile.type.startsWith('image/')){pEvent.preventDefault();pEvent.stopPropagation();pView._processImageFile(tmpFile,pSegmentIndex);}});};};},{}],19:[function(require,module,exports){/**
 * Pict-MDE-RichPreview: Helper module for PictSectionMarkdownEditor
 *
 * Handles rich content preview rendering via pict-section-content:
 * markdown-to-HTML parsing, mermaid diagram rendering, KaTeX math
 * rendering, and the full rendered-view toggle.
 */const libPictSectionContent=require('pict-section-content');const libPictContentProvider=libPictSectionContent.PictContentProvider;/**
 * Attach rich preview methods to the view instance.
 *
 * @param {object} pView - The PictSectionMarkdownEditor instance
 */module.exports.attach=function attach(pView){/**
	 * Get the pict-section-content provider instance for markdown parsing.
	 * Lazily instantiated on first use.
	 *
	 * @returns {object} The PictContentProvider instance
	 */pView._getContentProvider=function _getContentProvider(){if(!pView._contentProvider){pView._contentProvider=new libPictContentProvider(pView.fable,{},'Pict-Content-Provider-MDE');}return pView._contentProvider;};/**
	 * Render the raw markdown content of a segment into the rich preview area
	 * using pict-section-content's parseMarkdown() provider method.
	 *
	 * The rendered HTML includes syntax-highlighted code blocks, mermaid diagram
	 * placeholders, KaTeX math placeholders, headings, lists, tables, etc.
	 *
	 * After setting innerHTML, post-render hooks call mermaid.run() and
	 * katex.render() to activate diagrams and equations (if those libraries
	 * are available on window -- loaded by the consumer via CDN).
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */pView._updateRichPreviews=function _updateRichPreviews(pSegmentIndex){if(!pView.options.EnableRichPreview){return;}let tmpPreviewEl=document.getElementById(`PictMDE-RichPreview-${pSegmentIndex}`);if(!tmpPreviewEl){return;}let tmpEditor=pView._segmentEditors[pSegmentIndex];if(!tmpEditor){tmpPreviewEl.innerHTML='';tmpPreviewEl.classList.remove('pict-mde-has-rich-preview');return;}let tmpContent=tmpEditor.state.doc.toString();if(!tmpContent||tmpContent.trim().length===0){tmpPreviewEl.innerHTML='';tmpPreviewEl.classList.remove('pict-mde-has-rich-preview');return;}// Use pict-section-content's provider to parse the raw markdown into HTML
let tmpProvider=pView._getContentProvider();let tmpRenderedHTML=tmpProvider.parseMarkdown(tmpContent);if(!tmpRenderedHTML||tmpRenderedHTML.trim().length===0){tmpPreviewEl.innerHTML='';tmpPreviewEl.classList.remove('pict-mde-has-rich-preview');return;}// Wrap the rendered HTML in a pict-content container so that
// pict-section-content's CSS classes take effect
let tmpPreviewID=`PictMDE-RichPreviewBody-${pSegmentIndex}`;tmpPreviewEl.innerHTML=`<div class="pict-content" id="${tmpPreviewID}">${tmpRenderedHTML}</div>`;tmpPreviewEl.classList.add('pict-mde-has-rich-preview');// Resolve relative image URLs in the rendered HTML using ImageBaseURL
if(pView.options.ImageBaseURL){let tmpImages=tmpPreviewEl.querySelectorAll('img');for(let i=0;i<tmpImages.length;i++){let tmpSrc=tmpImages[i].getAttribute('src');if(tmpSrc){let tmpResolved=pView._resolveImageURL(tmpSrc);if(tmpResolved!==tmpSrc){tmpImages[i].setAttribute('src',tmpResolved);}}}}// Bump generation counter for stale-render protection (mermaid is async)
let tmpGeneration=(pView._richPreviewGenerations[pSegmentIndex]||0)+1;pView._richPreviewGenerations[pSegmentIndex]=tmpGeneration;// Post-render: call mermaid.run() for mermaid diagram elements
pView._postRenderMermaid(tmpPreviewID,pSegmentIndex,tmpGeneration);// Post-render: call katex.render() for KaTeX math elements
pView._postRenderKaTeX(tmpPreviewID);};/**
	 * Post-render hook: render Mermaid diagrams in the preview container.
	 * Uses the same approach as pict-section-content's renderMermaidDiagrams().
	 *
	 * @param {string} pContainerID - The container element ID
	 * @param {number} pSegmentIndex - The segment index (for stale-render protection)
	 * @param {number} pGeneration - The generation counter value
	 */pView._postRenderMermaid=function _postRenderMermaid(pContainerID,pSegmentIndex,pGeneration){if(typeof mermaid==='undefined'){return;}let tmpContainer=document.getElementById(pContainerID);if(!tmpContainer){return;}let tmpMermaidElements=tmpContainer.querySelectorAll('pre.mermaid');if(tmpMermaidElements.length<1){return;}try{let tmpPromise=mermaid.run({nodes:tmpMermaidElements});if(tmpPromise&&typeof tmpPromise.catch==='function'){tmpPromise.catch(pError=>{// Check stale-render: rendered view uses _renderedViewGeneration,
// per-segment previews use _richPreviewGenerations
let tmpCurrentGen=pSegmentIndex===-1?pView._renderedViewGeneration:pView._richPreviewGenerations[pSegmentIndex];if(tmpCurrentGen!==pGeneration){return;// stale render -- a newer update has replaced us
}pView.log.warn(`PICT-MarkdownEditor mermaid render error: ${pError.message||pError}`);});}}catch(pError){pView.log.warn(`PICT-MarkdownEditor mermaid render error: ${pError.message||pError}`);}};/**
	 * Post-render hook: render KaTeX inline and display math in the preview container.
	 * Uses the same approach as pict-section-content's renderKaTeXEquations().
	 *
	 * @param {string} pContainerID - The container element ID
	 */pView._postRenderKaTeX=function _postRenderKaTeX(pContainerID){if(typeof katex==='undefined'){return;}let tmpContainer=document.getElementById(pContainerID);if(!tmpContainer){return;}// Render inline math: <span class="pict-content-katex-inline">
let tmpInlineElements=tmpContainer.querySelectorAll('.pict-content-katex-inline');for(let i=0;i<tmpInlineElements.length;i++){try{katex.render(tmpInlineElements[i].textContent,tmpInlineElements[i],{throwOnError:false,displayMode:false});}catch(pError){pView.log.warn(`PICT-MarkdownEditor KaTeX inline error: ${pError.message||pError}`);}}// Render display math: <div class="pict-content-katex-display">
let tmpDisplayElements=tmpContainer.querySelectorAll('.pict-content-katex-display');for(let i=0;i<tmpDisplayElements.length;i++){try{katex.render(tmpDisplayElements[i].textContent,tmpDisplayElements[i],{throwOnError:false,displayMode:true});}catch(pError){pView.log.warn(`PICT-MarkdownEditor KaTeX display error: ${pError.message||pError}`);}}};/**
	 * Simple HTML escape for error messages in the rich preview.
	 *
	 * @param {string} pText - The text to escape
	 * @returns {string}
	 */pView._escapeHTMLForPreview=function _escapeHTMLForPreview(pText){return pText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};// -- Rendered View (full document preview) --
/**
	 * Toggle between the editing view (CodeMirror segments) and a fully rendered
	 * view of the combined markdown output using pict-section-content.
	 *
	 * @param {boolean} [pRendered] - If provided, set to this value; otherwise toggle
	 */pView.toggleRenderedView=function toggleRenderedView(pRendered){if(typeof pRendered==='boolean'){pView._renderedViewActive=pRendered;}else{pView._renderedViewActive=!pView._renderedViewActive;}if(pView._renderedViewActive){pView._renderRenderedView();}else{pView._restoreEditingView();}};/**
	 * Switch to the rendered view: marshal all editors, combine all segment
	 * content, render to HTML via pict-section-content, and replace the
	 * container contents with the rendered output.
	 */pView._renderRenderedView=function _renderRenderedView(){let tmpContainer=pView._getContainerElement();if(!tmpContainer){return;}// Marshal current editor content back to data before switching
pView._marshalAllEditorsToData();// Combine all segments into a single markdown document
let tmpSegments=pView._getSegmentsFromData();let tmpCombinedContent='';if(tmpSegments&&tmpSegments.length>0){let tmpParts=[];for(let i=0;i<tmpSegments.length;i++){tmpParts.push(tmpSegments[i].Content||'');}tmpCombinedContent=tmpParts.join('\n\n');}// Destroy existing CodeMirror editors
for(let tmpIdx in pView._segmentEditors){if(pView._segmentEditors[tmpIdx]){pView._segmentEditors[tmpIdx].destroy();}}pView._segmentEditors={};// Render the combined markdown via pict-section-content
let tmpProvider=pView._getContentProvider();let tmpRenderedHTML=tmpProvider.parseMarkdown(tmpCombinedContent);// Build the rendered view container
let tmpRenderedViewID='PictMDE-RenderedView';tmpContainer.innerHTML=`<div class="pict-mde-rendered-view" id="${tmpRenderedViewID}"><div class="pict-content">${tmpRenderedHTML||''}</div></div>`;tmpContainer.classList.add('pict-mde-rendered-mode');// Resolve relative image URLs in the rendered HTML using ImageBaseURL
if(pView.options.ImageBaseURL){let tmpImages=tmpContainer.querySelectorAll('.pict-mde-rendered-view img');for(let i=0;i<tmpImages.length;i++){let tmpSrc=tmpImages[i].getAttribute('src');if(tmpSrc){let tmpResolved=pView._resolveImageURL(tmpSrc);if(tmpResolved!==tmpSrc){tmpImages[i].setAttribute('src',tmpResolved);}}}}// Bump generation for stale-render protection
pView._renderedViewGeneration++;let tmpGeneration=pView._renderedViewGeneration;// Post-render hooks for mermaid diagrams and KaTeX equations
let tmpContentContainer=tmpContainer.querySelector(`#${tmpRenderedViewID} .pict-content`);if(tmpContentContainer){let tmpContentID='PictMDE-RenderedViewContent';tmpContentContainer.id=tmpContentID;pView._postRenderMermaid(tmpContentID,-1,tmpGeneration);pView._postRenderKaTeX(tmpContentID);}};/**
	 * Switch back from rendered view to the editing view: rebuild the
	 * full editor UI from the data.
	 */pView._restoreEditingView=function _restoreEditingView(){let tmpContainer=pView._getContainerElement();if(!tmpContainer){return;}tmpContainer.classList.remove('pict-mde-rendered-mode');pView._buildEditorUI();};};},{"pict-section-content":12}],20:[function(require,module,exports){module.exports={"DefaultRenderable":"MarkdownEditor-Wrap","DefaultDestinationAddress":"#MarkdownEditor-Container-Div","Templates":[{"Hash":"MarkdownEditor-Container","Template":/*html*/`<div class="pict-mde" id="PictMDE-Container"></div>`},{"Hash":"MarkdownEditor-Segment","Template":/*html*/`<div class="pict-mde-segment" id="PictMDE-Segment-{~D:Record.SegmentIndex~}" data-segment-index="{~D:Record.SegmentIndex~}">
	<div class="pict-mde-left-controls">
		<div class="pict-mde-quadrant-tl"></div>
		<div class="pict-mde-quadrant-bl"></div>
	</div>
	<div class="pict-mde-drag-handle" draggable="true" title="Drag to reorder"></div>
	<div class="pict-mde-segment-body">
		<div class="pict-mde-segment-editor" id="PictMDE-SegmentEditor-{~D:Record.SegmentIndex~}"></div>
		<div class="pict-mde-image-preview" id="PictMDE-ImagePreview-{~D:Record.SegmentIndex~}"></div>
		<div class="pict-mde-rich-preview" id="PictMDE-RichPreview-{~D:Record.SegmentIndex~}"></div>
	</div>
	<div class="pict-mde-sidebar" id="PictMDE-Sidebar-{~D:Record.SegmentIndex~}">
		<div class="pict-mde-quadrant-tr"></div>
		<div class="pict-mde-quadrant-br"></div>
		<input type="file" accept="image/*" class="pict-mde-image-input" id="PictMDE-ImageInput-{~D:Record.SegmentIndex~}" style="display:none" />
	</div>
</div>`},{"Hash":"MarkdownEditor-AddSegment","Template":/*html*/`<div class="pict-mde-add-segment">
	<button type="button" class="pict-mde-btn-add" onclick="{~D:Record.ViewIdentifier~}.addSegment()">+ Add Segment</button>
</div>`}],"Renderables":[{"RenderableHash":"MarkdownEditor-Wrap","TemplateHash":"MarkdownEditor-Container","DestinationAddress":"#MarkdownEditor-Container-Div"}],"TargetElementAddress":"#MarkdownEditor-Container-Div",// Address in AppData to read/write the segments array
// The data at this address should be an array of objects, each with a "Content" property
// e.g. AppData.Document.Segments = [ { Content: "# Hello" }, { Content: "Some text" } ]
"ContentDataAddress":false,// Whether the editor should be read-only
"ReadOnly":false,// Whether to show rich content previews (rendered markdown with syntax-highlighted
// code, mermaid diagrams, KaTeX equations, tables, etc. via pict-section-content).
// Requires the consumer to load the mermaid and/or katex libraries via CDN
// for diagram/equation rendering; code highlighting works without CDN scripts.
"EnableRichPreview":true,// Base URL prepended to relative image URLs in image and rich previews.
// Set this to the directory-level path (e.g. "/content/") so that images
// referenced by filename in the markdown resolve correctly.
// Absolute URLs (starting with /, http://, https://, data:) are left as-is.
"ImageBaseURL":"",// ---- Quadrant button definitions ----
// Each quadrant is an array of button objects:
//   HTML   — innerHTML for the button
//   Action — method name, optionally "method:arg" (receives segment index as first param)
//   Class  — additional CSS class(es) appended to the base class
//   Title  — tooltip text
//
// Consumers can override any quadrant to add, remove, or reorder buttons.
// Left quadrant buttons (TL, BL) get the "pict-mde-left-btn" base class.
// Right quadrant buttons (TR, BR) get the "pict-mde-sidebar-btn" base class.
"ButtonsTL":[{"HTML":"&times;","Action":"removeSegment","Class":"pict-mde-btn-remove","Title":"Remove Segment"}],"ButtonsBL":[{"HTML":"&uarr;","Action":"moveSegmentUp","Class":"pict-mde-btn-move","Title":"Move Up"},{"HTML":"&darr;","Action":"moveSegmentDown","Class":"pict-mde-btn-move","Title":"Move Down"},{"HTML":"&#x229E;","Action":"toggleControls","Class":"pict-mde-btn-linenums","Title":"Toggle Controls"},{"HTML":"&#x25CE;","Action":"toggleSegmentPreview","Class":"pict-mde-btn-preview","Title":"Toggle Preview"}],"ButtonsTR":[{"HTML":"<b>B</b>","Action":"applyFormatting:bold","Class":"","Title":"Bold (Ctrl+B)"},{"HTML":"<i>I</i>","Action":"applyFormatting:italic","Class":"","Title":"Italic (Ctrl+I)"},{"HTML":"<code>&lt;&gt;</code>","Action":"applyFormatting:code","Class":"","Title":"Inline Code (Ctrl+E)"},{"HTML":"#","Action":"applyFormatting:heading","Class":"","Title":"Heading"},{"HTML":"[&thinsp;]","Action":"applyFormatting:link","Class":"","Title":"Link"},{"HTML":"&#x25A3;","Action":"openImagePicker","Class":"pict-mde-sidebar-btn-image","Title":"Insert Image"}],"ButtonsBR":[],// CSS for the markdown editor
"CSS":/*css*/`
/* ---- Container ---- */
.pict-mde
{
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	font-size: 14px;
}

/* ---- Segment row: left-controls | drag-handle | editor body | sidebar ---- */
.pict-mde-segment
{
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: stretch;
	margin-bottom: 6px;
	min-height: 48px;
	transition: background-color 0.15s ease;
}

/* ---- Left controls column ---- */
.pict-mde-left-controls
{
	flex: 0 0 22px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	padding: 2px 0;
}

/* ---- Left-side quadrants ---- */
.pict-mde-quadrant-tl
{
	display: flex;
	flex-direction: column;
	align-items: center;
	position: sticky;
	top: 2px;
	z-index: 2;
}
.pict-mde-quadrant-bl
{
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1px;
	position: sticky;
	bottom: 2px;
	z-index: 2;
}

/* ---- Left-side buttons (shared base) ---- */
.pict-mde-left-btn
{
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border: none;
	background: transparent;
	cursor: pointer;
	font-size: 12px;
	padding: 0;
	color: #888;
	line-height: 1;
	font-family: inherit;
	opacity: 0;
	transition: opacity 0.15s ease;
}
.pict-mde-segment:hover .pict-mde-left-btn,
.pict-mde-segment.pict-mde-active .pict-mde-left-btn
{
	opacity: 1;
}
.pict-mde-left-btn:hover
{
	color: #222;
}
.pict-mde-btn-remove:hover
{
	color: #CC3333;
}
.pict-mde-btn-linenums
{
	font-size: 11px;
	font-weight: 600;
	font-family: 'SFMono-Regular', 'SF Mono', 'Menlo', monospace;
}
/* Highlight when controls are active */
.pict-mde.pict-mde-controls-on .pict-mde-btn-linenums
{
	color: #4A90D9;
}
.pict-mde-btn-preview
{
	font-size: 11px;
}
/* Highlight the preview button when preview is visible (not hidden) */
.pict-mde-segment:not(.pict-mde-preview-hidden) .pict-mde-btn-preview
{
	color: #4A90D9;
}
/* Dim preview button when this segment's preview is individually hidden */
.pict-mde-segment.pict-mde-preview-hidden .pict-mde-btn-preview
{
	color: #CCC;
}

/* ---- Drag handle (simple grey bar) ---- */
.pict-mde-drag-handle
{
	flex: 0 0 8px;
	cursor: grab;
	background: #EDEDED;
	transition: background-color 0.15s ease;
	user-select: none;
}
.pict-mde-drag-handle:active
{
	cursor: grabbing;
}
.pict-mde-drag-handle:hover
{
	background: #C8C8C8;
}

/* ---- Editor body (middle column) ---- */
.pict-mde-segment-body
{
	flex: 1 1 0%;
	min-width: 0;
	overflow: hidden;
	background: #FFFFFF;
	transition: background-color 0.15s ease;
}
.pict-mde-segment-editor
{
	min-height: 48px;
}

/* ---- Image preview area below the editor ---- */
.pict-mde-image-preview
{
	display: none;
}
.pict-mde-image-preview.pict-mde-has-images
{
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	padding: 8px 12px;
	border-top: 1px solid #EDEDED;
}
.pict-mde-image-preview img
{
	max-width: 200px;
	max-height: 150px;
	border-radius: 3px;
	border: 1px solid #E0E0E0;
	object-fit: contain;
	background: #F8F8F8;
}
.pict-mde-image-preview-item
{
	position: relative;
	display: inline-block;
}
.pict-mde-image-preview-label
{
	display: block;
	font-size: 10px;
	color: #999;
	margin-top: 2px;
	max-width: 200px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* ---- Rich content preview area (rendered via pict-section-content) ---- */
.pict-mde-rich-preview
{
	display: none;
}
.pict-mde-rich-preview.pict-mde-has-rich-preview
{
	display: block;
	border-top: 1px solid #EDEDED;
	background: #FCFCFC;
	overflow: hidden;
}
/* Constrain images in the rich preview even if pict-section-content CSS loads late */
.pict-mde-rich-preview img
{
	max-width: 100%;
	height: auto;
}
/* Global preview toggle: hide all previews when container has class */
.pict-mde.pict-mde-previews-hidden .pict-mde-rich-preview.pict-mde-has-rich-preview,
.pict-mde.pict-mde-previews-hidden .pict-mde-image-preview.pict-mde-has-images
{
	display: none;
}
/* Per-segment preview toggle: hide previews for a specific segment */
.pict-mde-segment.pict-mde-preview-hidden .pict-mde-rich-preview.pict-mde-has-rich-preview,
.pict-mde-segment.pict-mde-preview-hidden .pict-mde-image-preview.pict-mde-has-images
{
	display: none;
}
/* Constrain the pict-content inside the preview to fit the segment */
.pict-mde-rich-preview .pict-content
{
	padding: 12px;
	max-width: none;
	margin: 0;
	font-size: 13px;
}
/* Reduce heading sizes in the preview to be proportional */
.pict-mde-rich-preview .pict-content h1
{
	font-size: 1.4em;
	margin-top: 0;
}
.pict-mde-rich-preview .pict-content h2
{
	font-size: 1.2em;
	margin-top: 0.75em;
}
.pict-mde-rich-preview .pict-content h3
{
	font-size: 1.1em;
	margin-top: 0.6em;
}

/* ---- Rendered view (full document preview mode) ---- */
.pict-mde-rendered-view
{
	padding: 16px 20px;
	background: #FFFFFF;
	min-height: 120px;
}
.pict-mde-rendered-view .pict-content
{
	max-width: none;
	margin: 0;
}
/* Hide the add-segment button in rendered mode */
.pict-mde.pict-mde-rendered-mode .pict-mde-add-segment
{
	display: none;
}

/* Focused / active editor gets subtle warm background */
.pict-mde-segment.pict-mde-active .pict-mde-segment-body
{
	background: #FAFAF5;
}
.pict-mde-segment.pict-mde-active .pict-mde-drag-handle
{
	background: #9CB4C8;
}

/* ---- Right sidebar column ---- */
.pict-mde-sidebar
{
	flex: 0 0 30px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: space-between;
	position: relative;
}

/* ---- Right-side quadrants ---- */
.pict-mde-quadrant-tr
{
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1px;
	padding: 4px 0;
	width: 100%;
	opacity: 0;
	transition: opacity 0.15s ease, top 0.1s ease;
	position: sticky;
	top: 0;
}
.pict-mde-quadrant-br
{
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1px;
	padding: 4px 0;
	width: 100%;
	opacity: 0;
	transition: opacity 0.15s ease;
	position: sticky;
	bottom: 0;
}

/* Active segment always shows its right-side quadrants */
.pict-mde-segment.pict-mde-active .pict-mde-quadrant-tr,
.pict-mde-segment.pict-mde-active .pict-mde-quadrant-br
{
	opacity: 1;
}
/* When no segment is active, hovering shows both left + right controls */
.pict-mde:not(:has(.pict-mde-active)) .pict-mde-segment:hover .pict-mde-quadrant-tr,
.pict-mde:not(:has(.pict-mde-active)) .pict-mde-segment:hover .pict-mde-quadrant-br
{
	opacity: 1;
}

/* ---- Controls-hidden mode: right quadrants show faintly on hover ---- */
.pict-mde.pict-mde-controls-hidden .pict-mde-quadrant-tr,
.pict-mde.pict-mde-controls-hidden .pict-mde-quadrant-br
{
	opacity: 0;
}
.pict-mde.pict-mde-controls-hidden .pict-mde-segment:hover .pict-mde-quadrant-tr,
.pict-mde.pict-mde-controls-hidden .pict-mde-segment:hover .pict-mde-quadrant-br
{
	opacity: 0.3;
}
.pict-mde.pict-mde-controls-hidden .pict-mde-segment.pict-mde-active .pict-mde-quadrant-tr,
.pict-mde.pict-mde-controls-hidden .pict-mde-segment.pict-mde-active .pict-mde-quadrant-br
{
	opacity: 0.3;
}

/* When JS sets a cursor-relative offset, switch TR from sticky to absolute positioning */
.pict-mde-quadrant-tr.pict-mde-sidebar-at-cursor
{
	position: absolute;
	top: var(--pict-mde-sidebar-top, 0px);
}

/* ---- Right-side buttons (shared base) ---- */
.pict-mde-sidebar-btn
{
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 22px;
	border: none;
	background: transparent;
	cursor: pointer;
	font-size: 12px;
	padding: 0;
	border-radius: 3px;
	color: #666;
	line-height: 1;
	font-family: inherit;
}
.pict-mde-sidebar-btn:hover
{
	color: #222;
}
.pict-mde-sidebar-btn b
{
	font-size: 13px;
	font-weight: 700;
}
.pict-mde-sidebar-btn i
{
	font-size: 13px;
	font-style: italic;
}
.pict-mde-sidebar-btn code
{
	font-size: 10px;
	font-family: 'SFMono-Regular', 'SF Mono', 'Menlo', monospace;
}

/* ---- Add segment button ---- */
.pict-mde-add-segment
{
	margin-top: 6px;
	padding-left: 30px;
}
.pict-mde-btn-add
{
	display: block;
	width: 100%;
	padding: 7px;
	border: 2px dashed #D0D0D0;
	border-radius: 4px;
	background: transparent;
	color: #999;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.15s ease;
}
.pict-mde-btn-add:hover
{
	border-color: #4A90D9;
	color: #4A90D9;
	background: rgba(74, 144, 217, 0.04);
}

/* ---- Image drag-over indicator ---- */
.pict-mde-segment-editor.pict-mde-image-dragover
{
	outline: 2px dashed #4A90D9;
	outline-offset: -2px;
}

/* ---- Drag-in-progress: prevent CodeMirror from intercepting drop events ---- */
.pict-mde.pict-mde-dragging .pict-mde-segment-editor
{
	pointer-events: none;
}

/* ---- Drop target indicators for drag reorder ---- */
.pict-mde-segment.pict-mde-drag-over-top
{
	box-shadow: 0 -2px 0 0 #4A90D9;
}
.pict-mde-segment.pict-mde-drag-over-bottom
{
	box-shadow: 0 2px 0 0 #4A90D9;
}

/* ---- CodeMirror overrides inside segments ---- */
.pict-mde-segment-editor .cm-editor
{
	border: none;
}
.pict-mde-segment-editor .cm-editor .cm-scroller
{
	font-family: 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
	font-size: 14px;
	line-height: 1.6;
}
.pict-mde-segment-editor .cm-editor.cm-focused
{
	outline: none;
}
.pict-mde-segment-editor .cm-editor .cm-content
{
	padding: 8px 12px;
	min-height: 36px;
}
.pict-mde-segment-editor .cm-editor .cm-gutters
{
	background: #F8F8F8;
	border-right: 1px solid #E8E8E8;
	color: #BBB;
}

/* ---- Collapsed data URI widget ---- */
.pict-mde-data-uri-collapsed
{
	display: inline;
	background: #F0F0F0;
	color: #888;
	font-size: 11px;
	padding: 1px 4px;
	border-radius: 3px;
	border: 1px solid #E0E0E0;
	font-family: 'SFMono-Regular', 'SF Mono', 'Menlo', monospace;
	cursor: default;
	white-space: nowrap;
}

/* ---- Line number / controls toggle: gutters hidden by default ---- */
.pict-mde .cm-editor .cm-gutters
{
	display: none;
}
.pict-mde.pict-mde-controls-on .cm-editor .cm-gutters
{
	display: flex;
}

/* ============================================
   RESPONSIVE: Tablet / Phone (max-width: 768px)
   ============================================ */
@media (max-width: 768px)
{
	/* Prevent any horizontal overflow in the editor */
	.pict-mde
	{
		overflow-x: hidden;
		max-width: 100%;
	}

	/* Reduce the left controls column width */
	.pict-mde-left-controls
	{
		flex: 0 0 16px;
	}
	.pict-mde-left-btn
	{
		width: 16px;
		height: 18px;
		font-size: 10px;
	}

	/* Make left-side buttons always visible on touch (no hover) */
	.pict-mde-left-btn
	{
		opacity: 0.6;
	}

	/* Narrow the drag handle */
	.pict-mde-drag-handle
	{
		flex: 0 0 5px;
	}

	/* Shrink the right sidebar column */
	.pict-mde-sidebar
	{
		flex: 0 0 24px;
	}
	.pict-mde-sidebar-btn
	{
		width: 20px;
		height: 20px;
		font-size: 11px;
	}

	/* Make right sidebar buttons always visible (touch devices) */
	.pict-mde-quadrant-tr,
	.pict-mde-quadrant-br
	{
		opacity: 0.7;
	}
	.pict-mde-segment.pict-mde-active .pict-mde-quadrant-tr,
	.pict-mde-segment.pict-mde-active .pict-mde-quadrant-br
	{
		opacity: 1;
	}

	/* Reduce CodeMirror content padding */
	.pict-mde-segment-editor .cm-editor .cm-content
	{
		padding: 6px 6px;
	}

	/* Reduce font size slightly for more content on screen */
	.pict-mde-segment-editor .cm-editor .cm-scroller
	{
		font-size: 13px;
	}

	/* Add segment button: reduce left margin */
	.pict-mde-add-segment
	{
		padding-left: 21px;
	}

	/* Rich preview: less padding */
	.pict-mde-rich-preview .pict-content
	{
		padding: 8px;
		font-size: 12px;
	}

	/* Image previews: smaller max dimensions */
	.pict-mde-image-preview img
	{
		max-width: 120px;
		max-height: 100px;
	}

	/* Rendered view: less padding */
	.pict-mde-rendered-view
	{
		padding: 10px 8px;
	}
}

/* ============================================
   RESPONSIVE: Small phone (max-width: 480px)
   ============================================ */
@media (max-width: 480px)
{
	/* Wrap segment so left controls flow to the top as a horizontal bar */
	.pict-mde-segment
	{
		flex-wrap: wrap;
	}

	/* Left controls become a horizontal toolbar at the top of the segment */
	.pict-mde-left-controls
	{
		flex: 0 0 100%;
		flex-direction: row;
		justify-content: flex-start;
		gap: 2px;
		padding: 3px 4px;
		order: -1;
		background: #F5F5F5;
		border-bottom: 1px solid #EDEDED;
	}
	.pict-mde-left-btn
	{
		width: 24px;
		height: 24px;
		font-size: 12px;
		opacity: 0.7;
	}

	/* Left quadrants flow horizontally */
	.pict-mde-quadrant-tl,
	.pict-mde-quadrant-bl
	{
		flex-direction: row;
		gap: 2px;
		position: static;
	}

	/* Segment body: explicit basis so it fills the wrapped row */
	.pict-mde-segment-body
	{
		flex: 1 1 calc(100% - 20px);
	}

	/* Hide drag handle on very small screens */
	.pict-mde-drag-handle
	{
		display: none;
	}

	/* Right sidebar: further shrink */
	.pict-mde-sidebar
	{
		flex: 0 0 20px;
	}
	.pict-mde-sidebar-btn
	{
		width: 18px;
		height: 18px;
		font-size: 10px;
	}

	/* Add segment: no left offset since controls are at top */
	.pict-mde-add-segment
	{
		padding-left: 0;
	}

	/* Even tighter CodeMirror padding */
	.pict-mde-segment-editor .cm-editor .cm-content
	{
		padding: 4px 4px;
	}
}
`};},{}],21:[function(require,module,exports){const libPictViewClass=require('pict-view');const libPictSectionContent=require('pict-section-content');const _DefaultConfiguration=require('./Pict-Section-MarkdownEditor-DefaultConfiguration.js');// Helper modules
const libFormatting=require('./Pict-MDE-Formatting.js');const libImageHandling=require('./Pict-MDE-ImageHandling.js');const libDragAndReorder=require('./Pict-MDE-DragAndReorder.js');const libRichPreview=require('./Pict-MDE-RichPreview.js');const libCodeMirror=require('./Pict-MDE-CodeMirror.js');class PictSectionMarkdownEditor extends libPictViewClass{constructor(pFable,pOptions,pServiceHash){let tmpOptions=Object.assign({},_DefaultConfiguration,pOptions);super(pFable,tmpOptions,pServiceHash);this.initialRenderComplete=false;// CodeMirror prototype references (injected by consumer or found on window)
this._codeMirrorModules=null;// Map of segment index to CodeMirror EditorView instance
this._segmentEditors={};// Internal segment counter (monotonically increasing for unique IDs)
this._segmentCounter=0;// The view identifier used for onclick handlers in templates
this._viewCallIdentifier=false;// Currently active (focused) segment index, or -1
this._activeSegmentIndex=-1;// Drag state for reorder
this._dragSourceIndex=-1;// Whether controls (line numbers + right sidebar) are currently visible
this._controlsVisible=true;// Whether rich previews are globally visible
this._previewsVisible=true;// Set of logical segment indices where preview has been individually hidden
this._hiddenPreviewSegments={};// Debounce timers for image preview updates (keyed by segment index)
this._imagePreviewTimers={};// Debounce timers for rich content preview updates (keyed by segment index)
this._richPreviewTimers={};// Generation counters for mermaid async rendering (keyed by segment index)
this._richPreviewGenerations={};// Content provider for markdown-to-HTML rendering in rich previews
// (pict-section-content provides parseMarkdown, code highlighting, etc.)
this._contentProvider=null;// Whether the rendered (read-mode) view is currently active
this._renderedViewActive=false;// Generation counter for rendered view mermaid async rendering
this._renderedViewGeneration=0;// Attach helper modules
libFormatting.attach(this);libImageHandling.attach(this);libDragAndReorder.attach(this);libRichPreview.attach(this);libCodeMirror.attach(this);}onBeforeInitialize(){super.onBeforeInitialize();this.targetElement=false;return super.onBeforeInitialize();}/**
	 * Connect the CodeMirror modules.  The consumer must pass an object with:
	 *   - EditorView: the EditorView class
	 *   - EditorState: the EditorState class
	 *   - extensions: an array of extensions to use (e.g. basicSetup, markdown(), etc.)
	 *
	 * If not called explicitly, the view will attempt to find them on window.CodeMirrorModules.
	 *
	 * @param {object} [pCodeMirrorModules] - The CodeMirror modules object
	 * @returns {boolean|void}
	 */connectCodeMirrorModules(pCodeMirrorModules){if(pCodeMirrorModules&&typeof pCodeMirrorModules==='object'){if(typeof pCodeMirrorModules.EditorView==='function'&&typeof pCodeMirrorModules.EditorState==='function'){this._codeMirrorModules=pCodeMirrorModules;return;}}// Try to find CodeMirror modules in global scope
if(typeof window!=='undefined'){if(window.CodeMirrorModules&&typeof window.CodeMirrorModules.EditorView==='function'){this.log.trace(`PICT-MarkdownEditor Found CodeMirror modules on window.CodeMirrorModules.`);this._codeMirrorModules=window.CodeMirrorModules;return;}}this.log.error(`PICT-MarkdownEditor No CodeMirror modules found. Provide them via connectCodeMirrorModules() or set window.CodeMirrorModules.`);return false;}onAfterRender(pRenderable){if(!this.initialRenderComplete){this.onAfterInitialRender();this.initialRenderComplete=true;}// Inject CSS from all registered views (after onAfterInitialRender so
// that pict-section-content's CSS is registered before injection)
this.pict.CSSMap.injectCSS();return super.onAfterRender(pRenderable);}onAfterInitialRender(){// Resolve CodeMirror modules if not already set
if(!this._codeMirrorModules){this.connectCodeMirrorModules();}if(!this._codeMirrorModules){this.log.error(`PICT-MarkdownEditor Cannot initialize; no CodeMirror modules available.`);return false;}// Register pict-section-content's CSS for rich preview rendering.
// This ensures the rendered markdown (headings, code blocks, tables, etc.)
// is styled correctly inside the preview area.
if(this.options.EnableRichPreview){let tmpContentViewConfig=libPictSectionContent.default_configuration;if(tmpContentViewConfig&&tmpContentViewConfig.CSS){this.pict.CSSMap.addCSS('Pict-Content-View',tmpContentViewConfig.CSS);}}// Find the target element
let tmpTargetElementSet=this.services.ContentAssignment.getElement(this.options.TargetElementAddress);if(!tmpTargetElementSet||tmpTargetElementSet.length<1){this.log.error(`PICT-MarkdownEditor Could not find target element [${this.options.TargetElementAddress}]!`);this.targetElement=false;return false;}this.targetElement=tmpTargetElementSet[0];// Determine the view call identifier for onclick handlers
this._viewCallIdentifier=this._resolveViewCallIdentifier();// Build the editor UI
this._buildEditorUI();}/**
	 * Resolve how the view can be referenced from global onclick handlers.
	 * Returns a string like "_Pict.views.MyViewHash"
	 *
	 * @returns {string}
	 */_resolveViewCallIdentifier(){let tmpViews=this.pict.views;for(let tmpViewHash in tmpViews){if(tmpViews[tmpViewHash]===this){return`_Pict.views.${tmpViewHash}`;}}return`_Pict.servicesMap.PictView['${this.Hash}']`;}/**
	 * Get the .pict-mde container element.  Always does a fresh DOM lookup
	 * because pict's async render pipeline can replace the element between calls.
	 *
	 * @returns {HTMLElement|null}
	 */_getContainerElement(){if(this.targetElement){let tmpContainer=this.targetElement.querySelector('.pict-mde');if(tmpContainer){return tmpContainer;}}return this.targetElement||null;}/**
	 * Resolve a URL relative to the configured ImageBaseURL.
	 *
	 * Absolute URLs (starting with /, http://, https://, data:) are returned
	 * unchanged.  Relative URLs are prepended with this.options.ImageBaseURL.
	 *
	 * @param {string} pURL - The URL to resolve
	 * @returns {string} The resolved URL
	 */_resolveImageURL(pURL){if(!pURL||!this.options.ImageBaseURL){return pURL;}// Leave absolute URLs alone
if(pURL.startsWith('/')||pURL.startsWith('http://')||pURL.startsWith('https://')||pURL.startsWith('data:')){return pURL;}let tmpBase=this.options.ImageBaseURL;// Ensure base ends with /
if(tmpBase&&!tmpBase.endsWith('/')){tmpBase+='/';}return tmpBase+pURL;}/**
	 * Build the full editor UI: render existing segments from data and the add-segment button.
	 */_buildEditorUI(){let tmpContainer=this._getContainerElement();// Ensure the container has the pict-mde class (the template's wrapper
// may have been replaced by pict's async render pipeline)
if(tmpContainer&&!tmpContainer.classList.contains('pict-mde')){tmpContainer.classList.add('pict-mde');}// Destroy existing editors before clearing
for(let tmpIdx in this._segmentEditors){if(this._segmentEditors[tmpIdx]){this._segmentEditors[tmpIdx].destroy();}}tmpContainer.innerHTML='';// Restore toggle states on the container after clearing
if(!this._previewsVisible){tmpContainer.classList.add('pict-mde-previews-hidden');}if(this._controlsVisible){tmpContainer.classList.add('pict-mde-controls-on');}else{tmpContainer.classList.add('pict-mde-controls-hidden');}// Load existing segments from data address, or start with one empty segment
let tmpSegments=this._getSegmentsFromData();if(!tmpSegments||tmpSegments.length===0){tmpSegments=[{Content:''}];this._setSegmentsToData(tmpSegments);}this._segmentCounter=0;this._segmentEditors={};for(let i=0;i<tmpSegments.length;i++){this._renderSegment(tmpContainer,i,tmpSegments[i].Content||'');}this._renderAddButton(tmpContainer);}/**
	 * Render a single segment into the container.
	 *
	 * @param {HTMLElement} pContainer - The container element
	 * @param {number} pIndex - The segment index
	 * @param {string} pContent - The initial content
	 */_renderSegment(pContainer,pIndex,pContent){let tmpSegmentIndex=this._segmentCounter++;let tmpRecord={SegmentIndex:tmpSegmentIndex,SegmentDisplayIndex:pIndex+1,ViewIdentifier:this._viewCallIdentifier};let tmpHTML=this.pict.parseTemplateByHash('MarkdownEditor-Segment',tmpRecord);let tmpTempDiv=document.createElement('div');tmpTempDiv.innerHTML=tmpHTML;let tmpSegmentElement=tmpTempDiv.firstElementChild;pContainer.appendChild(tmpSegmentElement);// Build quadrant buttons from configuration arrays
this._buildQuadrantButtons(tmpSegmentElement,tmpSegmentIndex);// Restore per-segment preview hidden state (tracked by logical index)
if(this._hiddenPreviewSegments[pIndex]){tmpSegmentElement.classList.add('pict-mde-preview-hidden');}// Wire up drag-and-drop on the drag handle
this._wireSegmentDragEvents(tmpSegmentElement,tmpSegmentIndex);// Create the CodeMirror editor in the segment editor container
let tmpEditorContainer=document.getElementById(`PictMDE-SegmentEditor-${tmpSegmentIndex}`);if(tmpEditorContainer){this._createEditorInContainer(tmpEditorContainer,tmpSegmentIndex,pContent);// Wire image drag-and-drop on the editor container
this._wireImageDragEvents(tmpEditorContainer,tmpSegmentIndex);// Render image previews for existing content
if(pContent){this._updateImagePreviews(tmpSegmentIndex);this._updateRichPreviews(tmpSegmentIndex);}}}/**
	 * Build buttons in all four quadrants (TL, BL, TR, BR) from the
	 * configuration arrays.  Each button config has:
	 *   HTML   — innerHTML
	 *   Action — "methodName" or "methodName:arg"
	 *   Class  — additional CSS class(es)
	 *   Title  — tooltip text
	 *
	 * Left quadrant buttons (TL, BL) get the "pict-mde-left-btn" base class.
	 * Right quadrant buttons (TR, BR) get the "pict-mde-sidebar-btn" base class.
	 *
	 * @param {HTMLElement} pSegmentElement - The .pict-mde-segment element
	 * @param {number} pSegmentIndex - The internal segment index
	 */_buildQuadrantButtons(pSegmentElement,pSegmentIndex){let tmpQuadrants=[{key:'ButtonsTL',selector:'.pict-mde-quadrant-tl',baseClass:'pict-mde-left-btn'},{key:'ButtonsBL',selector:'.pict-mde-quadrant-bl',baseClass:'pict-mde-left-btn'},{key:'ButtonsTR',selector:'.pict-mde-quadrant-tr',baseClass:'pict-mde-sidebar-btn'},{key:'ButtonsBR',selector:'.pict-mde-quadrant-br',baseClass:'pict-mde-sidebar-btn'}];let tmpSelf=this;for(let q=0;q<tmpQuadrants.length;q++){let tmpQuadrant=tmpQuadrants[q];let tmpContainer=pSegmentElement.querySelector(tmpQuadrant.selector);if(!tmpContainer){continue;}let tmpButtons=this.options[tmpQuadrant.key];if(!Array.isArray(tmpButtons)){continue;}for(let b=0;b<tmpButtons.length;b++){let tmpBtnConfig=tmpButtons[b];let tmpButton=document.createElement('button');tmpButton.type='button';tmpButton.className=tmpQuadrant.baseClass;if(tmpBtnConfig.Class){tmpButton.className+=' '+tmpBtnConfig.Class;}tmpButton.innerHTML=tmpBtnConfig.HTML||'';tmpButton.title=tmpBtnConfig.Title||'';// Parse the action string: "methodName" or "methodName:arg"
let tmpAction=tmpBtnConfig.Action||'';let tmpMethod=tmpAction;let tmpArg=null;let tmpColonIndex=tmpAction.indexOf(':');if(tmpColonIndex>=0){tmpMethod=tmpAction.substring(0,tmpColonIndex);tmpArg=tmpAction.substring(tmpColonIndex+1);}// Build the click handler
(function(pMethod,pArg,pSegIdx){tmpButton.addEventListener('click',()=>{if(typeof tmpSelf[pMethod]==='function'){if(pArg!==null){tmpSelf[pMethod](pSegIdx,pArg);}else{tmpSelf[pMethod](pSegIdx);}}else{tmpSelf.log.warn(`PICT-MarkdownEditor _buildQuadrantButtons: method "${pMethod}" not found.`);}});})(tmpMethod,tmpArg,pSegmentIndex);tmpContainer.appendChild(tmpButton);}}}/**
	 * Hook for subclasses to customize the CodeMirror extensions before editor creation.
	 *
	 * @param {Array} pExtensions - The extensions array to modify
	 * @param {number} pSegmentIndex - The segment index
	 * @returns {Array} The modified extensions array
	 */customConfigureExtensions(pExtensions,pSegmentIndex){return pExtensions;}/**
	 * Render the "Add Segment" button at the bottom of the container.
	 *
	 * @param {HTMLElement} pContainer - The container element
	 */_renderAddButton(pContainer){let tmpRecord={ViewIdentifier:this._viewCallIdentifier};let tmpHTML=this.pict.parseTemplateByHash('MarkdownEditor-AddSegment',tmpRecord);let tmpTempDiv=document.createElement('div');tmpTempDiv.innerHTML=tmpHTML;let tmpButtonElement=tmpTempDiv.firstElementChild;pContainer.appendChild(tmpButtonElement);}/**
	 * Hook for consumers to handle image uploads.
	 *
	 * Override this in a subclass or consumer to upload images to a server/CDN.
	 * Return true to indicate you are handling the upload asynchronously.
	 * Call fCallback(null, url) on success, or fCallback(error) on failure.
	 * Return false/undefined to fall back to base64 data URI inline.
	 *
	 * @param {File} pFile - The image File object
	 * @param {number} pSegmentIndex - The logical segment index
	 * @param {function} fCallback - Callback: fCallback(pError, pURL)
	 * @returns {boolean} true if handling the upload, false to use base64 default
	 */onImageUpload(pFile,pSegmentIndex,fCallback){// Override in subclass or consumer
return false;}// -- Controls Toggle (line numbers + right sidebar) --
/**
	 * Toggle controls (line number gutters and right sidebar formatting
	 * buttons) on or off for all segments.
	 *
	 * When controls are hidden the right-side quadrants (TR, BR) appear
	 * faintly on hover but are otherwise invisible, and CodeMirror line
	 * number gutters are hidden.
	 *
	 * This method is called by the quadrant button system with the segment
	 * index as the first argument — it ignores that argument and uses only
	 * the optional boolean.
	 *
	 * @param {number|boolean} [pSegmentIndexOrVisible] - Segment index (ignored) or boolean
	 * @param {boolean} [pVisible] - If provided, set to this value; otherwise toggle
	 */toggleControls(pSegmentIndexOrVisible,pVisible){// When called from a quadrant button, first arg is segment index (number).
// When called programmatically, first arg may be a boolean.
let tmpVisible=pVisible;if(typeof pSegmentIndexOrVisible==='boolean'){tmpVisible=pSegmentIndexOrVisible;}if(typeof tmpVisible==='boolean'){this._controlsVisible=tmpVisible;}else{this._controlsVisible=!this._controlsVisible;}let tmpContainer=this._getContainerElement();if(tmpContainer){if(this._controlsVisible){tmpContainer.classList.add('pict-mde-controls-on');tmpContainer.classList.remove('pict-mde-controls-hidden');}else{tmpContainer.classList.remove('pict-mde-controls-on');tmpContainer.classList.add('pict-mde-controls-hidden');}}}/**
	 * Toggle line numbers on or off for all segments.
	 * Backward-compatible alias for toggleControls().
	 *
	 * @param {boolean} [pVisible] - If provided, set to this value; otherwise toggle
	 */toggleLineNumbers(pVisible){this.toggleControls(pVisible);}// -- Preview Toggle --
/**
	 * Toggle rich previews on or off for all segments globally.
	 *
	 * When hidden globally, individual segment overrides are preserved
	 * so that restoring global visibility returns to the per-segment state.
	 *
	 * @param {boolean} [pVisible] - If provided, set to this value; otherwise toggle
	 */togglePreview(pVisible){if(typeof pVisible==='boolean'){this._previewsVisible=pVisible;}else{this._previewsVisible=!this._previewsVisible;}let tmpContainer=this._getContainerElement();if(tmpContainer){if(this._previewsVisible){tmpContainer.classList.remove('pict-mde-previews-hidden');}else{tmpContainer.classList.add('pict-mde-previews-hidden');}}}/**
	 * Toggle the rich preview for a single segment.
	 *
	 * This adds/removes the .pict-mde-preview-hidden class on the
	 * individual segment element, independent of the global toggle.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 * @param {boolean} [pVisible] - If provided, set to this value; otherwise toggle
	 */toggleSegmentPreview(pSegmentIndex,pVisible){// Convert internal index to logical index for persistent tracking
let tmpLogicalIndex=this._getLogicalIndex(pSegmentIndex);if(tmpLogicalIndex<0){return;}let tmpCurrentlyHidden=!!this._hiddenPreviewSegments[tmpLogicalIndex];if(typeof pVisible==='boolean'){tmpCurrentlyHidden=!pVisible;}else{tmpCurrentlyHidden=!tmpCurrentlyHidden;}if(tmpCurrentlyHidden){this._hiddenPreviewSegments[tmpLogicalIndex]=true;}else{delete this._hiddenPreviewSegments[tmpLogicalIndex];}let tmpSegmentEl=document.getElementById(`PictMDE-Segment-${pSegmentIndex}`);if(tmpSegmentEl){if(tmpCurrentlyHidden){tmpSegmentEl.classList.add('pict-mde-preview-hidden');}else{tmpSegmentEl.classList.remove('pict-mde-preview-hidden');// Render preview content when making it visible
this._updateRichPreviews(pSegmentIndex);this._updateImagePreviews(pSegmentIndex);}}}// -- Segment Data Management --
/**
	 * Get the segments array from the configured data address.
	 *
	 * @returns {Array|null}
	 */_getSegmentsFromData(){if(!this.options.ContentDataAddress){return null;}const tmpAddressSpace={Fable:this.fable,Pict:this.fable,AppData:this.AppData,Bundle:this.Bundle,Options:this.options};let tmpData=this.fable.manifest.getValueByHash(tmpAddressSpace,this.options.ContentDataAddress);if(Array.isArray(tmpData)){return tmpData;}return null;}/**
	 * Write the segments array to the configured data address.
	 *
	 * @param {Array} pSegments - The segments array
	 */_setSegmentsToData(pSegments){if(!this.options.ContentDataAddress){return;}const tmpAddressSpace={Fable:this.fable,Pict:this.fable,AppData:this.AppData,Bundle:this.Bundle,Options:this.options};this.fable.manifest.setValueByHash(tmpAddressSpace,this.options.ContentDataAddress,pSegments);}/**
	 * Called when a segment's content changes in the CodeMirror editor.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 * @param {string} pContent - The new content
	 */_onSegmentContentChange(pSegmentIndex,pContent){let tmpLogicalIndex=this._getLogicalIndex(pSegmentIndex);if(tmpLogicalIndex<0){return;}let tmpSegments=this._getSegmentsFromData();if(!tmpSegments){return;}if(tmpLogicalIndex<tmpSegments.length){tmpSegments[tmpLogicalIndex].Content=pContent;}this.onContentChange(tmpLogicalIndex,pContent);// Debounce image preview updates (500ms) to avoid thrashing on every keystroke
let tmpSelf=this;if(this._imagePreviewTimers[pSegmentIndex]){clearTimeout(this._imagePreviewTimers[pSegmentIndex]);}this._imagePreviewTimers[pSegmentIndex]=setTimeout(()=>{tmpSelf._updateImagePreviews(pSegmentIndex);delete tmpSelf._imagePreviewTimers[pSegmentIndex];},500);// Debounce rich content preview updates (mermaid / KaTeX) at 500ms
if(this._richPreviewTimers[pSegmentIndex]){clearTimeout(this._richPreviewTimers[pSegmentIndex]);}this._richPreviewTimers[pSegmentIndex]=setTimeout(()=>{tmpSelf._updateRichPreviews(pSegmentIndex);delete tmpSelf._richPreviewTimers[pSegmentIndex];},500);}/**
	 * Hook for subclasses to respond to content changes.
	 *
	 * @param {number} pSegmentIndex - The logical segment index
	 * @param {string} pContent - The new content
	 */onContentChange(pSegmentIndex,pContent){// Override in subclass
}/**
	 * Get the logical (ordered) index for an internal segment index.
	 *
	 * @param {number} pInternalIndex - The internal segment index
	 * @returns {number} The logical index, or -1 if not found
	 */_getLogicalIndex(pInternalIndex){let tmpContainer=this._getContainerElement();if(!tmpContainer){return-1;}let tmpSegmentElements=tmpContainer.querySelectorAll('.pict-mde-segment');for(let i=0;i<tmpSegmentElements.length;i++){let tmpIndex=parseInt(tmpSegmentElements[i].getAttribute('data-segment-index'),10);if(tmpIndex===pInternalIndex){return i;}}return-1;}/**
	 * Get the ordered list of internal segment indices from the DOM.
	 *
	 * @returns {Array<number>}
	 */_getOrderedSegmentIndices(){let tmpContainer=this._getContainerElement();if(!tmpContainer){return[];}let tmpSegmentElements=tmpContainer.querySelectorAll('.pict-mde-segment');let tmpIndices=[];for(let i=0;i<tmpSegmentElements.length;i++){tmpIndices.push(parseInt(tmpSegmentElements[i].getAttribute('data-segment-index'),10));}return tmpIndices;}// -- Public API --
/**
	 * Add a new empty segment at the end.
	 *
	 * @param {string} [pContent] - Optional initial content for the new segment
	 */addSegment(pContent){let tmpContent=typeof pContent==='string'?pContent:'';let tmpSegments=this._getSegmentsFromData();if(!tmpSegments){tmpSegments=[];}tmpSegments.push({Content:tmpContent});this._setSegmentsToData(tmpSegments);this._buildEditorUI();}/**
	 * Remove a segment by its internal index.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */removeSegment(pSegmentIndex){let tmpLogicalIndex=this._getLogicalIndex(pSegmentIndex);if(tmpLogicalIndex<0){this.log.warn(`PICT-MarkdownEditor removeSegment: segment index ${pSegmentIndex} not found.`);return;}let tmpSegments=this._getSegmentsFromData();if(!tmpSegments||tmpSegments.length<=1){this.log.warn(`PICT-MarkdownEditor removeSegment: cannot remove the last segment.`);return;}if(this._segmentEditors[pSegmentIndex]){this._segmentEditors[pSegmentIndex].destroy();delete this._segmentEditors[pSegmentIndex];}tmpSegments.splice(tmpLogicalIndex,1);this._setSegmentsToData(tmpSegments);// Update per-segment hidden preview state after removal
let tmpNewHidden={};for(let tmpKey in this._hiddenPreviewSegments){let tmpIdx=parseInt(tmpKey,10);if(tmpIdx<tmpLogicalIndex){tmpNewHidden[tmpIdx]=true;}else if(tmpIdx>tmpLogicalIndex){tmpNewHidden[tmpIdx-1]=true;}// tmpIdx === tmpLogicalIndex is the removed segment; skip it
}this._hiddenPreviewSegments=tmpNewHidden;this._buildEditorUI();}/**
	 * Move a segment up by its internal index.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */moveSegmentUp(pSegmentIndex){let tmpLogicalIndex=this._getLogicalIndex(pSegmentIndex);if(tmpLogicalIndex<=0){return;}this._marshalAllEditorsToData();let tmpSegments=this._getSegmentsFromData();if(!tmpSegments){return;}let tmpTemp=tmpSegments[tmpLogicalIndex];tmpSegments[tmpLogicalIndex]=tmpSegments[tmpLogicalIndex-1];tmpSegments[tmpLogicalIndex-1]=tmpTemp;// Swap per-segment hidden preview state to follow the moved segment
this._swapHiddenPreviewState(tmpLogicalIndex,tmpLogicalIndex-1);this._buildEditorUI();}/**
	 * Move a segment down by its internal index.
	 *
	 * @param {number} pSegmentIndex - The internal segment index
	 */moveSegmentDown(pSegmentIndex){let tmpLogicalIndex=this._getLogicalIndex(pSegmentIndex);let tmpSegments=this._getSegmentsFromData();if(!tmpSegments||tmpLogicalIndex<0||tmpLogicalIndex>=tmpSegments.length-1){return;}this._marshalAllEditorsToData();let tmpTemp=tmpSegments[tmpLogicalIndex];tmpSegments[tmpLogicalIndex]=tmpSegments[tmpLogicalIndex+1];tmpSegments[tmpLogicalIndex+1]=tmpTemp;// Swap per-segment hidden preview state to follow the moved segment
this._swapHiddenPreviewState(tmpLogicalIndex,tmpLogicalIndex+1);this._buildEditorUI();}/**
	 * Get the content of a specific segment by logical index.
	 *
	 * @param {number} pLogicalIndex - The logical (0-based) index
	 * @returns {string} The segment content
	 */getSegmentContent(pLogicalIndex){let tmpOrderedIndices=this._getOrderedSegmentIndices();if(pLogicalIndex<0||pLogicalIndex>=tmpOrderedIndices.length){return'';}let tmpInternalIndex=tmpOrderedIndices[pLogicalIndex];let tmpEditor=this._segmentEditors[tmpInternalIndex];if(tmpEditor){return tmpEditor.state.doc.toString();}return'';}/**
	 * Set the content of a specific segment by logical index.
	 *
	 * @param {number} pLogicalIndex - The logical (0-based) index
	 * @param {string} pContent - The content to set
	 */setSegmentContent(pLogicalIndex,pContent){let tmpOrderedIndices=this._getOrderedSegmentIndices();if(pLogicalIndex<0||pLogicalIndex>=tmpOrderedIndices.length){this.log.warn(`PICT-MarkdownEditor setSegmentContent: index ${pLogicalIndex} out of range.`);return;}let tmpInternalIndex=tmpOrderedIndices[pLogicalIndex];let tmpEditor=this._segmentEditors[tmpInternalIndex];if(tmpEditor){tmpEditor.dispatch({changes:{from:0,to:tmpEditor.state.doc.length,insert:pContent}});}}/**
	 * Get the total number of segments.
	 *
	 * @returns {number}
	 */getSegmentCount(){return this._getOrderedSegmentIndices().length;}/**
	 * Get all content from all segments joined together.
	 *
	 * @param {string} [pSeparator] - The separator between segments (default: "\n\n")
	 * @returns {string}
	 */getAllContent(pSeparator){let tmpSeparator=typeof pSeparator==='string'?pSeparator:'\n\n';let tmpOrderedIndices=this._getOrderedSegmentIndices();let tmpParts=[];for(let i=0;i<tmpOrderedIndices.length;i++){let tmpEditor=this._segmentEditors[tmpOrderedIndices[i]];if(tmpEditor){tmpParts.push(tmpEditor.state.doc.toString());}}return tmpParts.join(tmpSeparator);}/**
	 * Marshal all editor contents back into the data address.
	 */_marshalAllEditorsToData(){let tmpSegments=this._getSegmentsFromData();if(!tmpSegments){return;}let tmpOrderedIndices=this._getOrderedSegmentIndices();for(let i=0;i<tmpOrderedIndices.length;i++){let tmpEditor=this._segmentEditors[tmpOrderedIndices[i]];if(tmpEditor&&i<tmpSegments.length){tmpSegments[i].Content=tmpEditor.state.doc.toString();}}}/**
	 * Set the read-only state of all editors.
	 *
	 * @param {boolean} pReadOnly - Whether editors should be read-only
	 */setReadOnly(pReadOnly){this.options.ReadOnly=pReadOnly;if(this.initialRenderComplete){this._marshalAllEditorsToData();this._buildEditorUI();}}/**
	 * Marshal content from the data address into the view.
	 */marshalToView(){super.marshalToView();if(this.initialRenderComplete&&this.options.ContentDataAddress){this._buildEditorUI();}}/**
	 * Marshal the current editor content back to the data address.
	 */marshalFromView(){super.marshalFromView();this._marshalAllEditorsToData();}/**
	 * Destroy all editors and clean up.
	 */destroy(){for(let tmpIndex in this._segmentEditors){if(this._segmentEditors[tmpIndex]){this._segmentEditors[tmpIndex].destroy();}}this._segmentEditors={};// Clear rich preview debounce timers
for(let tmpIndex in this._richPreviewTimers){clearTimeout(this._richPreviewTimers[tmpIndex]);}this._richPreviewTimers={};this._richPreviewGenerations={};}}module.exports=PictSectionMarkdownEditor;module.exports.default_configuration=_DefaultConfiguration;},{"./Pict-MDE-CodeMirror.js":15,"./Pict-MDE-DragAndReorder.js":16,"./Pict-MDE-Formatting.js":17,"./Pict-MDE-ImageHandling.js":18,"./Pict-MDE-RichPreview.js":19,"./Pict-Section-MarkdownEditor-DefaultConfiguration.js":20,"pict-section-content":12,"pict-view":33}],22:[function(require,module,exports){module.exports={ViewIdentifier:'Pict-ObjectEditor',DefaultRenderable:'ObjectEditor-Container',DefaultDestinationAddress:'#ObjectEditor-Container',AutoRender:false,// Address in AppData where the JSON object lives
ObjectDataAddress:false,// Maximum depth to auto-expand on initial load
InitialExpandDepth:1,// Whether editing is enabled (vs read-only inspector mode)
Editable:true,// Whether to show type indicator badges
ShowTypeIndicators:true,// Indentation pixels per depth level
IndentPixels:20,CSS:/*css*/`
.pict-objecteditor
{
	font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
	font-size: 13px;
	line-height: 1.5;
	color: #3D3229;
	background: #FDFCFA;
	border: 1px solid #E8E3DA;
	border-radius: 6px;
	padding: 8px 0;
	overflow: auto;
}
.pict-oe-row
{
	display: flex;
	align-items: center;
	padding: 2px 12px 2px 0;
	min-height: 26px;
	cursor: default;
	border-radius: 3px;
}
.pict-oe-row:hover
{
	background: #F5F0E8;
}
.pict-oe-toggle
{
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 16px;
	cursor: pointer;
	color: #8A7F72;
	font-size: 10px;
	flex-shrink: 0;
	user-select: none;
	border-radius: 3px;
	transition: color 0.1s;
}
.pict-oe-toggle:hover
{
	background: #E8E3DA;
	color: #3D3229;
}
.pict-oe-spacer
{
	display: inline-block;
	width: 16px;
	flex-shrink: 0;
}
.pict-oe-key
{
	color: #9E6B47;
	flex-shrink: 0;
}
.pict-oe-separator
{
	color: #8A7F72;
	margin: 0 8px;
	flex-shrink: 0;
}
.pict-oe-value
{
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.pict-oe-value-string
{
	color: #2E7D74;
}
.pict-oe-value-string::before
{
	content: '"';
	color: #A8CFC9;
}
.pict-oe-value-string::after
{
	content: '"';
	color: #A8CFC9;
}
.pict-oe-value-number
{
	color: #3B6DAA;
}
.pict-oe-value-boolean
{
	color: #8B5E3C;
	font-weight: 600;
}
.pict-oe-value-null
{
	color: #B0A89E;
	font-style: italic;
}
.pict-oe-summary
{
	color: #B0A89E;
	margin-left: 6px;
	font-size: 12px;
}
.pict-oe-type-badge
{
	display: inline-block;
	font-size: 9px;
	padding: 0 4px;
	border-radius: 3px;
	background: #F0ECE4;
	color: #8A7F72;
	margin-left: 6px;
	line-height: 16px;
	vertical-align: middle;
}
.pict-oe-value-input
{
	background: #FFF;
	border: 1px solid #2E7D74;
	border-radius: 3px;
	padding: 1px 4px;
	font-family: inherit;
	font-size: inherit;
	color: inherit;
	outline: none;
	min-width: 80px;
}
.pict-oe-value-input:focus
{
	border-color: #3B6DAA;
	box-shadow: 0 0 0 2px rgba(59, 109, 170, 0.15);
}
.pict-oe-array-index
{
	color: #8A7F72;
	font-size: 11px;
}
.pict-oe-empty
{
	color: #B0A89E;
	font-style: italic;
	padding: 8px 12px;
}
.pict-oe-actions
{
	margin-left: auto;
	padding-left: 12px;
	padding-right: 4px;
	opacity: 0.4;
	transition: opacity 0.15s;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	gap: 5px;
}
.pict-oe-row:hover .pict-oe-actions
{
	opacity: 1;
}
.pict-oe-action-btn
{
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 22px;
	height: 22px;
	padding: 0 5px;
	border-radius: 3px;
	border: 1px solid #DDD8CF;
	background: #F5F0E8;
	cursor: pointer;
	font-size: 12px;
	color: #8A7F72;
	user-select: none;
	box-sizing: border-box;
}
.pict-oe-action-btn:hover
{
	background: #E8E3DA;
	border-color: #C5BFAE;
	color: #3D3229;
}
.pict-oe-action-remove
{
	border-color: #E8C8C8;
	background: #FAF0F0;
	color: #A04040;
}
.pict-oe-action-remove:hover
{
	background: #F0D6D6;
	border-color: #D4A0A0;
	color: #A04040;
}
.pict-oe-action-move
{
	font-size: 9px;
}
.pict-oe-action-move:hover
{
	background: #D6E4F0;
	border-color: #A8C4DA;
	color: #3B6DAA;
}
.pict-oe-action-add
{
	border-color: #C8D8C8;
	background: #F0F5F0;
	color: #5A7A5A;
}
.pict-oe-action-add:hover
{
	background: #D6E8D6;
	border-color: #A0C0A0;
	color: #3D5C3D;
}
.pict-oe-key-input
{
	background: #FFF;
	border: 1px solid #9E6B47;
	border-radius: 3px;
	padding: 1px 4px;
	font-family: inherit;
	font-size: inherit;
	color: #9E6B47;
	outline: none;
	min-width: 60px;
	margin-left: 6px;
}
.pict-oe-key-input:focus
{
	border-color: #3B6DAA;
	box-shadow: 0 0 0 2px rgba(59, 109, 170, 0.15);
}
.pict-oe-type-select
{
	background: #FFF;
	border: 1px solid #C5BFAE;
	border-radius: 3px;
	padding: 1px 4px;
	font-family: inherit;
	font-size: inherit;
	color: #3D3229;
	outline: none;
	margin-left: 6px;
	cursor: pointer;
}
.pict-oe-type-select:focus
{
	border-color: #3B6DAA;
	box-shadow: 0 0 0 2px rgba(59, 109, 170, 0.15);
}
.pict-oe-root-add
{
	display: flex;
	align-items: center;
	padding: 4px 12px;
	min-height: 26px;
	cursor: default;
}
.pict-oe-root-add .pict-oe-action-btn
{
	width: auto;
	white-space: nowrap;
	padding: 0 8px;
}
`,MacroTemplates:{Node:{RowOpen:'<div class="pict-oe-row" style="padding-left:{~D:Record.PaddingLeft~}px" data-path="{~D:Record.EscapedPath~}">',RowClose:'</div>',Toggle:'<span class="pict-oe-toggle" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].toggleNode(\'{~D:Record.EscapedPath~}\')">{~D:Record.ToggleArrow~}</span>',Spacer:'<span class="pict-oe-spacer"></span>',KeyName:'<span class="pict-oe-key">{~D:Record.EscapedKey~}</span>',KeyIndex:'<span class="pict-oe-key"><span class="pict-oe-array-index">{~D:Record.ArrayIndex~}</span></span>',Separator:'<span class="pict-oe-separator">:</span>',TypeBadge:'<span class="pict-oe-type-badge">{~D:Record.TypeLabel~}</span>',Summary:'<span class="pict-oe-summary">{~D:Record.SummaryText~}</span>',ValueStringEditable:'<span class="pict-oe-value pict-oe-value-string" ondblclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].beginEdit(\'{~D:Record.EscapedPath~}\', \'string\')" title="{~D:Record.EscapedTitle~}">{~D:Record.EscapedValue~}</span>',ValueStringReadOnly:'<span class="pict-oe-value pict-oe-value-string" title="{~D:Record.EscapedTitle~}">{~D:Record.EscapedValue~}</span>',ValueNumberEditable:'<span class="pict-oe-value pict-oe-value-number" ondblclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].beginEdit(\'{~D:Record.EscapedPath~}\', \'number\')">{~D:Record.EscapedValue~}</span>',ValueNumberReadOnly:'<span class="pict-oe-value pict-oe-value-number">{~D:Record.EscapedValue~}</span>',ValueBooleanEditable:'<span class="pict-oe-value pict-oe-value-boolean" style="cursor:pointer" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].toggleBoolean(\'{~D:Record.EscapedPath~}\')">{~D:Record.DisplayValue~}</span>',ValueBooleanReadOnly:'<span class="pict-oe-value pict-oe-value-boolean">{~D:Record.DisplayValue~}</span>',ValueNull:'<span class="pict-oe-value pict-oe-value-null">null</span>',ActionsOpen:'<span class="pict-oe-actions">',ActionsClose:'</span>',ButtonRemove:'<span class="pict-oe-action-btn pict-oe-action-remove" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].removeNode(\'{~D:Record.EscapedPath~}\')" title="Remove">\u00D7</span>',ButtonAddObject:'<span class="pict-oe-action-btn pict-oe-action-add" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].beginAddToObject(\'{~D:Record.EscapedPath~}\')" title="Add">+</span>',ButtonAddArray:'<span class="pict-oe-action-btn pict-oe-action-add" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].beginAddToArray(\'{~D:Record.EscapedPath~}\')" title="Add">+</span>',ButtonMoveUp:'<span class="pict-oe-action-btn pict-oe-action-move" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].moveArrayElementUp(\'{~D:Record.EscapedArrayPath~}\', {~D:Record.ArrayIndex~})" title="Move up">\u25B2</span>',ButtonMoveDown:'<span class="pict-oe-action-btn pict-oe-action-move" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].moveArrayElementDown(\'{~D:Record.EscapedArrayPath~}\', {~D:Record.ArrayIndex~})" title="Move down">\u25BC</span>',RootAddObject:'<div class="pict-oe-root-add" data-path=""><span class="pict-oe-action-btn pict-oe-action-add" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].beginAddToObject(\'\')" title="Add property">+ add property</span></div>',RootAddArray:'<div class="pict-oe-root-add" data-path=""><span class="pict-oe-action-btn pict-oe-action-add" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].beginAddToArray(\'\')" title="Add element">+ add element</span></div>'}},Templates:[{Hash:'ObjectEditor-Container-Template',Template:'<div class="pict-objecteditor" id="ObjectEditor-Tree-{~D:Context[0].Hash~}"></div>'},{Hash:'ObjectEditor-Node-String',Template:'{~D:Record.Macro.RowOpen~}{~D:Record.Macro.Spacer~}{~D:Record.Macro.Key~}{~D:Record.Macro.Separator~}{~D:Record.Macro.Value~}{~D:Record.Macro.Actions~}{~D:Record.Macro.RowClose~}'},{Hash:'ObjectEditor-Node-Number',Template:'{~D:Record.Macro.RowOpen~}{~D:Record.Macro.Spacer~}{~D:Record.Macro.Key~}{~D:Record.Macro.Separator~}{~D:Record.Macro.Value~}{~D:Record.Macro.Actions~}{~D:Record.Macro.RowClose~}'},{Hash:'ObjectEditor-Node-Boolean',Template:'{~D:Record.Macro.RowOpen~}{~D:Record.Macro.Spacer~}{~D:Record.Macro.Key~}{~D:Record.Macro.Separator~}{~D:Record.Macro.Value~}{~D:Record.Macro.Actions~}{~D:Record.Macro.RowClose~}'},{Hash:'ObjectEditor-Node-Null',Template:'{~D:Record.Macro.RowOpen~}{~D:Record.Macro.Spacer~}{~D:Record.Macro.Key~}{~D:Record.Macro.Separator~}{~D:Record.Macro.Value~}{~D:Record.Macro.Actions~}{~D:Record.Macro.RowClose~}'},{Hash:'ObjectEditor-Node-Object',Template:'{~D:Record.Macro.RowOpen~}{~D:Record.Macro.Toggle~}{~D:Record.Macro.Key~}{~D:Record.Macro.TypeBadge~}{~D:Record.Macro.Summary~}{~D:Record.Macro.Actions~}{~D:Record.Macro.RowClose~}'},{Hash:'ObjectEditor-Node-Array',Template:'{~D:Record.Macro.RowOpen~}{~D:Record.Macro.Toggle~}{~D:Record.Macro.Key~}{~D:Record.Macro.TypeBadge~}{~D:Record.Macro.Summary~}{~D:Record.Macro.Actions~}{~D:Record.Macro.RowClose~}'}],Renderables:[{RenderableHash:'ObjectEditor-Container',TemplateHash:'ObjectEditor-Container-Template',DestinationAddress:'#ObjectEditor-Container',RenderMethod:'replace'}]};},{}],23:[function(require,module,exports){// Pict Section: Object Editor
// A tree-based JSON object viewer and editor for Pict applications.
// The main object editor view class
module.exports=require('./views/PictView-ObjectEditor.js');// Node type views
module.exports.PictViewObjectEditorNode=require('./views/PictView-ObjectEditor-Node.js');module.exports.PictViewObjectEditorNodeString=require('./views/PictView-ObjectEditor-NodeString.js');module.exports.PictViewObjectEditorNodeNumber=require('./views/PictView-ObjectEditor-NodeNumber.js');module.exports.PictViewObjectEditorNodeBoolean=require('./views/PictView-ObjectEditor-NodeBoolean.js');module.exports.PictViewObjectEditorNodeNull=require('./views/PictView-ObjectEditor-NodeNull.js');module.exports.PictViewObjectEditorNodeObject=require('./views/PictView-ObjectEditor-NodeObject.js');module.exports.PictViewObjectEditorNodeArray=require('./views/PictView-ObjectEditor-NodeArray.js');// Default configuration
module.exports.default_configuration=require('./Pict-Section-ObjectEditor-DefaultConfiguration.js');},{"./Pict-Section-ObjectEditor-DefaultConfiguration.js":22,"./views/PictView-ObjectEditor-Node.js":24,"./views/PictView-ObjectEditor-NodeArray.js":25,"./views/PictView-ObjectEditor-NodeBoolean.js":26,"./views/PictView-ObjectEditor-NodeNull.js":27,"./views/PictView-ObjectEditor-NodeNumber.js":28,"./views/PictView-ObjectEditor-NodeObject.js":29,"./views/PictView-ObjectEditor-NodeString.js":30,"./views/PictView-ObjectEditor.js":31}],24:[function(require,module,exports){const libPictView=require('pict-view');/**
 * Base class for all object editor node type renderers.
 *
 * Each subclass implements renderNodeHTML() to return an HTML string
 * for a single tree row.  One instance per type, not per node.
 *
 * Rendering uses the Pict template system with MacroTemplates defined
 * in the view configuration.  Each macro is a Jellyfish template string
 * compiled against the node descriptor (Record) and the ObjectEditor
 * view (Context[0]).  Subclasses set type-specific properties on the
 * node descriptor, call compileMacros(), then resolve a per-type
 * template that references the compiled macros.
 */class PictViewObjectEditorNode extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this.serviceType='PictViewObjectEditorNode';// Reference to the parent ObjectEditor view; set by the orchestrator
this._ObjectEditorView=null;}/**
	 * Render a single tree node row as an HTML string.
	 *
	 * @param {Object} pNode - Node descriptor { Path, Key, Depth, DataType, HasChildren, ChildCount, IsExpanded, IsArrayElement, ArrayIndex }
	 * @param {*} pValue - The actual value at this node's path
	 * @param {Object} pOptions - Editor options { Editable, ShowTypeIndicators, IndentPixels, ViewHash }
	 *
	 * @return {string} HTML string for this row
	 */renderNodeHTML(pNode,pValue,pOptions){return'';}// --- Macro compilation ---
/**
	 * Compile all MacroTemplates onto pNode.Macro.
	 *
	 * This sets computed display properties on the node descriptor,
	 * then resolves every MacroTemplate from the view configuration
	 * against the node (as Record) and the ObjectEditor view (as Context[0]).
	 *
	 * After this call, pNode.Macro contains the compiled HTML fragments
	 * ready to be composed by a per-type template.
	 */compileMacros(pNode,pValue,pOptions){// Compute derived display properties on the node descriptor
pNode.PaddingLeft=pNode.Depth*pOptions.IndentPixels+12;pNode.EscapedPath=this.escapeAttribute(pNode.Path);pNode.EscapedKey=this.escapeHTML(String(pNode.Key));pNode.ToggleArrow=pNode.IsExpanded?'\u25BC':'\u25B6';// Parse out parent array path for move buttons
let tmpBracketMatch=pNode.Path.match(/^(.*)\[(\d+)\]$/);if(tmpBracketMatch){pNode.EscapedArrayPath=this.escapeAttribute(tmpBracketMatch[1]);}else{pNode.EscapedArrayPath='';}// Compile each MacroTemplate onto pNode.Macro
let tmpMacroTemplates=this._ObjectEditorView.options.MacroTemplates.Node;let tmpMacroKeys=Object.keys(tmpMacroTemplates);pNode.Macro={};for(let i=0;i<tmpMacroKeys.length;i++){let tmpKey=tmpMacroKeys[i];pNode.Macro[tmpKey]=this.pict.parseTemplate(tmpMacroTemplates[tmpKey],pNode,null,[this._ObjectEditorView]);}// Set the Key macro conditionally: array index or key name
if(pNode.IsArrayElement){pNode.Macro.Key=pNode.Macro.KeyIndex;}else{pNode.Macro.Key=pNode.Macro.KeyName;}// Set TypeBadge to empty if ShowTypeIndicators is false
if(!pOptions.ShowTypeIndicators){pNode.Macro.TypeBadge='';}}/**
	 * Compose action button macros for leaf nodes.
	 * Returns a compiled HTML string for the actions area.
	 */compileActions(pNode,pOptions){if(!pOptions.Editable){return'';}let tmpHTML=pNode.Macro.ActionsOpen;if(pNode.IsArrayElement){tmpHTML+=pNode.Macro.ButtonMoveUp+pNode.Macro.ButtonMoveDown;}tmpHTML+=pNode.Macro.ButtonRemove;tmpHTML+=pNode.Macro.ActionsClose;return tmpHTML;}/**
	 * Compose action button macros for container nodes (object/array).
	 * Includes an add button in addition to move and remove.
	 */compileContainerActions(pNode,pOptions,pContainerType){if(!pOptions.Editable){return'';}let tmpHTML=pNode.Macro.ActionsOpen;tmpHTML+=pContainerType==='array'?pNode.Macro.ButtonAddArray:pNode.Macro.ButtonAddObject;if(pNode.IsArrayElement){tmpHTML+=pNode.Macro.ButtonMoveUp+pNode.Macro.ButtonMoveDown;}tmpHTML+=pNode.Macro.ButtonRemove;tmpHTML+=pNode.Macro.ActionsClose;return tmpHTML;}/**
	 * Escape a string for safe use in HTML attributes.
	 */escapeAttribute(pString){if(typeof pString!=='string'){return'';}return pString.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}/**
	 * Escape a string for safe use in HTML content.
	 */escapeHTML(pString){if(typeof pString!=='string'){return'';}return pString.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}}module.exports=PictViewObjectEditorNode;},{"pict-view":33}],25:[function(require,module,exports){const libPictViewObjectEditorNode=require('./PictView-ObjectEditor-Node.js');class PictViewObjectEditorNodeArray extends libPictViewObjectEditorNode{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this.serviceType='PictViewObjectEditorNodeArray';}renderNodeHTML(pNode,pValue,pOptions){// Set type-specific display properties on the node descriptor
let tmpLength=Array.isArray(pValue)?pValue.length:0;pNode.TypeLabel='Array';let tmpNoun=tmpLength===1?'item':'items';pNode.SummaryText='['+tmpLength+' '+tmpNoun+']';// Compile all MacroTemplates onto pNode.Macro
this.compileMacros(pNode,pValue,pOptions);// Compose container actions (includes add button)
pNode.Macro.Actions=this.compileContainerActions(pNode,pOptions,'array');// Render via per-type template
return this.pict.parseTemplate(this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Array'),pNode,null,[this._ObjectEditorView]);}}module.exports=PictViewObjectEditorNodeArray;},{"./PictView-ObjectEditor-Node.js":24}],26:[function(require,module,exports){const libPictViewObjectEditorNode=require('./PictView-ObjectEditor-Node.js');class PictViewObjectEditorNodeBoolean extends libPictViewObjectEditorNode{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this.serviceType='PictViewObjectEditorNodeBoolean';}renderNodeHTML(pNode,pValue,pOptions){// Set type-specific display properties on the node descriptor
pNode.DisplayValue=pValue?'true':'false';// Compile all MacroTemplates onto pNode.Macro
this.compileMacros(pNode,pValue,pOptions);// Select editable or read-only value macro
pNode.Macro.Value=pOptions.Editable?pNode.Macro.ValueBooleanEditable:pNode.Macro.ValueBooleanReadOnly;// Compose actions
pNode.Macro.Actions=this.compileActions(pNode,pOptions);// Render via per-type template
return this.pict.parseTemplate(this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Boolean'),pNode,null,[this._ObjectEditorView]);}}module.exports=PictViewObjectEditorNodeBoolean;},{"./PictView-ObjectEditor-Node.js":24}],27:[function(require,module,exports){const libPictViewObjectEditorNode=require('./PictView-ObjectEditor-Node.js');class PictViewObjectEditorNodeNull extends libPictViewObjectEditorNode{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this.serviceType='PictViewObjectEditorNodeNull';}renderNodeHTML(pNode,pValue,pOptions){// Compile all MacroTemplates onto pNode.Macro
this.compileMacros(pNode,pValue,pOptions);// Null always uses the static ValueNull macro
pNode.Macro.Value=pNode.Macro.ValueNull;// Compose actions
pNode.Macro.Actions=this.compileActions(pNode,pOptions);// Render via per-type template
return this.pict.parseTemplate(this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Null'),pNode,null,[this._ObjectEditorView]);}}module.exports=PictViewObjectEditorNodeNull;},{"./PictView-ObjectEditor-Node.js":24}],28:[function(require,module,exports){const libPictViewObjectEditorNode=require('./PictView-ObjectEditor-Node.js');class PictViewObjectEditorNodeNumber extends libPictViewObjectEditorNode{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this.serviceType='PictViewObjectEditorNodeNumber';}renderNodeHTML(pNode,pValue,pOptions){// Set type-specific display properties on the node descriptor
pNode.EscapedValue=this.escapeHTML(String(pValue));// Compile all MacroTemplates onto pNode.Macro
this.compileMacros(pNode,pValue,pOptions);// Select editable or read-only value macro
pNode.Macro.Value=pOptions.Editable?pNode.Macro.ValueNumberEditable:pNode.Macro.ValueNumberReadOnly;// Compose actions
pNode.Macro.Actions=this.compileActions(pNode,pOptions);// Render via per-type template
return this.pict.parseTemplate(this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Number'),pNode,null,[this._ObjectEditorView]);}}module.exports=PictViewObjectEditorNodeNumber;},{"./PictView-ObjectEditor-Node.js":24}],29:[function(require,module,exports){const libPictViewObjectEditorNode=require('./PictView-ObjectEditor-Node.js');class PictViewObjectEditorNodeObject extends libPictViewObjectEditorNode{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this.serviceType='PictViewObjectEditorNodeObject';}renderNodeHTML(pNode,pValue,pOptions){// Set type-specific display properties on the node descriptor
let tmpKeyCount=0;if(pValue&&typeof pValue==='object'&&!Array.isArray(pValue)){tmpKeyCount=Object.keys(pValue).length;}pNode.TypeLabel='Object';let tmpNoun=tmpKeyCount===1?'key':'keys';pNode.SummaryText='{'+tmpKeyCount+' '+tmpNoun+'}';// Compile all MacroTemplates onto pNode.Macro
this.compileMacros(pNode,pValue,pOptions);// Compose container actions (includes add button)
pNode.Macro.Actions=this.compileContainerActions(pNode,pOptions,'object');// Render via per-type template
return this.pict.parseTemplate(this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Object'),pNode,null,[this._ObjectEditorView]);}}module.exports=PictViewObjectEditorNodeObject;},{"./PictView-ObjectEditor-Node.js":24}],30:[function(require,module,exports){const libPictViewObjectEditorNode=require('./PictView-ObjectEditor-Node.js');class PictViewObjectEditorNodeString extends libPictViewObjectEditorNode{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this.serviceType='PictViewObjectEditorNodeString';}renderNodeHTML(pNode,pValue,pOptions){// Set type-specific display properties on the node descriptor
let tmpDisplayValue=typeof pValue==='string'?pValue:'';// Truncate long strings for display
let tmpTruncated=tmpDisplayValue.length>120?tmpDisplayValue.substring(0,120)+'\u2026':tmpDisplayValue;pNode.EscapedValue=this.escapeHTML(tmpTruncated);pNode.EscapedTitle=this.escapeAttribute(tmpDisplayValue);// Compile all MacroTemplates onto pNode.Macro
this.compileMacros(pNode,pValue,pOptions);// Select editable or read-only value macro
pNode.Macro.Value=pOptions.Editable?pNode.Macro.ValueStringEditable:pNode.Macro.ValueStringReadOnly;// Compose actions
pNode.Macro.Actions=this.compileActions(pNode,pOptions);// Render via per-type template
return this.pict.parseTemplate(this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-String'),pNode,null,[this._ObjectEditorView]);}}module.exports=PictViewObjectEditorNodeString;},{"./PictView-ObjectEditor-Node.js":24}],31:[function(require,module,exports){const libPictView=require('pict-view');const libNodeString=require('./PictView-ObjectEditor-NodeString.js');const libNodeNumber=require('./PictView-ObjectEditor-NodeNumber.js');const libNodeBoolean=require('./PictView-ObjectEditor-NodeBoolean.js');const libNodeNull=require('./PictView-ObjectEditor-NodeNull.js');const libNodeObject=require('./PictView-ObjectEditor-NodeObject.js');const libNodeArray=require('./PictView-ObjectEditor-NodeArray.js');const _DefaultConfiguration=require('../Pict-Section-ObjectEditor-DefaultConfiguration.js');class PictViewObjectEditor extends libPictView{constructor(pFable,pOptions,pServiceHash){let tmpOptions=Object.assign({},_DefaultConfiguration,pOptions);super(pFable,tmpOptions,pServiceHash);this.initialRenderComplete=false;// Set of expanded path strings
this._ExpandedPaths=new Set();// Map of data type -> node renderer instance
this._NodeRenderers={};}onBeforeInitialize(){super.onBeforeInitialize();// Register node type service types if they aren't already present
let tmpNodeTypes={'PictViewObjectEditorNodeString':libNodeString,'PictViewObjectEditorNodeNumber':libNodeNumber,'PictViewObjectEditorNodeBoolean':libNodeBoolean,'PictViewObjectEditorNodeNull':libNodeNull,'PictViewObjectEditorNodeObject':libNodeObject,'PictViewObjectEditorNodeArray':libNodeArray};let tmpNodeTypeKeys=Object.keys(tmpNodeTypes);for(let i=0;i<tmpNodeTypeKeys.length;i++){let tmpKey=tmpNodeTypeKeys[i];if(!this.fable.servicesMap.hasOwnProperty(tmpKey)){this.fable.addServiceType(tmpKey,tmpNodeTypes[tmpKey]);}}// Instantiate one renderer per data type
this._NodeRenderers.string=this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeString');this._NodeRenderers.number=this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeNumber');this._NodeRenderers.boolean=this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeBoolean');this._NodeRenderers.null=this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeNull');this._NodeRenderers.object=this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeObject');this._NodeRenderers.array=this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeArray');// Set back-references on each renderer
let tmpRendererKeys=Object.keys(this._NodeRenderers);for(let i=0;i<tmpRendererKeys.length;i++){this._NodeRenderers[tmpRendererKeys[i]]._ObjectEditorView=this;}return super.onBeforeInitialize();}onAfterRender(){super.onAfterRender();// Ensure the CSS from all registered views is injected into the DOM
this.pict.CSSMap.injectCSS();if(!this.initialRenderComplete){this.initialRenderComplete=true;this.onAfterInitialRender();}// Always re-populate the tree after any render, since the container
// template may have been re-rendered (e.g., by the application auto-render).
this.renderTree();}onAfterInitialRender(){// Expand to the configured initial depth
let tmpData=this._resolveObjectData();if(tmpData!==null&&typeof tmpData==='object'){this._expandToDepth(tmpData,'',0,this.options.InitialExpandDepth);}}// --- Public API ---
/**
	 * Toggle expand/collapse on a node path.
	 */toggleNode(pPath){if(this._ExpandedPaths.has(pPath)){this._ExpandedPaths.delete(pPath);}else{this._ExpandedPaths.add(pPath);}this.renderTree();}/**
	 * Toggle a boolean value at a path.
	 */toggleBoolean(pPath){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpCurrentValue=this._getValueAtPath(tmpData,pPath);this._setValueAtPath(tmpData,pPath,!tmpCurrentValue);this.renderTree();}/**
	 * Begin inline editing of a leaf node.
	 */beginEdit(pPath,pType){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpCurrentValue=this._getValueAtPath(tmpData,pPath);let tmpRowElement=this._getTreeElement().querySelector(`[data-path="${pPath}"]`);if(!tmpRowElement){return;}let tmpValueSpan=tmpRowElement.querySelector('.pict-oe-value');if(!tmpValueSpan){return;}let tmpInputType=pType==='number'?'number':'text';let tmpInputValue=tmpCurrentValue===null||tmpCurrentValue===undefined?'':String(tmpCurrentValue);let tmpEscapedPath=tmpInputValue.replace(/"/g,'&quot;');let tmpInput=document.createElement('input');tmpInput.type=tmpInputType;tmpInput.className='pict-oe-value-input';tmpInput.value=tmpInputValue;let tmpSelf=this;let tmpCommit=function(){let tmpNewValue=tmpInput.value;if(pType==='number'){tmpNewValue=Number(tmpNewValue);if(isNaN(tmpNewValue)){tmpNewValue=0;}}tmpSelf._setValueAtPath(tmpData,pPath,tmpNewValue);tmpSelf.renderTree();};tmpInput.addEventListener('blur',tmpCommit);tmpInput.addEventListener('keydown',function(pEvent){if(pEvent.key==='Enter'){tmpInput.blur();}else if(pEvent.key==='Escape'){// Cancel edit, just re-render
tmpInput.removeEventListener('blur',tmpCommit);tmpSelf.renderTree();}});tmpValueSpan.innerHTML='';tmpValueSpan.appendChild(tmpInput);tmpInput.focus();tmpInput.select();}/**
	 * Set a value at a dot-path in the object data and re-render.
	 */setValueAtPath(pPath,pValue){let tmpData=this._resolveObjectData();if(tmpData===null){return;}this._setValueAtPath(tmpData,pPath,pValue);this.renderTree();}/**
	 * Expand all nodes to a given depth.
	 */expandToDepth(pDepth){this._ExpandedPaths.clear();let tmpData=this._resolveObjectData();if(tmpData!==null&&typeof tmpData==='object'){this._expandToDepth(tmpData,'',0,pDepth);}this.renderTree();}/**
	 * Expand all nodes in the tree.
	 */expandAll(){let tmpData=this._resolveObjectData();if(tmpData!==null&&typeof tmpData==='object'){this._expandToDepth(tmpData,'',0,Infinity);}this.renderTree();}/**
	 * Collapse all nodes in the tree.
	 */collapseAll(){this._ExpandedPaths.clear();this.renderTree();}// --- Add/Remove API ---
/**
	 * Add a property to an object at a given path.
	 */addObjectProperty(pPath,pKey,pDefaultValue){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpTarget=pPath?this._getValueAtPath(tmpData,pPath):tmpData;if(tmpTarget===null||tmpTarget===undefined||typeof tmpTarget!=='object'||Array.isArray(tmpTarget)){return;}let tmpValue=pDefaultValue!==undefined?pDefaultValue:'';tmpTarget[pKey]=tmpValue;// Auto-expand the parent so the new property is visible
if(pPath){this._ExpandedPaths.add(pPath);}this.renderTree();}/**
	 * Remove a property from an object at a given path.
	 */removeObjectProperty(pPath,pKey){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpTarget=pPath?this._getValueAtPath(tmpData,pPath):tmpData;if(tmpTarget===null||tmpTarget===undefined||typeof tmpTarget!=='object'||Array.isArray(tmpTarget)){return;}let tmpChildPath=pPath?pPath+'.'+pKey:pKey;this._cleanupExpandedPaths(tmpChildPath);delete tmpTarget[pKey];this.renderTree();}/**
	 * Add an element to the end of an array at a given path.
	 */addArrayElement(pPath,pDefaultValue){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpTarget=pPath?this._getValueAtPath(tmpData,pPath):tmpData;if(!Array.isArray(tmpTarget)){return;}let tmpValue=pDefaultValue!==undefined?pDefaultValue:'';tmpTarget.push(tmpValue);// Auto-expand the parent so the new element is visible
if(pPath){this._ExpandedPaths.add(pPath);}this.renderTree();}/**
	 * Remove an element from an array at a given path by index.
	 */removeArrayElement(pPath,pIndex){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpTarget=pPath?this._getValueAtPath(tmpData,pPath):tmpData;if(!Array.isArray(tmpTarget)){return;}let tmpIntIndex=parseInt(pIndex,10);if(isNaN(tmpIntIndex)||tmpIntIndex<0||tmpIntIndex>=tmpTarget.length){return;}// Clean up expanded paths for the removed element and shift higher indices
let tmpRemovedPath=pPath?pPath+'['+tmpIntIndex+']':'['+tmpIntIndex+']';this._cleanupExpandedPaths(tmpRemovedPath);this._shiftArrayExpandedPaths(pPath,tmpIntIndex,tmpTarget.length);tmpTarget.splice(tmpIntIndex,1);this.renderTree();}/**
	 * Remove a node from its parent, auto-detecting whether parent is object or array.
	 * Works by parsing the path to find the parent and key/index.
	 */removeNode(pPath){if(!pPath){return;}let tmpData=this._resolveObjectData();if(tmpData===null){return;}// Determine if the last segment is a bracket index or a dot key
let tmpBracketMatch=pPath.match(/^(.*)\[(\d+)\]$/);if(tmpBracketMatch){// Array element: parent path is the part before [N]
let tmpParentPath=tmpBracketMatch[1];let tmpIndex=parseInt(tmpBracketMatch[2],10);this.removeArrayElement(tmpParentPath,tmpIndex);}else{// Object property: parent path is everything before the last dot
let tmpLastDot=pPath.lastIndexOf('.');if(tmpLastDot===-1){// Top-level key — parent is root
let tmpKey=pPath;this.removeObjectProperty('',tmpKey);}else{let tmpParentPath=pPath.substring(0,tmpLastDot);let tmpKey=pPath.substring(tmpLastDot+1);this.removeObjectProperty(tmpParentPath,tmpKey);}}}// --- Array Reorder API ---
/**
	 * Move an array element up by one position (swap with the element before it).
	 * If already at index 0 this is a no-op.
	 */moveArrayElementUp(pPath,pIndex){let tmpIntIndex=parseInt(pIndex,10);if(isNaN(tmpIntIndex)||tmpIntIndex<=0){return;}this.moveArrayElementToIndex(pPath,tmpIntIndex,tmpIntIndex-1);}/**
	 * Move an array element down by one position (swap with the element after it).
	 * If already at the last index this is a no-op.
	 */moveArrayElementDown(pPath,pIndex){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpTarget=pPath?this._getValueAtPath(tmpData,pPath):tmpData;if(!Array.isArray(tmpTarget)){return;}let tmpIntIndex=parseInt(pIndex,10);if(isNaN(tmpIntIndex)||tmpIntIndex<0||tmpIntIndex>=tmpTarget.length-1){return;}this.moveArrayElementToIndex(pPath,tmpIntIndex,tmpIntIndex+1);}/**
	 * Move an array element from one index to another.
	 * If pNewIndex is out of bounds it is clamped to [0, length-1].
	 */moveArrayElementToIndex(pPath,pFromIndex,pToIndex){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpTarget=pPath?this._getValueAtPath(tmpData,pPath):tmpData;if(!Array.isArray(tmpTarget)){return;}let tmpFrom=parseInt(pFromIndex,10);if(isNaN(tmpFrom)||tmpFrom<0||tmpFrom>=tmpTarget.length){return;}let tmpTo=parseInt(pToIndex,10);if(isNaN(tmpTo)){return;}// Clamp to valid range
if(tmpTo<0){tmpTo=0;}if(tmpTo>=tmpTarget.length){tmpTo=tmpTarget.length-1;}if(tmpFrom===tmpTo){return;}// Update expanded paths before mutating the array
this._moveArrayExpandedPaths(pPath,tmpFrom,tmpTo,tmpTarget.length);// Splice the element out and insert at the new position
let tmpElement=tmpTarget.splice(tmpFrom,1)[0];tmpTarget.splice(tmpTo,0,tmpElement);this.renderTree();}/**
	 * Begin adding a new property to an object by showing an inline key input
	 * and a type selector dropdown.
	 */beginAddToObject(pPath){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpTreeElement=this._getTreeElement();if(!tmpTreeElement){return;}let tmpRowElement=tmpTreeElement.querySelector(`[data-path="${pPath}"]`);if(!tmpRowElement){return;}// Create an inline input for the key name
let tmpInput=document.createElement('input');tmpInput.type='text';tmpInput.className='pict-oe-key-input';tmpInput.placeholder='key';// Create a type selector dropdown
let tmpSelect=this._createTypeSelect();let tmpSelf=this;let tmpCommitted=false;let tmpCommit=function(){if(tmpCommitted){return;}tmpCommitted=true;let tmpKey=tmpInput.value.trim();if(tmpKey){let tmpDefaultValue=tmpSelf._getDefaultValueForType(tmpSelect.value);tmpSelf.addObjectProperty(pPath,tmpKey,tmpDefaultValue);}else{tmpSelf.renderTree();}};tmpInput.addEventListener('keydown',function(pEvent){if(pEvent.key==='Enter'){tmpCommit();}else if(pEvent.key==='Escape'){tmpCommitted=true;tmpSelf.renderTree();}});tmpSelect.addEventListener('keydown',function(pEvent){if(pEvent.key==='Enter'){tmpCommit();}else if(pEvent.key==='Escape'){tmpCommitted=true;tmpSelf.renderTree();}});// Commit when focus leaves both elements
let tmpBlurTimeout=null;let tmpHandleBlur=function(){clearTimeout(tmpBlurTimeout);tmpBlurTimeout=setTimeout(function(){// Check if focus moved to the other element in the pair
if(document.activeElement!==tmpInput&&document.activeElement!==tmpSelect){tmpCommit();}},150);};tmpInput.addEventListener('blur',tmpHandleBlur);tmpSelect.addEventListener('blur',tmpHandleBlur);// Insert before the actions container
let tmpActionsSpan=tmpRowElement.querySelector('.pict-oe-actions');if(tmpActionsSpan){tmpRowElement.insertBefore(tmpInput,tmpActionsSpan);tmpRowElement.insertBefore(tmpSelect,tmpActionsSpan);}else{tmpRowElement.appendChild(tmpInput);tmpRowElement.appendChild(tmpSelect);}tmpInput.focus();}/**
	 * Begin adding a new element to an array by showing a type selector dropdown.
	 */beginAddToArray(pPath){let tmpData=this._resolveObjectData();if(tmpData===null){return;}let tmpTreeElement=this._getTreeElement();if(!tmpTreeElement){return;}let tmpRowElement=tmpTreeElement.querySelector(`[data-path="${pPath}"]`);if(!tmpRowElement){return;}// Create a type selector dropdown
let tmpSelect=this._createTypeSelect();let tmpSelf=this;let tmpCommitted=false;let tmpCommit=function(){if(tmpCommitted){return;}tmpCommitted=true;let tmpDefaultValue=tmpSelf._getDefaultValueForType(tmpSelect.value);tmpSelf.addArrayElement(pPath,tmpDefaultValue);};tmpSelect.addEventListener('keydown',function(pEvent){if(pEvent.key==='Enter'){tmpCommit();}else if(pEvent.key==='Escape'){tmpCommitted=true;tmpSelf.renderTree();}});tmpSelect.addEventListener('blur',function(){setTimeout(function(){tmpCommit();},100);});// Insert before the actions container
let tmpActionsSpan=tmpRowElement.querySelector('.pict-oe-actions');if(tmpActionsSpan){tmpRowElement.insertBefore(tmpSelect,tmpActionsSpan);}else{tmpRowElement.appendChild(tmpSelect);}tmpSelect.focus();}/**
	 * Create a type selector <select> element for choosing the type of a new entry.
	 */_createTypeSelect(){let tmpSelect=document.createElement('select');tmpSelect.className='pict-oe-type-select';let tmpTypes=['String','Number','Boolean','Null','Object','Array'];for(let i=0;i<tmpTypes.length;i++){let tmpOption=document.createElement('option');tmpOption.value=tmpTypes[i];tmpOption.textContent=tmpTypes[i];tmpSelect.appendChild(tmpOption);}return tmpSelect;}/**
	 * Return the default value for a given type name.
	 */_getDefaultValueForType(pTypeName){switch(pTypeName){case'Number':return 0;case'Boolean':return false;case'Null':return null;case'Object':return{};case'Array':return[];case'String':default:return'';}}// --- Marshal lifecycle ---
marshalToView(){this.renderTree();return super.marshalToView();}// --- Tree rendering ---
/**
	 * Render the visible tree into the container element.
	 */renderTree(){let tmpData=this._resolveObjectData();let tmpTreeElement=this._getTreeElement();if(!tmpTreeElement){return;}if(tmpData===null||tmpData===undefined){this.pict.ContentAssignment.assignContent(tmpTreeElement,'<div class="pict-oe-empty">No data</div>');return;}let tmpOptions={Editable:this.options.Editable,ShowTypeIndicators:this.options.ShowTypeIndicators,IndentPixels:this.options.IndentPixels,ViewHash:this.Hash};let tmpHTML='';if(typeof tmpData==='object'&&!Array.isArray(tmpData)){// Render top-level object keys without a root wrapper node
tmpHTML=this._walkObject(tmpData,'',0,tmpOptions,true);// Add a root-level "add property" button when editable
if(tmpOptions.Editable){tmpHTML+=this.pict.parseTemplate(this.options.MacroTemplates.Node.RootAddObject,{},null,[this]);}}else if(Array.isArray(tmpData)){// Render top-level array elements without a root wrapper node
tmpHTML=this._walkArray(tmpData,'',0,tmpOptions,true);// Add a root-level "add element" button when editable
if(tmpOptions.Editable){tmpHTML+=this.pict.parseTemplate(this.options.MacroTemplates.Node.RootAddArray,{},null,[this]);}}else{// Single primitive value at root
let tmpNode={Path:'',Key:'(root)',Depth:0,DataType:this._getJsonType(tmpData),HasChildren:false,ChildCount:0,IsExpanded:false,IsArrayElement:false,ArrayIndex:-1};let tmpRenderer=this._NodeRenderers[tmpNode.DataType];if(tmpRenderer){tmpHTML=tmpRenderer.renderNodeHTML(tmpNode,tmpData,tmpOptions);}}if(!tmpHTML){tmpHTML='<div class="pict-oe-empty">Empty object</div>';}this.pict.ContentAssignment.assignContent(tmpTreeElement,tmpHTML);}// --- Internal tree walking ---
_walkObject(pValue,pBasePath,pDepth,pOptions,pIsRoot){let tmpHTML='';let tmpKeys=Object.keys(pValue);for(let i=0;i<tmpKeys.length;i++){let tmpKey=tmpKeys[i];let tmpChildPath=pBasePath?pBasePath+'.'+tmpKey:tmpKey;let tmpChildValue=pValue[tmpKey];let tmpType=this._getJsonType(tmpChildValue);let tmpNode={Path:tmpChildPath,Key:tmpKey,Depth:pDepth,DataType:tmpType,HasChildren:false,ChildCount:0,IsExpanded:false,IsArrayElement:false,ArrayIndex:-1};if(tmpType==='object'){let tmpChildKeys=tmpChildValue!==null?Object.keys(tmpChildValue):[];tmpNode.HasChildren=tmpChildKeys.length>0;tmpNode.ChildCount=tmpChildKeys.length;tmpNode.IsExpanded=this._ExpandedPaths.has(tmpChildPath);let tmpRenderer=this._NodeRenderers.object;tmpHTML+=tmpRenderer.renderNodeHTML(tmpNode,tmpChildValue,pOptions);if(tmpNode.IsExpanded){tmpHTML+=this._walkObject(tmpChildValue,tmpChildPath,pDepth+1,pOptions,false);}}else if(tmpType==='array'){tmpNode.HasChildren=tmpChildValue.length>0;tmpNode.ChildCount=tmpChildValue.length;tmpNode.IsExpanded=this._ExpandedPaths.has(tmpChildPath);let tmpRenderer=this._NodeRenderers.array;tmpHTML+=tmpRenderer.renderNodeHTML(tmpNode,tmpChildValue,pOptions);if(tmpNode.IsExpanded){tmpHTML+=this._walkArray(tmpChildValue,tmpChildPath,pDepth+1,pOptions,false);}}else{let tmpRenderer=this._NodeRenderers[tmpType];if(tmpRenderer){tmpHTML+=tmpRenderer.renderNodeHTML(tmpNode,tmpChildValue,pOptions);}}}return tmpHTML;}_walkArray(pValue,pBasePath,pDepth,pOptions,pIsRoot){let tmpHTML='';for(let i=0;i<pValue.length;i++){let tmpChildPath=pBasePath?pBasePath+'['+i+']':'['+i+']';let tmpChildValue=pValue[i];let tmpType=this._getJsonType(tmpChildValue);let tmpNode={Path:tmpChildPath,Key:String(i),Depth:pDepth,DataType:tmpType,HasChildren:false,ChildCount:0,IsExpanded:false,IsArrayElement:true,ArrayIndex:i};if(tmpType==='object'){let tmpChildKeys=tmpChildValue!==null?Object.keys(tmpChildValue):[];tmpNode.HasChildren=tmpChildKeys.length>0;tmpNode.ChildCount=tmpChildKeys.length;tmpNode.IsExpanded=this._ExpandedPaths.has(tmpChildPath);let tmpRenderer=this._NodeRenderers.object;tmpHTML+=tmpRenderer.renderNodeHTML(tmpNode,tmpChildValue,pOptions);if(tmpNode.IsExpanded){tmpHTML+=this._walkObject(tmpChildValue,tmpChildPath,pDepth+1,pOptions,false);}}else if(tmpType==='array'){tmpNode.HasChildren=tmpChildValue.length>0;tmpNode.ChildCount=tmpChildValue.length;tmpNode.IsExpanded=this._ExpandedPaths.has(tmpChildPath);let tmpRenderer=this._NodeRenderers.array;tmpHTML+=tmpRenderer.renderNodeHTML(tmpNode,tmpChildValue,pOptions);if(tmpNode.IsExpanded){tmpHTML+=this._walkArray(tmpChildValue,tmpChildPath,pDepth+1,pOptions,false);}}else{let tmpRenderer=this._NodeRenderers[tmpType];if(tmpRenderer){tmpHTML+=tmpRenderer.renderNodeHTML(tmpNode,tmpChildValue,pOptions);}}}return tmpHTML;}// --- Utility methods ---
_getJsonType(pValue){if(pValue===null||pValue===undefined){return'null';}if(Array.isArray(pValue)){return'array';}let tmpType=typeof pValue;if(tmpType==='object'){return'object';}if(tmpType==='number'){return'number';}if(tmpType==='boolean'){return'boolean';}return'string';}_resolveObjectData(){if(!this.options.ObjectDataAddress){return null;}// Support "AppData.SomeKey" style addresses
let tmpAddress=this.options.ObjectDataAddress;let tmpParts=tmpAddress.split('.');let tmpCurrent=this.fable;for(let i=0;i<tmpParts.length;i++){if(tmpCurrent===null||tmpCurrent===undefined){return null;}tmpCurrent=tmpCurrent[tmpParts[i]];}return tmpCurrent;}_getTreeElement(){let tmpElementId='ObjectEditor-Tree-'+this.Hash;let tmpElements=this.pict.ContentAssignment.getElement('#'+tmpElementId);if(tmpElements&&tmpElements.length>0){return tmpElements[0];}return null;}_getValueAtPath(pObject,pPath){if(!pPath){return pObject;}let tmpSegments=this._parsePath(pPath);let tmpCurrent=pObject;for(let i=0;i<tmpSegments.length;i++){if(tmpCurrent===null||tmpCurrent===undefined){return undefined;}tmpCurrent=tmpCurrent[tmpSegments[i]];}return tmpCurrent;}_setValueAtPath(pObject,pPath,pValue){if(!pPath){return;}let tmpSegments=this._parsePath(pPath);let tmpCurrent=pObject;for(let i=0;i<tmpSegments.length-1;i++){if(tmpCurrent===null||tmpCurrent===undefined){return;}tmpCurrent=tmpCurrent[tmpSegments[i]];}if(tmpCurrent!==null&&tmpCurrent!==undefined){tmpCurrent[tmpSegments[tmpSegments.length-1]]=pValue;}}/**
	 * Parse a dotted path with bracket notation into segments.
	 * e.g., "config.items[2].name" -> ["config", "items", 2, "name"]
	 */_parsePath(pPath){let tmpSegments=[];let tmpParts=pPath.split('.');for(let i=0;i<tmpParts.length;i++){let tmpPart=tmpParts[i];// Check for bracket notation
let tmpBracketMatch=tmpPart.match(/^([^\[]*)\[(\d+)\]$/);if(tmpBracketMatch){if(tmpBracketMatch[1]){tmpSegments.push(tmpBracketMatch[1]);}tmpSegments.push(parseInt(tmpBracketMatch[2],10));}else if(tmpPart){tmpSegments.push(tmpPart);}}return tmpSegments;}/**
	 * Remove all expanded paths that reference a deleted subtree.
	 */_cleanupExpandedPaths(pRemovedPath){let tmpToRemove=[];this._ExpandedPaths.forEach(function(tmpPath){if(tmpPath===pRemovedPath||tmpPath.indexOf(pRemovedPath+'.')===0||tmpPath.indexOf(pRemovedPath+'[')===0){tmpToRemove.push(tmpPath);}});for(let i=0;i<tmpToRemove.length;i++){this._ExpandedPaths.delete(tmpToRemove[i]);}}/**
	 * After removing an array element, shift expanded paths for higher indices down by one.
	 * e.g., if we removed items[2], then items[3] becomes items[2], items[4] becomes items[3], etc.
	 */_shiftArrayExpandedPaths(pArrayPath,pRemovedIndex,pOriginalLength){let tmpPrefix=pArrayPath?pArrayPath:'';for(let i=pRemovedIndex+1;i<pOriginalLength;i++){let tmpOldPath=tmpPrefix+'['+i+']';let tmpNewPath=tmpPrefix+'['+(i-1)+']';// Collect all expanded paths that start with the old path
let tmpToRename=[];this._ExpandedPaths.forEach(function(tmpPath){if(tmpPath===tmpOldPath){tmpToRename.push({old:tmpPath,replacement:tmpNewPath});}else if(tmpPath.indexOf(tmpOldPath+'.')===0){tmpToRename.push({old:tmpPath,replacement:tmpNewPath+tmpPath.substring(tmpOldPath.length)});}else if(tmpPath.indexOf(tmpOldPath+'[')===0){tmpToRename.push({old:tmpPath,replacement:tmpNewPath+tmpPath.substring(tmpOldPath.length)});}});for(let j=0;j<tmpToRename.length;j++){this._ExpandedPaths.delete(tmpToRename[j].old);this._ExpandedPaths.add(tmpToRename[j].replacement);}}}/**
	 * Update expanded paths when an array element moves from one index to another.
	 * Works by collecting all paths for every index in the affected range,
	 * then remapping them to their new positions.
	 */_moveArrayExpandedPaths(pArrayPath,pFromIndex,pToIndex,pLength){let tmpPrefix=pArrayPath?pArrayPath:'';// Determine the range of indices affected by the move
let tmpMinIndex=Math.min(pFromIndex,pToIndex);let tmpMaxIndex=Math.max(pFromIndex,pToIndex);// Collect all expanded paths for every index in the affected range
// Map: index -> array of { suffix } (the part after the [N])
let tmpPathsByIndex={};for(let i=tmpMinIndex;i<=tmpMaxIndex;i++){tmpPathsByIndex[i]=[];}let tmpToRemove=[];let tmpSelf=this;this._ExpandedPaths.forEach(function(tmpPath){for(let i=tmpMinIndex;i<=tmpMaxIndex;i++){let tmpIndexPath=tmpPrefix+'['+i+']';if(tmpPath===tmpIndexPath){tmpPathsByIndex[i].push('');tmpToRemove.push(tmpPath);}else if(tmpPath.indexOf(tmpIndexPath+'.')===0){tmpPathsByIndex[i].push(tmpPath.substring(tmpIndexPath.length));tmpToRemove.push(tmpPath);}else if(tmpPath.indexOf(tmpIndexPath+'[')===0){tmpPathsByIndex[i].push(tmpPath.substring(tmpIndexPath.length));tmpToRemove.push(tmpPath);}}});// Remove old paths
for(let i=0;i<tmpToRemove.length;i++){this._ExpandedPaths.delete(tmpToRemove[i]);}// Compute new index mapping:
// When moving from -> to, the element at pFromIndex goes to pToIndex,
// and all elements between shift by 1 in the opposite direction.
let tmpNewIndexMap={};if(pFromIndex<pToIndex){// Moving forward: elements between (from+1..to) shift down by 1
tmpNewIndexMap[pFromIndex]=pToIndex;for(let i=pFromIndex+1;i<=pToIndex;i++){tmpNewIndexMap[i]=i-1;}}else{// Moving backward: elements between (to..from-1) shift up by 1
tmpNewIndexMap[pFromIndex]=pToIndex;for(let i=pToIndex;i<pFromIndex;i++){tmpNewIndexMap[i]=i+1;}}// Re-add paths at their new indices
let tmpOldIndices=Object.keys(tmpPathsByIndex);for(let i=0;i<tmpOldIndices.length;i++){let tmpOldIndex=parseInt(tmpOldIndices[i],10);let tmpNewIndex=tmpNewIndexMap[tmpOldIndex];let tmpSuffixes=tmpPathsByIndex[tmpOldIndex];for(let j=0;j<tmpSuffixes.length;j++){this._ExpandedPaths.add(tmpPrefix+'['+tmpNewIndex+']'+tmpSuffixes[j]);}}}/**
	 * Recursively expand paths up to a given depth.
	 */_expandToDepth(pValue,pBasePath,pCurrentDepth,pMaxDepth){if(pValue===null||pValue===undefined||typeof pValue!=='object'){return;}if(Array.isArray(pValue)){for(let i=0;i<pValue.length;i++){let tmpChildPath=pBasePath?pBasePath+'['+i+']':'['+i+']';if(typeof pValue[i]==='object'&&pValue[i]!==null){// Mark this child as expanded (it's an object or array that can be toggled)
this._ExpandedPaths.add(tmpChildPath);if(pCurrentDepth+1<pMaxDepth){this._expandToDepth(pValue[i],tmpChildPath,pCurrentDepth+1,pMaxDepth);}}}}else{let tmpKeys=Object.keys(pValue);for(let i=0;i<tmpKeys.length;i++){let tmpKey=tmpKeys[i];let tmpChildPath=pBasePath?pBasePath+'.'+tmpKey:tmpKey;let tmpChildValue=pValue[tmpKey];if(typeof tmpChildValue==='object'&&tmpChildValue!==null){// Mark this child as expanded (it's an object or array that can be toggled)
this._ExpandedPaths.add(tmpChildPath);if(pCurrentDepth+1<pMaxDepth){this._expandToDepth(tmpChildValue,tmpChildPath,pCurrentDepth+1,pMaxDepth);}}}}}}module.exports=PictViewObjectEditor;module.exports.default_configuration=_DefaultConfiguration;},{"../Pict-Section-ObjectEditor-DefaultConfiguration.js":22,"./PictView-ObjectEditor-NodeArray.js":25,"./PictView-ObjectEditor-NodeBoolean.js":26,"./PictView-ObjectEditor-NodeNull.js":27,"./PictView-ObjectEditor-NodeNumber.js":28,"./PictView-ObjectEditor-NodeObject.js":29,"./PictView-ObjectEditor-NodeString.js":30,"pict-view":33}],32:[function(require,module,exports){module.exports={"name":"pict-view","version":"1.0.67","description":"Pict View Base Class","main":"source/Pict-View.js","scripts":{"test":"npx quack test","tests":"npx quack test -g","start":"node source/Pict-View.js","coverage":"npx quack coverage","build":"npx quack build","docker-dev-build":"docker build ./ -f Dockerfile_LUXURYCode -t pict-view-image:local","docker-dev-run":"docker run -it -d --name pict-view-dev -p 30001:8080 -p 38086:8086 -v \"$PWD/.config:/home/coder/.config\"  -v \"$PWD:/home/coder/pict-view\" -u \"$(id -u):$(id -g)\" -e \"DOCKER_USER=$USER\" pict-view-image:local","docker-dev-shell":"docker exec -it pict-view-dev /bin/bash","types":"tsc -p .","lint":"eslint source/**"},"types":"types/source/Pict-View.d.ts","repository":{"type":"git","url":"git+https://github.com/stevenvelozo/pict-view.git"},"author":"steven velozo <steven@velozo.com>","license":"MIT","bugs":{"url":"https://github.com/stevenvelozo/pict-view/issues"},"homepage":"https://github.com/stevenvelozo/pict-view#readme","devDependencies":{"@eslint/js":"^9.39.1","browser-env":"^3.3.0","eslint":"^9.39.1","pict":"^1.0.348","quackage":"^1.0.58","typescript":"^5.9.3"},"mocha":{"diff":true,"extension":["js"],"package":"./package.json","reporter":"spec","slow":"75","timeout":"5000","ui":"tdd","watch-files":["source/**/*.js","test/**/*.js"],"watch-ignore":["lib/vendor"]},"dependencies":{"fable":"^3.1.63","fable-serviceproviderbase":"^3.0.19"}};},{}],33:[function(require,module,exports){const libFableServiceBase=require('fable-serviceproviderbase');const libPackage=require('../package.json');const defaultPictViewSettings={DefaultRenderable:false,DefaultDestinationAddress:false,DefaultTemplateRecordAddress:false,ViewIdentifier:false,// If this is set to true, when the App initializes this will.
// After the App initializes, initialize will be called as soon as it's added.
AutoInitialize:true,AutoInitializeOrdinal:0,// If this is set to true, when the App autorenders (on load) this will.
// After the App initializes, render will be called as soon as it's added.
AutoRender:true,AutoRenderOrdinal:0,AutoSolveWithApp:true,AutoSolveOrdinal:0,CSSHash:false,CSS:false,CSSProvider:false,CSSPriority:500,Templates:[],DefaultTemplates:[],Renderables:[],Manifests:{}};/** @typedef {(error?: Error) => void} ErrorCallback *//** @typedef {number | boolean} PictTimestamp *//**
 * @typedef {'replace' | 'append' | 'prepend' | 'append_once' | 'virtual-assignment'} RenderMethod
 *//**
 * @typedef {Object} Renderable
 *
 * @property {string} RenderableHash - A unique hash for the renderable.
 * @property {string} TemplateHash - The hash of the template to use for rendering this renderable.
 * @property {string} [DefaultTemplateRecordAddress] - The default address for resolving the data record for this renderable.
 * @property {string} [ContentDestinationAddress] - The default address (DOM CSS selector) for rendering the content of this renderable.
 * @property {RenderMethod} [RenderMethod=replace] - The method to use when projecting the renderable to the DOM ('replace', 'append', 'prepend', 'append_once', 'virtual-assignment').
 * @property {string} [TestAddress] - The address to use for testing the renderable.
 * @property {string} [TransactionHash] - The transaction hash for the root renderable.
 * @property {string} [RootRenderableViewHash] - The hash of the root renderable.
 * @property {string} [Content] - The rendered content for this renderable, if applicable.
 *//**
 * Represents a view in the Pict ecosystem.
 */class PictView extends libFableServiceBase{/**
	 * @param {any} pFable - The Fable object that this service is attached to.
	 * @param {any} [pOptions] - (optional) The options for this service.
	 * @param {string} [pServiceHash] - (optional) The hash of the service.
	 */constructor(pFable,pOptions,pServiceHash){// Intersect default options, parent constructor, service information
let tmpOptions=Object.assign({},JSON.parse(JSON.stringify(defaultPictViewSettings)),pOptions);super(pFable,tmpOptions,pServiceHash);//FIXME: add types to fable and ancillaries
/** @type {any} */this.fable;/** @type {any} */this.options;/** @type {String} */this.UUID;/** @type {String} */this.Hash;/** @type {any} */this.log;const tmpHashIsUUID=this.Hash===this.UUID;//NOTE: since many places are using the view UUID as the HTML element ID, we prefix it to avoid starting with a number
this.UUID=`V-${this.UUID}`;if(tmpHashIsUUID){this.Hash=this.UUID;}if(!this.options.ViewIdentifier){this.options.ViewIdentifier=`AutoViewID-${this.fable.getUUID()}`;}this.serviceType='PictView';/** @type {Record<string, any>} */this._Package=libPackage;// Convenience and consistency naming
/** @type {import('pict') & { log: any, instantiateServiceProviderWithoutRegistration: (hash: String) => any, instantiateServiceProviderIfNotExists: (hash: string) => any, TransactionTracking: import('pict/types/source/services/Fable-Service-TransactionTracking') }} */this.pict=this.fable;// Wire in the essential Pict application state
this.AppData=this.pict.AppData;this.Bundle=this.pict.Bundle;/** @type {PictTimestamp} */this.initializeTimestamp=false;/** @type {PictTimestamp} */this.lastSolvedTimestamp=false;/** @type {PictTimestamp} */this.lastRenderedTimestamp=false;/** @type {PictTimestamp} */this.lastMarshalFromViewTimestamp=false;/** @type {PictTimestamp} */this.lastMarshalToViewTimestamp=false;this.pict.instantiateServiceProviderIfNotExists('TransactionTracking');// Load all templates from the array in the options
// Templates are in the form of {Hash:'Some-Template-Hash',Template:'Template content',Source:'TemplateSource'}
for(let i=0;i<this.options.Templates.length;i++){let tmpTemplate=this.options.Templates[i];if(!('Hash'in tmpTemplate)||!('Template'in tmpTemplate)){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Template ${i} in the options array.`,tmpTemplate);}else{if(!tmpTemplate.Source){tmpTemplate.Source=`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} options object.`;}this.pict.TemplateProvider.addTemplate(tmpTemplate.Hash,tmpTemplate.Template,tmpTemplate.Source);}}// Load all default templates from the array in the options
// Templates are in the form of {Prefix:'',Postfix:'-List-Row',Template:'Template content',Source:'TemplateSourceString'}
for(let i=0;i<this.options.DefaultTemplates.length;i++){let tmpDefaultTemplate=this.options.DefaultTemplates[i];if(!('Postfix'in tmpDefaultTemplate)||!('Template'in tmpDefaultTemplate)){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Default Template ${i} in the options array.`,tmpDefaultTemplate);}else{if(!tmpDefaultTemplate.Source){tmpDefaultTemplate.Source=`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} options object.`;}this.pict.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix,tmpDefaultTemplate.Postfix,tmpDefaultTemplate.Template,tmpDefaultTemplate.Source);}}// Load the CSS if it's available
if(this.options.CSS){let tmpCSSHash=this.options.CSSHash?this.options.CSSHash:`View-${this.options.ViewIdentifier}`;let tmpCSSProvider=this.options.CSSProvider?this.options.CSSProvider:tmpCSSHash;this.pict.CSSMap.addCSS(tmpCSSHash,this.options.CSS,tmpCSSProvider,this.options.CSSPriority);}// Load all renderables
// Renderables are launchable renderable instructions with templates
// They look as such: {Identifier:'ContentEntry', TemplateHash:'Content-Entry-Section-Main', ContentDestinationAddress:'#ContentSection', RecordAddress:'AppData.Content.DefaultText', ManifestTransformation:'ManyfestHash', ManifestDestinationAddress:'AppData.Content.DataToTransformContent'}
// The only parts that are necessary are Identifier and Template
// A developer can then do render('ContentEntry') and it just kinda works.  Or they can override the ContentDestinationAddress
/** @type {Record<String, Renderable>} */this.renderables={};for(let i=0;i<this.options.Renderables.length;i++){/** @type {Renderable} */let tmpRenderable=this.options.Renderables[i];this.addRenderable(tmpRenderable);}}/**
	 * Adds a renderable to the view.
	 *
	 * @param {string | Renderable} pRenderableHash - The hash of the renderable, or a renderable object.
	 * @param {string} [pTemplateHash] - (optional) The hash of the template for the renderable.
	 * @param {string} [pDefaultTemplateRecordAddress] - (optional) The default data address for the template.
	 * @param {string} [pDefaultDestinationAddress] - (optional) The default destination address for the renderable.
	 * @param {RenderMethod} [pRenderMethod=replace] - (optional) The method to use when rendering the renderable (ex. 'replace').
	 */addRenderable(pRenderableHash,pTemplateHash,pDefaultTemplateRecordAddress,pDefaultDestinationAddress,pRenderMethod){/** @type {Renderable} */let tmpRenderable;if(typeof pRenderableHash=='object'){// The developer passed in the renderable as an object.
// Use theirs instead!
tmpRenderable=pRenderableHash;}else{/** @type {RenderMethod} */let tmpRenderMethod=typeof pRenderMethod!=='string'?pRenderMethod:'replace';tmpRenderable={RenderableHash:pRenderableHash,TemplateHash:pTemplateHash,DefaultTemplateRecordAddress:pDefaultTemplateRecordAddress,ContentDestinationAddress:pDefaultDestinationAddress,RenderMethod:tmpRenderMethod};}if(typeof tmpRenderable.RenderableHash!='string'||typeof tmpRenderable.TemplateHash!='string'){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Renderable; RenderableHash or TemplateHash are invalid.`,tmpRenderable);}else{if(this.pict.LogNoisiness>0){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} adding renderable [${tmpRenderable.RenderableHash}] pointed to template ${tmpRenderable.TemplateHash}.`);}this.renderables[tmpRenderable.RenderableHash]=tmpRenderable;}}/* -------------------------------------------------------------------------- *//*                        Code Section: Initialization                        *//* -------------------------------------------------------------------------- *//**
	 * Lifecycle hook that triggers before the view is initialized.
	 */onBeforeInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeInitialize:`);}return true;}/**
	 * Lifecycle hook that triggers before the view is initialized (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onBeforeInitializeAsync(fCallback){this.onBeforeInitialize();return fCallback();}/**
	 * Lifecycle hook that triggers when the view is initialized.
	 */onInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onInitialize:`);}return true;}/**
	 * Lifecycle hook that triggers when the view is initialized (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onInitializeAsync(fCallback){this.onInitialize();return fCallback();}/**
	 * Performs view initialization.
	 */initialize(){if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialize:`);}if(!this.initializeTimestamp){this.onBeforeInitialize();this.onInitialize();this.onAfterInitialize();this.initializeTimestamp=this.pict.log.getTimeStamp();return true;}else{this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialize called but initialization is already completed.  Aborting.`);return false;}}/**
	 * Performs view initialization (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */initializeAsync(fCallback){if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initializeAsync:`);}if(!this.initializeTimestamp){let tmpAnticipate=this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');if(this.pict.LogNoisiness>0){this.log.info(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} beginning initialization...`);}tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));tmpAnticipate.wait(/** @param {Error} pError */pError=>{if(pError){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialization failed: ${pError.message||pError}`,{stack:pError.stack});}this.initializeTimestamp=this.pict.log.getTimeStamp();if(this.pict.LogNoisiness>0){this.log.info(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialization complete.`);}return fCallback();});}else{this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} async initialize called but initialization is already completed.  Aborting.`);// TODO: Should this be an error?
return fCallback();}}onAfterInitialize(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterInitialize:`);}return true;}/**
	 * Lifecycle hook that triggers after the view is initialized (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onAfterInitializeAsync(fCallback){this.onAfterInitialize();return fCallback();}/* -------------------------------------------------------------------------- *//*                            Code Section: Render                            *//* -------------------------------------------------------------------------- *//**
	 * Lifecycle hook that triggers before the view is rendered.
	 *
	 * @param {Renderable} pRenderable - The renderable that will be rendered.
	 */onBeforeRender(pRenderable){// Overload this to mess with stuff before the content gets generated from the template
if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeRender:`);}return true;}/**
	 * Lifecycle hook that triggers before the view is rendered (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that will be rendered.
	 */onBeforeRenderAsync(fCallback,pRenderable){this.onBeforeRender(pRenderable);return fCallback();}/**
	 * Lifecycle hook that triggers before the view is projected into the DOM.
	 *
	 * @param {Renderable} pRenderable - The renderable that will be projected.
	 */onBeforeProject(pRenderable){// Overload this to mess with stuff before the content gets generated from the template
if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeProject:`);}return true;}/**
	 * Lifecycle hook that triggers before the view is projected into the DOM (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that will be projected.
	 */onBeforeProjectAsync(fCallback,pRenderable){this.onBeforeProject(pRenderable);return fCallback();}/**
	 * Builds the render options for a renderable.
	 *
	 * For DRY purposes on the three flavors of render.
	 *
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 */buildRenderOptions(pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress){let tmpRenderOptions={Valid:true};tmpRenderOptions.RenderableHash=typeof pRenderableHash==='string'?pRenderableHash:typeof this.options.DefaultRenderable=='string'?this.options.DefaultRenderable:false;if(!tmpRenderOptions.RenderableHash){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not find a suitable RenderableHash ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`);tmpRenderOptions.Valid=false;}tmpRenderOptions.Renderable=this.renderables[tmpRenderOptions.RenderableHash];if(!tmpRenderOptions.Renderable){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}) because it does not exist.`);tmpRenderOptions.Valid=false;}tmpRenderOptions.DestinationAddress=typeof pRenderDestinationAddress==='string'?pRenderDestinationAddress:typeof tmpRenderOptions.Renderable.ContentDestinationAddress==='string'?tmpRenderOptions.Renderable.ContentDestinationAddress:typeof this.options.DefaultDestinationAddress==='string'?this.options.DefaultDestinationAddress:false;if(!tmpRenderOptions.DestinationAddress){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address (param ${pRenderDestinationAddress}).`);tmpRenderOptions.Valid=false;}if(typeof pTemplateRecordAddress==='object'){tmpRenderOptions.RecordAddress='Passed in as object';tmpRenderOptions.Record=pTemplateRecordAddress;}else{tmpRenderOptions.RecordAddress=typeof pTemplateRecordAddress==='string'?pTemplateRecordAddress:typeof tmpRenderOptions.Renderable.DefaultTemplateRecordAddress==='string'?tmpRenderOptions.Renderable.DefaultTemplateRecordAddress:typeof this.options.DefaultTemplateRecordAddress==='string'?this.options.DefaultTemplateRecordAddress:false;tmpRenderOptions.Record=typeof tmpRenderOptions.RecordAddress==='string'?this.pict.DataProvider.getDataByAddress(tmpRenderOptions.RecordAddress):undefined;}return tmpRenderOptions;}/**
	 * Assigns the content to the destination address.
	 *
	 * For DRY purposes on the three flavors of render.
	 *
	 * @param {Renderable} pRenderable - The renderable to render.
	 * @param {string} pRenderDestinationAddress - The address where the renderable will be rendered.
	 * @param {string} pContent - The content to render.
	 * @returns {boolean} - Returns true if the content was assigned successfully.
	 * @memberof PictView
	 */assignRenderContent(pRenderable,pRenderDestinationAddress,pContent){return this.pict.ContentAssignment.projectContent(pRenderable.RenderMethod,pRenderDestinationAddress,pContent,pRenderable.TestAddress);}/**
	 * Render a renderable from this view.
	 *
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
	 * @return {boolean}
	 */render(pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,pRootRenderable){return this.renderWithScope(this,pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,pRootRenderable);}/**
	 * Render a renderable from this view, providing a specifici scope for the template.
	 *
	 * @param {any} pScope - The scope to use for the template rendering.
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
	 * @return {boolean}
	 */renderWithScope(pScope,pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,pRootRenderable){let tmpRenderableHash=typeof pRenderableHash==='string'?pRenderableHash:typeof this.options.DefaultRenderable=='string'?this.options.DefaultRenderable:false;if(!tmpRenderableHash){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it is not a valid renderable.`);return false;}/** @type {Renderable} */let tmpRenderable;if(tmpRenderableHash=='__Virtual'){tmpRenderable={RenderableHash:'__Virtual',TemplateHash:this.renderables[this.options.DefaultRenderable].TemplateHash,ContentDestinationAddress:typeof pRenderDestinationAddress==='string'?pRenderDestinationAddress:typeof tmpRenderable.ContentDestinationAddress==='string'?tmpRenderable.ContentDestinationAddress:typeof this.options.DefaultDestinationAddress==='string'?this.options.DefaultDestinationAddress:null,RenderMethod:'virtual-assignment',TransactionHash:pRootRenderable&&pRootRenderable.TransactionHash,RootRenderableViewHash:pRootRenderable&&pRootRenderable.RootRenderableViewHash};}else{tmpRenderable=Object.assign({},this.renderables[tmpRenderableHash]);tmpRenderable.ContentDestinationAddress=typeof pRenderDestinationAddress==='string'?pRenderDestinationAddress:typeof tmpRenderable.ContentDestinationAddress==='string'?tmpRenderable.ContentDestinationAddress:typeof this.options.DefaultDestinationAddress==='string'?this.options.DefaultDestinationAddress:null;}if(!tmpRenderable.TransactionHash){tmpRenderable.TransactionHash=`ViewRender-V-${this.options.ViewIdentifier}-R-${tmpRenderableHash}-U-${this.pict.getUUID()}`;tmpRenderable.RootRenderableViewHash=this.Hash;this.pict.TransactionTracking.registerTransaction(tmpRenderable.TransactionHash);}if(!tmpRenderable){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`);return false;}if(!tmpRenderable.ContentDestinationAddress){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address.`);return false;}let tmpRecordAddress;let tmpRecord;if(typeof pTemplateRecordAddress==='object'){tmpRecord=pTemplateRecordAddress;tmpRecordAddress='Passed in as object';}else{tmpRecordAddress=typeof pTemplateRecordAddress==='string'?pTemplateRecordAddress:typeof tmpRenderable.DefaultTemplateRecordAddress==='string'?tmpRenderable.DefaultTemplateRecordAddress:typeof this.options.DefaultTemplateRecordAddress==='string'?this.options.DefaultTemplateRecordAddress:false;tmpRecord=typeof tmpRecordAddress==='string'?this.pict.DataProvider.getDataByAddress(tmpRecordAddress):undefined;}// Execute the developer-overridable pre-render behavior
this.onBeforeRender(tmpRenderable);if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderable.ContentDestinationAddress}] TemplateRecordAddress[${tmpRecordAddress}] render:`);}if(this.pict.LogNoisiness>0){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Render of Renderable[${tmpRenderableHash}] to Destination [${tmpRenderable.ContentDestinationAddress}]...`);}// Generate the content output from the template and data
tmpRenderable.Content=this.pict.parseTemplateByHash(tmpRenderable.TemplateHash,tmpRecord,null,[this],pScope,{RootRenderable:typeof pRootRenderable==='object'?pRootRenderable:tmpRenderable});if(this.pict.LogNoisiness>0){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${tmpRenderableHash}] content length ${tmpRenderable.Content.length} to Destination [${tmpRenderable.ContentDestinationAddress}] using render method [${tmpRenderable.RenderMethod}].`);}this.onBeforeProject(tmpRenderable);this.onProject(tmpRenderable);if(tmpRenderable.RenderMethod!=='virtual-assignment'){this.onAfterProject(tmpRenderable);// Execute the developer-overridable post-render behavior
this.onAfterRender(tmpRenderable);}return true;}/**
	 * Render a renderable from this view.
	 *
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {Renderable|ErrorCallback} [pRootRenderable] - The root renderable for the render operation, if applicable.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 *
	 * @return {void}
	 */renderAsync(pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,pRootRenderable,fCallback){return this.renderWithScopeAsync(this,pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,pRootRenderable,fCallback);}/**
	 * Render a renderable from this view.
	 *
	 * @param {any} pScope - The scope to use for the template rendering.
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {Renderable|ErrorCallback} [pRootRenderable] - The root renderable for the render operation, if applicable.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 *
	 * @return {void}
	 */renderWithScopeAsync(pScope,pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,pRootRenderable,fCallback){let tmpRenderableHash=typeof pRenderableHash==='string'?pRenderableHash:typeof this.options.DefaultRenderable=='string'?this.options.DefaultRenderable:false;// Allow the callback to be passed in as the last parameter no matter what
/** @type {ErrorCallback} */let tmpCallback=typeof fCallback==='function'?fCallback:typeof pTemplateRecordAddress==='function'?pTemplateRecordAddress:typeof pRenderDestinationAddress==='function'?pRenderDestinationAddress:typeof pRenderableHash==='function'?pRenderableHash:typeof pRootRenderable==='function'?pRootRenderable:null;if(!tmpCallback){this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync Auto Callback Error: ${pError}`,pError);}};}if(!tmpRenderableHash){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`);return tmpCallback(new Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`));}/** @type {Renderable} */let tmpRenderable;if(tmpRenderableHash=='__Virtual'){tmpRenderable={RenderableHash:'__Virtual',TemplateHash:this.renderables[this.options.DefaultRenderable].TemplateHash,ContentDestinationAddress:typeof pRenderDestinationAddress==='string'?pRenderDestinationAddress:typeof this.options.DefaultDestinationAddress==='string'?this.options.DefaultDestinationAddress:null,RenderMethod:'virtual-assignment',TransactionHash:pRootRenderable&&typeof pRootRenderable!=='function'&&pRootRenderable.TransactionHash,RootRenderableViewHash:pRootRenderable&&typeof pRootRenderable!=='function'&&pRootRenderable.RootRenderableViewHash};}else{tmpRenderable=Object.assign({},this.renderables[tmpRenderableHash]);tmpRenderable.ContentDestinationAddress=typeof pRenderDestinationAddress==='string'?pRenderDestinationAddress:typeof tmpRenderable.ContentDestinationAddress==='string'?tmpRenderable.ContentDestinationAddress:typeof this.options.DefaultDestinationAddress==='string'?this.options.DefaultDestinationAddress:null;}if(!tmpRenderable.TransactionHash){tmpRenderable.TransactionHash=`ViewRender-V-${this.options.ViewIdentifier}-R-${tmpRenderableHash}-U-${this.pict.getUUID()}`;tmpRenderable.RootRenderableViewHash=this.Hash;this.pict.TransactionTracking.registerTransaction(tmpRenderable.TransactionHash);}if(!tmpRenderable){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`);return tmpCallback(new Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`));}if(!tmpRenderable.ContentDestinationAddress){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address.`);return tmpCallback(new Error(`Could not render ${tmpRenderableHash}`));}let tmpRecordAddress;let tmpRecord;if(typeof pTemplateRecordAddress==='object'){tmpRecord=pTemplateRecordAddress;tmpRecordAddress='Passed in as object';}else{tmpRecordAddress=typeof pTemplateRecordAddress==='string'?pTemplateRecordAddress:typeof tmpRenderable.DefaultTemplateRecordAddress==='string'?tmpRenderable.DefaultTemplateRecordAddress:typeof this.options.DefaultTemplateRecordAddress==='string'?this.options.DefaultTemplateRecordAddress:false;tmpRecord=typeof tmpRecordAddress==='string'?this.pict.DataProvider.getDataByAddress(tmpRecordAddress):undefined;}if(this.pict.LogControlFlow){this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderable.ContentDestinationAddress}] TemplateRecordAddress[${tmpRecordAddress}] renderAsync:`);}if(this.pict.LogNoisiness>2){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Asynchronous Render (callback-style)...`);}let tmpAnticipate=this.fable.newAnticipate();tmpAnticipate.anticipate(fOnBeforeRenderCallback=>{this.onBeforeRenderAsync(fOnBeforeRenderCallback,tmpRenderable);});tmpAnticipate.anticipate(fAsyncTemplateCallback=>{// Render the template (asynchronously)
this.pict.parseTemplateByHash(tmpRenderable.TemplateHash,tmpRecord,(pError,pContent)=>{if(pError){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render (asynchronously) ${tmpRenderableHash} (param ${pRenderableHash}) because it did not parse the template.`,pError);return fAsyncTemplateCallback(pError);}tmpRenderable.Content=pContent;return fAsyncTemplateCallback();},[this],pScope,{RootRenderable:typeof pRootRenderable==='object'?pRootRenderable:tmpRenderable});});tmpAnticipate.anticipate(fNext=>{this.onBeforeProjectAsync(fNext,tmpRenderable);});tmpAnticipate.anticipate(fNext=>{this.onProjectAsync(fNext,tmpRenderable);});if(tmpRenderable.RenderMethod!=='virtual-assignment'){tmpAnticipate.anticipate(fNext=>{this.onAfterProjectAsync(fNext,tmpRenderable);});// Execute the developer-overridable post-render behavior
tmpAnticipate.anticipate(fNext=>{this.onAfterRenderAsync(fNext,tmpRenderable);});}tmpAnticipate.wait(tmpCallback);}/**
	 * Renders the default renderable.
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */renderDefaultAsync(fCallback){// Render the default renderable
this.renderAsync(fCallback);}/**
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 */basicRender(pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress){return this.basicRenderWithScope(this,pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress);}/**
	 * @param {any} pScope - The scope to use for the template rendering.
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 */basicRenderWithScope(pScope,pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress){let tmpRenderOptions=this.buildRenderOptions(pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress);if(tmpRenderOptions.Valid){this.assignRenderContent(tmpRenderOptions.Renderable,tmpRenderOptions.DestinationAddress,this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash,tmpRenderOptions.Record,null,[this],pScope,{RootRenderable:tmpRenderOptions.Renderable}));return true;}else{this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not perform a basic render of ${tmpRenderOptions.RenderableHash} because it is not valid.`);return false;}}/**
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 */basicRenderAsync(pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,fCallback){return this.basicRenderWithScopeAsync(this,pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,fCallback);}/**
	 * @param {any} pScope - The scope to use for the template rendering.
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 */basicRenderWithScopeAsync(pScope,pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress,fCallback){// Allow the callback to be passed in as the last parameter no matter what
/** @type {ErrorCallback} */let tmpCallback=typeof fCallback==='function'?fCallback:typeof pTemplateRecordAddress==='function'?pTemplateRecordAddress:typeof pRenderDestinationAddress==='function'?pRenderDestinationAddress:typeof pRenderableHash==='function'?pRenderableHash:null;if(!tmpCallback){this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} basicRenderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} basicRenderAsync Auto Callback Error: ${pError}`,pError);}};}const tmpRenderOptions=this.buildRenderOptions(pRenderableHash,pRenderDestinationAddress,pTemplateRecordAddress);if(tmpRenderOptions.Valid){this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash,tmpRenderOptions.Record,/**
				 * @param {Error} [pError] - The error that occurred during template parsing.
				 * @param {string} [pContent] - The content that was rendered from the template.
				 */(pError,pContent)=>{if(pError){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render (asynchronously) ${tmpRenderOptions.RenderableHash} because it did not parse the template.`,pError);return tmpCallback(pError);}this.assignRenderContent(tmpRenderOptions.Renderable,tmpRenderOptions.DestinationAddress,pContent);return tmpCallback();},[this],pScope,{RootRenderable:tmpRenderOptions.Renderable});}else{let tmpErrorMessage=`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not perform a basic render of ${tmpRenderOptions.RenderableHash} because it is not valid.`;this.log.error(tmpErrorMessage);return tmpCallback(new Error(tmpErrorMessage));}}/**
	 * @param {Renderable} pRenderable - The renderable that was rendered.
	 */onProject(pRenderable){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onProject:`);}if(pRenderable.RenderMethod==='virtual-assignment'){this.pict.TransactionTracking.pushToTransactionQueue(pRenderable.TransactionHash,{ViewHash:this.Hash,Renderable:pRenderable},'Deferred-Post-Content-Assignment');}if(this.pict.LogNoisiness>0){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${pRenderable.RenderableHash}] content length ${pRenderable.Content.length} to Destination [${pRenderable.ContentDestinationAddress}] using Async render method ${pRenderable.RenderMethod}.`);}// Assign the content to the destination address
this.pict.ContentAssignment.projectContent(pRenderable.RenderMethod,pRenderable.ContentDestinationAddress,pRenderable.Content,pRenderable.TestAddress);this.lastRenderedTimestamp=this.pict.log.getTimeStamp();}/**
	 * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
	 *
	 * @param {(error?: Error, content?: string) => void} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that is being projected.
	 */onProjectAsync(fCallback,pRenderable){this.onProject(pRenderable);return fCallback();}/**
	 * Lifecycle hook that triggers after the view is rendered.
	 *
	 * @param {Renderable} pRenderable - The renderable that was rendered.
	 */onAfterRender(pRenderable){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRender:`);}if(pRenderable&&pRenderable.RootRenderableViewHash===this.Hash){const tmpTransactionQueue=this.pict.TransactionTracking.clearTransactionQueue(pRenderable.TransactionHash)||[];for(const tmpEvent of tmpTransactionQueue){const tmpView=this.pict.views[tmpEvent.Data.ViewHash];if(!tmpView){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRender: Could not find view for transaction hash ${pRenderable.TransactionHash} and ViewHash ${tmpEvent.Data.ViewHash}.`);continue;}tmpView.onAfterProject();// Execute the developer-overridable post-render behavior
tmpView.onAfterRender(tmpEvent.Data.Renderable);}}return true;}/**
	 * Lifecycle hook that triggers after the view is rendered (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that was rendered.
	 */onAfterRenderAsync(fCallback,pRenderable){this.onAfterRender(pRenderable);const tmpAnticipate=this.fable.newAnticipate();if(pRenderable&&pRenderable.RootRenderableViewHash===this.Hash){const queue=this.pict.TransactionTracking.clearTransactionQueue(pRenderable.TransactionHash)||[];for(const event of queue){/** @type {PictView} */const tmpView=this.pict.views[event.Data.ViewHash];if(!tmpView){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRenderAsync: Could not find view for transaction hash ${pRenderable.TransactionHash} and ViewHash ${event.Data.ViewHash}.`);continue;}tmpAnticipate.anticipate(tmpView.onAfterProjectAsync.bind(tmpView));tmpAnticipate.anticipate(fNext=>{tmpView.onAfterRenderAsync(fNext,event.Data.Renderable);});// Execute the developer-overridable post-render behavior
}}return tmpAnticipate.wait(fCallback);}/**
	 * Lifecycle hook that triggers after the view is projected into the DOM.
	 *
	 * @param {Renderable} pRenderable - The renderable that was projected.
	 */onAfterProject(pRenderable){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterProject:`);}return true;}/**
	 * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that was projected.
	 */onAfterProjectAsync(fCallback,pRenderable){return fCallback();}/* -------------------------------------------------------------------------- *//*                            Code Section: Solver                            *//* -------------------------------------------------------------------------- *//**
	 * Lifecycle hook that triggers before the view is solved.
	 */onBeforeSolve(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeSolve:`);}return true;}/**
	 * Lifecycle hook that triggers before the view is solved (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onBeforeSolveAsync(fCallback){this.onBeforeSolve();return fCallback();}/**
	 * Lifecycle hook that triggers when the view is solved.
	 */onSolve(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onSolve:`);}return true;}/**
	 * Lifecycle hook that triggers when the view is solved (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onSolveAsync(fCallback){this.onSolve();return fCallback();}/**
	 * Performs view solving and triggers lifecycle hooks.
	 *
	 * @return {boolean} - True if the view was solved successfully, false otherwise.
	 */solve(){if(this.pict.LogNoisiness>2){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);}this.onBeforeSolve();this.onSolve();this.onAfterSolve();this.lastSolvedTimestamp=this.pict.log.getTimeStamp();return true;}/**
	 * Performs view solving and triggers lifecycle hooks (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */solveAsync(fCallback){let tmpAnticipate=this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');/** @type {ErrorCallback} */let tmpCallback=typeof fCallback==='function'?fCallback:null;if(!tmpCallback){this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync Auto Callback Error: ${pError}`,pError);}};}tmpAnticipate.anticipate(this.onBeforeSolveAsync.bind(this));tmpAnticipate.anticipate(this.onSolveAsync.bind(this));tmpAnticipate.anticipate(this.onAfterSolveAsync.bind(this));tmpAnticipate.wait(pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} solveAsync() complete.`);}this.lastSolvedTimestamp=this.pict.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * Lifecycle hook that triggers after the view is solved.
	 */onAfterSolve(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterSolve:`);}return true;}/**
	 * Lifecycle hook that triggers after the view is solved (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onAfterSolveAsync(fCallback){this.onAfterSolve();return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Marshal From View                        *//* -------------------------------------------------------------------------- *//**
	 * Lifecycle hook that triggers before data is marshaled from the view.
	 *
	 * @return {boolean} - True if the operation was successful, false otherwise.
	 */onBeforeMarshalFromView(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeMarshalFromView:`);}return true;}/**
	 * Lifecycle hook that triggers before data is marshaled from the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onBeforeMarshalFromViewAsync(fCallback){this.onBeforeMarshalFromView();return fCallback();}/**
	 * Lifecycle hook that triggers when data is marshaled from the view.
	 */onMarshalFromView(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onMarshalFromView:`);}return true;}/**
	 * Lifecycle hook that triggers when data is marshaled from the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onMarshalFromViewAsync(fCallback){this.onMarshalFromView();return fCallback();}/**
	 * Marshals data from the view.
	 *
	 * @return {boolean} - True if the operation was successful, false otherwise.
	 */marshalFromView(){if(this.pict.LogNoisiness>2){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);}this.onBeforeMarshalFromView();this.onMarshalFromView();this.onAfterMarshalFromView();this.lastMarshalFromViewTimestamp=this.pict.log.getTimeStamp();return true;}/**
	 * Marshals data from the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */marshalFromViewAsync(fCallback){let tmpAnticipate=this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');/** @type {ErrorCallback} */let tmpCallback=typeof fCallback==='function'?fCallback:null;if(!tmpCallback){this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewAsync Auto Callback Error: ${pError}`,pError);}};}tmpAnticipate.anticipate(this.onBeforeMarshalFromViewAsync.bind(this));tmpAnticipate.anticipate(this.onMarshalFromViewAsync.bind(this));tmpAnticipate.anticipate(this.onAfterMarshalFromViewAsync.bind(this));tmpAnticipate.wait(pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} marshalFromViewAsync() complete.`);}this.lastMarshalFromViewTimestamp=this.pict.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * Lifecycle hook that triggers after data is marshaled from the view.
	 */onAfterMarshalFromView(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterMarshalFromView:`);}return true;}/**
	 * Lifecycle hook that triggers after data is marshaled from the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onAfterMarshalFromViewAsync(fCallback){this.onAfterMarshalFromView();return fCallback();}/* -------------------------------------------------------------------------- *//*                     Code Section: Marshal To View                          *//* -------------------------------------------------------------------------- *//**
	 * Lifecycle hook that triggers before data is marshaled into the view.
	 */onBeforeMarshalToView(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeMarshalToView:`);}return true;}/**
	 * Lifecycle hook that triggers before data is marshaled into the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onBeforeMarshalToViewAsync(fCallback){this.onBeforeMarshalToView();return fCallback();}/**
	 * Lifecycle hook that triggers when data is marshaled into the view.
	 */onMarshalToView(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onMarshalToView:`);}return true;}/**
	 * Lifecycle hook that triggers when data is marshaled into the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onMarshalToViewAsync(fCallback){this.onMarshalToView();return fCallback();}/**
	 * Marshals data into the view.
	 *
	 * @return {boolean} - True if the operation was successful, false otherwise.
	 */marshalToView(){if(this.pict.LogNoisiness>2){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);}this.onBeforeMarshalToView();this.onMarshalToView();this.onAfterMarshalToView();this.lastMarshalToViewTimestamp=this.pict.log.getTimeStamp();return true;}/**
	 * Marshals data into the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */marshalToViewAsync(fCallback){let tmpAnticipate=this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');/** @type {ErrorCallback} */let tmpCallback=typeof fCallback==='function'?fCallback:null;if(!tmpCallback){this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);tmpCallback=pError=>{if(pError){this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewAsync Auto Callback Error: ${pError}`,pError);}};}tmpAnticipate.anticipate(this.onBeforeMarshalToViewAsync.bind(this));tmpAnticipate.anticipate(this.onMarshalToViewAsync.bind(this));tmpAnticipate.anticipate(this.onAfterMarshalToViewAsync.bind(this));tmpAnticipate.wait(pError=>{if(this.pict.LogNoisiness>2){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} marshalToViewAsync() complete.`);}this.lastMarshalToViewTimestamp=this.pict.log.getTimeStamp();return tmpCallback(pError);});}/**
	 * Lifecycle hook that triggers after data is marshaled into the view.
	 */onAfterMarshalToView(){if(this.pict.LogNoisiness>3){this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterMarshalToView:`);}return true;}/**
	 * Lifecycle hook that triggers after data is marshaled into the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */onAfterMarshalToViewAsync(fCallback){this.onAfterMarshalToView();return fCallback();}/** @return {boolean} - True if the object is a PictView. */get isPictView(){return true;}}module.exports=PictView;},{"../package.json":32,"fable-serviceproviderbase":2}],34:[function(require,module,exports){module.exports={"Name":"Retold Facto","Hash":"Facto-Full","MainViewportViewIdentifier":"Facto-Full-Layout","MainViewportDestinationAddress":"#Facto-Full-Application-Container","MainViewportDefaultDataAddress":"AppData.Facto","AutoSolveAfterInitialize":true,"AutoRenderMainViewportViewAfterInitialize":false,"AutoRenderViewsAfterInitialize":false,"pict_configuration":{"Product":"Retold-Facto-Full"}};},{}],35:[function(require,module,exports){const libPictApplication=require('pict-application');const libPictRouter=require('pict-router');const THEME_LIST=[{Key:'facto-dark',Label:'Facto Dark',Colors:['#12151e','#4a90d9','#28a745','#dc3545','#6366f1']},{Key:'facto-light',Label:'Facto Light',Colors:['#f5f6f8','#3b82f6','#22c55e','#ef4444','#6366f1']},{Key:'midnight-blue',Label:'Midnight Blue',Colors:['#0a0e1a','#3b82f6','#10b981','#f87171','#60a5fa']},{Key:'slate',Label:'Slate',Colors:['#1e2228','#6b8aae','#5ea37a','#c85a5a','#82a0c4']},{Key:'warm-earth',Label:'Warm Earth',Colors:['#1a1610','#c4956a','#8a9a5a','#b04050','#4a9090']},{Key:'high-contrast',Label:'High Contrast',Colors:['#000000','#58a6ff','#3fb950','#f85149','#d29922']}];// Shared provider (same API layer as accordion app)
const libProvider=require('../pict-app/providers/Pict-Provider-Facto.js');// Shell views
const libViewLayout=require('./views/PictView-Facto-Full-Layout.js');const libViewTopBar=require('./views/PictView-Facto-Full-TopBar.js');const libViewBottomBar=require('./views/PictView-Facto-Full-BottomBar.js');// Content views
const libViewDashboard=require('./views/PictView-Facto-Full-Dashboard.js');const libViewSourceResearch=require('./views/PictView-Facto-Full-SourceResearch.js');const libViewIngestJobs=require('./views/PictView-Facto-Full-IngestJobs.js');const libViewSources=require('./views/PictView-Facto-Full-Sources.js');const libViewDatasets=require('./views/PictView-Facto-Full-Datasets.js');const libViewRecords=require('./views/PictView-Facto-Full-Records.js');const libViewProjections=require('./views/PictView-Facto-Full-Projections.js');const libViewDashboards=require('./views/PictView-Facto-Full-Dashboards.js');const libViewRecordViewer=require('./views/PictView-Facto-Full-RecordViewer.js');const libViewSourceDetail=require('./views/PictView-Facto-Full-SourceDetail.js');class FactoFullApplication extends libPictApplication{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);// Skip premature route resolution during addRoute(); the Layout view
// calls resolve() explicitly after the DOM is ready.
this.pict.settings.RouterSkipRouteResolveOnAdd=true;// Register the shared API provider
this.pict.addProvider('Facto',libProvider.default_configuration,libProvider);// Register router
this.pict.addProvider('PictRouter',require('./providers/PictRouter-Facto-Configuration.json'),libPictRouter);// Shell views
this.pict.addView('Facto-Full-Layout',libViewLayout.default_configuration,libViewLayout);this.pict.addView('Facto-Full-TopBar',libViewTopBar.default_configuration,libViewTopBar);this.pict.addView('Facto-Full-BottomBar',libViewBottomBar.default_configuration,libViewBottomBar);// Content views
this.pict.addView('Facto-Full-Dashboard',libViewDashboard.default_configuration,libViewDashboard);this.pict.addView('Facto-Full-SourceResearch',libViewSourceResearch.default_configuration,libViewSourceResearch);this.pict.addView('Facto-Full-IngestJobs',libViewIngestJobs.default_configuration,libViewIngestJobs);this.pict.addView('Facto-Full-Sources',libViewSources.default_configuration,libViewSources);this.pict.addView('Facto-Full-Datasets',libViewDatasets.default_configuration,libViewDatasets);this.pict.addView('Facto-Full-Records',libViewRecords.default_configuration,libViewRecords);this.pict.addView('Facto-Full-Projections',libViewProjections.default_configuration,libViewProjections);this.pict.addView('Facto-Full-Dashboards',libViewDashboards.default_configuration,libViewDashboards);this.pict.addView('Facto-Full-RecordViewer',libViewRecordViewer.default_configuration,libViewRecordViewer);this.pict.addView('Facto-Full-SourceDetail',libViewSourceDetail.default_configuration,libViewSourceDetail);}onAfterInitializeAsync(fCallback){// Apply saved theme before first render
this.loadSavedTheme();// Initialize application state
this.pict.AppData.Facto={CatalogEntries:[],Sources:[],Datasets:[],Records:[],IngestJobs:[],SelectedSource:null,SelectedDataset:null,RecordPage:0,RecordPageSize:50,CurrentRecordContent:{},CurrentDocumentSegments:[],CurrentTheme:'facto-dark',CurrentRoute:''};// Expose pict globally for inline onclick handlers
window.pict=this.pict;// Register all parameterized routes BEFORE rendering the layout,
// so they are available when resolve() fires after the DOM is ready.
let tmpSelf=this;this.pict.providers.PictRouter.addRoute('/Record/:IDRecord',pMatch=>{let tmpIDRecord=pMatch&&pMatch.data?pMatch.data.IDRecord:null;if(tmpIDRecord){tmpSelf.showRecordView(tmpIDRecord);}});this.pict.providers.PictRouter.addRoute('/Source/:IDSource',pMatch=>{let tmpIDSource=pMatch&&pMatch.data?pMatch.data.IDSource:null;if(tmpIDSource){tmpSelf.showSourceView(tmpIDSource);}});this.pict.providers.PictRouter.addRoute('/Source/:IDSource/Doc/:IDDoc',pMatch=>{let tmpIDSource=pMatch&&pMatch.data?pMatch.data.IDSource:null;let tmpIDDoc=pMatch&&pMatch.data?pMatch.data.IDDoc:null;if(tmpIDSource){tmpSelf.showSourceView(tmpIDSource,tmpIDDoc);}});// Render the layout shell — this cascades into TopBar, BottomBar
this.pict.views['Facto-Full-Layout'].render();// Resolve the router now that all routes are registered and the DOM
// is ready. This picks up the current hash URL for deep links / reloads.
this.pict.providers.PictRouter.resolve();return super.onAfterInitializeAsync(fCallback);}navigateTo(pRoute){this.pict.providers.PictRouter.navigate(pRoute);}showRecordView(pIDRecord){let tmpView=this.pict.views['Facto-Full-RecordViewer'];if(tmpView){tmpView.loadRecord(pIDRecord);}// Highlight "Records" in the nav since the record viewer is a child of Records
this._setActiveNav('Records');}showSourceView(pIDSource,pIDDoc){let tmpView=this.pict.views['Facto-Full-SourceDetail'];if(tmpView){tmpView.loadSource(pIDSource,pIDDoc);}// Highlight "SourceResearch" in the nav since source detail is a child of Source Research
this._setActiveNav('SourceResearch');}showView(pViewIdentifier){if(pViewIdentifier in this.pict.views){this.pict.views[pViewIdentifier].render();}else{this.pict.log.warn(`View [${pViewIdentifier}] not found; falling back to dashboard.`);this.pict.views['Facto-Full-Dashboard'].render();}// Derive the route name from the view identifier for nav highlighting
// e.g. "Facto-Full-SourceResearch" → "SourceResearch"
let tmpRoute=pViewIdentifier.replace('Facto-Full-','');this._setActiveNav(tmpRoute);}_setActiveNav(pRoute){this.pict.AppData.Facto.CurrentRoute=pRoute;let tmpTopBar=this.pict.views['Facto-Full-TopBar'];if(tmpTopBar&&typeof tmpTopBar.highlightRoute==='function'){tmpTopBar.highlightRoute(pRoute);}}// --- Theme ---
applyTheme(pThemeKey){let tmpThemeKey=pThemeKey||'facto-dark';if(tmpThemeKey==='facto-dark'){delete document.body.dataset.theme;}else{document.body.dataset.theme=tmpThemeKey;}localStorage.setItem('facto-theme',tmpThemeKey);if(this.pict.AppData.Facto){this.pict.AppData.Facto.CurrentTheme=tmpThemeKey;}}loadSavedTheme(){let tmpSavedTheme=localStorage.getItem('facto-theme')||'facto-dark';this.applyTheme(tmpSavedTheme);}getThemeList(){return THEME_LIST;}}module.exports=FactoFullApplication;module.exports.default_configuration=require('./Pict-Application-Facto-Full-Configuration.json');},{"../pict-app/providers/Pict-Provider-Facto.js":53,"./Pict-Application-Facto-Full-Configuration.json":34,"./providers/PictRouter-Facto-Configuration.json":36,"./views/PictView-Facto-Full-BottomBar.js":37,"./views/PictView-Facto-Full-Dashboard.js":38,"./views/PictView-Facto-Full-Dashboards.js":39,"./views/PictView-Facto-Full-Datasets.js":40,"./views/PictView-Facto-Full-IngestJobs.js":41,"./views/PictView-Facto-Full-Layout.js":42,"./views/PictView-Facto-Full-Projections.js":43,"./views/PictView-Facto-Full-RecordViewer.js":44,"./views/PictView-Facto-Full-Records.js":45,"./views/PictView-Facto-Full-SourceDetail.js":46,"./views/PictView-Facto-Full-SourceResearch.js":47,"./views/PictView-Facto-Full-Sources.js":48,"./views/PictView-Facto-Full-TopBar.js":49,"pict-application":5,"pict-router":8}],36:[function(require,module,exports){module.exports={"ProviderIdentifier":"Pict-Router","AutoInitialize":true,"AutoInitializeOrdinal":0,"Routes":[{"path":"/Home","template":"{~LV:Pict.PictApplication.showView(`Facto-Full-Dashboard`)~}"},{"path":"/SourceResearch","template":"{~LV:Pict.PictApplication.showView(`Facto-Full-SourceResearch`)~}"},{"path":"/IngestJobs","template":"{~LV:Pict.PictApplication.showView(`Facto-Full-IngestJobs`)~}"},{"path":"/Sources","template":"{~LV:Pict.PictApplication.showView(`Facto-Full-Sources`)~}"},{"path":"/Datasets","template":"{~LV:Pict.PictApplication.showView(`Facto-Full-Datasets`)~}"},{"path":"/Records","template":"{~LV:Pict.PictApplication.showView(`Facto-Full-Records`)~}"},{"path":"/Projections","template":"{~LV:Pict.PictApplication.showView(`Facto-Full-Projections`)~}"},{"path":"/Dashboards","template":"{~LV:Pict.PictApplication.showView(`Facto-Full-Dashboards`)~}"}]};},{}],37:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-BottomBar",DefaultRenderable:"Facto-Full-BottomBar-Content",DefaultDestinationAddress:"#Facto-Full-BottomBar-Container",AutoRender:false,CSS:/*css*/`
		.facto-bottombar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.6em 1.25em;
			background: var(--facto-topbar-bg);
			border-top: 1px solid var(--facto-border-subtle);
			font-size: 0.78em;
			color: var(--facto-text-tertiary);
		}

		.facto-bottombar a {
			color: var(--facto-text-tertiary);
			text-decoration: none;
		}

		.facto-bottombar a:hover {
			color: var(--facto-text-secondary);
		}
	`,Templates:[{Hash:"Facto-Full-BottomBar-Template",Template:/*html*/`
<div class="facto-bottombar">
	<span>Retold Facto Data Warehouse</span>
	<span>Retold</span>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-BottomBar-Content",TemplateHash:"Facto-Full-BottomBar-Template",DestinationAddress:"#Facto-Full-BottomBar-Container",RenderMethod:"replace"}]};class FactoFullBottomBarView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}}module.exports=FactoFullBottomBarView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],38:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-Dashboard",DefaultRenderable:"Facto-Full-Dashboard-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,CSS:/*css*/`
		.facto-dashboard-stat {
			text-align: center;
		}

		.facto-dashboard-stat-value {
			font-size: 2em;
			font-weight: 700;
			color: var(--facto-text-heading);
			line-height: 1.2;
		}

		.facto-dashboard-stat-label {
			font-size: 0.85em;
			color: var(--facto-text-secondary);
			margin-top: 0.3em;
		}

		.facto-dashboard-actions {
			display: flex;
			gap: 0.75em;
			flex-wrap: wrap;
		}
	`,Templates:[{Hash:"Facto-Full-Dashboard-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Dashboard</h1>
		<p>Retold Facto data warehouse overview.</p>
	</div>

	<div class="facto-card-grid" id="Facto-Full-Dashboard-Cards">
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-SourceCount">--</div>
			<div class="facto-dashboard-stat-label">Sources</div>
		</div>
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-DatasetCount">--</div>
			<div class="facto-dashboard-stat-label">Datasets</div>
		</div>
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-RecordCount">--</div>
			<div class="facto-dashboard-stat-label">Records</div>
		</div>
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-IngestCount">--</div>
			<div class="facto-dashboard-stat-label">Ingest Jobs</div>
		</div>
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-CatalogCount">--</div>
			<div class="facto-dashboard-stat-label">Catalog Entries</div>
		</div>
	</div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Quick Actions</div>
		<div class="facto-dashboard-actions">
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.PictApplication.navigateTo('/SourceResearch')">Source Research</button>
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.PictApplication.navigateTo('/Sources')">Manage Sources</button>
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.PictApplication.navigateTo('/Records')">Browse Records</button>
			<button class="facto-btn facto-btn-secondary" onclick="window.location.href='/simple/'">Simple View</button>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-Dashboard-Content",TemplateHash:"Facto-Full-Dashboard-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullDashboardView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){let tmpProvider=this.pict.providers.Facto;// Load counts in parallel
tmpProvider.loadSources().then(()=>{let tmpEl=document.getElementById('Facto-Full-Dash-SourceCount');if(tmpEl)tmpEl.textContent=(this.pict.AppData.Facto.Sources||[]).length;});tmpProvider.loadDatasets().then(()=>{let tmpEl=document.getElementById('Facto-Full-Dash-DatasetCount');if(tmpEl)tmpEl.textContent=(this.pict.AppData.Facto.Datasets||[]).length;});tmpProvider.loadRecords().then(()=>{let tmpEl=document.getElementById('Facto-Full-Dash-RecordCount');if(tmpEl)tmpEl.textContent=(this.pict.AppData.Facto.Records||[]).length;});tmpProvider.loadIngestJobs().then(()=>{let tmpEl=document.getElementById('Facto-Full-Dash-IngestCount');if(tmpEl)tmpEl.textContent=(this.pict.AppData.Facto.IngestJobs||[]).length;});tmpProvider.loadCatalogEntries().then(()=>{let tmpEl=document.getElementById('Facto-Full-Dash-CatalogCount');if(tmpEl)tmpEl.textContent=(this.pict.AppData.Facto.CatalogEntries||[]).length;});return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}}module.exports=FactoFullDashboardView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],39:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-Dashboards",DefaultRenderable:"Facto-Full-Dashboards-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,Templates:[{Hash:"Facto-Full-Dashboards-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Dashboards</h1>
		<p>Custom analytics dashboards and data visualizations.</p>
	</div>

	<div class="facto-empty" style="padding:4em 1em;">
		<h3 style="margin-bottom:0.5em; color:var(--facto-text-secondary);">Coming Soon</h3>
		<p style="color:var(--facto-text-tertiary); max-width:500px; margin:0 auto;">
			Custom dashboards with charts, data visualizations, and configurable widgets will be available in a future release.
			For now, use the <a onclick="pict.PictApplication.navigateTo('/Projections')" style="cursor:pointer;">Projections</a> view to query and aggregate data.
		</p>
	</div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-Dashboards-Content",TemplateHash:"Facto-Full-Dashboards-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullDashboardsView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}}module.exports=FactoFullDashboardsView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],40:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-Datasets",DefaultRenderable:"Facto-Full-Datasets-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,Templates:[{Hash:"Facto-Full-Datasets-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Data Sets</h1>
		<p>Manage datasets and their configurations.</p>
	</div>

	<div id="Facto-Full-Datasets-List"></div>
	<div id="Facto-Full-Datasets-Stats" style="display:none; margin-top:1.25em; padding-top:1.25em; border-top:1px solid var(--facto-border-subtle);"></div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Add Dataset</div>
		<div class="facto-inline-group">
			<div>
				<label>Name</label>
				<input type="text" id="Facto-Full-Dataset-Name" placeholder="Dataset name">
			</div>
			<div>
				<label>Type</label>
				<select id="Facto-Full-Dataset-Type">
					<option value="Raw">Raw</option>
					<option value="Compositional">Compositional</option>
					<option value="Projection">Projection</option>
					<option value="Derived">Derived</option>
				</select>
			</div>
			<div>
				<label>Description</label>
				<input type="text" id="Facto-Full-Dataset-Desc" placeholder="Description">
			</div>
		</div>
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Datasets'].addDataset()">Add Dataset</button>
	</div>

	<div id="Facto-Full-Datasets-Status" class="facto-status" style="display:none;"></div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-Datasets-Content",TemplateHash:"Facto-Full-Datasets-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullDatasetsView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){this.pict.providers.Facto.loadDatasets().then(()=>{this.refreshList();});return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}setStatus(pMessage,pType){let tmpEl=document.getElementById('Facto-Full-Datasets-Status');if(!tmpEl)return;tmpEl.className='facto-status facto-status-'+(pType||'info');tmpEl.textContent=pMessage;tmpEl.style.display='block';}refreshList(){let tmpContainer=document.getElementById('Facto-Full-Datasets-List');if(!tmpContainer)return;let tmpDatasets=this.pict.AppData.Facto.Datasets;if(!tmpDatasets||tmpDatasets.length===0){tmpContainer.innerHTML='<div class="facto-empty">No datasets yet. Add one below or provision from Source Research.</div>';return;}let tmpHtml='<table><thead><tr><th>ID</th><th>Hash</th><th>Name</th><th>Type</th><th>Description</th><th>Version Policy</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpDatasets.length;i++){let tmpDS=tmpDatasets[i];let tmpTypeBadge='facto-badge-primary';if(tmpDS.Type==='Projection')tmpTypeBadge='facto-badge-warning';else if(tmpDS.Type==='Derived')tmpTypeBadge='facto-badge-muted';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpDS.IDDataset||'')+'</td>';tmpHtml+='<td><code>'+(tmpDS.Hash||'-')+'</code></td>';tmpHtml+='<td>'+(tmpDS.Name||'')+'</td>';tmpHtml+='<td><span class="facto-badge '+tmpTypeBadge+'">'+(tmpDS.Type||'')+'</span></td>';tmpHtml+='<td>'+(tmpDS.Description||'')+'</td>';tmpHtml+='<td>'+(tmpDS.VersionPolicy||'Append')+'</td>';tmpHtml+='<td><button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Datasets\'].viewStats('+tmpDS.IDDataset+')">Stats</button></td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}viewStats(pIDDataset){let tmpStatsContainer=document.getElementById('Facto-Full-Datasets-Stats');if(!tmpStatsContainer)return;tmpStatsContainer.style.display='block';tmpStatsContainer.innerHTML='<p style="color:var(--facto-text-secondary);">Loading stats for Dataset #'+pIDDataset+'...</p>';this.pict.providers.Facto.loadDatasetStats(pIDDataset).then(pResponse=>{if(pResponse){let tmpHtml='<h3>Dataset #'+pIDDataset+' Statistics</h3>';tmpHtml+='<div class="facto-card-grid" style="margin-top:0.75em;">';tmpHtml+='<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">'+(pResponse.RecordCount||0)+'</div><div class="facto-dashboard-stat-label">Records</div></div>';tmpHtml+='<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">'+(pResponse.SourceCount||0)+'</div><div class="facto-dashboard-stat-label">Sources</div></div>';tmpHtml+='<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">'+(pResponse.CurrentVersion||0)+'</div><div class="facto-dashboard-stat-label">Current Version</div></div>';tmpHtml+='</div>';tmpHtml+='<div style="margin-top:0.75em;"><button class="facto-btn facto-btn-secondary" onclick="document.getElementById(\'Facto-Full-Datasets-Stats\').style.display=\'none\'">Close</button></div>';tmpStatsContainer.innerHTML=tmpHtml;}});}addDataset(){let tmpName=(document.getElementById('Facto-Full-Dataset-Name')||{}).value||'';let tmpType=(document.getElementById('Facto-Full-Dataset-Type')||{}).value||'';let tmpDesc=(document.getElementById('Facto-Full-Dataset-Desc')||{}).value||'';if(!tmpName){this.setStatus('Dataset name is required','warn');return;}this.pict.providers.Facto.createDataset({Name:tmpName,Type:tmpType,Description:tmpDesc}).then(pResponse=>{if(pResponse&&pResponse.IDDataset){this.setStatus('Dataset created: '+tmpName,'ok');document.getElementById('Facto-Full-Dataset-Name').value='';document.getElementById('Facto-Full-Dataset-Desc').value='';return this.pict.providers.Facto.loadDatasets();}else{this.setStatus('Error creating dataset','error');}}).then(()=>{this.refreshList();});}}module.exports=FactoFullDatasetsView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],41:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-IngestJobs",DefaultRenderable:"Facto-Full-IngestJobs-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,Templates:[{Hash:"Facto-Full-IngestJobs-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Ingestion Jobs</h1>
		<p>Monitor and manage data ingestion jobs.</p>
	</div>

	<div id="Facto-Full-IngestJobs-List"></div>
	<div id="Facto-Full-IngestJobs-Status" class="facto-status" style="display:none;"></div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-IngestJobs-Content",TemplateHash:"Facto-Full-IngestJobs-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullIngestJobsView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){this.pict.providers.Facto.loadIngestJobs().then(()=>{this.refreshList();});return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}refreshList(){let tmpContainer=document.getElementById('Facto-Full-IngestJobs-List');if(!tmpContainer)return;let tmpJobs=this.pict.AppData.Facto.IngestJobs;if(!tmpJobs||tmpJobs.length===0){tmpContainer.innerHTML='<div class="facto-empty">No ingestion jobs yet. Jobs are created automatically when data is ingested.</div>';return;}let tmpHtml='<table><thead><tr><th>ID</th><th>Source</th><th>Dataset</th><th>Status</th><th>Version</th><th>Records</th><th>Errors</th><th>Created</th></tr></thead><tbody>';for(let i=0;i<tmpJobs.length;i++){let tmpJob=tmpJobs[i];let tmpStatusBadge='facto-badge-muted';if(tmpJob.Status==='Complete')tmpStatusBadge='facto-badge-success';else if(tmpJob.Status==='Running')tmpStatusBadge='facto-badge-primary';else if(tmpJob.Status==='Error')tmpStatusBadge='facto-badge-error';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpJob.IDIngestJob||'')+'</td>';tmpHtml+='<td>'+(tmpJob.IDSource||'')+'</td>';tmpHtml+='<td>'+(tmpJob.IDDataset||'')+'</td>';tmpHtml+='<td><span class="facto-badge '+tmpStatusBadge+'">'+(tmpJob.Status||'Pending')+'</span></td>';tmpHtml+='<td>'+(tmpJob.DatasetVersion||'')+'</td>';tmpHtml+='<td>'+(tmpJob.RecordsIngested||0)+'</td>';tmpHtml+='<td>'+(tmpJob.RecordsErrored||0)+'</td>';tmpHtml+='<td>'+(tmpJob.CreatingIDUser?new Date(tmpJob.CreateDate).toLocaleString():tmpJob.CreateDate||'')+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}}module.exports=FactoFullIngestJobsView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],42:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-Layout",DefaultRenderable:"Facto-Full-Layout-Shell",DefaultDestinationAddress:"#Facto-Full-Application-Container",AutoRender:false,Templates:[{Hash:"Facto-Full-Layout-Shell-Template",Template:/*html*/`
<div id="Facto-Full-TopBar-Container"></div>
<div id="Facto-Full-Content-Container"></div>
<div id="Facto-Full-BottomBar-Container"></div>
`}],Renderables:[{RenderableHash:"Facto-Full-Layout-Shell",TemplateHash:"Facto-Full-Layout-Shell-Template",DestinationAddress:"#Facto-Full-Application-Container",RenderMethod:"replace"}]};class FactoFullLayoutView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){// Render shell views
this.pict.views['Facto-Full-TopBar'].render();this.pict.views['Facto-Full-BottomBar'].render();// Render the dashboard as default content.
// The application will call resolve() after this, which will
// override with the correct view if a hash route is present.
this.pict.views['Facto-Full-Dashboard'].render();// Inject all view CSS into the PICT-CSS style element
this.pict.CSSMap.injectCSS();return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}}module.exports=FactoFullLayoutView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],43:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-Projections",DefaultRenderable:"Facto-Full-Projections-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,CSS:/*css*/`
		.facto-projection-results {
			margin-top: 1.25em;
			padding-top: 1.25em;
			border-top: 1px solid var(--facto-border-subtle);
		}
		.facto-projection-results pre {
			max-height: 400px;
			overflow: auto;
		}
	`,Templates:[{Hash:"Facto-Full-Projections-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Projections</h1>
		<p>Query, aggregate, and compare records across datasets.</p>
	</div>

	<div class="facto-section">
		<div class="facto-section-title">Warehouse Summary</div>
		<div id="Facto-Full-Projections-Summary" class="facto-card-grid"></div>
	</div>

	<div class="facto-section" style="margin-top:1.5em;">
		<div class="facto-section-title">Query Records</div>
		<div class="facto-inline-group">
			<div>
				<label>Dataset ID</label>
				<input type="number" id="Facto-Full-Proj-DatasetID" placeholder="e.g. 1">
			</div>
			<div>
				<label>Type Filter</label>
				<select id="Facto-Full-Proj-Type">
					<option value="">All</option>
					<option value="Raw">Raw</option>
					<option value="Compositional">Compositional</option>
					<option value="Projection">Projection</option>
				</select>
			</div>
		</div>
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Projections'].runQuery()">Run Query</button>
		<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-Projections'].runAggregate()">Aggregate</button>
	</div>

	<div id="Facto-Full-Projections-Results" class="facto-projection-results" style="display:none;"></div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-Projections-Content",TemplateHash:"Facto-Full-Projections-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullProjectionsView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){this.pict.providers.Facto.loadProjectionSummary().then(pResponse=>{let tmpContainer=document.getElementById('Facto-Full-Projections-Summary');if(!tmpContainer||!pResponse)return;let tmpHtml='';tmpHtml+='<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">'+(pResponse.TotalRecords||0)+'</div><div class="facto-dashboard-stat-label">Total Records</div></div>';tmpHtml+='<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">'+(pResponse.TotalDatasets||0)+'</div><div class="facto-dashboard-stat-label">Total Datasets</div></div>';tmpHtml+='<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">'+(pResponse.TotalSources||0)+'</div><div class="facto-dashboard-stat-label">Total Sources</div></div>';tmpContainer.innerHTML=tmpHtml;});return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}runQuery(){let tmpDatasetID=parseInt((document.getElementById('Facto-Full-Proj-DatasetID')||{}).value)||0;let tmpType=(document.getElementById('Facto-Full-Proj-Type')||{}).value||'';let tmpParams={};if(tmpDatasetID)tmpParams.IDDataset=tmpDatasetID;if(tmpType)tmpParams.Type=tmpType;this.pict.providers.Facto.queryRecords(tmpParams).then(pResponse=>{this._showResults('Query Results',pResponse);});}runAggregate(){let tmpDatasetID=parseInt((document.getElementById('Facto-Full-Proj-DatasetID')||{}).value)||0;let tmpParams={};if(tmpDatasetID)tmpParams.IDDataset=tmpDatasetID;this.pict.providers.Facto.aggregateRecords(tmpParams).then(pResponse=>{this._showResults('Aggregate Results',pResponse);});}_showResults(pTitle,pData){let tmpContainer=document.getElementById('Facto-Full-Projections-Results');if(!tmpContainer)return;tmpContainer.style.display='block';let tmpRecordCount=pData&&pData.Records?pData.Records.length:pData&&pData.Aggregations?pData.Aggregations.length:0;let tmpHtml='<h3>'+pTitle+' ('+tmpRecordCount+')</h3>';tmpHtml+='<pre>'+JSON.stringify(pData,null,2)+'</pre>';tmpHtml+='<button class="facto-btn facto-btn-secondary" style="margin-top:0.5em;" onclick="document.getElementById(\'Facto-Full-Projections-Results\').style.display=\'none\'">Close</button>';tmpContainer.innerHTML=tmpHtml;}}module.exports=FactoFullProjectionsView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],44:[function(require,module,exports){const libPictView=require('pict-view');const libPictSectionObjectEditor=require('pict-section-objecteditor');const _ViewConfiguration={ViewIdentifier:"Facto-Full-RecordViewer",DefaultRenderable:"Facto-Full-RecordViewer-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,CSS:/*css*/`
		.facto-record-viewer-back {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			color: var(--facto-text-secondary);
			cursor: pointer;
			font-size: 0.85em;
			margin-bottom: 0.75em;
			transition: color 0.15s;
		}
		.facto-record-viewer-back:hover {
			color: var(--facto-accent);
		}
		.facto-record-meta {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
			gap: 1em;
			margin-bottom: 1.5em;
		}
		.facto-record-meta-card {
			background: var(--facto-surface-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 8px;
			padding: 1em;
		}
		.facto-record-meta-card h3 {
			margin: 0 0 0.5em;
			font-size: 0.75em;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--facto-text-tertiary, #888);
		}
		.facto-record-meta-row {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			padding: 0.2em 0;
			font-size: 0.85em;
		}
		.facto-record-meta-label {
			color: var(--facto-text-secondary, #aaa);
			flex-shrink: 0;
			margin-right: 0.75em;
		}
		.facto-record-meta-value {
			color: var(--facto-text-primary, #eee);
			text-align: right;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.9em;
		}
		.facto-record-meta-value.facto-hash-value {
			color: var(--facto-accent, #4a90d9);
		}
		.facto-record-certainty-bar {
			height: 6px;
			background: var(--facto-border-subtle, #2a2e3a);
			border-radius: 3px;
			margin-top: 0.35em;
			overflow: hidden;
		}
		.facto-record-certainty-fill {
			height: 100%;
			border-radius: 3px;
			transition: width 0.3s;
		}
		.facto-record-content-section {
			margin-top: 1.5em;
		}
		.facto-record-content-section h2 {
			font-size: 1em;
			margin: 0 0 0.75em;
			color: var(--facto-text-secondary, #aaa);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		/* Override ObjectEditor styles for dark theme compatibility */
		.facto-record-content-section .pict-objecteditor {
			background: var(--facto-surface-elevated, #1a1e2a);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-primary, #eee);
		}
		.facto-record-content-section .pict-oe-row:hover {
			background: var(--facto-surface-hover, #222738);
		}
		.facto-record-content-section .pict-oe-key {
			color: var(--facto-accent, #4a90d9);
		}
		.facto-record-content-section .pict-oe-separator {
			color: var(--facto-text-tertiary, #888);
		}
		.facto-record-content-section .pict-oe-value-string {
			color: #2ee6a8;
		}
		.facto-record-content-section .pict-oe-value-string::before,
		.facto-record-content-section .pict-oe-value-string::after {
			color: #1a8a66;
		}
		.facto-record-content-section .pict-oe-value-number {
			color: #d4a0ff;
		}
		.facto-record-content-section .pict-oe-value-boolean {
			color: #ffb347;
		}
		.facto-record-content-section .pict-oe-value-null {
			color: var(--facto-text-tertiary, #666);
		}
		.facto-record-content-section .pict-oe-summary {
			color: var(--facto-text-tertiary, #666);
		}
		.facto-record-content-section .pict-oe-toggle {
			color: var(--facto-text-secondary, #aaa);
		}
		.facto-record-content-section .pict-oe-toggle:hover {
			color: var(--facto-accent, #4a90d9);
			background: var(--facto-surface-hover, #222738);
		}
		.facto-record-content-section .pict-oe-type-badge {
			background: var(--facto-surface-hover, #222738);
			color: var(--facto-text-tertiary, #888);
		}
		.facto-record-content-section .pict-oe-empty {
			color: var(--facto-text-tertiary, #666);
		}
	`,Templates:[{Hash:"Facto-Full-RecordViewer-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-record-viewer-back" onclick="{~P~}.views['Facto-Full-RecordViewer'].goBack()">
		&#8592; Back to Records
	</div>

	<div class="facto-content-header">
		<h1 id="Facto-RecordViewer-Title">Record</h1>
	</div>

	<div id="Facto-RecordViewer-Loading" style="color:var(--facto-text-secondary);">Loading record...</div>
	<div id="Facto-RecordViewer-Error" class="facto-status facto-status-error" style="display:none;"></div>

	<div id="Facto-RecordViewer-MetaContainer" style="display:none;">
		<div class="facto-record-meta" id="Facto-RecordViewer-Meta"></div>

		<div class="facto-record-content-section">
			<h2>Record Content</h2>
			<div id="Facto-RecordViewer-ObjectEditor-Container"></div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-RecordViewer-Content",TemplateHash:"Facto-Full-RecordViewer-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullRecordViewerView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this._CurrentIDRecord=null;this._ObjectEditorView=null;}onBeforeInitialize(){super.onBeforeInitialize();// Register the ObjectEditor view type if it isn't already present
if(!this.fable.servicesMap.hasOwnProperty('PictViewObjectEditor')){this.fable.addServiceType('PictViewObjectEditor',libPictSectionObjectEditor);}return true;}/**
	 * Navigate to a specific record by ID.
	 */loadRecord(pIDRecord){this._CurrentIDRecord=pIDRecord;this.render();}onAfterRender(){super.onAfterRender();if(!this._CurrentIDRecord){let tmpLoading=document.getElementById('Facto-RecordViewer-Loading');if(tmpLoading){tmpLoading.textContent='No record selected.';}return;}this._fetchAndDisplayRecord(this._CurrentIDRecord);}_fetchAndDisplayRecord(pIDRecord){let tmpProvider=this.pict.providers.Facto;let tmpLoadingEl=document.getElementById('Facto-RecordViewer-Loading');let tmpErrorEl=document.getElementById('Facto-RecordViewer-Error');let tmpMetaContainer=document.getElementById('Facto-RecordViewer-MetaContainer');// Fetch the record, its source, its dataset, and certainty in parallel
let tmpRecord=null;let tmpSource=null;let tmpDataset=null;let tmpCertainty=null;let tmpIngestJob=null;let tmpRecordPromise=tmpProvider.api('GET','/1.0/Record/'+pIDRecord);let tmpCertaintyPromise=tmpProvider.api('GET','/facto/record/'+pIDRecord+'/certainty');tmpRecordPromise.then(pRecordResponse=>{if(pRecordResponse&&pRecordResponse.Error){if(tmpLoadingEl)tmpLoadingEl.style.display='none';if(tmpErrorEl){tmpErrorEl.textContent='Error loading record: '+pRecordResponse.Error;tmpErrorEl.style.display='block';}return;}tmpRecord=pRecordResponse;// Now fetch the related source, dataset, and ingest job
let tmpFetches=[];if(tmpRecord.IDSource){tmpFetches.push(tmpProvider.api('GET','/1.0/Source/'+tmpRecord.IDSource).then(pResp=>{tmpSource=pResp;}));}if(tmpRecord.IDDataset){tmpFetches.push(tmpProvider.api('GET','/1.0/Dataset/'+tmpRecord.IDDataset).then(pResp=>{tmpDataset=pResp;}));}if(tmpRecord.IDIngestJob){tmpFetches.push(tmpProvider.api('GET','/facto/ingest/job/'+tmpRecord.IDIngestJob).then(pResp=>{tmpIngestJob=pResp;}));}return Promise.all(tmpFetches).then(()=>{return tmpCertaintyPromise;}).then(pCertaintyResponse=>{tmpCertainty=pCertaintyResponse;this._renderRecordDetail(tmpRecord,tmpSource,tmpDataset,tmpCertainty,tmpIngestJob);});}).catch(pError=>{if(tmpLoadingEl)tmpLoadingEl.style.display='none';if(tmpErrorEl){tmpErrorEl.textContent='Error loading record: '+(pError.message||pError);tmpErrorEl.style.display='block';}});}_renderRecordDetail(pRecord,pSource,pDataset,pCertainty,pIngestJob){let tmpLoadingEl=document.getElementById('Facto-RecordViewer-Loading');let tmpMetaContainer=document.getElementById('Facto-RecordViewer-MetaContainer');let tmpTitleEl=document.getElementById('Facto-RecordViewer-Title');if(tmpLoadingEl)tmpLoadingEl.style.display='none';if(tmpMetaContainer)tmpMetaContainer.style.display='block';// Title
if(tmpTitleEl){let tmpTitle='Record #'+pRecord.IDRecord;if(pDataset&&pDataset.Hash){tmpTitle+=' \u2014 '+pDataset.Hash;}tmpTitleEl.textContent=tmpTitle;}// Build metadata cards
let tmpMetaEl=document.getElementById('Facto-RecordViewer-Meta');if(tmpMetaEl){tmpMetaEl.innerHTML=this._buildMetaCards(pRecord,pSource,pDataset,pCertainty,pIngestJob);}// Parse the Content JSON and render via ObjectEditor
let tmpContentData={};if(pRecord.Content){try{tmpContentData=JSON.parse(pRecord.Content);}catch(e){tmpContentData={'_raw':pRecord.Content};}}// Store the parsed content in AppData so the ObjectEditor can find it
this.pict.AppData.Facto.CurrentRecordContent=tmpContentData;// Create or re-render the ObjectEditor
this._renderObjectEditor();}_renderObjectEditor(){let tmpEditorContainerId='Facto-RecordViewer-ObjectEditor-Container';let tmpViewHash='Facto-RecordViewer-ObjectEditor';// If we already created this view, just re-render
if(this.pict.views[tmpViewHash]){this.pict.views[tmpViewHash].render();return;}// Create a new ObjectEditor view instance
let tmpEditorConfig={ViewIdentifier:tmpViewHash,DefaultDestinationAddress:'#'+tmpEditorContainerId,ObjectDataAddress:'AppData.Facto.CurrentRecordContent',InitialExpandDepth:2,Editable:false,ShowTypeIndicators:true,IndentPixels:20,Renderables:[{RenderableHash:'ObjectEditor-Container',TemplateHash:'ObjectEditor-Container-Template',DestinationAddress:'#'+tmpEditorContainerId,RenderMethod:'replace'}]};this.pict.addView(tmpViewHash,tmpEditorConfig,libPictSectionObjectEditor);// The ObjectEditor registers node renderers in onBeforeInitialize.
// Since this view is created dynamically (after the app init cycle),
// we must explicitly trigger initialization before the first render.
let tmpEditorView=this.pict.views[tmpViewHash];tmpEditorView.onBeforeInitialize();tmpEditorView.render();}_buildMetaCards(pRecord,pSource,pDataset,pCertainty,pIngestJob){let tmpHtml='';// Record Identity card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Record Identity</h3>';tmpHtml+=this._metaRow('ID',pRecord.IDRecord);tmpHtml+=this._metaRow('GUID',pRecord.GUIDRecord,true);tmpHtml+=this._metaRow('Type',pRecord.Type||'\u2014');tmpHtml+=this._metaRow('Version',pRecord.Version||1);tmpHtml+='</div>';// Source card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Source</h3>';if(pSource&&!pSource.Error){tmpHtml+=this._metaRow('Name',pSource.Name||'\u2014');tmpHtml+=this._metaRow('Hash',pSource.Hash||'\u2014',false,true);tmpHtml+=this._metaRow('Type',pSource.Type||'\u2014');if(pSource.URL){tmpHtml+=this._metaRow('URL',pSource.URL);}}else{tmpHtml+=this._metaRow('ID',pRecord.IDSource||0);}tmpHtml+='</div>';// Dataset card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Dataset</h3>';if(pDataset&&!pDataset.Error){tmpHtml+=this._metaRow('Name',pDataset.Name||'\u2014');tmpHtml+=this._metaRow('Hash',pDataset.Hash||'\u2014',false,true);tmpHtml+=this._metaRow('Type',pDataset.Type||'\u2014');tmpHtml+=this._metaRow('Version Policy',pDataset.VersionPolicy||'\u2014');}else{tmpHtml+=this._metaRow('ID',pRecord.IDDataset||0);}tmpHtml+='</div>';// Ingest Metadata card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Ingest Metadata</h3>';tmpHtml+=this._metaRow('Ingest Date',this._formatDate(pRecord.IngestDate));tmpHtml+=this._metaRow('Ingest Job',pRecord.IDIngestJob||'\u2014');if(pIngestJob&&pIngestJob.Job){tmpHtml+=this._metaRow('Job Status',pIngestJob.Job.Status||'\u2014');}tmpHtml+=this._metaRow('Created',this._formatDate(pRecord.CreateDate));if(pRecord.OriginCreateDate){tmpHtml+=this._metaRow('Origin Date',this._formatDate(pRecord.OriginCreateDate));}tmpHtml+='</div>';// Schema card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Schema</h3>';tmpHtml+=this._metaRow('Schema Hash',pRecord.SchemaHash||'\u2014');tmpHtml+=this._metaRow('Schema Version',pRecord.SchemaVersion||0);tmpHtml+='</div>';// Certainty card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Certainty</h3>';if(pCertainty&&pCertainty.CertaintyIndices&&pCertainty.CertaintyIndices.length>0){for(let i=0;i<pCertainty.CertaintyIndices.length;i++){let tmpCI=pCertainty.CertaintyIndices[i];let tmpPct=Math.round((tmpCI.CertaintyValue||0)*100);let tmpBarColor=tmpPct>=70?'#28a745':tmpPct>=40?'#ffc107':'#dc3545';tmpHtml+=this._metaRow(tmpCI.Dimension||'overall',tmpPct+'%');tmpHtml+='<div class="facto-record-certainty-bar"><div class="facto-record-certainty-fill" style="width:'+tmpPct+'%; background:'+tmpBarColor+';"></div></div>';if(tmpCI.Justification){tmpHtml+='<div style="font-size:0.75em; color:var(--facto-text-tertiary); margin-top:0.15em;">'+this._escapeHtml(tmpCI.Justification)+'</div>';}}}else{tmpHtml+='<div style="color:var(--facto-text-tertiary); font-size:0.85em;">No certainty data</div>';}tmpHtml+='</div>';return tmpHtml;}_metaRow(pLabel,pValue,pIsGuid,pIsHash){let tmpDisplayValue=this._escapeHtml(String(pValue||''));if(pIsGuid&&tmpDisplayValue.length>16){tmpDisplayValue='<span title="'+tmpDisplayValue+'">'+tmpDisplayValue.substring(0,8)+'\u2026'+tmpDisplayValue.substring(tmpDisplayValue.length-4)+'</span>';}let tmpValueClass='facto-record-meta-value';if(pIsHash){tmpValueClass+=' facto-hash-value';}return'<div class="facto-record-meta-row"><span class="facto-record-meta-label">'+this._escapeHtml(pLabel)+'</span><span class="'+tmpValueClass+'">'+tmpDisplayValue+'</span></div>';}_formatDate(pDateStr){if(!pDateStr)return'\u2014';try{// SQLite datetimes (e.g. "2026-03-15 19:07:43") lack a timezone
// indicator, so new Date() would treat them as local time.
// Append 'Z' to interpret them as UTC, matching ISO timestamps.
let tmpNormalized=pDateStr;if(typeof tmpNormalized==='string'&&!tmpNormalized.endsWith('Z')&&!tmpNormalized.match(/[+-]\d{2}:\d{2}$/)){tmpNormalized=tmpNormalized.replace(' ','T')+'Z';}let tmpDate=new Date(tmpNormalized);return tmpDate.toLocaleString();}catch(e){return pDateStr;}}_escapeHtml(pStr){return pStr.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}goBack(){this.pict.PictApplication.navigateTo('/Records');}}module.exports=FactoFullRecordViewerView;module.exports.default_configuration=_ViewConfiguration;},{"pict-section-objecteditor":23,"pict-view":33}],45:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-Records",DefaultRenderable:"Facto-Full-Records-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,CSS:/*css*/`
		.facto-records-pager {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-bottom: 1em;
		}
		.facto-records-pager span {
			font-size: 0.85em;
			color: var(--facto-text-secondary);
		}
		.facto-record-data {
			max-width: 400px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.8em;
			color: var(--facto-text-secondary);
		}
	`,Templates:[{Hash:"Facto-Full-Records-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Records</h1>
		<p>Browse ingested records across all datasets.</p>
	</div>

	<div class="facto-records-pager">
		<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Records'].prevPage()">Previous</button>
		<span id="Facto-Full-Records-PageInfo">Page 1</span>
		<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Records'].nextPage()">Next</button>
	</div>

	<div id="Facto-Full-Records-List"></div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-Records-Content",TemplateHash:"Facto-Full-Records-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullRecordsView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){this.pict.providers.Facto.loadRecords(this.pict.AppData.Facto.RecordPage).then(()=>{this.refreshList();});return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}refreshList(){let tmpContainer=document.getElementById('Facto-Full-Records-List');if(!tmpContainer)return;let tmpRecords=this.pict.AppData.Facto.Records;let tmpPageInfo=document.getElementById('Facto-Full-Records-PageInfo');if(tmpPageInfo)tmpPageInfo.textContent='Page '+((this.pict.AppData.Facto.RecordPage||0)+1);if(!tmpRecords||tmpRecords.length===0){tmpContainer.innerHTML='<div class="facto-empty">No records found. Ingest data via Source Research or the Ingest API.</div>';return;}let tmpHtml='<table><thead><tr><th>ID</th><th>Dataset</th><th>Source</th><th>GUID</th><th>Data</th><th></th></tr></thead><tbody>';for(let i=0;i<tmpRecords.length;i++){let tmpRec=tmpRecords[i];let tmpData='';try{tmpData=JSON.stringify(JSON.parse(tmpRec.Content||'{}'));}catch(e){tmpData=tmpRec.Content||'';}tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpRec.IDRecord||'')+'</td>';tmpHtml+='<td>'+(tmpRec.IDDataset||'')+'</td>';tmpHtml+='<td>'+(tmpRec.IDSource||'')+'</td>';tmpHtml+='<td style="font-size:0.8em; color:var(--facto-text-tertiary);">'+(tmpRec.GUIDRecord||'').substring(0,8)+'...</td>';tmpHtml+='<td class="facto-record-data">'+tmpData+'</td>';tmpHtml+='<td><button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Record/'+tmpRec.IDRecord+'\')">View</button></td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}prevPage(){if(this.pict.AppData.Facto.RecordPage>0){this.pict.AppData.Facto.RecordPage--;this.pict.providers.Facto.loadRecords(this.pict.AppData.Facto.RecordPage).then(()=>{this.refreshList();});}}nextPage(){this.pict.AppData.Facto.RecordPage++;this.pict.providers.Facto.loadRecords(this.pict.AppData.Facto.RecordPage).then(()=>{this.refreshList();});}}module.exports=FactoFullRecordsView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],46:[function(require,module,exports){const libPictView=require('pict-view');const libPictSectionMarkdownEditor=require('pict-section-markdowneditor');const libPictSectionContent=require('pict-section-content');const _ViewConfiguration={ViewIdentifier:"Facto-Full-SourceDetail",DefaultRenderable:"Facto-Full-SourceDetail-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,CSS:/*css*/`
		.facto-source-detail-back {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			color: var(--facto-text-secondary);
			cursor: pointer;
			font-size: 0.85em;
			margin-bottom: 0.75em;
			transition: color 0.15s;
		}
		.facto-source-detail-back:hover {
			color: var(--facto-accent);
		}

		/* Research context section */
		.facto-research-context {
			background: var(--facto-surface-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 8px;
			padding: 1em;
			margin-bottom: 1.5em;
		}
		.facto-research-context h3 {
			margin: 0 0 0.5em;
			font-size: 0.75em;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--facto-text-tertiary, #888);
		}
		.facto-research-context-detail {
			font-size: 0.85em;
			color: var(--facto-text-secondary, #aaa);
			line-height: 1.6;
		}
		.facto-research-context-detail strong {
			color: var(--facto-text-primary, #eee);
		}
		.facto-research-context-note {
			margin-top: 0.5em;
			padding: 0.5em 0.75em;
			background: rgba(74, 144, 217, 0.08);
			border-left: 3px solid var(--facto-accent, #4a90d9);
			border-radius: 0 4px 4px 0;
			font-size: 0.85em;
			color: var(--facto-text-secondary, #aaa);
		}

		/* Dataset definitions table */
		.facto-dataset-defs {
			margin-bottom: 1.5em;
		}
		.facto-dataset-defs h2 {
			font-size: 1em;
			margin: 0 0 0.75em;
			color: var(--facto-text-secondary, #aaa);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		/* Documentation section */
		.facto-doc-section {
			margin-top: 1.5em;
		}
		.facto-doc-section-header {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-bottom: 0.75em;
		}
		.facto-doc-section-header h2 {
			font-size: 1em;
			margin: 0;
			color: var(--facto-text-secondary, #aaa);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		.facto-edit-toggle {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			padding: 0.25em 0.6em;
			font-size: 0.75em;
			border-radius: 4px;
			cursor: pointer;
			transition: background 0.15s, color 0.15s;
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			background: transparent;
			color: var(--facto-text-tertiary, #888);
		}
		.facto-edit-toggle:hover {
			border-color: var(--facto-accent, #4a90d9);
			color: var(--facto-accent, #4a90d9);
		}
		.facto-edit-toggle.active {
			background: rgba(74, 144, 217, 0.15);
			border-color: var(--facto-accent, #4a90d9);
			color: var(--facto-accent, #4a90d9);
		}

		/* Read-only rendered content */
		.facto-doc-content-wrap {
			background: var(--facto-surface-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 8px;
			padding: 1.5em 2em;
			min-height: 100px;
		}
		.facto-doc-content-wrap h1 {
			font-size: 1.75em;
			color: var(--facto-text-primary, #eee);
			border-bottom: 1px solid var(--facto-border-subtle, #2a2e3a);
			padding-bottom: 0.3em;
			margin-top: 0;
		}
		.facto-doc-content-wrap h2 {
			font-size: 1.4em;
			color: var(--facto-text-primary, #eee);
			border-bottom: 1px solid var(--facto-border-subtle, #2a2e3a);
			padding-bottom: 0.25em;
			margin-top: 1.5em;
		}
		.facto-doc-content-wrap h3 {
			font-size: 1.15em;
			color: var(--facto-text-primary, #eee);
			margin-top: 1.25em;
		}
		.facto-doc-content-wrap h4,
		.facto-doc-content-wrap h5,
		.facto-doc-content-wrap h6 {
			color: var(--facto-text-secondary, #ccc);
			margin-top: 1em;
		}
		.facto-doc-content-wrap p {
			line-height: 1.7;
			color: var(--facto-text-secondary, #bbb);
			margin: 0.75em 0;
		}
		.facto-doc-content-wrap a {
			color: var(--facto-accent, #4a90d9);
		}
		.facto-doc-content-wrap code {
			background: rgba(74, 144, 217, 0.1);
			color: var(--facto-accent, #4a90d9);
			padding: 0.15em 0.35em;
			border-radius: 3px;
			font-size: 0.9em;
		}
		.facto-doc-content-wrap pre {
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 6px;
			padding: 1em;
			overflow-x: auto;
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-content-wrap pre code {
			background: transparent;
			padding: 0;
			color: inherit;
		}
		.facto-doc-content-wrap blockquote {
			border-left: 3px solid var(--facto-accent, #4a90d9);
			padding: 0.5em 1em;
			margin: 1em 0;
			color: var(--facto-text-tertiary, #888);
			background: rgba(74, 144, 217, 0.05);
			border-radius: 0 4px 4px 0;
		}
		.facto-doc-content-wrap table {
			width: 100%;
			border-collapse: collapse;
			margin: 1em 0;
		}
		.facto-doc-content-wrap table th,
		.facto-doc-content-wrap table td {
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			padding: 0.5em 0.75em;
		}
		.facto-doc-content-wrap table th {
			background: rgba(255, 255, 255, 0.03);
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-content-wrap img {
			max-width: 100%;
			height: auto;
			border-radius: 4px;
			margin: 0.5em 0;
		}
		.facto-doc-content-wrap hr {
			border: none;
			border-top: 1px solid var(--facto-border-subtle, #2a2e3a);
			margin: 1.5em 0;
		}
		.facto-doc-content-wrap ul,
		.facto-doc-content-wrap ol {
			color: var(--facto-text-secondary, #bbb);
			padding-left: 1.5em;
			line-height: 1.7;
		}
		.facto-doc-list {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5em;
			margin-bottom: 1em;
		}
		.facto-doc-item {
			padding: 0.4em 0.75em;
			background: var(--facto-surface-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 6px;
			font-size: 0.85em;
			cursor: pointer;
			color: var(--facto-text-secondary, #aaa);
			transition: border-color 0.15s, color 0.15s;
		}
		.facto-doc-item:hover {
			border-color: var(--facto-accent, #4a90d9);
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-item.active {
			border-color: var(--facto-accent, #4a90d9);
			color: var(--facto-accent, #4a90d9);
			background: rgba(74, 144, 217, 0.1);
		}
		.facto-doc-editor-wrap {
			background: var(--facto-surface-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 8px;
			padding: 1em;
			min-height: 200px;
		}
		.facto-doc-toolbar {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-bottom: 0.75em;
		}
		.facto-doc-name {
			font-size: 0.9em;
			font-weight: 600;
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-name-input {
			font-size: 0.9em;
			font-weight: 600;
			color: var(--facto-text-primary, #eee);
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border, #3a3e4a);
			border-radius: 4px;
			padding: 0.2em 0.5em;
			width: 250px;
		}
		.facto-doc-name-input:focus {
			border-color: var(--facto-accent, #4a90d9);
			outline: none;
		}
		.facto-doc-new-input {
			display: flex;
			gap: 0.5em;
			align-items: center;
		}
		.facto-doc-new-input input {
			width: 240px;
			margin-bottom: 0;
		}

		/* Editor toolbar controls */
		.facto-editor-controls {
			display: flex;
			align-items: center;
			gap: 0.25em;
			margin-left: auto;
		}
		.facto-editor-ctrl-btn {
			display: inline-flex;
			align-items: center;
			gap: 0.3em;
			padding: 0.2em 0.55em;
			font-size: 0.72em;
			border-radius: 4px;
			cursor: pointer;
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			background: transparent;
			color: var(--facto-text-tertiary, #888);
			transition: background 0.15s, color 0.15s, border-color 0.15s;
			white-space: nowrap;
		}
		.facto-editor-ctrl-btn:hover {
			border-color: var(--facto-border, #3a3e4a);
			color: var(--facto-text-secondary, #aaa);
		}
		.facto-editor-ctrl-btn.active {
			background: rgba(74, 144, 217, 0.12);
			border-color: var(--facto-accent, #4a90d9);
			color: var(--facto-accent, #4a90d9);
		}
		.facto-editor-ctrl-sep {
			width: 1px;
			height: 16px;
			background: var(--facto-border-subtle, #2a2e3a);
			margin: 0 0.25em;
		}

		/* Settings gear & flyout */
		.facto-settings-wrap {
			position: relative;
			display: flex;
			align-items: center;
		}
		.facto-settings-gear {
			background: transparent;
			border: none;
			cursor: pointer;
			padding: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 4px;
			color: var(--facto-text-tertiary, #888);
			transition: color 0.15s;
		}
		.facto-settings-gear:hover,
		.facto-settings-gear.active {
			color: var(--facto-accent, #4a90d9);
		}
		.facto-settings-gear svg {
			width: 18px;
			height: 18px;
			fill: currentColor;
		}
		.facto-settings-overlay {
			display: none;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 999;
		}
		.facto-settings-overlay.open {
			display: block;
		}
		.facto-settings-flyout {
			position: absolute;
			top: 36px;
			right: 0;
			width: 260px;
			background: var(--facto-surface-elevated, #1a1e2a);
			border: 1px solid var(--facto-border, #3a3e4a);
			border-radius: 8px;
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
			z-index: 1000;
			opacity: 0;
			transform: translateY(-4px);
			pointer-events: none;
			transition: opacity 0.15s ease, transform 0.15s ease;
		}
		.facto-settings-flyout.open {
			opacity: 1;
			transform: translateY(0);
			pointer-events: auto;
		}
		.facto-settings-flyout::before {
			content: '';
			position: absolute;
			top: -6px;
			right: 10px;
			width: 10px;
			height: 10px;
			background: var(--facto-surface-elevated, #1a1e2a);
			border-left: 1px solid var(--facto-border, #3a3e4a);
			border-top: 1px solid var(--facto-border, #3a3e4a);
			transform: rotate(45deg);
		}
		.facto-settings-section {
			padding: 8px 12px;
		}
		.facto-settings-label {
			font-size: 0.68rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--facto-text-tertiary, #888);
			margin-bottom: 6px;
		}
		.facto-settings-divider {
			height: 1px;
			background: var(--facto-border-subtle, #2a2e3a);
			margin: 2px 8px;
		}
		.facto-settings-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			margin-bottom: 5px;
		}
		.facto-settings-row:last-child {
			margin-bottom: 0;
		}
		.facto-settings-checkbox {
			width: 15px;
			height: 15px;
			accent-color: var(--facto-accent, #4a90d9);
			cursor: pointer;
			flex-shrink: 0;
		}
		.facto-settings-checkbox-label {
			font-size: 0.82rem;
			color: var(--facto-text-secondary, #aaa);
			cursor: pointer;
			user-select: none;
		}
		.facto-settings-select {
			width: 130px;
			padding: 4px 6px;
			border: 1px solid var(--facto-border, #3a3e4a);
			border-radius: 4px;
			background: var(--facto-bg-input, #0d1117);
			font-size: 0.78rem;
			color: var(--facto-text-secondary, #aaa);
			cursor: pointer;
		}
		.facto-settings-select:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}
		.facto-settings-select-label {
			font-size: 0.78rem;
			color: var(--facto-text-tertiary, #888);
			white-space: nowrap;
		}

		/* Override MarkdownEditor default light theme for dark theme.
		   Selectors must match or exceed library specificity. */
		.facto-doc-editor-wrap .pict-mde {
			background: transparent;
		}
		.facto-doc-editor-wrap .pict-mde-segment {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-segment-body {
			background: var(--facto-bg-input, #0d1117);
		}
		.facto-doc-editor-wrap .pict-mde-segment.pict-mde-active .pict-mde-segment-body {
			background: var(--facto-bg-input, #0d1117);
		}

		/* Drag handle */
		.facto-doc-editor-wrap .pict-mde-drag-handle {
			background: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-drag-handle:hover {
			background: var(--facto-border, #3a3e4a);
		}
		.facto-doc-editor-wrap .pict-mde-segment.pict-mde-active .pict-mde-drag-handle {
			background: rgba(74, 144, 217, 0.25);
		}

		/* Left control buttons */
		.facto-doc-editor-wrap .pict-mde-left-btn {
			color: var(--facto-text-tertiary, #666);
		}
		.facto-doc-editor-wrap .pict-mde-left-btn:hover {
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-btn-remove:hover {
			color: var(--facto-danger, #dc3545);
		}

		/* CodeMirror editor */
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor {
			background: var(--facto-bg-input, #0d1117);
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-gutters {
			background: var(--facto-surface-elevated, #1a1e2a);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-tertiary, #666);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-activeLine {
			background: rgba(74, 144, 217, 0.05);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-activeLineGutter {
			background: rgba(74, 144, 217, 0.1);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-cursor {
			border-left-color: var(--facto-text-primary, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-selectionBackground {
			background: rgba(74, 144, 217, 0.2) !important;
		}

		/* Rich preview — must match library's two-class specificity */
		.facto-doc-editor-wrap .pict-mde-rich-preview.pict-mde-has-rich-preview {
			background: var(--facto-bg-surface, #161a24);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-secondary, #aaa);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview h1,
		.facto-doc-editor-wrap .pict-mde-rich-preview h2,
		.facto-doc-editor-wrap .pict-mde-rich-preview h3,
		.facto-doc-editor-wrap .pict-mde-rich-preview h4 {
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview code {
			background: rgba(74, 144, 217, 0.1);
			color: var(--facto-accent, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview pre {
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview a {
			color: var(--facto-accent, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview blockquote {
			border-left-color: var(--facto-accent, #4a90d9);
			color: var(--facto-text-tertiary, #888);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview table th,
		.facto-doc-editor-wrap .pict-mde-rich-preview table td {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview hr {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}

		/* Image preview */
		.facto-doc-editor-wrap .pict-mde-image-preview.pict-mde-has-images {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-image-preview-label {
			color: var(--facto-text-tertiary, #666);
			background: var(--facto-bg-surface, #161a24);
		}

		/* Add-segment button */
		.facto-doc-editor-wrap .pict-mde-btn-add {
			background: var(--facto-bg-surface, #161a24);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-tertiary, #666);
		}
		.facto-doc-editor-wrap .pict-mde-btn-add:hover {
			border-color: var(--facto-accent, #4a90d9);
			color: var(--facto-accent, #4a90d9);
			background: rgba(74, 144, 217, 0.05);
		}

		/* Sidebar buttons */
		.facto-doc-editor-wrap .pict-mde-sidebar-btn {
			background: var(--facto-bg-surface, #161a24);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-tertiary, #666);
		}
		.facto-doc-editor-wrap .pict-mde-sidebar-btn:hover {
			border-color: var(--facto-accent, #4a90d9);
			color: var(--facto-accent, #4a90d9);
		}

		/* Drag-over indicators */
		.facto-doc-editor-wrap .pict-mde-segment.pict-mde-drag-over-top {
			border-top-color: var(--facto-accent, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-segment.pict-mde-drag-over-bottom {
			border-bottom-color: var(--facto-accent, #4a90d9);
		}

		/* Rendered view (full-document preview mode) */
		.facto-doc-editor-wrap .pict-mde-rendered-view {
			background: var(--facto-bg-surface, #161a24);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-secondary, #aaa);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view h1,
		.facto-doc-editor-wrap .pict-mde-rendered-view h2,
		.facto-doc-editor-wrap .pict-mde-rendered-view h3,
		.facto-doc-editor-wrap .pict-mde-rendered-view h4 {
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view p {
			color: var(--facto-text-secondary, #bbb);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view a {
			color: var(--facto-accent, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view code {
			background: rgba(74, 144, 217, 0.1);
			color: var(--facto-accent, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view pre {
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-primary, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view pre code {
			background: transparent;
			color: inherit;
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view blockquote {
			border-left-color: var(--facto-accent, #4a90d9);
			color: var(--facto-text-tertiary, #888);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view table th,
		.facto-doc-editor-wrap .pict-mde-rendered-view table td {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view img {
			max-width: 100%;
			height: auto;
			border-radius: 4px;
		}
	`,Templates:[{Hash:"Facto-Full-SourceDetail-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-source-detail-back" onclick="{~P~}.views['Facto-Full-SourceDetail'].goBack()">
		&#8592; Back to Source Research
	</div>

	<div class="facto-content-header">
		<h1 id="Facto-SourceDetail-Title">Source</h1>
	</div>

	<div id="Facto-SourceDetail-Loading" style="color:var(--facto-text-secondary);">Loading source...</div>
	<div id="Facto-SourceDetail-Error" class="facto-status facto-status-error" style="display:none;"></div>

	<div id="Facto-SourceDetail-Container" style="display:none;">
		<div class="facto-record-meta" id="Facto-SourceDetail-Meta"></div>

		<div id="Facto-SourceDetail-ResearchContext"></div>

		<div class="facto-dataset-defs" id="Facto-SourceDetail-DatasetDefs"></div>

		<div class="facto-doc-section">
			<div class="facto-doc-section-header">
				<h2>Documentation</h2>
				<button class="facto-edit-toggle" id="Facto-SourceDetail-EditToggle" onclick="{~P~}.views['Facto-Full-SourceDetail'].toggleEditMode()">
					&#9998; Edit
				</button>
			</div>
			<div id="Facto-SourceDetail-DocListWrap"></div>
			<div id="Facto-SourceDetail-ContentWrap" style="display:none;">
				<div class="facto-doc-content-wrap" id="Facto-SourceDetail-ContentDisplay"></div>
			</div>
			<div id="Facto-SourceDetail-EditorWrap" style="display:none;">
				<div class="facto-doc-editor-wrap">
					<div class="facto-doc-toolbar">
						<span class="facto-doc-name" id="Facto-SourceDetail-DocName"></span>
						<div class="facto-editor-controls" id="Facto-SourceDetail-EditorControls">
							<button class="facto-editor-ctrl-btn active" id="Facto-EditorCtrl-Preview" title="Toggle rich previews below each segment" onclick="{~P~}.views['Facto-Full-SourceDetail'].toggleEditorPreview()">&#x25CE; Preview</button>
							<button class="facto-editor-ctrl-btn active" id="Facto-EditorCtrl-LineNums" title="Toggle line numbers and sidebar controls" onclick="{~P~}.views['Facto-Full-SourceDetail'].toggleEditorControls()">&#x229E; Controls</button>
							<div class="facto-editor-ctrl-sep"></div>
							<button class="facto-editor-ctrl-btn" id="Facto-EditorCtrl-Rendered" title="Preview the full document as rendered markdown" onclick="{~P~}.views['Facto-Full-SourceDetail'].toggleEditorRenderedView()">&#9635; Full Preview</button>
							<div class="facto-editor-ctrl-sep"></div>
							<div class="facto-settings-wrap">
								<button class="facto-settings-gear" id="Facto-EditorSettings-Gear" title="Editor settings"
									onclick="{~P~}.views['Facto-Full-SourceDetail'].toggleSettingsPanel()">
									<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>
								</button>
								<div class="facto-settings-overlay" id="Facto-EditorSettings-Overlay"
									onclick="{~P~}.views['Facto-Full-SourceDetail'].closeSettingsPanel()"></div>
								<div class="facto-settings-flyout" id="Facto-EditorSettings-Flyout">
									<div class="facto-settings-section">
										<div class="facto-settings-label">Segmentation</div>
										<div class="facto-settings-row">
											<label class="facto-settings-checkbox-label"
												for="Facto-Setting-AutoSegment">Auto Segment Markdown</label>
											<input type="checkbox" class="facto-settings-checkbox"
												id="Facto-Setting-AutoSegment"
												onchange="{~P~}.views['Facto-Full-SourceDetail'].onAutoSegmentChanged(this.checked)">
										</div>
										<div class="facto-settings-row">
											<span class="facto-settings-select-label">Segment Depth</span>
											<select class="facto-settings-select"
												id="Facto-Setting-SegmentDepth"
												disabled
												onchange="{~P~}.views['Facto-Full-SourceDetail'].onSegmentDepthChanged(this.value)">
												<option value="1">Depth 1: Blocks</option>
												<option value="2" selected>Depth 2: ##</option>
												<option value="3">Depth 3: ###</option>
												<option value="4">Depth 4: ####</option>
												<option value="5">Depth 5: #####</option>
												<option value="6">Depth 6: ######</option>
											</select>
										</div>
									</div>
									<div class="facto-settings-divider"></div>
									<div class="facto-settings-section">
										<div class="facto-settings-label">Word Wrap</div>
										<div class="facto-settings-row">
											<label class="facto-settings-checkbox-label"
												for="Facto-Setting-WordWrap">Markdown Word Wrap</label>
											<input type="checkbox" class="facto-settings-checkbox"
												id="Facto-Setting-WordWrap"
												onchange="{~P~}.views['Facto-Full-SourceDetail'].onWordWrapChanged(this.checked)">
										</div>
									</div>
								</div>
							</div>
						</div>
						<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-SourceDetail'].saveDocument()">Save</button>
					</div>
					<div id="Facto-SourceDetail-MarkdownEditor-Container"></div>
				</div>
			</div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-SourceDetail-Content",TemplateHash:"Facto-Full-SourceDetail-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullSourceDetailView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this._CurrentIDSource=null;this._CurrentIDDoc=null;this._CurrentDocName='';this._CurrentDocContent='';this._Documentation=[];this._EditMode=false;// Settings state
this._SettingsOpen=false;this._AutoSegment=false;this._AutoSegmentDepth=2;this._WordWrap=false;}onBeforeInitialize(){super.onBeforeInitialize();// Register the MarkdownEditor view type if not already present
if(!this.fable.servicesMap.hasOwnProperty('PictViewMarkdownEditor')){this.fable.addServiceType('PictViewMarkdownEditor',libPictSectionMarkdownEditor);}// Register the Content provider for markdown rendering
if(!this.pict.providers.PictContent){this.pict.addProvider('PictContent',{ProviderIdentifier:'PictContent'},libPictSectionContent.PictContentProvider);}return true;}/**
	 * Navigate to a specific source, optionally opening a document.
	 */loadSource(pIDSource,pIDDoc){this._CurrentIDSource=pIDSource;this._CurrentIDDoc=pIDDoc||null;this.render();}onAfterRender(){super.onAfterRender();if(!this._CurrentIDSource){let tmpLoading=document.getElementById('Facto-SourceDetail-Loading');if(tmpLoading){tmpLoading.textContent='No source selected.';}return;}this._fetchAndDisplaySource();}_fetchAndDisplaySource(){let tmpProvider=this.pict.providers.Facto;let tmpLoadingEl=document.getElementById('Facto-SourceDetail-Loading');let tmpErrorEl=document.getElementById('Facto-SourceDetail-Error');let tmpSummary=null;let tmpCatalogContext=null;let tmpDocumentation=null;let tmpSummaryPromise=tmpProvider.loadSourceSummary(this._CurrentIDSource);let tmpCatalogPromise=tmpProvider.loadSourceCatalogContext(this._CurrentIDSource);let tmpDocsPromise=tmpProvider.loadSourceDocumentation(this._CurrentIDSource);tmpSummaryPromise.then(pResponse=>{if(pResponse&&pResponse.Error){if(tmpLoadingEl)tmpLoadingEl.style.display='none';if(tmpErrorEl){tmpErrorEl.textContent='Error loading source: '+pResponse.Error;tmpErrorEl.style.display='block';}return;}tmpSummary=pResponse;});tmpCatalogPromise.then(pResponse=>{tmpCatalogContext=pResponse||{CatalogEntries:[],DatasetDefinitions:[]};});tmpDocsPromise.then(pResponse=>{tmpDocumentation=pResponse&&pResponse.Documentation?pResponse.Documentation:[];});Promise.all([tmpSummaryPromise,tmpCatalogPromise,tmpDocsPromise]).then(()=>{if(!tmpSummary||!tmpSummary.Source){if(tmpLoadingEl)tmpLoadingEl.style.display='none';if(tmpErrorEl){tmpErrorEl.textContent='Source not found';tmpErrorEl.style.display='block';}return;}this._renderSourceDetail(tmpSummary,tmpCatalogContext,tmpDocumentation);}).catch(pError=>{if(tmpLoadingEl)tmpLoadingEl.style.display='none';if(tmpErrorEl){tmpErrorEl.textContent='Error loading source: '+(pError.message||pError);tmpErrorEl.style.display='block';}});}_renderSourceDetail(pSummary,pCatalogContext,pDocumentation){let tmpLoadingEl=document.getElementById('Facto-SourceDetail-Loading');let tmpContainer=document.getElementById('Facto-SourceDetail-Container');let tmpTitleEl=document.getElementById('Facto-SourceDetail-Title');if(tmpLoadingEl)tmpLoadingEl.style.display='none';if(tmpContainer)tmpContainer.style.display='block';let tmpSource=pSummary.Source;// Title
if(tmpTitleEl){tmpTitleEl.textContent=tmpSource.Hash||tmpSource.Name||'Source #'+tmpSource.IDSource;}// Metadata cards
let tmpMetaEl=document.getElementById('Facto-SourceDetail-Meta');if(tmpMetaEl){tmpMetaEl.innerHTML=this._buildMetaCards(tmpSource,pSummary);}// Research context
this._renderResearchContext(pCatalogContext);// Dataset definitions
this._renderDatasetDefs(pCatalogContext);// Documentation list
this._Documentation=pDocumentation;this._renderDocList();// Auto-open document if specified
if(this._CurrentIDDoc){this.selectDocument(this._CurrentIDDoc);}}_buildMetaCards(pSource,pSummary){let tmpGUID=(pSource.GUIDSource||'').substring(0,8)+'\u2026'+(pSource.GUIDSource||'').substring((pSource.GUIDSource||'').length-4);let tmpActive=pSource.Active?'<span class="facto-badge facto-badge-success">Active</span>':'<span class="facto-badge facto-badge-muted">Inactive</span>';let tmpHtml='';// Source Identity card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Source Identity</h3>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">ID</span><span class="facto-record-meta-value">'+pSource.IDSource+'</span></div>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">GUID</span><span class="facto-record-meta-value">'+tmpGUID+'</span></div>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">Hash</span><span class="facto-record-meta-value facto-hash-value">'+(pSource.Hash||'\u2014')+'</span></div>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">Status</span><span class="facto-record-meta-value">'+tmpActive+'</span></div>';tmpHtml+='</div>';// Connection card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Connection</h3>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">Name</span><span class="facto-record-meta-value">'+(pSource.Name||'\u2014')+'</span></div>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">Type</span><span class="facto-record-meta-value">'+(pSource.Type||'\u2014')+'</span></div>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">URL</span><span class="facto-record-meta-value" title="'+(pSource.URL||'')+'">'+(pSource.URL||'\u2014')+'</span></div>';tmpHtml+='</div>';// Statistics card
tmpHtml+='<div class="facto-record-meta-card">';tmpHtml+='<h3>Statistics</h3>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">Records</span><span class="facto-record-meta-value">'+(pSummary.RecordCount||0).toLocaleString()+'</span></div>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">Datasets</span><span class="facto-record-meta-value">'+(pSummary.DatasetCount||0)+'</span></div>';tmpHtml+='<div class="facto-record-meta-row"><span class="facto-record-meta-label">Documents</span><span class="facto-record-meta-value">'+(pSummary.DocumentationCount||0)+'</span></div>';tmpHtml+='</div>';return tmpHtml;}_renderResearchContext(pCatalogContext){let tmpEl=document.getElementById('Facto-SourceDetail-ResearchContext');if(!tmpEl)return;if(!pCatalogContext||!pCatalogContext.CatalogEntries||pCatalogContext.CatalogEntries.length===0){tmpEl.innerHTML='';return;}let tmpHtml='';for(let i=0;i<pCatalogContext.CatalogEntries.length;i++){let tmpEntry=pCatalogContext.CatalogEntries[i];tmpHtml+='<div class="facto-research-context">';tmpHtml+='<h3>Research Context'+(pCatalogContext.CatalogEntries.length>1?' ('+(i+1)+')':'')+'</h3>';tmpHtml+='<div class="facto-research-context-detail">';tmpHtml+='<strong>Agency:</strong> '+(tmpEntry.Agency||'\u2014');tmpHtml+=' &nbsp;\u00B7&nbsp; <strong>Category:</strong> '+(tmpEntry.Category||'\u2014');tmpHtml+=' &nbsp;\u00B7&nbsp; <strong>Region:</strong> '+(tmpEntry.Region||'\u2014');tmpHtml+=' &nbsp;\u00B7&nbsp; <strong>Update Frequency:</strong> '+(tmpEntry.UpdateFrequency||'\u2014');tmpHtml+=' &nbsp;\u00B7&nbsp; <strong>Verified:</strong> '+(tmpEntry.Verified?'Yes':'No');tmpHtml+='</div>';if(tmpEntry.Description){tmpHtml+='<div class="facto-research-context-detail" style="margin-top:0.5em;">'+tmpEntry.Description+'</div>';}if(tmpEntry.Notes){tmpHtml+='<div class="facto-research-context-note">'+tmpEntry.Notes+'</div>';}tmpHtml+='</div>';}tmpEl.innerHTML=tmpHtml;}_renderDatasetDefs(pCatalogContext){let tmpEl=document.getElementById('Facto-SourceDetail-DatasetDefs');if(!tmpEl)return;if(!pCatalogContext||!pCatalogContext.DatasetDefinitions||pCatalogContext.DatasetDefinitions.length===0){tmpEl.innerHTML='';return;}let tmpDefs=pCatalogContext.DatasetDefinitions;let tmpHtml='<h2>Dataset Definitions</h2>';tmpHtml+='<table><thead><tr><th>Name</th><th>Format</th><th>Endpoint</th><th>Policy</th><th>Status</th></tr></thead><tbody>';for(let i=0;i<tmpDefs.length;i++){let tmpDef=tmpDefs[i];let tmpStatus=tmpDef.Provisioned?'<span class="facto-badge facto-badge-success">Provisioned</span>':'<span class="facto-badge facto-badge-muted">Not provisioned</span>';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpDef.Name||'')+'</td>';tmpHtml+='<td><span class="facto-badge facto-badge-primary">'+(tmpDef.Format||'')+'</span></td>';tmpHtml+='<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+(tmpDef.EndpointURL||'')+'</td>';tmpHtml+='<td>'+(tmpDef.VersionPolicy||'Append')+'</td>';tmpHtml+='<td>'+tmpStatus+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpEl.innerHTML=tmpHtml;}_renderDocList(){let tmpEl=document.getElementById('Facto-SourceDetail-DocListWrap');if(!tmpEl)return;let tmpHtml='<div class="facto-doc-list">';// New Document button
tmpHtml+='<div class="facto-doc-new-input" id="Facto-SourceDetail-NewDocWrap">';tmpHtml+='<input type="text" id="Facto-SourceDetail-NewDocName" placeholder="Document name...">';tmpHtml+='<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-SourceDetail\'].createDocument()">New Document</button>';tmpHtml+='</div>';tmpHtml+='</div>';// Document tabs
if(this._Documentation&&this._Documentation.length>0){tmpHtml+='<div class="facto-doc-list">';for(let i=0;i<this._Documentation.length;i++){let tmpDoc=this._Documentation[i];let tmpActiveClass=this._CurrentIDDoc&&parseInt(this._CurrentIDDoc,10)===tmpDoc.IDSourceDocumentation?' active':'';tmpHtml+='<div class="facto-doc-item'+tmpActiveClass+'" onclick="pict.views[\'Facto-Full-SourceDetail\'].selectDocument('+tmpDoc.IDSourceDocumentation+')">';tmpHtml+=tmpDoc.Name||'Untitled';tmpHtml+='</div>';}tmpHtml+='</div>';}tmpEl.innerHTML=tmpHtml;}selectDocument(pIDDoc){let tmpProvider=this.pict.providers.Facto;this._CurrentIDDoc=pIDDoc;// Update URL hash without full re-render
if(window.history&&window.history.replaceState){window.history.replaceState(null,'','#/Source/'+this._CurrentIDSource+'/Doc/'+pIDDoc);}// Re-render doc list to highlight active
this._renderDocList();tmpProvider.loadSourceDocument(this._CurrentIDSource,pIDDoc).then(pResponse=>{if(pResponse&&pResponse.Error){this._setEditorStatus('Error loading document: '+pResponse.Error,'error');return;}let tmpDoc=pResponse.Documentation;this._CurrentDocName=tmpDoc.Name||'Untitled';this._CurrentDocContent=tmpDoc.Content||'';// Populate the content data for the markdown editor (used when entering edit mode)
this.pict.AppData.Facto.CurrentDocumentSegments=this._segmentMarkdownContent(this._CurrentDocContent);this._showDocument();});}_showDocument(){let tmpContentWrap=document.getElementById('Facto-SourceDetail-ContentWrap');let tmpEditorWrap=document.getElementById('Facto-SourceDetail-EditorWrap');if(this._EditMode){// Edit mode: show markdown editor
if(tmpContentWrap)tmpContentWrap.style.display='none';if(tmpEditorWrap)tmpEditorWrap.style.display='block';// Show editable name input
let tmpNameEl=document.getElementById('Facto-SourceDetail-DocName');if(tmpNameEl){tmpNameEl.innerHTML='<input type="text" class="facto-doc-name-input" id="Facto-SourceDetail-DocNameInput" value="'+(this._CurrentDocName||'').replace(/"/g,'&quot;')+'">';}this._renderMarkdownEditor();this._syncEditorToolbarState();}else{// Read mode: show rendered content
if(tmpEditorWrap)tmpEditorWrap.style.display='none';if(tmpContentWrap)tmpContentWrap.style.display='block';this._renderReadOnlyContent();}}/**
	 * Sync the editor toolbar toggle buttons with the MDE's current state.
	 */_syncEditorToolbarState(){let tmpEditorView=this.pict.views['Facto-SourceDetail-MarkdownEditor'];if(!tmpEditorView)return;let tmpPreviewBtn=document.getElementById('Facto-EditorCtrl-Preview');if(tmpPreviewBtn){tmpPreviewBtn.classList.toggle('active',tmpEditorView._previewsVisible);}let tmpControlsBtn=document.getElementById('Facto-EditorCtrl-LineNums');if(tmpControlsBtn){tmpControlsBtn.classList.toggle('active',tmpEditorView._controlsVisible);}let tmpRenderedBtn=document.getElementById('Facto-EditorCtrl-Rendered');if(tmpRenderedBtn){tmpRenderedBtn.classList.toggle('active',tmpEditorView._renderedViewActive);}}_renderReadOnlyContent(){let tmpDisplayEl=document.getElementById('Facto-SourceDetail-ContentDisplay');if(!tmpDisplayEl)return;if(!this._CurrentDocContent){tmpDisplayEl.innerHTML='<p style="color:var(--facto-text-tertiary);">Empty document.</p>';return;}let tmpHTML=this.pict.providers.PictContent.parseMarkdown(this._CurrentDocContent);tmpDisplayEl.innerHTML=tmpHTML;}toggleEditMode(){let tmpToggleBtn=document.getElementById('Facto-SourceDetail-EditToggle');if(this._EditMode){// If in rendered view mode, exit it first so MDE state is clean
let tmpEditorView=this.pict.views['Facto-SourceDetail-MarkdownEditor'];if(tmpEditorView&&tmpEditorView._renderedViewActive){tmpEditorView.toggleRenderedView(false);}// Leaving edit mode: marshal content from editor back to raw string
this._marshalEditorContent();// Capture any name change from the input
let tmpNameInput=document.getElementById('Facto-SourceDetail-DocNameInput');if(tmpNameInput){let tmpNewName=tmpNameInput.value.trim();if(tmpNewName&&tmpNewName!==this._CurrentDocName){this._CurrentDocName=tmpNewName;}}this._EditMode=false;if(tmpToggleBtn){tmpToggleBtn.innerHTML='&#9998; Edit';tmpToggleBtn.classList.remove('active');}}else{// Entering edit mode: ensure segments are in sync
this.pict.AppData.Facto.CurrentDocumentSegments=this._segmentMarkdownContent(this._CurrentDocContent);this._EditMode=true;if(tmpToggleBtn){tmpToggleBtn.innerHTML='&#10003; Done';tmpToggleBtn.classList.add('active');}}// Re-display current document in the new mode (if one is selected)
if(this._CurrentIDDoc){this._showDocument();}}// -- Editor toolbar toggles --
toggleEditorPreview(){let tmpEditorView=this.pict.views['Facto-SourceDetail-MarkdownEditor'];if(!tmpEditorView)return;tmpEditorView.togglePreview();let tmpBtn=document.getElementById('Facto-EditorCtrl-Preview');if(tmpBtn){tmpBtn.classList.toggle('active',tmpEditorView._previewsVisible);}}toggleEditorControls(){let tmpEditorView=this.pict.views['Facto-SourceDetail-MarkdownEditor'];if(!tmpEditorView)return;tmpEditorView.toggleControls();let tmpBtn=document.getElementById('Facto-EditorCtrl-LineNums');if(tmpBtn){tmpBtn.classList.toggle('active',tmpEditorView._controlsVisible);}}toggleEditorRenderedView(){let tmpEditorView=this.pict.views['Facto-SourceDetail-MarkdownEditor'];if(!tmpEditorView)return;tmpEditorView.toggleRenderedView();let tmpBtn=document.getElementById('Facto-EditorCtrl-Rendered');if(tmpBtn){tmpBtn.classList.toggle('active',tmpEditorView._renderedViewActive);}}// -- Settings gear flyout --
toggleSettingsPanel(){if(this._SettingsOpen){this.closeSettingsPanel();}else{this.openSettingsPanel();}}openSettingsPanel(){this._SettingsOpen=true;let tmpFlyout=document.getElementById('Facto-EditorSettings-Flyout');let tmpOverlay=document.getElementById('Facto-EditorSettings-Overlay');let tmpGear=document.getElementById('Facto-EditorSettings-Gear');if(tmpFlyout)tmpFlyout.classList.add('open');if(tmpOverlay)tmpOverlay.classList.add('open');if(tmpGear)tmpGear.classList.add('active');// Sync checkboxes/selects with current state
let tmpAutoSeg=document.getElementById('Facto-Setting-AutoSegment');if(tmpAutoSeg)tmpAutoSeg.checked=this._AutoSegment;let tmpDepth=document.getElementById('Facto-Setting-SegmentDepth');if(tmpDepth){tmpDepth.value=String(this._AutoSegmentDepth);tmpDepth.disabled=!this._AutoSegment;}let tmpWrap=document.getElementById('Facto-Setting-WordWrap');if(tmpWrap)tmpWrap.checked=this._WordWrap;}closeSettingsPanel(){this._SettingsOpen=false;let tmpFlyout=document.getElementById('Facto-EditorSettings-Flyout');let tmpOverlay=document.getElementById('Facto-EditorSettings-Overlay');let tmpGear=document.getElementById('Facto-EditorSettings-Gear');if(tmpFlyout)tmpFlyout.classList.remove('open');if(tmpOverlay)tmpOverlay.classList.remove('open');if(tmpGear)tmpGear.classList.remove('active');}onAutoSegmentChanged(pChecked){this._AutoSegment=pChecked;let tmpDepthSelect=document.getElementById('Facto-Setting-SegmentDepth');if(tmpDepthSelect){tmpDepthSelect.disabled=!pChecked;}// If turning on, re-segment the current document and rebuild the editor
if(pChecked&&this._CurrentDocContent){this._resegmentAndRebuildEditor();}}onSegmentDepthChanged(pValue){this._AutoSegmentDepth=parseInt(pValue,10)||2;// Re-segment if auto-segment is active
if(this._AutoSegment&&this._CurrentDocContent){this._resegmentAndRebuildEditor();}}onWordWrapChanged(pChecked){this._WordWrap=pChecked;// Live-apply to all CodeMirror editors
let tmpEditorView=this.pict.views['Facto-SourceDetail-MarkdownEditor'];if(tmpEditorView&&tmpEditorView._segmentEditors){for(let tmpKey in tmpEditorView._segmentEditors){let tmpEditor=tmpEditorView._segmentEditors[tmpKey];if(tmpEditor&&tmpEditor.contentDOM){if(pChecked){tmpEditor.contentDOM.classList.add('cm-lineWrapping');}else{tmpEditor.contentDOM.classList.remove('cm-lineWrapping');}}}}}/**
	 * Re-segment the current document content and rebuild the editor.
	 * Called when auto-segment is toggled on or the depth changes.
	 */_resegmentAndRebuildEditor(){// First marshal current editor content back to the raw string
this._marshalEditorContent();// Re-segment
let tmpSegments=this._segmentMarkdownContent(this._CurrentDocContent);this.pict.AppData.Facto.CurrentDocumentSegments=tmpSegments;// Force the editor to rebuild with the new segments
let tmpEditorView=this.pict.views['Facto-SourceDetail-MarkdownEditor'];if(tmpEditorView){tmpEditorView.marshalToView();}}/**
	 * Segment markdown content based on the auto-segment settings.
	 *
	 * When AutoSegment is enabled, splits the content into segments
	 * at the configured heading depth.
	 *
	 * Depth 1 splits every top-level block (paragraphs, code fences,
	 * headings, etc.) into its own segment. Depth 2+ splits at the
	 * corresponding heading level, keeping everything between two
	 * headings of that level (or higher) in the same segment.
	 *
	 * @param {string} pContent - Raw markdown text
	 * @returns {Array} Array of { Content: string } segment objects
	 */_segmentMarkdownContent(pContent){if(!this._AutoSegment||!pContent){return[{Content:pContent||''}];}let tmpDepth=this._AutoSegmentDepth;if(tmpDepth===1){// Depth 1: every block is its own segment.
// Split on blank lines, preserving fenced code blocks.
let tmpLines=pContent.split('\n');let tmpSegments=[];let tmpCurrent=[];let tmpInFence=false;for(let i=0;i<tmpLines.length;i++){let tmpLine=tmpLines[i];if(/^(`{3,}|~{3,})/.test(tmpLine.trim())){tmpInFence=!tmpInFence;tmpCurrent.push(tmpLine);continue;}if(tmpInFence){tmpCurrent.push(tmpLine);continue;}if(tmpLine.trim()===''){if(tmpCurrent.length>0){tmpSegments.push({Content:tmpCurrent.join('\n')});tmpCurrent=[];}continue;}tmpCurrent.push(tmpLine);}if(tmpCurrent.length>0){tmpSegments.push({Content:tmpCurrent.join('\n')});}return tmpSegments.length>0?tmpSegments:[{Content:''}];}// Depth 2+: split at headings of that level or higher.
let tmpHeadingPattern=new RegExp('^(#{1,'+tmpDepth+'})\\s');let tmpLines=pContent.split('\n');let tmpSegments=[];let tmpCurrent=[];for(let i=0;i<tmpLines.length;i++){let tmpLine=tmpLines[i];if(tmpHeadingPattern.test(tmpLine.trim())&&tmpCurrent.length>0){tmpSegments.push({Content:tmpCurrent.join('\n')});tmpCurrent=[];}tmpCurrent.push(tmpLine);}if(tmpCurrent.length>0){tmpSegments.push({Content:tmpCurrent.join('\n')});}return tmpSegments.length>0?tmpSegments:[{Content:''}];}/**
	 * Marshal content out of the markdown editor and back into _CurrentDocContent.
	 */_marshalEditorContent(){let tmpViewHash='Facto-SourceDetail-MarkdownEditor';let tmpEditorView=this.pict.views[tmpViewHash];if(!tmpEditorView)return;tmpEditorView.marshalFromView();let tmpSegments=this.pict.AppData.Facto.CurrentDocumentSegments||[];let tmpParts=[];for(let i=0;i<tmpSegments.length;i++){if(tmpSegments[i]&&tmpSegments[i].Content){tmpParts.push(tmpSegments[i].Content);}}this._CurrentDocContent=tmpParts.join('\n\n');}_renderMarkdownEditor(){let tmpViewHash='Facto-SourceDetail-MarkdownEditor';let tmpContainerId='Facto-SourceDetail-MarkdownEditor-Container';// If editor view already exists, re-render it with new data
if(this.pict.views[tmpViewHash]){this.pict.views[tmpViewHash].marshalToView();return;}// Create a new MarkdownEditor view instance
let tmpEditorConfig={ViewIdentifier:tmpViewHash,DefaultDestinationAddress:'#'+tmpContainerId,TargetElementAddress:'#'+tmpContainerId,ContentDataAddress:'AppData.Facto.CurrentDocumentSegments',ReadOnly:false,EnableRichPreview:true,ImageBaseURL:'',Renderables:[{RenderableHash:tmpViewHash+'-Renderable',TemplateHash:'MarkdownEditor-Container',DestinationAddress:'#'+tmpContainerId,RenderMethod:'replace'}]};this.pict.addView(tmpViewHash,tmpEditorConfig,libPictSectionMarkdownEditor);// Must explicitly trigger initialization for dynamically added views
let tmpEditorView=this.pict.views[tmpViewHash];// Override onImageUpload to upload files to the server instead of inlining base64
let tmpSelf=this;tmpEditorView.onImageUpload=function(pFile,pSegmentIndex,fCallback){let tmpReader=new FileReader();tmpReader.onload=function(){// Strip the data:...;base64, prefix
let tmpBase64=tmpReader.result.split(',')[1];tmpSelf.pict.providers.Facto.uploadSourceFile(tmpSelf._CurrentIDSource,pFile.name,pFile.type,tmpBase64).then(function(pResponse){if(pResponse&&pResponse.Success&&pResponse.URL){fCallback(null,pResponse.URL);}else{fCallback(pResponse&&pResponse.Error||'Upload failed');}});};tmpReader.onerror=function(){fCallback('Failed to read file');};tmpReader.readAsDataURL(pFile);return true;};tmpEditorView.onBeforeInitialize();tmpEditorView.render();}saveDocument(){if(!this._CurrentIDDoc||!this._CurrentIDSource)return;// Marshal from editor if we're in edit mode
if(this._EditMode){this._marshalEditorContent();}// Check if name was changed via the input
let tmpUpdateData={Content:this._CurrentDocContent};let tmpNameInput=document.getElementById('Facto-SourceDetail-DocNameInput');if(tmpNameInput){let tmpNewName=tmpNameInput.value.trim();if(tmpNewName&&tmpNewName!==this._CurrentDocName){tmpUpdateData.Name=tmpNewName;this._CurrentDocName=tmpNewName;}}let tmpProvider=this.pict.providers.Facto;tmpProvider.updateSourceDocument(this._CurrentIDSource,this._CurrentIDDoc,tmpUpdateData).then(pResponse=>{if(pResponse&&pResponse.Success){this._setEditorStatus('Saved','ok');// If name changed, update the doc list and internal state
if(tmpUpdateData.Name){// Update the in-memory doc list entry
for(let i=0;i<this._Documentation.length;i++){if(this._Documentation[i].IDSourceDocumentation===parseInt(this._CurrentIDDoc,10)){this._Documentation[i].Name=tmpUpdateData.Name;break;}}this._renderDocList();}}else{this._setEditorStatus('Error saving: '+(pResponse&&pResponse.Error||'Unknown'),'error');}});}createDocument(){let tmpNameInput=document.getElementById('Facto-SourceDetail-NewDocName');let tmpName=tmpNameInput?tmpNameInput.value.trim():'';if(!tmpName){// Auto-number untitled docs based on existing ones
let tmpUntitledCount=0;if(this._Documentation){for(let i=0;i<this._Documentation.length;i++){let tmpDocName=this._Documentation[i].Name||'';if(tmpDocName==='Untitled'||tmpDocName.match(/^Untitled \d+$/)){tmpUntitledCount++;}}}tmpName='Untitled '+(tmpUntitledCount+1);}let tmpProvider=this.pict.providers.Facto;tmpProvider.createSourceDocument(this._CurrentIDSource,{Name:tmpName,DocumentType:'markdown',Content:'# '+tmpName+'\n\n'}).then(pResponse=>{if(pResponse&&pResponse.Success&&pResponse.Documentation){// Clear the input
if(tmpNameInput)tmpNameInput.value='';// Reload doc list and auto-select the new doc
let tmpNewID=pResponse.Documentation.IDSourceDocumentation;return tmpProvider.loadSourceDocumentation(this._CurrentIDSource).then(pDocsResponse=>{this._Documentation=pDocsResponse&&pDocsResponse.Documentation?pDocsResponse.Documentation:[];this._renderDocList();this.selectDocument(tmpNewID);});}});}closeDocument(){let tmpEditorWrap=document.getElementById('Facto-SourceDetail-EditorWrap');let tmpContentWrap=document.getElementById('Facto-SourceDetail-ContentWrap');if(tmpEditorWrap)tmpEditorWrap.style.display='none';if(tmpContentWrap)tmpContentWrap.style.display='none';this._CurrentIDDoc=null;this._CurrentDocContent='';// Update URL to remove doc reference
if(window.history&&window.history.replaceState){window.history.replaceState(null,'','#/Source/'+this._CurrentIDSource);}// Re-render doc list to clear active highlight
this._renderDocList();}_setEditorStatus(pMessage,pType){let tmpNameEl=document.getElementById('Facto-SourceDetail-DocName');if(tmpNameEl){let tmpOriginal=this._CurrentDocName;tmpNameEl.textContent=tmpOriginal+' \u2014 '+pMessage;setTimeout(()=>{if(tmpNameEl)tmpNameEl.textContent=tmpOriginal;},2000);}}goBack(){this.pict.PictApplication.navigateTo('/SourceResearch');}}module.exports=FactoFullSourceDetailView;module.exports.default_configuration=_ViewConfiguration;},{"pict-section-content":12,"pict-section-markdowneditor":21,"pict-view":33}],47:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-SourceResearch",DefaultRenderable:"Facto-Full-SourceResearch-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,CSS:/*css*/`
		.facto-research-search {
			display: flex;
			gap: 0.75em;
			margin-bottom: 1.25em;
		}
		.facto-research-search input {
			flex: 1;
			margin-bottom: 0;
		}
		.facto-research-detail {
			margin-top: 1.25em;
			padding-top: 1.25em;
			border-top: 1px solid var(--facto-border-subtle);
		}
		.facto-research-import textarea {
			width: 100%;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.85em;
			padding: 0.75em;
			background: var(--facto-bg-input);
			color: var(--facto-text);
			border: 1px solid var(--facto-border);
			border-radius: 6px;
			margin-bottom: 0.5em;
		}
	`,Templates:[{Hash:"Facto-Full-SourceResearch-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Source Research</h1>
		<p>Research and catalog potential data sources before provisioning them as runtime Sources and Datasets.</p>
	</div>

	<div class="facto-research-search">
		<input type="text" id="Facto-Full-Research-Search" placeholder="Search catalog by name, agency, category, or description...">
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SourceResearch'].searchCatalog()">Search</button>
	</div>

	<div id="Facto-Full-Research-List"></div>
	<div id="Facto-Full-Research-Detail" class="facto-research-detail" style="display:none;"></div>
	<div id="Facto-Full-Research-Status" class="facto-status" style="display:none;"></div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Import / Export</div>
		<div class="facto-research-import">
			<textarea id="Facto-Full-Research-ImportJSON" rows="4" placeholder="Paste JSON array of catalog entries here..."></textarea>
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SourceResearch'].importCatalog()">Import JSON</button>
			<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-SourceResearch'].exportCatalog()">Export Catalog</button>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-SourceResearch-Content",TemplateHash:"Facto-Full-SourceResearch-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullSourceResearchView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){this._SourceLinks={};Promise.all([this.pict.providers.Facto.loadCatalogEntries(),this.pict.providers.Facto.loadCatalogSourceLinks()]).then(pResults=>{let tmpLinksResponse=pResults[1];if(tmpLinksResponse&&tmpLinksResponse.Links){this._SourceLinks=tmpLinksResponse.Links;}this.refreshList();});return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}setStatus(pMessage,pType){let tmpEl=document.getElementById('Facto-Full-Research-Status');if(!tmpEl)return;tmpEl.className='facto-status facto-status-'+(pType||'info');tmpEl.textContent=pMessage;tmpEl.style.display='block';}refreshList(){let tmpContainer=document.getElementById('Facto-Full-Research-List');if(!tmpContainer)return;let tmpEntries=this.pict.AppData.Facto.CatalogEntries;if(!tmpEntries||tmpEntries.length===0){tmpContainer.innerHTML='<div class="facto-empty">No catalog entries yet. Import a catalog or add sources manually.</div>';return;}let tmpHtml='<table><thead><tr><th>ID</th><th>Agency</th><th>Name</th><th>Type</th><th>Category</th><th>Region</th><th>Verified</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpEntries.length;i++){let tmpEntry=tmpEntries[i];let tmpVerified=tmpEntry.Verified?'<span class="facto-badge facto-badge-success">Yes</span>':'<span class="facto-badge facto-badge-muted">No</span>';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpEntry.IDSourceCatalogEntry||'')+'</td>';tmpHtml+='<td>'+(tmpEntry.Agency||'')+'</td>';tmpHtml+='<td>'+(tmpEntry.Name||'')+'</td>';tmpHtml+='<td><span class="facto-badge facto-badge-primary">'+(tmpEntry.Type||'')+'</span></td>';tmpHtml+='<td>'+(tmpEntry.Category||'')+'</td>';tmpHtml+='<td>'+(tmpEntry.Region||'')+'</td>';tmpHtml+='<td>'+tmpVerified+'</td>';tmpHtml+='<td>';let tmpLinkedSource=this._SourceLinks&&this._SourceLinks[tmpEntry.IDSourceCatalogEntry];if(tmpLinkedSource){tmpHtml+='<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Source/'+tmpLinkedSource+'\')">View Source &rarr;</button> ';}tmpHtml+='<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-SourceResearch\'].viewEntry('+tmpEntry.IDSourceCatalogEntry+')">Datasets</button> ';tmpHtml+='<button class="facto-btn facto-btn-danger facto-btn-small" onclick="pict.views[\'Facto-Full-SourceResearch\'].deleteEntry('+tmpEntry.IDSourceCatalogEntry+')">Delete</button>';tmpHtml+='</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}searchCatalog(){let tmpQuery=(document.getElementById('Facto-Full-Research-Search')||{}).value||'';if(!tmpQuery){this.pict.providers.Facto.loadCatalogEntries().then(()=>{this.refreshList();});return;}this.pict.providers.Facto.searchCatalog(tmpQuery).then(pResponse=>{this.pict.AppData.Facto.CatalogEntries=pResponse&&pResponse.Entries?pResponse.Entries:[];this.refreshList();});}deleteEntry(pIDEntry){if(!confirm('Remove this catalog entry?'))return;this.pict.providers.Facto.deleteCatalogEntry(pIDEntry).then(()=>{return this.pict.providers.Facto.loadCatalogEntries();}).then(()=>{this.refreshList();this.setStatus('Entry removed','ok');});}viewEntry(pIDEntry){let tmpDetail=document.getElementById('Facto-Full-Research-Detail');if(!tmpDetail)return;tmpDetail.style.display='block';this.pict.providers.Facto.loadCatalogEntryDatasets(pIDEntry).then(pResponse=>{let tmpDatasets=pResponse&&pResponse.Datasets?pResponse.Datasets:[];let tmpHtml='<h3>Dataset Definitions for Entry #'+pIDEntry+'</h3>';if(tmpDatasets.length===0){tmpHtml+='<div class="facto-empty">No dataset definitions yet.</div>';}else{tmpHtml+='<table><thead><tr><th>ID</th><th>Name</th><th>Format</th><th>Endpoint URL</th><th>Policy</th><th>Status</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpDatasets.length;i++){let tmpDS=tmpDatasets[i];let tmpStatus=tmpDS.Provisioned?'<span class="facto-badge facto-badge-success">Provisioned</span>':'<span class="facto-badge facto-badge-muted">Not provisioned</span>';let tmpAction='';if(tmpDS.Provisioned){tmpAction='<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-SourceResearch\'].fetchDataset('+tmpDS.IDCatalogDatasetDefinition+', '+pIDEntry+')">Fetch</button>';if(tmpDS.IDSource){tmpAction+=' <button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Source/'+tmpDS.IDSource+'\')">View Source &rarr;</button>';}}else{tmpAction='<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-SourceResearch\'].provisionDataset('+tmpDS.IDCatalogDatasetDefinition+', '+pIDEntry+')">Provision</button>';}tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpDS.IDCatalogDatasetDefinition||'')+'</td>';tmpHtml+='<td>'+(tmpDS.Name||'')+'</td>';tmpHtml+='<td><span class="facto-badge facto-badge-primary">'+(tmpDS.Format||'')+'</span></td>';tmpHtml+='<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+(tmpDS.EndpointURL||'')+'</td>';tmpHtml+='<td>'+(tmpDS.VersionPolicy||'Append')+'</td>';tmpHtml+='<td>'+tmpStatus+'</td>';tmpHtml+='<td>'+tmpAction+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';}tmpHtml+='<div style="margin-top:1em;"><button class="facto-btn facto-btn-secondary" onclick="document.getElementById(\'Facto-Full-Research-Detail\').style.display=\'none\'">Close</button></div>';tmpDetail.innerHTML=tmpHtml;});}provisionDataset(pIDCatalogDataset,pIDEntry){this.setStatus('Provisioning...','info');this.pict.providers.Facto.provisionCatalogDataset(pIDCatalogDataset).then(pResponse=>{if(pResponse&&pResponse.Success){let tmpStatusEl=document.getElementById('Facto-Full-Research-Status');if(tmpStatusEl){tmpStatusEl.className='facto-status facto-status-ok';tmpStatusEl.innerHTML='Provisioned! Source: '+(pResponse.Source.Hash||pResponse.Source.Name)+' (#'+pResponse.Source.IDSource+'), Dataset: '+(pResponse.Dataset.Hash||pResponse.Dataset.Name)+' (#'+pResponse.Dataset.IDDataset+') &mdash; <a href="#/Source/'+pResponse.Source.IDSource+'" style="color:var(--facto-accent);text-decoration:underline;cursor:pointer;">View Source \u2192</a>';tmpStatusEl.style.display='block';}this.viewEntry(pIDEntry);}else{this.setStatus('Error: '+(pResponse&&pResponse.Error||'Unknown'),'error');}});}fetchDataset(pIDCatalogDataset,pIDEntry){this.setStatus('Fetching data from endpoint...','info');this.pict.providers.Facto.fetchCatalogDataset(pIDCatalogDataset).then(pResponse=>{if(pResponse&&pResponse.Success){let tmpMsg='Fetched! '+pResponse.Ingested+' records ingested (v'+pResponse.DatasetVersion+', '+pResponse.Format+')';if(pResponse.IsDuplicate)tmpMsg+=' [duplicate content]';this.setStatus(tmpMsg,'ok');this.viewEntry(pIDEntry);}else{this.setStatus('Fetch error: '+(pResponse&&pResponse.Error||'Unknown'),'error');}});}importCatalog(){let tmpTextArea=document.getElementById('Facto-Full-Research-ImportJSON');if(!tmpTextArea||!tmpTextArea.value){this.setStatus('Paste JSON to import','warn');return;}let tmpEntries;try{tmpEntries=JSON.parse(tmpTextArea.value);}catch(pErr){this.setStatus('Invalid JSON: '+pErr.message,'error');return;}this.pict.providers.Facto.importCatalog(tmpEntries).then(pResponse=>{if(pResponse&&pResponse.Success){this.setStatus('Imported '+pResponse.EntriesCreated+' entries with '+pResponse.DatasetsCreated+' datasets','ok');tmpTextArea.value='';return this.pict.providers.Facto.loadCatalogEntries();}else{this.setStatus('Import error: '+(pResponse&&pResponse.Error||'Unknown'),'error');}}).then(()=>{this.refreshList();});}exportCatalog(){this.pict.providers.Facto.exportCatalog().then(pResponse=>{let tmpTextArea=document.getElementById('Facto-Full-Research-ImportJSON');if(tmpTextArea){tmpTextArea.value=JSON.stringify(pResponse&&pResponse.Entries?pResponse.Entries:pResponse,null,2);}this.setStatus('Catalog exported to JSON text area','ok');});}}module.exports=FactoFullSourceResearchView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],48:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-Sources",DefaultRenderable:"Facto-Full-Sources-Content",DefaultDestinationAddress:"#Facto-Full-Content-Container",AutoRender:false,Templates:[{Hash:"Facto-Full-Sources-Template",Template:/*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Sources</h1>
		<p>Manage data sources that feed into the warehouse.</p>
	</div>

	<div id="Facto-Full-Sources-List"></div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Add Source</div>
		<div class="facto-inline-group">
			<div>
				<label>Name</label>
				<input type="text" id="Facto-Full-Source-Name" placeholder="Source name">
			</div>
			<div>
				<label>Type</label>
				<select id="Facto-Full-Source-Type">
					<option value="API">API</option>
					<option value="File">File</option>
					<option value="Database">Database</option>
					<option value="Manual">Manual</option>
				</select>
			</div>
			<div>
				<label>URL</label>
				<input type="text" id="Facto-Full-Source-URL" placeholder="https://...">
			</div>
		</div>
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Sources'].addSource()">Add Source</button>
	</div>

	<div id="Facto-Full-Sources-Status" class="facto-status" style="display:none;"></div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-Sources-Content",TemplateHash:"Facto-Full-Sources-Template",DestinationAddress:"#Facto-Full-Content-Container",RenderMethod:"replace"}]};class FactoFullSourcesView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){this.pict.providers.Facto.loadSources().then(()=>{this.refreshList();});return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}setStatus(pMessage,pType){let tmpEl=document.getElementById('Facto-Full-Sources-Status');if(!tmpEl)return;tmpEl.className='facto-status facto-status-'+(pType||'info');tmpEl.textContent=pMessage;tmpEl.style.display='block';}refreshList(){let tmpContainer=document.getElementById('Facto-Full-Sources-List');if(!tmpContainer)return;let tmpSources=this.pict.AppData.Facto.Sources;if(!tmpSources||tmpSources.length===0){tmpContainer.innerHTML='<div class="facto-empty">No sources yet. Add one below or provision from Source Research.</div>';return;}let tmpHtml='<table><thead><tr><th>ID</th><th>Hash</th><th>Name</th><th>Type</th><th>URL</th><th>Active</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpSources.length;i++){let tmpSource=tmpSources[i];let tmpActive=tmpSource.Active?'<span class="facto-badge facto-badge-success">Active</span>':'<span class="facto-badge facto-badge-muted">Inactive</span>';let tmpToggleBtn=tmpSource.Active?'<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Sources\'].toggleActive('+tmpSource.IDSource+', false)">Deactivate</button>':'<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-Sources\'].toggleActive('+tmpSource.IDSource+', true)">Activate</button>';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpSource.IDSource||'')+'</td>';tmpHtml+='<td><code>'+(tmpSource.Hash||'-')+'</code></td>';tmpHtml+='<td>'+(tmpSource.Name||'')+'</td>';tmpHtml+='<td><span class="facto-badge facto-badge-primary">'+(tmpSource.Type||'')+'</span></td>';tmpHtml+='<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+(tmpSource.URL||'')+'</td>';tmpHtml+='<td>'+tmpActive+'</td>';let tmpViewBtn='<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Source/'+tmpSource.IDSource+'\')">View</button>';tmpHtml+='<td>'+tmpViewBtn+' '+tmpToggleBtn+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}toggleActive(pIDSource,pActivate){let tmpPromise=pActivate?this.pict.providers.Facto.activateSource(pIDSource):this.pict.providers.Facto.deactivateSource(pIDSource);tmpPromise.then(()=>{return this.pict.providers.Facto.loadSources();}).then(()=>{this.refreshList();this.setStatus(pActivate?'Source activated':'Source deactivated','ok');});}addSource(){let tmpName=(document.getElementById('Facto-Full-Source-Name')||{}).value||'';let tmpType=(document.getElementById('Facto-Full-Source-Type')||{}).value||'';let tmpURL=(document.getElementById('Facto-Full-Source-URL')||{}).value||'';if(!tmpName){this.setStatus('Source name is required','warn');return;}this.pict.providers.Facto.createSource({Name:tmpName,Type:tmpType,URL:tmpURL,Active:1}).then(pResponse=>{if(pResponse&&pResponse.IDSource){this.setStatus('Source created: '+tmpName,'ok');document.getElementById('Facto-Full-Source-Name').value='';document.getElementById('Facto-Full-Source-URL').value='';return this.pict.providers.Facto.loadSources();}else{this.setStatus('Error creating source','error');}}).then(()=>{this.refreshList();});}}module.exports=FactoFullSourcesView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],49:[function(require,module,exports){const libPictView=require('pict-view');const _ViewConfiguration={ViewIdentifier:"Facto-Full-TopBar",DefaultRenderable:"Facto-Full-TopBar-Content",DefaultDestinationAddress:"#Facto-Full-TopBar-Container",AutoRender:false,CSS:/*css*/`
		.facto-topbar {
			display: flex;
			align-items: center;
			height: 48px;
			background: var(--facto-topbar-bg);
			padding: 0 1.25em;
			border-bottom: 1px solid var(--facto-border-subtle);
			position: sticky;
			top: 0;
			z-index: 100;
		}

		.facto-topbar-brand {
			font-size: 1.05em;
			font-weight: 700;
			color: var(--facto-text-heading);
			cursor: pointer;
			margin-right: 2em;
			white-space: nowrap;
			text-decoration: none;
		}

		.facto-topbar-brand:hover {
			color: var(--facto-brand);
		}

		.facto-topbar-nav {
			display: flex;
			align-items: center;
			gap: 0.15em;
			flex: 1;
			overflow-x: auto;
		}

		.facto-topbar-nav a {
			padding: 0.35em 0.7em;
			font-size: 0.85em;
			font-weight: 500;
			color: var(--facto-topbar-text);
			text-decoration: none;
			border-radius: 5px;
			white-space: nowrap;
			cursor: pointer;
			transition: color 0.12s, background 0.12s;
		}

		.facto-topbar-nav a:hover {
			color: var(--facto-topbar-hover);
			background: rgba(255,255,255,0.06);
		}

		.facto-topbar-nav a.active {
			color: var(--facto-topbar-active);
			background: rgba(255,255,255,0.08);
		}

		.facto-topbar-right {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-left: auto;
		}

		.facto-topbar-simple-link {
			font-size: 0.75em;
			color: var(--facto-topbar-text);
			text-decoration: none;
			opacity: 0.6;
		}

		.facto-topbar-simple-link:hover {
			opacity: 1;
		}

		/* Settings gear */
		.facto-settings-wrap {
			position: relative;
		}

		.facto-settings-gear {
			background: none;
			border: none;
			padding: 0.3em;
			cursor: pointer;
			color: var(--facto-topbar-text);
			display: flex;
			align-items: center;
			border-radius: 4px;
			transition: color 0.12s;
		}

		.facto-settings-gear:hover {
			color: var(--facto-topbar-hover);
		}

		.facto-settings-gear svg {
			width: 20px;
			height: 20px;
			fill: currentColor;
		}

		/* Settings panel */
		.facto-settings-panel {
			position: absolute;
			top: 100%;
			right: 0;
			margin-top: 0.5em;
			background: var(--facto-bg-surface);
			border: 1px solid var(--facto-border);
			border-radius: 8px;
			padding: 1em;
			min-width: 220px;
			box-shadow: var(--facto-shadow-heavy);
			z-index: 200;
		}

		.facto-settings-panel-title {
			font-size: 0.8em;
			font-weight: 600;
			color: var(--facto-text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 0.75em;
		}

		.facto-theme-grid {
			display: flex;
			flex-direction: column;
			gap: 0.4em;
		}

		.facto-theme-swatch {
			display: flex;
			align-items: center;
			gap: 0.6em;
			padding: 0.4em 0.5em;
			border-radius: 5px;
			cursor: pointer;
			transition: background 0.12s;
		}

		.facto-theme-swatch:hover {
			background: var(--facto-bg-elevated);
		}

		.facto-theme-swatch.active {
			background: var(--facto-bg-elevated);
			outline: 2px solid var(--facto-brand);
			outline-offset: -2px;
		}

		.facto-theme-swatch-colors {
			display: flex;
			gap: 3px;
		}

		.facto-theme-swatch-dot {
			width: 14px;
			height: 14px;
			border-radius: 50%;
			border: 1px solid rgba(255,255,255,0.1);
		}

		.facto-theme-swatch-label {
			font-size: 0.82em;
			color: var(--facto-text);
		}

		@media (max-width: 900px) {
			.facto-topbar-nav {
				display: none;
			}
		}
	`,Templates:[{Hash:"Facto-Full-TopBar-Template",Template:/*html*/`
<div class="facto-topbar">
	<a class="facto-topbar-brand" onclick="{~P~}.PictApplication.navigateTo('/Home')">Retold Facto</a>

	<div class="facto-topbar-nav" id="Facto-Full-TopBar-Nav">
		<a data-route="SourceResearch" onclick="{~P~}.PictApplication.navigateTo('/SourceResearch')">Source Research</a>
		<a data-route="IngestJobs" onclick="{~P~}.PictApplication.navigateTo('/IngestJobs')">Ingestion Jobs</a>
		<a data-route="Sources" onclick="{~P~}.PictApplication.navigateTo('/Sources')">Sources</a>
		<a data-route="Datasets" onclick="{~P~}.PictApplication.navigateTo('/Datasets')">Data Sets</a>
		<a data-route="Records" onclick="{~P~}.PictApplication.navigateTo('/Records')">Records</a>
		<a data-route="Projections" onclick="{~P~}.PictApplication.navigateTo('/Projections')">Projections</a>
		<a data-route="Dashboards" onclick="{~P~}.PictApplication.navigateTo('/Dashboards')">Dashboards</a>
	</div>

	<div class="facto-topbar-right">
		<a class="facto-topbar-simple-link" href="/simple/">Simple View</a>

		<div class="facto-settings-wrap">
			<button class="facto-settings-gear" onclick="{~P~}.views['Facto-Full-TopBar'].toggleThemePanel()">
				<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg>
			</button>

			<div class="facto-settings-panel" id="Facto-Full-Settings-Panel" style="display:none;">
				<div class="facto-settings-panel-title">Theme</div>
				<div class="facto-theme-grid" id="Facto-Full-Settings-ThemeGrid"></div>
			</div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:"Facto-Full-TopBar-Content",TemplateHash:"Facto-Full-TopBar-Template",DestinationAddress:"#Facto-Full-TopBar-Container",RenderMethod:"replace"}]};class FactoFullTopBarView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);this._themePanelOpen=false;}onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent){this._renderThemeGrid();// Close theme panel on outside click
document.addEventListener('click',pEvent=>{if(!this._themePanelOpen)return;let tmpWrap=pEvent.target.closest('.facto-settings-wrap');if(!tmpWrap){this._themePanelOpen=false;let tmpPanel=document.getElementById('Facto-Full-Settings-Panel');if(tmpPanel)tmpPanel.style.display='none';}});return super.onAfterRender(pRenderable,pRenderDestinationAddress,pRecord,pContent);}toggleThemePanel(){let tmpPanel=document.getElementById('Facto-Full-Settings-Panel');if(!tmpPanel)return;this._themePanelOpen=!this._themePanelOpen;tmpPanel.style.display=this._themePanelOpen?'block':'none';}selectTheme(pThemeKey){this.pict.PictApplication.applyTheme(pThemeKey);this._renderThemeGrid();this._themePanelOpen=false;let tmpPanel=document.getElementById('Facto-Full-Settings-Panel');if(tmpPanel)tmpPanel.style.display='none';}highlightRoute(pRoute){let tmpNav=document.getElementById('Facto-Full-TopBar-Nav');if(!tmpNav)return;let tmpLinks=tmpNav.querySelectorAll('a[data-route]');for(let i=0;i<tmpLinks.length;i++){if(tmpLinks[i].getAttribute('data-route')===pRoute){tmpLinks[i].classList.add('active');}else{tmpLinks[i].classList.remove('active');}}}_renderThemeGrid(){let tmpGrid=document.getElementById('Facto-Full-Settings-ThemeGrid');if(!tmpGrid)return;let tmpThemes=this.pict.PictApplication.getThemeList();let tmpCurrentTheme=this.pict.AppData.Facto.CurrentTheme||'facto-dark';let tmpHtml='';for(let i=0;i<tmpThemes.length;i++){let tmpTheme=tmpThemes[i];let tmpActiveClass=tmpTheme.Key===tmpCurrentTheme?' active':'';tmpHtml+='<div class="facto-theme-swatch'+tmpActiveClass+'" onclick="pict.views[\'Facto-Full-TopBar\'].selectTheme(\''+tmpTheme.Key+'\')">';tmpHtml+='<div class="facto-theme-swatch-colors">';for(let c=0;c<tmpTheme.Colors.length;c++){tmpHtml+='<div class="facto-theme-swatch-dot" style="background:'+tmpTheme.Colors[c]+';"></div>';}tmpHtml+='</div>';tmpHtml+='<div class="facto-theme-swatch-label">'+tmpTheme.Label+'</div>';tmpHtml+='</div>';}tmpGrid.innerHTML=tmpHtml;}}module.exports=FactoFullTopBarView;module.exports.default_configuration=_ViewConfiguration;},{"pict-view":33}],50:[function(require,module,exports){module.exports={"Name":"Retold Facto","Hash":"Facto","MainViewportViewIdentifier":"Facto-Layout","MainViewportDestinationAddress":"#Facto-Application-Container","MainViewportDefaultDataAddress":"AppData.Facto","pict_configuration":{"Product":"Facto"},"AutoRenderMainViewportViewAfterInitialize":false};},{}],51:[function(require,module,exports){const libPictApplication=require('pict-application');const libProvider=require('./providers/Pict-Provider-Facto.js');const libViewLayout=require('./views/PictView-Facto-Layout.js');const libViewSources=require('./views/PictView-Facto-Sources.js');const libViewRecords=require('./views/PictView-Facto-Records.js');const libViewDatasets=require('./views/PictView-Facto-Datasets.js');const libViewIngest=require('./views/PictView-Facto-Ingest.js');const libViewProjections=require('./views/PictView-Facto-Projections.js');const libViewCatalog=require('./views/PictView-Facto-Catalog.js');class FactoApplication extends libPictApplication{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);// Register provider
this.pict.addProvider('Facto',libProvider.default_configuration,libProvider);// Register views
this.pict.addView('Facto-Layout',libViewLayout.default_configuration,libViewLayout);this.pict.addView('Facto-Sources',libViewSources.default_configuration,libViewSources);this.pict.addView('Facto-Records',libViewRecords.default_configuration,libViewRecords);this.pict.addView('Facto-Datasets',libViewDatasets.default_configuration,libViewDatasets);this.pict.addView('Facto-Ingest',libViewIngest.default_configuration,libViewIngest);this.pict.addView('Facto-Projections',libViewProjections.default_configuration,libViewProjections);this.pict.addView('Facto-Catalog',libViewCatalog.default_configuration,libViewCatalog);}onAfterInitializeAsync(fCallback){// Centralized application state
this.pict.AppData.Facto={CatalogEntries:[],Sources:[],Datasets:[],Records:[],IngestJobs:[],SelectedSource:null,SelectedDataset:null,RecordPage:0,RecordPageSize:50};// Make pict available for inline onclick handlers
window.pict=this.pict;// Render layout (which cascades child view renders)
this.pict.views['Facto-Layout'].render();return fCallback();}}module.exports=FactoApplication;module.exports.default_configuration=require('./Pict-Application-Facto-Configuration.json');},{"./Pict-Application-Facto-Configuration.json":50,"./providers/Pict-Provider-Facto.js":53,"./views/PictView-Facto-Catalog.js":54,"./views/PictView-Facto-Datasets.js":55,"./views/PictView-Facto-Ingest.js":56,"./views/PictView-Facto-Layout.js":57,"./views/PictView-Facto-Projections.js":58,"./views/PictView-Facto-Records.js":59,"./views/PictView-Facto-Sources.js":60,"pict-application":5}],52:[function(require,module,exports){module.exports={FactoApplication:require('./Pict-Application-Facto.js'),FactoFullApplication:require('../pict-app-full/Pict-Application-Facto-Full.js')};if(typeof window!=='undefined'){window.FactoApplication=module.exports.FactoApplication;window.FactoFullApplication=module.exports.FactoFullApplication;}},{"../pict-app-full/Pict-Application-Facto-Full.js":35,"./Pict-Application-Facto.js":51}],53:[function(require,module,exports){const libPictProvider=require('pict-provider');class FactoProvider extends libPictProvider{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}// ================================================================
// API Helper
// ================================================================
api(pMethod,pPath,pBody){let tmpOpts={method:pMethod,headers:{}};if(pBody){tmpOpts.headers['Content-Type']='application/json';tmpOpts.body=JSON.stringify(pBody);}return fetch(pPath,tmpOpts).then(function(pResponse){return pResponse.text().then(function(pText){let tmpData;try{tmpData=JSON.parse(pText);}catch(pParseError){return{Error:'HTTP '+pResponse.status+' (non-JSON): '+pText.substring(0,200)};}// Translate Restify error format {code, message} to {Error}
if(!pResponse.ok&&tmpData&&tmpData.code&&!tmpData.Error){tmpData.Error=tmpData.code+': '+(tmpData.message||'HTTP '+pResponse.status);}return tmpData;});}).catch(function(pError){return{Error:pError.message||'Network error'};});}setStatus(pElementId,pMessage,pType){let tmpEl=document.getElementById(pElementId);if(!tmpEl)return;tmpEl.className='status '+(pType||'info');tmpEl.textContent=pMessage;tmpEl.style.display='block';}clearStatus(pElementId){let tmpEl=document.getElementById(pElementId);if(!tmpEl)return;tmpEl.style.display='none';tmpEl.textContent='';}// ================================================================
// Catalog Operations
// ================================================================
loadCatalogEntries(){return this.api('GET','/facto/catalog/entries').then(pResponse=>{this.pict.AppData.Facto.CatalogEntries=pResponse&&pResponse.Entries?pResponse.Entries:[];});}searchCatalog(pQuery){return this.api('GET','/facto/catalog/search?q='+encodeURIComponent(pQuery)).then(pResponse=>{return pResponse;});}createCatalogEntry(pData){return this.api('POST','/facto/catalog/entry',pData).then(pResponse=>{return pResponse;});}deleteCatalogEntry(pIDEntry){return this.api('DELETE','/facto/catalog/entry/'+pIDEntry).then(pResponse=>{return pResponse;});}loadCatalogEntryDatasets(pIDEntry){return this.api('GET','/facto/catalog/entry/'+pIDEntry+'/datasets').then(pResponse=>{return pResponse;});}addCatalogDataset(pIDEntry,pData){return this.api('POST','/facto/catalog/entry/'+pIDEntry+'/dataset',pData).then(pResponse=>{return pResponse;});}provisionCatalogDataset(pIDCatalogDataset){return this.api('POST','/facto/catalog/dataset/'+pIDCatalogDataset+'/provision').then(pResponse=>{return pResponse;});}fetchCatalogDataset(pIDCatalogDataset){return this.api('POST','/facto/catalog/dataset/'+pIDCatalogDataset+'/fetch').then(pResponse=>{return pResponse;});}importCatalog(pEntries){return this.api('POST','/facto/catalog/import',pEntries).then(pResponse=>{return pResponse;});}exportCatalog(){return this.api('GET','/facto/catalog/export').then(pResponse=>{return pResponse;});}// ================================================================
// Source Operations
// ================================================================
loadSources(){return this.api('GET','/1.0/Sources/0/100').then(pResponse=>{this.pict.AppData.Facto.Sources=pResponse||[];});}loadActiveSources(){return this.api('GET','/facto/sources/active').then(pResponse=>{return pResponse;});}createSource(pSourceData){return this.api('POST','/1.0/Source',pSourceData).then(pResponse=>{return pResponse;});}activateSource(pIDSource){return this.api('PUT',`/facto/source/${pIDSource}/activate`).then(pResponse=>{return pResponse;});}deactivateSource(pIDSource){return this.api('PUT',`/facto/source/${pIDSource}/deactivate`).then(pResponse=>{return pResponse;});}loadSourceSummary(pIDSource){return this.api('GET',`/facto/source/${pIDSource}/summary`).then(pResponse=>{return pResponse;});}// ================================================================
// Source Documentation Operations
// ================================================================
loadSourceDocumentation(pIDSource){return this.api('GET',`/facto/source/${pIDSource}/documentation`);}loadSourceDocument(pIDSource,pIDDoc){return this.api('GET',`/facto/source/${pIDSource}/documentation/${pIDDoc}`);}createSourceDocument(pIDSource,pData){return this.api('POST',`/facto/source/${pIDSource}/documentation`,pData);}updateSourceDocument(pIDSource,pIDDoc,pData){return this.api('PUT',`/facto/source/${pIDSource}/documentation/${pIDDoc}`,pData);}deleteSourceDocument(pIDSource,pIDDoc){return this.api('DELETE',`/facto/source/${pIDSource}/documentation/${pIDDoc}`);}// ================================================================
// Source Catalog Context
// ================================================================
loadSourceCatalogContext(pIDSource){return this.api('GET',`/facto/source/${pIDSource}/catalog-context`);}loadCatalogSourceLinks(){return this.api('GET','/facto/catalog/source-links');}// ================================================================
// Dataset Operations
// ================================================================
loadDatasets(){return this.api('GET','/1.0/Datasets/0/100').then(pResponse=>{this.pict.AppData.Facto.Datasets=pResponse||[];});}createDataset(pDatasetData){return this.api('POST','/1.0/Dataset',pDatasetData).then(pResponse=>{return pResponse;});}loadDatasetStats(pIDDataset){return this.api('GET',`/facto/dataset/${pIDDataset}/stats`).then(pResponse=>{return pResponse;});}loadDatasetSources(pIDDataset){return this.api('GET',`/facto/dataset/${pIDDataset}/sources`).then(pResponse=>{return pResponse;});}linkDatasetSource(pIDDataset,pIDSource,pReliabilityWeight){return this.api('POST',`/facto/dataset/${pIDDataset}/source`,{IDSource:pIDSource,ReliabilityWeight:pReliabilityWeight||1.0}).then(pResponse=>{return pResponse;});}loadDatasetRecords(pIDDataset,pBegin,pCap){return this.api('GET',`/facto/dataset/${pIDDataset}/records/${pBegin||0}/${pCap||50}`).then(pResponse=>{return pResponse;});}// ================================================================
// Record Operations
// ================================================================
loadRecords(pPage){let tmpPageSize=this.pict.AppData.Facto.RecordPageSize;let tmpBegin=(pPage||0)*tmpPageSize;return this.api('GET',`/1.0/Records/${tmpBegin}/${tmpPageSize}`).then(pResponse=>{this.pict.AppData.Facto.Records=pResponse||[];});}ingestRecords(pRecords,pIDDataset,pIDSource){return this.api('POST','/facto/record/ingest',{Records:pRecords,IDDataset:pIDDataset,IDSource:pIDSource}).then(pResponse=>{return pResponse;});}loadRecordCertainty(pIDRecord){return this.api('GET',`/facto/record/${pIDRecord}/certainty`).then(pResponse=>{return pResponse;});}addRecordCertainty(pIDRecord,pCertaintyValue,pDimension,pJustification){return this.api('POST',`/facto/record/${pIDRecord}/certainty`,{CertaintyValue:pCertaintyValue,Dimension:pDimension||'overall',Justification:pJustification||''}).then(pResponse=>{return pResponse;});}loadRecordVersions(pIDRecord){return this.api('GET',`/facto/record/${pIDRecord}/versions`).then(pResponse=>{return pResponse;});}// ================================================================
// Ingest Job Operations
// ================================================================
loadIngestJobs(){return this.api('GET','/facto/ingest/jobs').then(pResponse=>{this.pict.AppData.Facto.IngestJobs=pResponse&&pResponse.Jobs?pResponse.Jobs:[];});}createIngestJob(pIDSource,pIDDataset,pConfiguration){return this.api('POST','/facto/ingest/job',{IDSource:pIDSource,IDDataset:pIDDataset,Configuration:pConfiguration||{}}).then(pResponse=>{return pResponse;});}startIngestJob(pIDIngestJob){return this.api('PUT',`/facto/ingest/job/${pIDIngestJob}/start`).then(pResponse=>{return pResponse;});}completeIngestJob(pIDIngestJob,pCounters,pStatus){let tmpBody=Object.assign({},pCounters||{});if(pStatus){tmpBody.Status=pStatus;}return this.api('PUT',`/facto/ingest/job/${pIDIngestJob}/complete`,tmpBody).then(pResponse=>{return pResponse;});}loadIngestJobDetails(pIDIngestJob){return this.api('GET',`/facto/ingest/job/${pIDIngestJob}`).then(pResponse=>{return pResponse;});}// ================================================================
// Projection Operations
// ================================================================
loadProjections(){return this.api('GET','/facto/projections').then(pResponse=>{return pResponse;});}loadDatasetsByType(pType){return this.api('GET',`/facto/datasets/by-type/${pType}`).then(pResponse=>{return pResponse;});}queryRecords(pParams){return this.api('POST','/facto/projections/query',pParams).then(pResponse=>{return pResponse;});}aggregateRecords(pParams){return this.api('POST','/facto/projections/aggregate',pParams).then(pResponse=>{return pResponse;});}queryCertainty(pParams){return this.api('POST','/facto/projections/certainty',pParams).then(pResponse=>{return pResponse;});}compareDatasets(pDatasetIDs){return this.api('POST','/facto/projections/compare',{DatasetIDs:pDatasetIDs}).then(pResponse=>{return pResponse;});}loadProjectionSummary(){return this.api('GET','/facto/projections/summary').then(pResponse=>{return pResponse;});}uploadSourceFile(pIDSource,pFilename,pContentType,pBase64Data){return this.api('POST',`/facto/source/${pIDSource}/documentation/upload`,{Filename:pFilename,ContentType:pContentType,Data:pBase64Data});}ingestFileContent(pIDDataset,pIDSource,pContent,pFormat,pType){return this.api('POST','/facto/ingest/file',{IDDataset:pIDDataset||0,IDSource:pIDSource||0,Content:pContent,Format:pFormat||'Auto',Type:pType||'data'}).then(pResponse=>{return pResponse;});}}module.exports=FactoProvider;module.exports.default_configuration={ProviderIdentifier:'Facto',AutoInitialize:true};},{"pict-provider":7}],54:[function(require,module,exports){const libPictView=require('pict-view');class FactoCatalogView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(){// Load catalog entries from API on first render
this.pict.providers.Facto.loadCatalogEntries().then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Error loading catalog: '+pError.message,'error');});}refreshList(){let tmpContainer=document.getElementById('facto-catalog-list');if(!tmpContainer)return;let tmpEntries=this.pict.AppData.Facto.CatalogEntries;if(!tmpEntries||tmpEntries.length===0){tmpContainer.innerHTML='<p style="color:#888; font-style:italic;">No catalog entries yet. Add sources to your research catalog.</p>';return;}let tmpHtml='<table><thead><tr><th>ID</th><th>Agency</th><th>Name</th><th>Type</th><th>Category</th><th>Region</th><th>Verified</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpEntries.length;i++){let tmpEntry=tmpEntries[i];let tmpVerified=tmpEntry.Verified?'<span style="color:#28a745;">&#10003;</span>':'<span style="color:#ccc;">&#10007;</span>';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpEntry.IDSourceCatalogEntry||'')+'</td>';tmpHtml+='<td>'+(tmpEntry.Agency||'')+'</td>';tmpHtml+='<td>'+(tmpEntry.Name||'')+'</td>';tmpHtml+='<td>'+(tmpEntry.Type||'')+'</td>';tmpHtml+='<td>'+(tmpEntry.Category||'')+'</td>';tmpHtml+='<td>'+(tmpEntry.Region||'')+'</td>';tmpHtml+='<td style="text-align:center;">'+tmpVerified+'</td>';tmpHtml+='<td>';tmpHtml+='<button class="primary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].viewEntry('+tmpEntry.IDSourceCatalogEntry+')">Datasets</button> ';tmpHtml+='<button class="danger" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].deleteEntry('+tmpEntry.IDSourceCatalogEntry+')">Delete</button>';tmpHtml+='</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}searchCatalog(){let tmpQuery=(document.getElementById('facto-catalog-search')||{}).value||'';if(!tmpQuery){// Reload all entries
this.pict.providers.Facto.loadCatalogEntries().then(()=>{this.refreshList();});return;}this.pict.providers.Facto.searchCatalog(tmpQuery).then(pResponse=>{this.pict.AppData.Facto.CatalogEntries=pResponse&&pResponse.Entries?pResponse.Entries:[];this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Search error: '+pError.message,'error');});}addEntry(){let tmpAgency=(document.getElementById('facto-catalog-agency')||{}).value||'';let tmpName=(document.getElementById('facto-catalog-name')||{}).value||'';let tmpType=(document.getElementById('facto-catalog-type')||{}).value||'';let tmpURL=(document.getElementById('facto-catalog-url')||{}).value||'';let tmpProtocol=(document.getElementById('facto-catalog-protocol')||{}).value||'';let tmpCategory=(document.getElementById('facto-catalog-category')||{}).value||'';let tmpRegion=(document.getElementById('facto-catalog-region')||{}).value||'';let tmpUpdateFrequency=(document.getElementById('facto-catalog-frequency')||{}).value||'';let tmpDescription=(document.getElementById('facto-catalog-description')||{}).value||'';if(!tmpAgency&&!tmpName){this.pict.providers.Facto.setStatus('facto-catalog-status','Agency or Name is required','warn');return;}this.pict.providers.Facto.createCatalogEntry({Agency:tmpAgency,Name:tmpName,Type:tmpType,URL:tmpURL,Protocol:tmpProtocol,Category:tmpCategory,Region:tmpRegion,UpdateFrequency:tmpUpdateFrequency,Description:tmpDescription}).then(pResponse=>{if(pResponse&&pResponse.Success){this.pict.providers.Facto.setStatus('facto-catalog-status','Catalog entry created: '+(tmpAgency||tmpName),'ok');// Clear form
let tmpFields=['agency','name','url','description'];for(let i=0;i<tmpFields.length;i++){let tmpEl=document.getElementById('facto-catalog-'+tmpFields[i]);if(tmpEl)tmpEl.value='';}// Reload list
return this.pict.providers.Facto.loadCatalogEntries();}else{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+(pResponse&&pResponse.Error||'Unknown error'),'error');}}).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+pError.message,'error');});}deleteEntry(pIDEntry){if(!confirm('Remove this catalog entry?'))return;this.pict.providers.Facto.deleteCatalogEntry(pIDEntry).then(()=>{return this.pict.providers.Facto.loadCatalogEntries();}).then(()=>{this.refreshList();this.pict.providers.Facto.setStatus('facto-catalog-status','Entry removed','ok');}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+pError.message,'error');});}viewEntry(pIDEntry){let tmpDetailContainer=document.getElementById('facto-catalog-detail');if(!tmpDetailContainer)return;this.pict.providers.Facto.loadCatalogEntryDatasets(pIDEntry).then(pResponse=>{let tmpDatasets=pResponse&&pResponse.Datasets?pResponse.Datasets:[];let tmpHtml='<h3 style="margin-bottom:8px; font-size:1em; color:#444;">Dataset Definitions for Entry #'+pIDEntry+'</h3>';if(tmpDatasets.length===0){tmpHtml+='<p style="color:#888; font-style:italic; margin-bottom:8px;">No dataset definitions yet.</p>';}else{tmpHtml+='<table><thead><tr><th>ID</th><th>Name</th><th>Format</th><th>Endpoint URL</th><th>Version Policy</th><th>Status</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpDatasets.length;i++){let tmpDS=tmpDatasets[i];let tmpStatusLabel=tmpDS.Provisioned?'<span style="color:#28a745;">Provisioned (Source #'+tmpDS.IDSource+', Dataset #'+tmpDS.IDDataset+')</span>':'<span style="color:#888;">Not provisioned</span>';let tmpActionBtn='';if(tmpDS.Provisioned){tmpActionBtn='<button class="primary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].fetchDataset('+tmpDS.IDCatalogDatasetDefinition+', '+pIDEntry+')">Fetch</button>';}else{tmpActionBtn='<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].provisionDataset('+tmpDS.IDCatalogDatasetDefinition+', '+pIDEntry+')">Provision</button>';}tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpDS.IDCatalogDatasetDefinition||'')+'</td>';tmpHtml+='<td>'+(tmpDS.Name||'')+'</td>';tmpHtml+='<td>'+(tmpDS.Format||'')+'</td>';tmpHtml+='<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+(tmpDS.EndpointURL||'')+'</td>';tmpHtml+='<td>'+(tmpDS.VersionPolicy||'Append')+'</td>';tmpHtml+='<td>'+tmpStatusLabel+'</td>';tmpHtml+='<td>'+tmpActionBtn+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';}// Add dataset definition form
tmpHtml+='<h4 style="margin-top:12px; margin-bottom:8px; font-size:0.95em; color:#555;">Add Dataset Definition</h4>';tmpHtml+='<div class="inline-group">';tmpHtml+='<div><label for="facto-catds-name">Name</label><input type="text" id="facto-catds-name" placeholder="e.g. Monthly Earthquake Feed"></div>';tmpHtml+='<div><label for="facto-catds-format">Format</label>';tmpHtml+='<select id="facto-catds-format"><option value="csv">CSV</option><option value="json">JSON</option><option value="xml">XML</option><option value="geojson">GeoJSON</option><option value="other">Other</option></select></div>';tmpHtml+='</div>';tmpHtml+='<div class="inline-group">';tmpHtml+='<div><label for="facto-catds-endpoint">Endpoint URL</label><input type="text" id="facto-catds-endpoint" placeholder="https://api.example.gov/data.csv"></div>';tmpHtml+='<div><label for="facto-catds-versionpolicy">Version Policy</label>';tmpHtml+='<select id="facto-catds-versionpolicy"><option value="Append">Append</option><option value="Replace">Replace</option></select></div>';tmpHtml+='</div>';tmpHtml+='<div><label for="facto-catds-description">Description</label><input type="text" id="facto-catds-description" placeholder="Description of the dataset"></div>';tmpHtml+='<button class="primary" onclick="pict.views[\'Facto-Catalog\'].addDatasetDefinition('+pIDEntry+')">Add Dataset Definition</button>';tmpHtml+='<button class="secondary" onclick="document.getElementById(\'facto-catalog-detail\').innerHTML=\'\';">Close</button>';tmpDetailContainer.innerHTML=tmpHtml;}).catch(pError=>{tmpDetailContainer.innerHTML='<p style="color:#dc3545;">Error loading datasets: '+pError.message+'</p>';});}addDatasetDefinition(pIDEntry){let tmpName=(document.getElementById('facto-catds-name')||{}).value||'';let tmpFormat=(document.getElementById('facto-catds-format')||{}).value||'';let tmpEndpointURL=(document.getElementById('facto-catds-endpoint')||{}).value||'';let tmpVersionPolicy=(document.getElementById('facto-catds-versionpolicy')||{}).value||'Append';let tmpDescription=(document.getElementById('facto-catds-description')||{}).value||'';if(!tmpName){this.pict.providers.Facto.setStatus('facto-catalog-status','Dataset name is required','warn');return;}this.pict.providers.Facto.addCatalogDataset(pIDEntry,{Name:tmpName,Format:tmpFormat,EndpointURL:tmpEndpointURL,VersionPolicy:tmpVersionPolicy,Description:tmpDescription}).then(pResponse=>{if(pResponse&&pResponse.Success){this.pict.providers.Facto.setStatus('facto-catalog-status','Dataset definition added: '+tmpName,'ok');this.viewEntry(pIDEntry);}else{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+(pResponse&&pResponse.Error||'Unknown error'),'error');}}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+pError.message,'error');});}provisionDataset(pIDCatalogDataset,pIDEntry){this.pict.providers.Facto.setStatus('facto-catalog-status','Provisioning...','info');this.pict.providers.Facto.provisionCatalogDataset(pIDCatalogDataset).then(pResponse=>{if(pResponse&&pResponse.Success){let tmpMsg='Provisioned! Source #'+pResponse.Source.IDSource+', Dataset #'+pResponse.Dataset.IDDataset;this.pict.providers.Facto.setStatus('facto-catalog-status',tmpMsg,'ok');this.viewEntry(pIDEntry);// Refresh sources and datasets views if they exist
if(this.pict.views['Facto-Sources']){this.pict.providers.Facto.loadSources().then(()=>{this.pict.views['Facto-Sources'].refreshList();});}if(this.pict.views['Facto-Datasets']){this.pict.providers.Facto.loadDatasets().then(()=>{this.pict.views['Facto-Datasets'].refreshList();});}}else{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+(pResponse&&pResponse.Error||'Unknown error'),'error');}}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+pError.message,'error');});}fetchDataset(pIDCatalogDataset,pIDEntry){this.pict.providers.Facto.setStatus('facto-catalog-status','Fetching data from endpoint...','info');this.pict.providers.Facto.fetchCatalogDataset(pIDCatalogDataset).then(pResponse=>{if(pResponse&&pResponse.Success){let tmpMsg='Fetched! '+pResponse.Ingested+' records ingested (v'+pResponse.DatasetVersion+', '+pResponse.Format+')';if(pResponse.IsDuplicate){tmpMsg+=' [duplicate content detected]';}this.pict.providers.Facto.setStatus('facto-catalog-status',tmpMsg,'ok');this.viewEntry(pIDEntry);// Refresh records view if it exists
if(this.pict.views['Facto-Records']){this.pict.providers.Facto.loadRecords().then(()=>{this.pict.views['Facto-Records'].refreshList();});}}else{this.pict.providers.Facto.setStatus('facto-catalog-status','Fetch error: '+(pResponse&&pResponse.Error||'Unknown error'),'error');}}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Fetch error: '+pError.message,'error');});}importCatalog(){let tmpTextArea=document.getElementById('facto-catalog-import-json');if(!tmpTextArea||!tmpTextArea.value){this.pict.providers.Facto.setStatus('facto-catalog-status','Paste JSON to import','warn');return;}let tmpEntries;try{tmpEntries=JSON.parse(tmpTextArea.value);}catch(pParseError){this.pict.providers.Facto.setStatus('facto-catalog-status','Invalid JSON: '+pParseError.message,'error');return;}this.pict.providers.Facto.importCatalog(tmpEntries).then(pResponse=>{if(pResponse&&pResponse.Success){this.pict.providers.Facto.setStatus('facto-catalog-status','Imported '+pResponse.EntriesCreated+' entries with '+pResponse.DatasetsCreated+' datasets','ok');tmpTextArea.value='';return this.pict.providers.Facto.loadCatalogEntries();}else{let tmpError=pResponse&&pResponse.Error||'Unknown';if(tmpError==='Unknown'){try{tmpError='Unexpected response: '+JSON.stringify(pResponse).substring(0,300);}catch(e){/* ignore */}}this.pict.providers.Facto.setStatus('facto-catalog-status','Import error: '+tmpError,'error');}}).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+pError.message,'error');});}exportCatalog(){this.pict.providers.Facto.exportCatalog().then(pResponse=>{let tmpTextArea=document.getElementById('facto-catalog-import-json');if(tmpTextArea){tmpTextArea.value=JSON.stringify(pResponse&&pResponse.Entries?pResponse.Entries:pResponse,null,2);}this.pict.providers.Facto.setStatus('facto-catalog-status','Catalog exported to JSON text area','ok');}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-catalog-status','Error: '+pError.message,'error');});}}module.exports=FactoCatalogView;module.exports.default_configuration={ViewIdentifier:'Facto-Catalog',DefaultRenderable:'Facto-Catalog',DefaultDestinationAddress:'#Facto-Section-Catalog',Templates:[{Hash:'Facto-Catalog',Template:/*html*/`
<div class="accordion-row">
	<div class="accordion-number">0</div>
	<div class="accordion-card" id="facto-card-catalog">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-catalog')">
			<span class="accordion-title">Source Catalog</span>
			<span class="accordion-preview">Research and catalog data sources</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Research and catalog potential data sources before provisioning them as runtime Sources and Datasets.</p>

			<!-- Search -->
			<div class="inline-group" style="margin-bottom:12px;">
				<div style="flex:3;">
					<input type="text" id="facto-catalog-search" placeholder="Search catalog by name, agency, category, or description..." style="margin-bottom:0;">
				</div>
				<div style="flex:0 0 auto; display:flex; align-items:flex-end;">
					<button class="primary" style="margin-bottom:0;" onclick="pict.views['Facto-Catalog'].searchCatalog()">Search</button>
				</div>
			</div>

			<!-- Entries list -->
			<div id="facto-catalog-list"></div>

			<!-- Dataset definitions detail (appears when clicking "Datasets" on an entry) -->
			<div id="facto-catalog-detail" style="margin-top:12px;"></div>

			<!-- Add entry form -->
			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Add Catalog Entry</h3>
			<div class="inline-group">
				<div>
					<label for="facto-catalog-agency">Agency / Organization</label>
					<input type="text" id="facto-catalog-agency" placeholder="e.g. US Geological Survey (USGS)">
				</div>
				<div>
					<label for="facto-catalog-name">Portal Name</label>
					<input type="text" id="facto-catalog-name" placeholder="e.g. USGS Water Services">
				</div>
			</div>
			<div class="inline-group">
				<div>
					<label for="facto-catalog-type">Type</label>
					<select id="facto-catalog-type">
						<option value="API">API</option>
						<option value="File">File</option>
						<option value="FTP">FTP</option>
						<option value="Web">Web</option>
						<option value="Database">Database</option>
						<option value="Other">Other</option>
					</select>
				</div>
				<div>
					<label for="facto-catalog-protocol">Protocol</label>
					<select id="facto-catalog-protocol">
						<option value="HTTPS">HTTPS</option>
						<option value="HTTP">HTTP</option>
						<option value="FTP">FTP</option>
						<option value="SFTP">SFTP</option>
						<option value="Local">Local</option>
					</select>
				</div>
				<div>
					<label for="facto-catalog-category">Category</label>
					<input type="text" id="facto-catalog-category" placeholder="e.g. Science, Finance">
				</div>
			</div>
			<div class="inline-group">
				<div>
					<label for="facto-catalog-url">Base URL</label>
					<input type="text" id="facto-catalog-url" placeholder="https://api.example.gov">
				</div>
				<div>
					<label for="facto-catalog-region">Region</label>
					<input type="text" id="facto-catalog-region" placeholder="e.g. US, Global">
				</div>
				<div>
					<label for="facto-catalog-frequency">Update Frequency</label>
					<select id="facto-catalog-frequency">
						<option value="Continuous">Continuous</option>
						<option value="Daily">Daily</option>
						<option value="Weekly">Weekly</option>
						<option value="Monthly">Monthly</option>
						<option value="Quarterly">Quarterly</option>
						<option value="Yearly">Yearly</option>
						<option value="Unknown">Unknown</option>
					</select>
				</div>
			</div>
			<div>
				<label for="facto-catalog-description">Description</label>
				<input type="text" id="facto-catalog-description" placeholder="Brief description of this data source">
			</div>
			<button class="primary" onclick="pict.views['Facto-Catalog'].addEntry()">Add Catalog Entry</button>

			<!-- Import / Export -->
			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Import / Export</h3>
			<textarea id="facto-catalog-import-json" rows="4" style="width:100%; font-family:monospace; font-size:0.85em; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:8px;" placeholder="Paste JSON array of catalog entries here..."></textarea>
			<button class="primary" onclick="pict.views['Facto-Catalog'].importCatalog()">Import JSON</button>
			<button class="secondary" onclick="pict.views['Facto-Catalog'].exportCatalog()">Export Catalog</button>

			<div id="facto-catalog-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:'Facto-Catalog',TemplateHash:'Facto-Catalog',DestinationAddress:'#Facto-Section-Catalog'}]};},{"pict-view":33}],55:[function(require,module,exports){const libPictView=require('pict-view');class FactoDatasetsView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(){this.pict.providers.Facto.loadDatasets().then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-datasets-status','Error loading datasets: '+pError.message,'error');});}refreshList(){let tmpContainer=document.getElementById('facto-datasets-list');if(!tmpContainer)return;let tmpDatasets=this.pict.AppData.Facto.Datasets;if(!tmpDatasets||tmpDatasets.length===0){tmpContainer.innerHTML='<p style="color:#888; font-style:italic;">No datasets created yet.</p>';return;}let tmpBadgeClass={Raw:'badge-raw',Compositional:'badge-compositional',Projection:'badge-projection',Derived:'badge-derived'};let tmpHtml='<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Description</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpDatasets.length;i++){let tmpDataset=tmpDatasets[i];let tmpBadge=tmpBadgeClass[tmpDataset.Type]||'badge-raw';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpDataset.IDDataset||'')+'</td>';tmpHtml+='<td>'+(tmpDataset.Name||'')+'</td>';tmpHtml+='<td><span class="badge '+tmpBadge+'">'+(tmpDataset.Type||'')+'</span></td>';tmpHtml+='<td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+(tmpDataset.Description||'')+'</td>';tmpHtml+='<td><button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Datasets\'].viewStats('+tmpDataset.IDDataset+')">Stats</button></td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}viewStats(pIDDataset){this.pict.providers.Facto.loadDatasetStats(pIDDataset).then(pResponse=>{let tmpMsg='Dataset: '+(pResponse.Dataset?pResponse.Dataset.Name:'#'+pIDDataset);tmpMsg+=' | Records: '+(pResponse.RecordCount||0);tmpMsg+=' | Linked Sources: '+(pResponse.SourceCount||0);this.pict.providers.Facto.setStatus('facto-datasets-status',tmpMsg,'info');}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-datasets-status','Error: '+pError.message,'error');});}addDataset(){let tmpName=(document.getElementById('facto-dataset-name')||{}).value||'';let tmpType=(document.getElementById('facto-dataset-type')||{}).value||'Raw';let tmpDescription=(document.getElementById('facto-dataset-desc')||{}).value||'';if(!tmpName){this.pict.providers.Facto.setStatus('facto-datasets-status','Name is required','warn');return;}this.pict.providers.Facto.createDataset({Name:tmpName,Type:tmpType,Description:tmpDescription}).then(pResponse=>{if(pResponse&&pResponse.IDDataset){this.pict.providers.Facto.setStatus('facto-datasets-status','Dataset created: '+pResponse.Name,'ok');if(document.getElementById('facto-dataset-name'))document.getElementById('facto-dataset-name').value='';if(document.getElementById('facto-dataset-desc'))document.getElementById('facto-dataset-desc').value='';return this.pict.providers.Facto.loadDatasets();}else{this.pict.providers.Facto.setStatus('facto-datasets-status','Error creating dataset','error');}}).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-datasets-status','Error: '+pError.message,'error');});}}module.exports=FactoDatasetsView;module.exports.default_configuration={ViewIdentifier:'Facto-Datasets',DefaultRenderable:'Facto-Datasets',DefaultDestinationAddress:'#Facto-Section-Datasets',Templates:[{Hash:'Facto-Datasets',Template:/*html*/`
<div class="accordion-row">
	<div class="accordion-number">2</div>
	<div class="accordion-card open" id="facto-card-datasets">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-datasets')">
			<span class="accordion-title">Datasets</span>
			<span class="accordion-preview">Raw, Compositional, Projection, Derived</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Datasets are named collections of records. Types: Raw (ingested), Compositional (merged), Projection (flattened), Derived (computed).</p>
			<div id="facto-datasets-list"></div>

			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Create Dataset</h3>
			<div class="inline-group">
				<div>
					<label for="facto-dataset-name">Name</label>
					<input type="text" id="facto-dataset-name" placeholder="e.g. Census Population 2020">
				</div>
				<div>
					<label for="facto-dataset-type">Type</label>
					<select id="facto-dataset-type">
						<option value="Raw">Raw</option>
						<option value="Compositional">Compositional</option>
						<option value="Projection">Projection</option>
						<option value="Derived">Derived</option>
					</select>
				</div>
			</div>
			<div>
				<label for="facto-dataset-desc">Description</label>
				<input type="text" id="facto-dataset-desc" placeholder="Brief description of the dataset">
			</div>
			<button class="primary" onclick="pict.views['Facto-Datasets'].addDataset()">Create Dataset</button>

			<div id="facto-datasets-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:'Facto-Datasets',TemplateHash:'Facto-Datasets',DestinationAddress:'#Facto-Section-Datasets'}]};},{"pict-view":33}],56:[function(require,module,exports){const libPictView=require('pict-view');class FactoIngestView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(){this.pict.providers.Facto.loadIngestJobs().then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-ingest-status','Error loading jobs: '+pError.message,'error');});}refreshList(){let tmpContainer=document.getElementById('facto-ingest-list');if(!tmpContainer)return;let tmpJobs=this.pict.AppData.Facto.IngestJobs;if(!tmpJobs||tmpJobs.length===0){tmpContainer.innerHTML='<p style="color:#888; font-style:italic;">No ingest jobs yet.</p>';return;}let tmpStatusColors={Pending:'#ffc107',Running:'#17a2b8',Completed:'#28a745',Failed:'#dc3545',Cancelled:'#6c757d'};let tmpHtml='<table><thead><tr><th>ID</th><th>Status</th><th>Source</th><th>Dataset</th><th>Processed</th><th>Created</th><th>Errors</th><th>Start</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpJobs.length;i++){let tmpJob=tmpJobs[i];let tmpColor=tmpStatusColors[tmpJob.Status]||'#888';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpJob.IDIngestJob||'')+'</td>';tmpHtml+='<td><span style="color:'+tmpColor+'; font-weight:600;">'+(tmpJob.Status||'')+'</span></td>';tmpHtml+='<td>'+(tmpJob.IDSource||'')+'</td>';tmpHtml+='<td>'+(tmpJob.IDDataset||'')+'</td>';tmpHtml+='<td>'+(tmpJob.RecordsProcessed||0)+'</td>';tmpHtml+='<td>'+(tmpJob.RecordsCreated||0)+'</td>';tmpHtml+='<td>'+(tmpJob.RecordsErrored||0)+'</td>';tmpHtml+='<td>'+(tmpJob.StartDate||'-')+'</td>';tmpHtml+='<td>';if(tmpJob.Status==='Pending'){tmpHtml+='<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Ingest\'].startJob('+tmpJob.IDIngestJob+')">Start</button>';}tmpHtml+='<button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Ingest\'].viewLog('+tmpJob.IDIngestJob+')">Log</button>';tmpHtml+='</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}startJob(pIDIngestJob){this.pict.providers.Facto.startIngestJob(pIDIngestJob).then(()=>{this.pict.providers.Facto.setStatus('facto-ingest-status','Job #'+pIDIngestJob+' started','ok');return this.pict.providers.Facto.loadIngestJobs();}).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-ingest-status','Error: '+pError.message,'error');});}viewLog(pIDIngestJob){this.pict.providers.Facto.loadIngestJobDetails(pIDIngestJob).then(pResponse=>{if(pResponse&&pResponse.Job){let tmpLog=pResponse.Job.Log||'(empty)';let tmpLogContainer=document.getElementById('facto-ingest-log');if(tmpLogContainer){tmpLogContainer.textContent='Job #'+pIDIngestJob+' Log:\n'+tmpLog;tmpLogContainer.style.display='block';}}}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-ingest-status','Error: '+pError.message,'error');});}ingestPastedContent(){let tmpIDDataset=parseInt((document.getElementById('facto-ingest-paste-dataset')||{}).value,10)||0;let tmpIDSource=parseInt((document.getElementById('facto-ingest-paste-source')||{}).value,10)||0;let tmpFormat=(document.getElementById('facto-ingest-paste-format')||{}).value||'Auto';let tmpType=(document.getElementById('facto-ingest-paste-type')||{}).value||'data';let tmpContent=(document.getElementById('facto-ingest-paste-content')||{}).value||'';if(!tmpContent.trim()){this.pict.providers.Facto.setStatus('facto-ingest-status','Content is required','warn');return;}this.pict.providers.Facto.setStatus('facto-ingest-status','Ingesting...','info');this.pict.providers.Facto.ingestFileContent(tmpIDDataset,tmpIDSource,tmpContent,tmpFormat,tmpType).then(pResponse=>{if(pResponse&&pResponse.Success){this.pict.providers.Facto.setStatus('facto-ingest-status','Ingested '+(pResponse.RecordsCreated||0)+' records','ok');if(document.getElementById('facto-ingest-paste-content')){document.getElementById('facto-ingest-paste-content').value='';}}else{this.pict.providers.Facto.setStatus('facto-ingest-status','Ingest error: '+(pResponse&&pResponse.Error||'Unknown'),'error');}}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-ingest-status','Error: '+pError.message,'error');});}createJob(){let tmpIDSource=parseInt((document.getElementById('facto-ingest-source')||{}).value,10)||0;let tmpIDDataset=parseInt((document.getElementById('facto-ingest-dataset')||{}).value,10)||0;if(!tmpIDSource||!tmpIDDataset){this.pict.providers.Facto.setStatus('facto-ingest-status','Source ID and Dataset ID are required','warn');return;}this.pict.providers.Facto.createIngestJob(tmpIDSource,tmpIDDataset).then(pResponse=>{if(pResponse&&pResponse.Success){this.pict.providers.Facto.setStatus('facto-ingest-status','Ingest job created: #'+pResponse.Job.IDIngestJob,'ok');if(document.getElementById('facto-ingest-source'))document.getElementById('facto-ingest-source').value='';if(document.getElementById('facto-ingest-dataset'))document.getElementById('facto-ingest-dataset').value='';return this.pict.providers.Facto.loadIngestJobs();}else{this.pict.providers.Facto.setStatus('facto-ingest-status','Error creating job','error');}}).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-ingest-status','Error: '+pError.message,'error');});}}module.exports=FactoIngestView;module.exports.default_configuration={ViewIdentifier:'Facto-Ingest',DefaultRenderable:'Facto-Ingest',DefaultDestinationAddress:'#Facto-Section-Ingest',Templates:[{Hash:'Facto-Ingest',Template:/*html*/`
<div class="accordion-row">
	<div class="accordion-number">4</div>
	<div class="accordion-card" id="facto-card-ingest">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-ingest')">
			<span class="accordion-title">Ingest Jobs</span>
			<span class="accordion-preview">Download, parse, and store datasets</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Track data ingest operations from configured sources into datasets.</p>
			<div id="facto-ingest-list"></div>

			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Create Ingest Job</h3>
			<div class="inline-group">
				<div>
					<label for="facto-ingest-source">Source ID</label>
					<input type="number" id="facto-ingest-source" placeholder="1">
				</div>
				<div>
					<label for="facto-ingest-dataset">Dataset ID</label>
					<input type="number" id="facto-ingest-dataset" placeholder="1">
				</div>
			</div>
			<button class="primary" onclick="pict.views['Facto-Ingest'].createJob()">Create Job</button>

			<pre id="facto-ingest-log" style="display:none; margin-top:12px; padding:12px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:4px; font-size:0.85em; max-height:200px; overflow:auto; white-space:pre-wrap;"></pre>

			<h3 style="margin-top:20px; margin-bottom:8px; font-size:1em; color:#444;">Paste &amp; Ingest</h3>
			<p style="margin-bottom:8px; color:#666; font-size:0.85em;">Paste CSV or JSON content directly to ingest records.</p>
			<div class="inline-group">
				<div>
					<label for="facto-ingest-paste-dataset">Dataset ID</label>
					<input type="number" id="facto-ingest-paste-dataset" placeholder="1">
				</div>
				<div>
					<label for="facto-ingest-paste-source">Source ID</label>
					<input type="number" id="facto-ingest-paste-source" placeholder="1">
				</div>
				<div>
					<label for="facto-ingest-paste-format">Format</label>
					<select id="facto-ingest-paste-format">
						<option value="Auto">Auto-Detect</option>
						<option value="CSV">CSV</option>
						<option value="JSON">JSON</option>
					</select>
				</div>
				<div>
					<label for="facto-ingest-paste-type">Record Type</label>
					<input type="text" id="facto-ingest-paste-type" placeholder="data">
				</div>
			</div>
			<textarea id="facto-ingest-paste-content" rows="6" style="width:100%; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-size:0.9em; font-family:monospace; margin-bottom:10px;" placeholder="Paste CSV or JSON data here..."></textarea>
			<button class="primary" onclick="pict.views['Facto-Ingest'].ingestPastedContent()">Ingest</button>

			<div id="facto-ingest-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:'Facto-Ingest',TemplateHash:'Facto-Ingest',DestinationAddress:'#Facto-Section-Ingest'}]};},{"pict-view":33}],57:[function(require,module,exports){const libPictView=require('pict-view');class FactoLayoutView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(){// Render all section views into their containers
this.pict.views['Facto-Catalog'].render();this.pict.views['Facto-Sources'].render();this.pict.views['Facto-Datasets'].render();this.pict.views['Facto-Records'].render();this.pict.views['Facto-Ingest'].render();this.pict.views['Facto-Projections'].render();this.pict.CSSMap.injectCSS();}toggleSection(pSectionId){let tmpCard=document.getElementById(pSectionId);if(!tmpCard)return;tmpCard.classList.toggle('open');}expandAllSections(){let tmpCards=document.querySelectorAll('.accordion-card');for(let i=0;i<tmpCards.length;i++){tmpCards[i].classList.add('open');}}collapseAllSections(){let tmpCards=document.querySelectorAll('.accordion-card');for(let i=0;i<tmpCards.length;i++){tmpCards[i].classList.remove('open');}}}module.exports=FactoLayoutView;module.exports.default_configuration={ViewIdentifier:'Facto-Layout',DefaultRenderable:'Facto-Layout',DefaultDestinationAddress:'#Facto-Application-Container',CSS:/*css*/`
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; padding: 20px; }
h1 { margin-bottom: 20px; color: #1a1a1a; }
h2 { margin-bottom: 12px; color: #444; font-size: 1.2em; border-bottom: 2px solid #ddd; padding-bottom: 6px; }

.section { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

/* Accordion layout */
.accordion-row { display: flex; gap: 0; margin-bottom: 16px; align-items: stretch; }
.accordion-number {
	flex: 0 0 48px; display: flex; align-items: flex-start; justify-content: center;
	padding-top: 16px; font-size: 1.6em; font-weight: 700; color: #4a90d9;
	user-select: none;
}
.accordion-card {
	flex: 1; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	overflow: hidden; min-width: 0;
}
.accordion-header {
	display: flex; align-items: center; padding: 14px 20px; cursor: pointer;
	user-select: none; gap: 12px; transition: background 0.15s; line-height: 1.4;
}
.accordion-header:hover { background: #fafafa; }
.accordion-title { font-weight: 600; color: #333; font-size: 1.05em; white-space: nowrap; }
.accordion-preview { flex: 1; font-style: italic; color: #888; font-size: 0.9em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.accordion-toggle {
	flex: 0 0 20px; display: flex; align-items: center; justify-content: center;
	border-radius: 4px; transition: background 0.15s, transform 0.25s; font-size: 0.7em; color: #888;
}
.accordion-header:hover .accordion-toggle { background: #eee; color: #555; }
.accordion-card.open .accordion-toggle { transform: rotate(180deg); }
.accordion-body { padding: 0 20px 20px; display: none; }
.accordion-card.open .accordion-body { display: block; }
.accordion-card.open .accordion-header { border-bottom: 1px solid #eee; }
.accordion-card.open .accordion-preview { display: none; }

.accordion-controls {
	display: flex; gap: 8px; margin-bottom: 12px; justify-content: flex-end;
}
.accordion-controls button {
	padding: 4px 10px; font-size: 0.82em; font-weight: 500; background: none;
	border: 1px solid #ccc; border-radius: 4px; color: #666; cursor: pointer; margin: 0;
}
.accordion-controls button:hover { background: #f0f0f0; border-color: #aaa; color: #333; }

label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 0.9em; }
input[type="text"], input[type="password"], input[type="number"] {
	width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px;
	font-size: 0.95em; margin-bottom: 10px;
}
input[type="text"]:focus, input[type="password"]:focus, input[type="number"]:focus {
	outline: none; border-color: #4a90d9;
}

button {
	padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
	font-size: 0.9em; font-weight: 600; margin-right: 8px; margin-bottom: 8px;
}
button.primary { background: #4a90d9; color: #fff; }
button.primary:hover { background: #357abd; }
button.secondary { background: #6c757d; color: #fff; }
button.secondary:hover { background: #5a6268; }
button.danger { background: #dc3545; color: #fff; }
button.danger:hover { background: #c82333; }
button.success { background: #28a745; color: #fff; }
button.success:hover { background: #218838; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.status { padding: 8px 12px; border-radius: 4px; margin-top: 10px; font-size: 0.9em; }
.status.ok { background: #d4edda; color: #155724; }
.status.error { background: #f8d7da; color: #721c24; }
.status.info { background: #d1ecf1; color: #0c5460; }
.status.warn { background: #fff3cd; color: #856404; }

.inline-group { display: flex; gap: 8px; align-items: flex-end; margin-bottom: 10px; }
.inline-group > div { flex: 1; }

a { color: #4a90d9; }

select { background: #fff; width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95em; margin-bottom: 10px; }

table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
th { text-align: left; font-weight: 600; padding: 8px; border-bottom: 2px solid #ddd; color: #555; }
td { padding: 8px; border-bottom: 1px solid #eee; }
tr:hover { background: #fafafa; }

.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; font-weight: 600; }
.badge-raw { background: #d1ecf1; color: #0c5460; }
.badge-compositional { background: #d4edda; color: #155724; }
.badge-projection { background: #fff3cd; color: #856404; }
.badge-derived { background: #e2d5f1; color: #4a2d73; }

.certainty-bar { display: inline-block; width: 60px; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; vertical-align: middle; }
.certainty-fill { height: 100%; border-radius: 4px; }
.certainty-low { background: #dc3545; }
.certainty-mid { background: #ffc107; }
.certainty-high { background: #28a745; }
`,Templates:[{Hash:'Facto-Layout',Template:/*html*/`
<h1>Retold Facto</h1>
<p style="color:#666; margin-bottom:20px; font-size:0.95em;">Data Warehouse &amp; Knowledge Graph Storage</p>

<!-- Expand / Collapse All -->
<div class="accordion-controls">
	<button onclick="pict.views['Facto-Layout'].expandAllSections()">Expand All</button>
	<button onclick="pict.views['Facto-Layout'].collapseAllSections()">Collapse All</button>
</div>

<!-- Section containers -->
<div id="Facto-Section-Catalog"></div>
<div id="Facto-Section-Sources"></div>
<div id="Facto-Section-Datasets"></div>
<div id="Facto-Section-Records"></div>
<div id="Facto-Section-Ingest"></div>
<div id="Facto-Section-Projections"></div>
`}],Renderables:[{RenderableHash:'Facto-Layout',TemplateHash:'Facto-Layout',DestinationAddress:'#Facto-Application-Container'}]};},{"pict-view":33}],58:[function(require,module,exports){const libPictView=require('pict-view');class FactoProjectionsView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(){this.loadSummary();}loadSummary(){this.pict.providers.Facto.loadProjectionSummary().then(pResponse=>{let tmpContainer=document.getElementById('facto-projections-summary');if(!tmpContainer||!pResponse)return;let tmpHtml='<table><tbody>';tmpHtml+='<tr><td style="font-weight:600;">Sources</td><td>'+(pResponse.Sources||0)+'</td>';tmpHtml+='<td style="font-weight:600;">Datasets</td><td>'+(pResponse.Datasets||0)+'</td></tr>';tmpHtml+='<tr><td style="font-weight:600;">Records</td><td>'+(pResponse.Records||0)+'</td>';tmpHtml+='<td style="font-weight:600;">Certainty Indices</td><td>'+(pResponse.CertaintyIndices||0)+'</td></tr>';tmpHtml+='<tr><td style="font-weight:600;">Ingest Jobs</td><td>'+(pResponse.IngestJobs||0)+'</td>';tmpHtml+='<td></td><td></td></tr>';if(pResponse.DatasetsByType){tmpHtml+='<tr><td colspan="4" style="padding-top:12px; font-weight:600; border-bottom:2px solid #ddd;">Datasets by Type</td></tr>';tmpHtml+='<tr>';tmpHtml+='<td><span class="badge badge-raw">Raw</span></td><td>'+(pResponse.DatasetsByType.Raw||0)+'</td>';tmpHtml+='<td><span class="badge badge-compositional">Compositional</span></td><td>'+(pResponse.DatasetsByType.Compositional||0)+'</td>';tmpHtml+='</tr><tr>';tmpHtml+='<td><span class="badge badge-projection">Projection</span></td><td>'+(pResponse.DatasetsByType.Projection||0)+'</td>';tmpHtml+='<td><span class="badge badge-derived">Derived</span></td><td>'+(pResponse.DatasetsByType.Derived||0)+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-projections-status','Error loading summary: '+pError.message,'error');});}runQuery(){let tmpDatasetIDsRaw=(document.getElementById('facto-proj-dataset-ids')||{}).value||'';let tmpType=(document.getElementById('facto-proj-type')||{}).value||'';let tmpCertaintyThreshold=parseFloat((document.getElementById('facto-proj-certainty')||{}).value)||0;let tmpTimeStart=(document.getElementById('facto-proj-time-start')||{}).value||'';let tmpTimeStop=(document.getElementById('facto-proj-time-stop')||{}).value||'';let tmpDatasetIDs=tmpDatasetIDsRaw.split(',').map(function(s){return parseInt(s.trim(),10);}).filter(function(n){return!isNaN(n)&&n>0;});if(tmpDatasetIDs.length===0){this.pict.providers.Facto.setStatus('facto-projections-status','Enter at least one Dataset ID','warn');return;}let tmpParams={DatasetIDs:tmpDatasetIDs,Begin:0,Cap:100};if(tmpType)tmpParams.Type=tmpType;if(tmpCertaintyThreshold>0)tmpParams.CertaintyThreshold=tmpCertaintyThreshold;if(tmpTimeStart)tmpParams.TimeRangeStart=parseInt(tmpTimeStart,10)||0;if(tmpTimeStop)tmpParams.TimeRangeStop=parseInt(tmpTimeStop,10)||0;this.pict.providers.Facto.setStatus('facto-projections-status','Querying...','info');this.pict.providers.Facto.queryRecords(tmpParams).then(pResponse=>{this.pict.providers.Facto.clearStatus('facto-projections-status');this.refreshResults(pResponse);}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-projections-status','Query error: '+pError.message,'error');});}runCompare(){let tmpDatasetIDsRaw=(document.getElementById('facto-proj-dataset-ids')||{}).value||'';let tmpDatasetIDs=tmpDatasetIDsRaw.split(',').map(function(s){return parseInt(s.trim(),10);}).filter(function(n){return!isNaN(n)&&n>0;});if(tmpDatasetIDs.length===0){this.pict.providers.Facto.setStatus('facto-projections-status','Enter at least one Dataset ID','warn');return;}this.pict.providers.Facto.setStatus('facto-projections-status','Comparing...','info');this.pict.providers.Facto.compareDatasets(tmpDatasetIDs).then(pResponse=>{this.pict.providers.Facto.clearStatus('facto-projections-status');let tmpContainer=document.getElementById('facto-projections-results');if(!tmpContainer||!pResponse||!pResponse.Datasets)return;let tmpHtml='<h4 style="margin:12px 0 8px; font-size:0.95em;">Dataset Comparison</h4>';tmpHtml+='<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Records</th><th>Sources</th></tr></thead><tbody>';for(let i=0;i<pResponse.Datasets.length;i++){let tmpDS=pResponse.Datasets[i];let tmpTypeLower=(tmpDS.Type||'').toLowerCase();tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpDS.IDDataset||'')+'</td>';tmpHtml+='<td>'+(tmpDS.Name||'')+'</td>';tmpHtml+='<td><span class="badge badge-'+tmpTypeLower+'">'+(tmpDS.Type||'')+'</span></td>';tmpHtml+='<td>'+(tmpDS.RecordCount||0)+'</td>';tmpHtml+='<td>'+(tmpDS.SourceCount||0)+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-projections-status','Compare error: '+pError.message,'error');});}refreshResults(pResponse){let tmpContainer=document.getElementById('facto-projections-results');if(!tmpContainer)return;if(!pResponse||!pResponse.Records||pResponse.Records.length===0){tmpContainer.innerHTML='<p style="color:#888; font-style:italic;">No records match the query.</p>';return;}let tmpHtml='<h4 style="margin:12px 0 8px; font-size:0.95em;">Query Results ('+(pResponse.Count||pResponse.Records.length)+' records)</h4>';tmpHtml+='<table><thead><tr><th>ID</th><th>Dataset</th><th>Source</th><th>Type</th><th>Version</th><th>Ingest Date</th><th>Content</th></tr></thead><tbody>';for(let i=0;i<pResponse.Records.length;i++){let tmpRecord=pResponse.Records[i];let tmpContent=tmpRecord.Content||'';if(tmpContent.length>80)tmpContent=tmpContent.substring(0,80)+'...';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpRecord.IDRecord||'')+'</td>';tmpHtml+='<td>'+(tmpRecord.IDDataset||'')+'</td>';tmpHtml+='<td>'+(tmpRecord.IDSource||'')+'</td>';tmpHtml+='<td>'+(tmpRecord.Type||'')+'</td>';tmpHtml+='<td>'+(tmpRecord.Version||1)+'</td>';tmpHtml+='<td>'+(tmpRecord.IngestDate||'-')+'</td>';tmpHtml+='<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+tmpContent+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}}module.exports=FactoProjectionsView;module.exports.default_configuration={ViewIdentifier:'Facto-Projections',DefaultRenderable:'Facto-Projections',DefaultDestinationAddress:'#Facto-Section-Projections',Templates:[{Hash:'Facto-Projections',Template:/*html*/`
<div class="accordion-row">
	<div class="accordion-number">5</div>
	<div class="accordion-card" id="facto-card-projections">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-projections')">
			<span class="accordion-title">Projections</span>
			<span class="accordion-preview">Cross-dataset queries and warehouse statistics</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Query across datasets, compare data, and view warehouse-wide statistics.</p>

			<h3 style="margin-bottom:8px; font-size:1em; color:#444;">Warehouse Summary</h3>
			<div id="facto-projections-summary" style="margin-bottom:16px;"><p style="color:#888; font-style:italic;">Loading...</p></div>

			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Cross-Dataset Query</h3>
			<div class="inline-group">
				<div>
					<label for="facto-proj-dataset-ids">Dataset IDs (comma-separated)</label>
					<input type="text" id="facto-proj-dataset-ids" placeholder="1,2,3">
				</div>
				<div>
					<label for="facto-proj-type">Record Type (optional)</label>
					<input type="text" id="facto-proj-type" placeholder="e.g. enrollment">
				</div>
			</div>
			<div class="inline-group">
				<div>
					<label for="facto-proj-certainty">Min Certainty (0-1)</label>
					<input type="text" id="facto-proj-certainty" placeholder="0.0">
				</div>
				<div>
					<label for="facto-proj-time-start">Time Range Start</label>
					<input type="text" id="facto-proj-time-start" placeholder="timestamp">
				</div>
				<div>
					<label for="facto-proj-time-stop">Time Range Stop</label>
					<input type="text" id="facto-proj-time-stop" placeholder="timestamp">
				</div>
			</div>
			<button class="primary" onclick="pict.views['Facto-Projections'].runQuery()">Query</button>
			<button class="secondary" onclick="pict.views['Facto-Projections'].runCompare()">Compare Datasets</button>
			<button class="secondary" onclick="pict.views['Facto-Projections'].loadSummary()">Refresh Summary</button>

			<div id="facto-projections-results" style="margin-top:16px;"></div>
			<div id="facto-projections-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:'Facto-Projections',TemplateHash:'Facto-Projections',DestinationAddress:'#Facto-Section-Projections'}]};},{"pict-view":33}],59:[function(require,module,exports){const libPictView=require('pict-view');class FactoRecordsView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(){this.pict.providers.Facto.loadRecords(0).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-records-status','Error loading records: '+pError.message,'error');});}refreshList(){let tmpContainer=document.getElementById('facto-records-list');if(!tmpContainer)return;let tmpRecords=this.pict.AppData.Facto.Records;if(!tmpRecords||tmpRecords.length===0){tmpContainer.innerHTML='<p style="color:#888; font-style:italic;">No records ingested yet.</p>';return;}let tmpHtml='<table><thead><tr><th>ID</th><th>Type</th><th>Dataset</th><th>Source</th><th>Version</th><th>Ingest Date</th><th>Content Preview</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpRecords.length;i++){let tmpRecord=tmpRecords[i];let tmpPreview=(tmpRecord.Content||'').substring(0,60);if((tmpRecord.Content||'').length>60)tmpPreview+='...';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpRecord.IDRecord||'')+'</td>';tmpHtml+='<td>'+(tmpRecord.Type||'')+'</td>';tmpHtml+='<td>'+(tmpRecord.IDDataset||'')+'</td>';tmpHtml+='<td>'+(tmpRecord.IDSource||'')+'</td>';tmpHtml+='<td>'+(tmpRecord.Version||'1')+'</td>';tmpHtml+='<td>'+(tmpRecord.IngestDate||'')+'</td>';tmpHtml+='<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:monospace; font-size:0.85em;">'+tmpPreview+'</td>';tmpHtml+='<td><button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Records\'].viewCertainty('+tmpRecord.IDRecord+')">Certainty</button></td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';// Pagination controls
let tmpPage=this.pict.AppData.Facto.RecordPage||0;tmpHtml+='<div style="margin-top:12px; display:flex; gap:8px; align-items:center;">';if(tmpPage>0){tmpHtml+='<button class="secondary" style="padding:4px 12px; font-size:0.85em;" onclick="pict.views[\'Facto-Records\'].changePage('+(tmpPage-1)+')">&#9664; Previous</button>';}tmpHtml+='<span style="color:#888; font-size:0.85em;">Page '+(tmpPage+1)+'</span>';if(tmpRecords.length>=this.pict.AppData.Facto.RecordPageSize){tmpHtml+='<button class="secondary" style="padding:4px 12px; font-size:0.85em;" onclick="pict.views[\'Facto-Records\'].changePage('+(tmpPage+1)+')">Next &#9654;</button>';}tmpHtml+='</div>';tmpContainer.innerHTML=tmpHtml;}changePage(pPage){this.pict.AppData.Facto.RecordPage=pPage;this.pict.providers.Facto.loadRecords(pPage).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-records-status','Error: '+pError.message,'error');});}viewCertainty(pIDRecord){this.pict.providers.Facto.loadRecordCertainty(pIDRecord).then(pResponse=>{if(!pResponse||!pResponse.CertaintyIndices||pResponse.CertaintyIndices.length===0){this.pict.providers.Facto.setStatus('facto-records-status','No certainty indices for record #'+pIDRecord,'info');return;}let tmpParts=[];for(let i=0;i<pResponse.CertaintyIndices.length;i++){let tmpCI=pResponse.CertaintyIndices[i];tmpParts.push(tmpCI.Dimension+': '+tmpCI.CertaintyValue);}this.pict.providers.Facto.setStatus('facto-records-status','Record #'+pIDRecord+' certainty: '+tmpParts.join(', '),'info');}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-records-status','Error: '+pError.message,'error');});}}module.exports=FactoRecordsView;module.exports.default_configuration={ViewIdentifier:'Facto-Records',DefaultRenderable:'Facto-Records',DefaultDestinationAddress:'#Facto-Section-Records',Templates:[{Hash:'Facto-Records',Template:/*html*/`
<div class="accordion-row">
	<div class="accordion-number">3</div>
	<div class="accordion-card" id="facto-card-records">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-records')">
			<span class="accordion-title">Records</span>
			<span class="accordion-preview">Browse ingested records</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Individual data records with versioning, certainty indices, and temporal metadata.</p>
			<div id="facto-records-list"></div>
			<div id="facto-records-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:'Facto-Records',TemplateHash:'Facto-Records',DestinationAddress:'#Facto-Section-Records'}]};},{"pict-view":33}],60:[function(require,module,exports){const libPictView=require('pict-view');class FactoSourcesView extends libPictView{constructor(pFable,pOptions,pServiceHash){super(pFable,pOptions,pServiceHash);}onAfterRender(){// Load sources from API on first render
this.pict.providers.Facto.loadSources().then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-sources-status','Error loading sources: '+pError.message,'error');});}refreshList(){let tmpContainer=document.getElementById('facto-sources-list');if(!tmpContainer)return;let tmpSources=this.pict.AppData.Facto.Sources;if(!tmpSources||tmpSources.length===0){tmpContainer.innerHTML='<p style="color:#888; font-style:italic;">No sources registered yet.</p>';return;}let tmpHtml='<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>URL</th><th>Active</th><th>Actions</th></tr></thead><tbody>';for(let i=0;i<tmpSources.length;i++){let tmpSource=tmpSources[i];let tmpActiveLabel=tmpSource.Active?'<span style="color:#28a745;">Active</span>':'<span style="color:#888;">Inactive</span>';let tmpToggleBtn=tmpSource.Active?'<button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Sources\'].toggleActive('+tmpSource.IDSource+', false)">Deactivate</button>':'<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Sources\'].toggleActive('+tmpSource.IDSource+', true)">Activate</button>';tmpHtml+='<tr>';tmpHtml+='<td>'+(tmpSource.IDSource||'')+'</td>';tmpHtml+='<td>'+(tmpSource.Name||'')+'</td>';tmpHtml+='<td>'+(tmpSource.Type||'')+'</td>';tmpHtml+='<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+(tmpSource.URL||'')+'</td>';tmpHtml+='<td>'+tmpActiveLabel+'</td>';tmpHtml+='<td>'+tmpToggleBtn+'</td>';tmpHtml+='</tr>';}tmpHtml+='</tbody></table>';tmpContainer.innerHTML=tmpHtml;}toggleActive(pIDSource,pActivate){let tmpPromise=pActivate?this.pict.providers.Facto.activateSource(pIDSource):this.pict.providers.Facto.deactivateSource(pIDSource);tmpPromise.then(()=>{return this.pict.providers.Facto.loadSources();}).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-sources-status','Error: '+pError.message,'error');});}addSource(){let tmpName=(document.getElementById('facto-source-name')||{}).value||'';let tmpType=(document.getElementById('facto-source-type')||{}).value||'';let tmpURL=(document.getElementById('facto-source-url')||{}).value||'';let tmpProtocol=(document.getElementById('facto-source-protocol')||{}).value||'';if(!tmpName){this.pict.providers.Facto.setStatus('facto-sources-status','Name is required','warn');return;}this.pict.providers.Facto.createSource({Name:tmpName,Type:tmpType,URL:tmpURL,Protocol:tmpProtocol,Active:1}).then(pResponse=>{if(pResponse&&pResponse.IDSource){this.pict.providers.Facto.setStatus('facto-sources-status','Source created: '+pResponse.Name,'ok');// Clear form
if(document.getElementById('facto-source-name'))document.getElementById('facto-source-name').value='';if(document.getElementById('facto-source-url'))document.getElementById('facto-source-url').value='';// Reload list
return this.pict.providers.Facto.loadSources();}else{this.pict.providers.Facto.setStatus('facto-sources-status','Error creating source','error');}}).then(()=>{this.refreshList();}).catch(pError=>{this.pict.providers.Facto.setStatus('facto-sources-status','Error: '+pError.message,'error');});}}module.exports=FactoSourcesView;module.exports.default_configuration={ViewIdentifier:'Facto-Sources',DefaultRenderable:'Facto-Sources',DefaultDestinationAddress:'#Facto-Section-Sources',Templates:[{Hash:'Facto-Sources',Template:/*html*/`
<div class="accordion-row">
	<div class="accordion-number">1</div>
	<div class="accordion-card open" id="facto-card-sources">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-sources')">
			<span class="accordion-title">Sources</span>
			<span class="accordion-preview">Manage data sources</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Data sources describe where ingested data originates -- websites, APIs, FTP servers, OCR results, ML outputs, etc.</p>
			<div id="facto-sources-list"></div>

			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Add Source</h3>
			<div class="inline-group">
				<div>
					<label for="facto-source-name">Name</label>
					<input type="text" id="facto-source-name" placeholder="e.g. US Census Bureau API">
				</div>
				<div>
					<label for="facto-source-type">Type</label>
					<select id="facto-source-type">
						<option value="API">API</option>
						<option value="File">File</option>
						<option value="FTP">FTP</option>
						<option value="Web">Web</option>
						<option value="OCR">OCR</option>
						<option value="ML">ML</option>
						<option value="Manual">Manual</option>
					</select>
				</div>
			</div>
			<div class="inline-group">
				<div>
					<label for="facto-source-url">URL</label>
					<input type="text" id="facto-source-url" placeholder="https://api.example.gov/data">
				</div>
				<div>
					<label for="facto-source-protocol">Protocol</label>
					<select id="facto-source-protocol">
						<option value="HTTPS">HTTPS</option>
						<option value="HTTP">HTTP</option>
						<option value="FTP">FTP</option>
						<option value="SFTP">SFTP</option>
						<option value="Local">Local</option>
					</select>
				</div>
			</div>
			<button class="primary" onclick="pict.views['Facto-Sources'].addSource()">Add Source</button>

			<div id="facto-sources-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`}],Renderables:[{RenderableHash:'Facto-Sources',TemplateHash:'Facto-Sources',DestinationAddress:'#Facto-Section-Sources'}]};},{"pict-view":33}]},{},[52])(52);});
//# sourceMappingURL=retold-facto.js.map
