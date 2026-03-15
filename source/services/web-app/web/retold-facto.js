"use strict";

(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.retoldFacto = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      module.exports = {
        "name": "fable-serviceproviderbase",
        "version": "3.0.19",
        "description": "Simple base classes for fable services.",
        "main": "source/Fable-ServiceProviderBase.js",
        "scripts": {
          "start": "node source/Fable-ServiceProviderBase.js",
          "test": "npx quack test",
          "tests": "npx quack test -g",
          "coverage": "npx quack coverage",
          "build": "npx quack build",
          "types": "tsc -p ./tsconfig.build.json",
          "check": "tsc -p . --noEmit"
        },
        "types": "types/source/Fable-ServiceProviderBase.d.ts",
        "mocha": {
          "diff": true,
          "extension": ["js"],
          "package": "./package.json",
          "reporter": "spec",
          "slow": "75",
          "timeout": "5000",
          "ui": "tdd",
          "watch-files": ["source/**/*.js", "test/**/*.js"],
          "watch-ignore": ["lib/vendor"]
        },
        "repository": {
          "type": "git",
          "url": "https://github.com/stevenvelozo/fable-serviceproviderbase.git"
        },
        "keywords": ["entity", "behavior"],
        "author": "Steven Velozo <steven@velozo.com> (http://velozo.com/)",
        "license": "MIT",
        "bugs": {
          "url": "https://github.com/stevenvelozo/fable-serviceproviderbase/issues"
        },
        "homepage": "https://github.com/stevenvelozo/fable-serviceproviderbase",
        "devDependencies": {
          "@types/mocha": "^10.0.10",
          "fable": "^3.1.62",
          "quackage": "^1.0.58",
          "typescript": "^5.9.3"
        }
      };
    }, {}],
    2: [function (require, module, exports) {
      /**
      * Fable Service Base
      * @author <steven@velozo.com>
      */

      const libPackage = require('../package.json');
      class FableServiceProviderBase {
        /**
         * The constructor can be used in two ways:
         * 1) With a fable, options object and service hash (the options object and service hash are optional)a
         * 2) With an object or nothing as the first parameter, where it will be treated as the options object
         *
         * @param {import('fable')|Record<string, any>} [pFable] - (optional) The fable instance, or the options object if there is no fable
         * @param {Record<string, any>|string} [pOptions] - (optional) The options object, or the service hash if there is no fable
         * @param {string} [pServiceHash] - (optional) The service hash to identify this service instance
         */
        constructor(pFable, pOptions, pServiceHash) {
          /** @type {import('fable')} */
          this.fable;
          /** @type {string} */
          this.UUID;
          /** @type {Record<string, any>} */
          this.options;
          /** @type {Record<string, any>} */
          this.services;
          /** @type {Record<string, any>} */
          this.servicesMap;

          // Check if a fable was passed in; connect it if so
          if (typeof pFable === 'object' && pFable.isFable) {
            this.connectFable(pFable);
          } else {
            this.fable = false;
          }

          // Initialize the services map if it wasn't passed in
          /** @type {Record<string, any>} */
          this._PackageFableServiceProvider = libPackage;

          // initialize options and UUID based on whether the fable was passed in or not.
          if (this.fable) {
            this.UUID = pFable.getUUID();
            this.options = typeof pOptions === 'object' ? pOptions : {};
          } else {
            // With no fable, check to see if there was an object passed into either of the first two
            // Parameters, and if so, treat it as the options object
            this.options = typeof pFable === 'object' && !pFable.isFable ? pFable : typeof pOptions === 'object' ? pOptions : {};
            this.UUID = `CORE-SVC-${Math.floor(Math.random() * (99999 - 10000) + 10000)}`;
          }

          // It's expected that the deriving class will set this
          this.serviceType = `Unknown-${this.UUID}`;

          // The service hash is used to identify the specific instantiation of the service in the services map
          this.Hash = typeof pServiceHash === 'string' ? pServiceHash : !this.fable && typeof pOptions === 'string' ? pOptions : `${this.UUID}`;
        }

        /**
         * @param {import('fable')} pFable
         */
        connectFable(pFable) {
          if (typeof pFable !== 'object' || !pFable.isFable) {
            let tmpErrorMessage = `Fable Service Provider Base: Cannot connect to Fable, invalid Fable object passed in.  The pFable parameter was a [${typeof pFable}].}`;
            console.log(tmpErrorMessage);
            return new Error(tmpErrorMessage);
          }
          if (!this.fable) {
            this.fable = pFable;
          }
          if (!this.log) {
            this.log = this.fable.Logging;
          }
          if (!this.services) {
            this.services = this.fable.services;
          }
          if (!this.servicesMap) {
            this.servicesMap = this.fable.servicesMap;
          }
          return true;
        }
        static isFableService = true;
      }
      module.exports = FableServiceProviderBase;

      // This is left here in case we want to go back to having different code/base class for "core" services
      module.exports.CoreServiceProviderBase = FableServiceProviderBase;
    }, {
      "../package.json": 1
    }],
    3: [function (require, module, exports) {
      module.exports = {
        "name": "pict-application",
        "version": "1.0.33",
        "description": "Application base class for a pict view-based application",
        "main": "source/Pict-Application.js",
        "scripts": {
          "test": "npx quack test",
          "start": "node source/Pict-Application.js",
          "coverage": "npx quack coverage",
          "build": "npx quack build",
          "docker-dev-build": "docker build ./ -f Dockerfile_LUXURYCode -t pict-application-image:local",
          "docker-dev-run": "docker run -it -d --name pict-application-dev -p 30001:8080 -p 38086:8086 -v \"$PWD/.config:/home/coder/.config\"  -v \"$PWD:/home/coder/pict-application\" -u \"$(id -u):$(id -g)\" -e \"DOCKER_USER=$USER\" pict-application-image:local",
          "docker-dev-shell": "docker exec -it pict-application-dev /bin/bash",
          "tests": "npx quack test -g",
          "lint": "eslint source/**",
          "types": "tsc -p ."
        },
        "types": "types/source/Pict-Application.d.ts",
        "repository": {
          "type": "git",
          "url": "git+https://github.com/stevenvelozo/pict-application.git"
        },
        "author": "steven velozo <steven@velozo.com>",
        "license": "MIT",
        "bugs": {
          "url": "https://github.com/stevenvelozo/pict-application/issues"
        },
        "homepage": "https://github.com/stevenvelozo/pict-application#readme",
        "devDependencies": {
          "@eslint/js": "^9.28.0",
          "browser-env": "^3.3.0",
          "eslint": "^9.28.0",
          "pict": "^1.0.348",
          "pict-provider": "^1.0.10",
          "pict-view": "^1.0.66",
          "quackage": "^1.0.58",
          "typescript": "^5.9.3"
        },
        "mocha": {
          "diff": true,
          "extension": ["js"],
          "package": "./package.json",
          "reporter": "spec",
          "slow": "75",
          "timeout": "5000",
          "ui": "tdd",
          "watch-files": ["source/**/*.js", "test/**/*.js"],
          "watch-ignore": ["lib/vendor"]
        },
        "dependencies": {
          "fable-serviceproviderbase": "^3.0.19"
        }
      };
    }, {}],
    4: [function (require, module, exports) {
      const libFableServiceBase = require('fable-serviceproviderbase');
      const libPackage = require('../package.json');
      const defaultPictSettings = {
        Name: 'DefaultPictApplication',
        // The main "viewport" is the view that is used to host our application
        MainViewportViewIdentifier: 'Default-View',
        MainViewportRenderableHash: false,
        MainViewportDestinationAddress: false,
        MainViewportDefaultDataAddress: false,
        // Whether or not we should automatically render the main viewport and other autorender views after we initialize the pict application
        AutoSolveAfterInitialize: true,
        AutoRenderMainViewportViewAfterInitialize: true,
        AutoRenderViewsAfterInitialize: false,
        AutoLoginAfterInitialize: false,
        AutoLoadDataAfterLogin: false,
        ConfigurationOnlyViews: [],
        Manifests: {},
        // The prefix to prepend on all template destination hashes
        IdentifierAddressPrefix: 'PICT-'
      };

      /**
       * Base class for pict applications.
       */
      class PictApplication extends libFableServiceBase {
        /**
         * @param {import('fable')} pFable
         * @param {Record<string, any>} [pOptions]
         * @param {string} [pServiceHash]
         */
        constructor(pFable, pOptions, pServiceHash) {
          let tmpCarryOverConfiguration = typeof pFable.settings.PictApplicationConfiguration === 'object' ? pFable.settings.PictApplicationConfiguration : {};
          let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictSettings)), tmpCarryOverConfiguration, pOptions);
          super(pFable, tmpOptions, pServiceHash);

          /** @type {any} */
          this.options;
          /** @type {any} */
          this.log;
          /** @type {import('pict') & import('fable')} */
          this.fable;
          /** @type {string} */
          this.UUID;
          /** @type {string} */
          this.Hash;
          /**
           * @type {{ [key: string]: any }}
           */
          this.servicesMap;
          this.serviceType = 'PictApplication';
          /** @type {Record<string, any>} */
          this._Package = libPackage;

          // Convenience and consistency naming
          this.pict = this.fable;
          // Wire in the essential Pict state
          /** @type {Record<string, any>} */
          this.AppData = this.fable.AppData;
          /** @type {Record<string, any>} */
          this.Bundle = this.fable.Bundle;

          /** @type {number} */
          this.initializeTimestamp;
          /** @type {number} */
          this.lastSolvedTimestamp;
          /** @type {number} */
          this.lastLoginTimestamp;
          /** @type {number} */
          this.lastMarshalFromViewsTimestamp;
          /** @type {number} */
          this.lastMarshalToViewsTimestamp;
          /** @type {number} */
          this.lastAutoRenderTimestamp;
          /** @type {number} */
          this.lastLoadDataTimestamp;

          // Load all the manifests for the application
          let tmpManifestKeys = Object.keys(this.options.Manifests);
          if (tmpManifestKeys.length > 0) {
            for (let i = 0; i < tmpManifestKeys.length; i++) {
              // Load each manifest
              let tmpManifestKey = tmpManifestKeys[i];
              this.fable.instantiateServiceProvider('Manifest', this.options.Manifests[tmpManifestKey], tmpManifestKey);
            }
          }
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Solve All Views                          */
        /* -------------------------------------------------------------------------- */
        /**
         * @return {boolean}
         */
        onPreSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onPreSolve:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onPreSolveAsync(fCallback) {
          this.onPreSolve();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        onBeforeSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeSolve:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onBeforeSolveAsync(fCallback) {
          this.onBeforeSolve();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        onSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onSolve:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onSolveAsync(fCallback) {
          this.onSolve();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        solve() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} executing solve() function...`);
          }

          // Walk through any loaded providers and solve them as well.
          let tmpLoadedProviders = Object.keys(this.pict.providers);
          let tmpProvidersToSolve = [];
          for (let i = 0; i < tmpLoadedProviders.length; i++) {
            let tmpProvider = this.pict.providers[tmpLoadedProviders[i]];
            if (tmpProvider.options.AutoSolveWithApp) {
              tmpProvidersToSolve.push(tmpProvider);
            }
          }
          // Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
          tmpProvidersToSolve.sort((a, b) => {
            return a.options.AutoSolveOrdinal - b.options.AutoSolveOrdinal;
          });
          for (let i = 0; i < tmpProvidersToSolve.length; i++) {
            tmpProvidersToSolve[i].solve(tmpProvidersToSolve[i]);
          }
          this.onBeforeSolve();
          // Now walk through any loaded views and initialize them as well.
          let tmpLoadedViews = Object.keys(this.pict.views);
          let tmpViewsToSolve = [];
          for (let i = 0; i < tmpLoadedViews.length; i++) {
            let tmpView = this.pict.views[tmpLoadedViews[i]];
            if (tmpView.options.AutoInitialize) {
              tmpViewsToSolve.push(tmpView);
            }
          }
          // Sort the views by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
          tmpViewsToSolve.sort((a, b) => {
            return a.options.AutoInitializeOrdinal - b.options.AutoInitializeOrdinal;
          });
          for (let i = 0; i < tmpViewsToSolve.length; i++) {
            tmpViewsToSolve[i].solve();
          }
          this.onSolve();
          this.onAfterSolve();
          this.lastSolvedTimestamp = this.fable.log.getTimeStamp();
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        solveAsync(fCallback) {
          let tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');
          tmpAnticipate.anticipate(this.onBeforeSolveAsync.bind(this));

          // Allow the callback to be passed in as the last parameter no matter what
          let tmpCallback = typeof fCallback === 'function' ? fCallback : false;
          if (!tmpCallback) {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          // Walk through any loaded providers and solve them as well.
          let tmpLoadedProviders = Object.keys(this.pict.providers);
          let tmpProvidersToSolve = [];
          for (let i = 0; i < tmpLoadedProviders.length; i++) {
            let tmpProvider = this.pict.providers[tmpLoadedProviders[i]];
            if (tmpProvider.options.AutoSolveWithApp) {
              tmpProvidersToSolve.push(tmpProvider);
            }
          }
          // Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
          tmpProvidersToSolve.sort((a, b) => {
            return a.options.AutoSolveOrdinal - b.options.AutoSolveOrdinal;
          });
          for (let i = 0; i < tmpProvidersToSolve.length; i++) {
            tmpAnticipate.anticipate(tmpProvidersToSolve[i].solveAsync.bind(tmpProvidersToSolve[i]));
          }

          // Walk through any loaded views and solve them as well.
          let tmpLoadedViews = Object.keys(this.pict.views);
          let tmpViewsToSolve = [];
          for (let i = 0; i < tmpLoadedViews.length; i++) {
            let tmpView = this.pict.views[tmpLoadedViews[i]];
            if (tmpView.options.AutoSolveWithApp) {
              tmpViewsToSolve.push(tmpView);
            }
          }
          // Sort the views by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
          tmpViewsToSolve.sort((a, b) => {
            return a.options.AutoSolveOrdinal - b.options.AutoSolveOrdinal;
          });
          for (let i = 0; i < tmpViewsToSolve.length; i++) {
            tmpAnticipate.anticipate(tmpViewsToSolve[i].solveAsync.bind(tmpViewsToSolve[i]));
          }
          tmpAnticipate.anticipate(this.onSolveAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterSolveAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync() complete.`);
            }
            this.lastSolvedTimestamp = this.fable.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * @return {boolean}
         */
        onAfterSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterSolve:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onAfterSolveAsync(fCallback) {
          this.onAfterSolve();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Application Login                        */
        /* -------------------------------------------------------------------------- */

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onBeforeLoginAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeLoginAsync:`);
          }
          return fCallback();
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onLoginAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onLoginAsync:`);
          }
          return fCallback();
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        loginAsync(fCallback) {
          const tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');
          let tmpCallback = fCallback;
          if (typeof tmpCallback !== 'function') {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loginAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loginAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeLoginAsync.bind(this));
          tmpAnticipate.anticipate(this.onLoginAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterLoginAsync.bind(this));

          // check and see if we should automatically trigger a data load
          if (this.options.AutoLoadDataAfterLogin) {
            tmpAnticipate.anticipate(fNext => {
              if (!this.isLoggedIn()) {
                return fNext();
              }
              if (this.pict.LogNoisiness > 1) {
                this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto loading data after login...`);
              }
              //TODO: should data load errors funnel here? this creates a weird coupling between login and data load callbacks
              this.loadDataAsync(pError => {
                fNext(pError);
              });
            });
          }
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loginAsync() complete.`);
            }
            this.lastLoginTimestamp = this.fable.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * Check if the application state is logged in. Defaults to true. Override this method in your application based on login requirements.
         *
         * @return {boolean}
         */
        isLoggedIn() {
          return true;
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onAfterLoginAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterLoginAsync:`);
          }
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Application LoadData                     */
        /* -------------------------------------------------------------------------- */

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onBeforeLoadDataAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeLoadDataAsync:`);
          }
          return fCallback();
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onLoadDataAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onLoadDataAsync:`);
          }
          return fCallback();
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        loadDataAsync(fCallback) {
          const tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');
          let tmpCallback = fCallback;
          if (typeof tmpCallback !== 'function') {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loadDataAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loadDataAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeLoadDataAsync.bind(this));

          // Walk through any loaded providers and load their data as well.
          let tmpLoadedProviders = Object.keys(this.pict.providers);
          let tmpProvidersToLoadData = [];
          for (let i = 0; i < tmpLoadedProviders.length; i++) {
            let tmpProvider = this.pict.providers[tmpLoadedProviders[i]];
            if (tmpProvider.options.AutoLoadDataWithApp) {
              tmpProvidersToLoadData.push(tmpProvider);
            }
          }
          // Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
          tmpProvidersToLoadData.sort((a, b) => {
            return a.options.AutoLoadDataOrdinal - b.options.AutoLoadDataOrdinal;
          });
          for (const tmpProvider of tmpProvidersToLoadData) {
            tmpAnticipate.anticipate(tmpProvider.onBeforeLoadDataAsync.bind(tmpProvider));
          }
          tmpAnticipate.anticipate(this.onLoadDataAsync.bind(this));

          //TODO: think about ways to parallelize these
          for (const tmpProvider of tmpProvidersToLoadData) {
            tmpAnticipate.anticipate(tmpProvider.onLoadDataAsync.bind(tmpProvider));
          }
          tmpAnticipate.anticipate(this.onAfterLoadDataAsync.bind(this));
          for (const tmpProvider of tmpProvidersToLoadData) {
            tmpAnticipate.anticipate(tmpProvider.onAfterLoadDataAsync.bind(tmpProvider));
          }
          tmpAnticipate.wait(/** @param {Error} [pError] */
          pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} loadDataAsync() complete.`);
            }
            this.lastLoadDataTimestamp = this.fable.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onAfterLoadDataAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterLoadDataAsync:`);
          }
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Application SaveData                     */
        /* -------------------------------------------------------------------------- */

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onBeforeSaveDataAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeSaveDataAsync:`);
          }
          return fCallback();
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onSaveDataAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onSaveDataAsync:`);
          }
          return fCallback();
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        saveDataAsync(fCallback) {
          const tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');
          let tmpCallback = fCallback;
          if (typeof tmpCallback !== 'function') {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} saveDataAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} saveDataAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeSaveDataAsync.bind(this));

          // Walk through any loaded providers and load their data as well.
          let tmpLoadedProviders = Object.keys(this.pict.providers);
          let tmpProvidersToSaveData = [];
          for (let i = 0; i < tmpLoadedProviders.length; i++) {
            let tmpProvider = this.pict.providers[tmpLoadedProviders[i]];
            if (tmpProvider.options.AutoSaveDataWithApp) {
              tmpProvidersToSaveData.push(tmpProvider);
            }
          }
          // Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
          tmpProvidersToSaveData.sort((a, b) => {
            return a.options.AutoSaveDataOrdinal - b.options.AutoSaveDataOrdinal;
          });
          for (const tmpProvider of tmpProvidersToSaveData) {
            tmpAnticipate.anticipate(tmpProvider.onBeforeSaveDataAsync.bind(tmpProvider));
          }
          tmpAnticipate.anticipate(this.onSaveDataAsync.bind(this));

          //TODO: think about ways to parallelize these
          for (const tmpProvider of tmpProvidersToSaveData) {
            tmpAnticipate.anticipate(tmpProvider.onSaveDataAsync.bind(tmpProvider));
          }
          tmpAnticipate.anticipate(this.onAfterSaveDataAsync.bind(this));
          for (const tmpProvider of tmpProvidersToSaveData) {
            tmpAnticipate.anticipate(tmpProvider.onAfterSaveDataAsync.bind(tmpProvider));
          }
          tmpAnticipate.wait(/** @param {Error} [pError] */
          pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} saveDataAsync() complete.`);
            }
            this.lastSaveDataTimestamp = this.fable.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        onAfterSaveDataAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterSaveDataAsync:`);
          }
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Initialize Application                   */
        /* -------------------------------------------------------------------------- */
        /**
         * @return {boolean}
         */
        onBeforeInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeInitialize:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onBeforeInitializeAsync(fCallback) {
          this.onBeforeInitialize();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        onInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onInitialize:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onInitializeAsync(fCallback) {
          this.onInitialize();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        initialize() {
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} initialize:`);
          }
          if (!this.initializeTimestamp) {
            this.onBeforeInitialize();
            if ('ConfigurationOnlyViews' in this.options) {
              // Load all the configuration only views
              for (let i = 0; i < this.options.ConfigurationOnlyViews.length; i++) {
                let tmpViewIdentifier = typeof this.options.ConfigurationOnlyViews[i].ViewIdentifier === 'undefined' ? `AutoView-${this.fable.getUUID()}` : this.options.ConfigurationOnlyViews[i].ViewIdentifier;
                this.log.info(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} adding configuration only view: ${tmpViewIdentifier}`);
                this.pict.addView(tmpViewIdentifier, this.options.ConfigurationOnlyViews[i]);
              }
            }
            this.onInitialize();

            // Walk through any loaded providers and initialize them as well.
            let tmpLoadedProviders = Object.keys(this.pict.providers);
            let tmpProvidersToInitialize = [];
            for (let i = 0; i < tmpLoadedProviders.length; i++) {
              let tmpProvider = this.pict.providers[tmpLoadedProviders[i]];
              if (tmpProvider.options.AutoInitialize) {
                tmpProvidersToInitialize.push(tmpProvider);
              }
            }
            // Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
            tmpProvidersToInitialize.sort((a, b) => {
              return a.options.AutoInitializeOrdinal - b.options.AutoInitializeOrdinal;
            });
            for (let i = 0; i < tmpProvidersToInitialize.length; i++) {
              tmpProvidersToInitialize[i].initialize();
            }

            // Now walk through any loaded views and initialize them as well.
            let tmpLoadedViews = Object.keys(this.pict.views);
            let tmpViewsToInitialize = [];
            for (let i = 0; i < tmpLoadedViews.length; i++) {
              let tmpView = this.pict.views[tmpLoadedViews[i]];
              if (tmpView.options.AutoInitialize) {
                tmpViewsToInitialize.push(tmpView);
              }
            }
            // Sort the views by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
            tmpViewsToInitialize.sort((a, b) => {
              return a.options.AutoInitializeOrdinal - b.options.AutoInitializeOrdinal;
            });
            for (let i = 0; i < tmpViewsToInitialize.length; i++) {
              tmpViewsToInitialize[i].initialize();
            }
            this.onAfterInitialize();
            if (this.options.AutoSolveAfterInitialize) {
              if (this.pict.LogNoisiness > 1) {
                this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto solving after initialization...`);
              }
              // Solve the template synchronously
              this.solve();
            }
            // Now check and see if we should automatically render as well
            if (this.options.AutoRenderMainViewportViewAfterInitialize) {
              if (this.pict.LogNoisiness > 1) {
                this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto rendering after initialization...`);
              }
              // Render the template synchronously
              this.render();
            }
            this.initializeTimestamp = this.fable.log.getTimeStamp();
            this.onCompletionOfInitialize();
            return true;
          } else {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initialize called but initialization is already completed.  Aborting.`);
            return false;
          }
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        initializeAsync(fCallback) {
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} initializeAsync:`);
          }

          // Allow the callback to be passed in as the last parameter no matter what
          let tmpCallback = typeof fCallback === 'function' ? fCallback : false;
          if (!tmpCallback) {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initializeAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initializeAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          if (!this.initializeTimestamp) {
            let tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');
            if (this.pict.LogNoisiness > 3) {
              this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} beginning initialization...`);
            }
            if ('ConfigurationOnlyViews' in this.options) {
              // Load all the configuration only views
              for (let i = 0; i < this.options.ConfigurationOnlyViews.length; i++) {
                let tmpViewIdentifier = typeof this.options.ConfigurationOnlyViews[i].ViewIdentifier === 'undefined' ? `AutoView-${this.fable.getUUID()}` : this.options.ConfigurationOnlyViews[i].ViewIdentifier;
                this.log.info(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} adding configuration only view: ${tmpViewIdentifier}`);
                this.pict.addView(tmpViewIdentifier, this.options.ConfigurationOnlyViews[i]);
              }
            }
            tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));
            tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));

            // Walk through any loaded providers and solve them as well.
            let tmpLoadedProviders = Object.keys(this.pict.providers);
            let tmpProvidersToInitialize = [];
            for (let i = 0; i < tmpLoadedProviders.length; i++) {
              let tmpProvider = this.pict.providers[tmpLoadedProviders[i]];
              if (tmpProvider.options.AutoInitialize) {
                tmpProvidersToInitialize.push(tmpProvider);
              }
            }
            // Sort the providers by their priority (if they are all priority 0, it will end up being add order due to JSON Object Property Key order stuff)
            tmpProvidersToInitialize.sort((a, b) => {
              return a.options.AutoInitializeOrdinal - b.options.AutoInitializeOrdinal;
            });
            for (let i = 0; i < tmpProvidersToInitialize.length; i++) {
              tmpAnticipate.anticipate(tmpProvidersToInitialize[i].initializeAsync.bind(tmpProvidersToInitialize[i]));
            }

            // Now walk through any loaded views and initialize them as well.
            // TODO: Some optimization cleverness could be gained by grouping them into a parallelized async operation, by ordinal.
            let tmpLoadedViews = Object.keys(this.pict.views);
            let tmpViewsToInitialize = [];
            for (let i = 0; i < tmpLoadedViews.length; i++) {
              let tmpView = this.pict.views[tmpLoadedViews[i]];
              if (tmpView.options.AutoInitialize) {
                tmpViewsToInitialize.push(tmpView);
              }
            }
            // Sort the views by their priority
            // If they are all the default priority 0, it will end up being add order due to JSON Object Property Key order stuff
            tmpViewsToInitialize.sort((a, b) => {
              return a.options.AutoInitializeOrdinal - b.options.AutoInitializeOrdinal;
            });
            for (let i = 0; i < tmpViewsToInitialize.length; i++) {
              let tmpView = tmpViewsToInitialize[i];
              tmpAnticipate.anticipate(tmpView.initializeAsync.bind(tmpView));
            }
            tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));
            if (this.options.AutoLoginAfterInitialize) {
              if (this.pict.LogNoisiness > 1) {
                this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto login (asynchronously) after initialization...`);
              }
              tmpAnticipate.anticipate(this.loginAsync.bind(this));
            }
            if (this.options.AutoSolveAfterInitialize) {
              if (this.pict.LogNoisiness > 1) {
                this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto solving (asynchronously) after initialization...`);
              }
              tmpAnticipate.anticipate(this.solveAsync.bind(this));
            }
            if (this.options.AutoRenderMainViewportViewAfterInitialize) {
              if (this.pict.LogNoisiness > 1) {
                this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} auto rendering (asynchronously) after initialization...`);
              }
              tmpAnticipate.anticipate(this.renderMainViewportAsync.bind(this));
            }
            tmpAnticipate.wait(pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initializeAsync Error: ${pError.message || pError}`, {
                  stack: pError.stack
                });
              }
              this.initializeTimestamp = this.fable.log.getTimeStamp();
              if (this.pict.LogNoisiness > 2) {
                this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} initialization complete.`);
              }
              return tmpCallback();
            });
          } else {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} async initialize called but initialization is already completed.  Aborting.`);
            // TODO: Should this be an error?
            return this.onCompletionOfInitializeAsync(tmpCallback);
          }
        }

        /**
         * @return {boolean}
         */
        onAfterInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterInitialize:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onAfterInitializeAsync(fCallback) {
          this.onAfterInitialize();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        onCompletionOfInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onCompletionOfInitialize:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onCompletionOfInitializeAsync(fCallback) {
          this.onCompletionOfInitialize();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Marshal Data From All Views              */
        /* -------------------------------------------------------------------------- */
        /**
         * @return {boolean}
         */
        onBeforeMarshalFromViews() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeMarshalFromViews:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onBeforeMarshalFromViewsAsync(fCallback) {
          this.onBeforeMarshalFromViews();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        onMarshalFromViews() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onMarshalFromViews:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onMarshalFromViewsAsync(fCallback) {
          this.onMarshalFromViews();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        marshalFromViews() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} executing marshalFromViews() function...`);
          }
          this.onBeforeMarshalFromViews();
          // Now walk through any loaded views and initialize them as well.
          let tmpLoadedViews = Object.keys(this.pict.views);
          let tmpViewsToMarshalFromViews = [];
          for (let i = 0; i < tmpLoadedViews.length; i++) {
            let tmpView = this.pict.views[tmpLoadedViews[i]];
            tmpViewsToMarshalFromViews.push(tmpView);
          }
          for (let i = 0; i < tmpViewsToMarshalFromViews.length; i++) {
            tmpViewsToMarshalFromViews[i].marshalFromView();
          }
          this.onMarshalFromViews();
          this.onAfterMarshalFromViews();
          this.lastMarshalFromViewsTimestamp = this.fable.log.getTimeStamp();
          return true;
        }

        /**
         * @param {(error?: Error) => void} fCallback
         */
        marshalFromViewsAsync(fCallback) {
          let tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');

          // Allow the callback to be passed in as the last parameter no matter what
          let tmpCallback = typeof fCallback === 'function' ? fCallback : false;
          if (!tmpCallback) {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewsAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewsAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeMarshalFromViewsAsync.bind(this));
          // Walk through any loaded views and marshalFromViews them as well.
          let tmpLoadedViews = Object.keys(this.pict.views);
          let tmpViewsToMarshalFromViews = [];
          for (let i = 0; i < tmpLoadedViews.length; i++) {
            let tmpView = this.pict.views[tmpLoadedViews[i]];
            tmpViewsToMarshalFromViews.push(tmpView);
          }
          for (let i = 0; i < tmpViewsToMarshalFromViews.length; i++) {
            tmpAnticipate.anticipate(tmpViewsToMarshalFromViews[i].marshalFromViewAsync.bind(tmpViewsToMarshalFromViews[i]));
          }
          tmpAnticipate.anticipate(this.onMarshalFromViewsAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterMarshalFromViewsAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewsAsync() complete.`);
            }
            this.lastMarshalFromViewsTimestamp = this.fable.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * @return {boolean}
         */
        onAfterMarshalFromViews() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterMarshalFromViews:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onAfterMarshalFromViewsAsync(fCallback) {
          this.onAfterMarshalFromViews();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Marshal Data To All Views                */
        /* -------------------------------------------------------------------------- */
        /**
         * @return {boolean}
         */
        onBeforeMarshalToViews() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeMarshalToViews:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onBeforeMarshalToViewsAsync(fCallback) {
          this.onBeforeMarshalToViews();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        onMarshalToViews() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onMarshalToViews:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onMarshalToViewsAsync(fCallback) {
          this.onMarshalToViews();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        marshalToViews() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} executing marshalToViews() function...`);
          }
          this.onBeforeMarshalToViews();
          // Now walk through any loaded views and initialize them as well.
          let tmpLoadedViews = Object.keys(this.pict.views);
          let tmpViewsToMarshalToViews = [];
          for (let i = 0; i < tmpLoadedViews.length; i++) {
            let tmpView = this.pict.views[tmpLoadedViews[i]];
            tmpViewsToMarshalToViews.push(tmpView);
          }
          for (let i = 0; i < tmpViewsToMarshalToViews.length; i++) {
            tmpViewsToMarshalToViews[i].marshalToView();
          }
          this.onMarshalToViews();
          this.onAfterMarshalToViews();
          this.lastMarshalToViewsTimestamp = this.fable.log.getTimeStamp();
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        marshalToViewsAsync(fCallback) {
          let tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');

          // Allow the callback to be passed in as the last parameter no matter what
          let tmpCallback = typeof fCallback === 'function' ? fCallback : false;
          if (!tmpCallback) {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewsAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewsAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeMarshalToViewsAsync.bind(this));
          // Walk through any loaded views and marshalToViews them as well.
          let tmpLoadedViews = Object.keys(this.pict.views);
          let tmpViewsToMarshalToViews = [];
          for (let i = 0; i < tmpLoadedViews.length; i++) {
            let tmpView = this.pict.views[tmpLoadedViews[i]];
            tmpViewsToMarshalToViews.push(tmpView);
          }
          for (let i = 0; i < tmpViewsToMarshalToViews.length; i++) {
            tmpAnticipate.anticipate(tmpViewsToMarshalToViews[i].marshalToViewAsync.bind(tmpViewsToMarshalToViews[i]));
          }
          tmpAnticipate.anticipate(this.onMarshalToViewsAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterMarshalToViewsAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewsAsync() complete.`);
            }
            this.lastMarshalToViewsTimestamp = this.fable.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * @return {boolean}
         */
        onAfterMarshalToViews() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterMarshalToViews:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onAfterMarshalToViewsAsync(fCallback) {
          this.onAfterMarshalToViews();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Render View                              */
        /* -------------------------------------------------------------------------- */
        /**
         * @return {boolean}
         */
        onBeforeRender() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onBeforeRender:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onBeforeRenderAsync(fCallback) {
          this.onBeforeRender();
          return fCallback();
        }

        /**
         * @param {string} [pViewIdentifier] - The hash of the view to render. By default, the main viewport view is rendered.
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string} [pTemplateDataAddress] - The address where the data for the template is stored.
         *
         * TODO: Should we support objects for pTemplateDataAddress for parity with pict-view?
         */
        render(pViewIdentifier, pRenderableHash, pRenderDestinationAddress, pTemplateDataAddress) {
          let tmpViewIdentifier = typeof pViewIdentifier !== 'string' ? this.options.MainViewportViewIdentifier : pViewIdentifier;
          let tmpRenderableHash = typeof pRenderableHash !== 'string' ? this.options.MainViewportRenderableHash : pRenderableHash;
          let tmpRenderDestinationAddress = typeof pRenderDestinationAddress !== 'string' ? this.options.MainViewportDestinationAddress : pRenderDestinationAddress;
          let tmpTemplateDataAddress = typeof pTemplateDataAddress !== 'string' ? this.options.MainViewportDefaultDataAddress : pTemplateDataAddress;
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} VIEW Renderable[${tmpRenderableHash}] Destination[${tmpRenderDestinationAddress}] TemplateDataAddress[${tmpTemplateDataAddress}] render:`);
          }
          this.onBeforeRender();

          // Now get the view (by hash) from the loaded views
          let tmpView = typeof tmpViewIdentifier === 'string' ? this.servicesMap.PictView[tmpViewIdentifier] : false;
          if (!tmpView) {
            this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} could not render from View ${tmpViewIdentifier} because it is not a valid view.`);
            return false;
          }
          this.onRender();
          tmpView.render(tmpRenderableHash, tmpRenderDestinationAddress, tmpTemplateDataAddress);
          this.onAfterRender();
          return true;
        }
        /**
         * @return {boolean}
         */
        onRender() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onRender:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onRenderAsync(fCallback) {
          this.onRender();
          return fCallback();
        }

        /**
         * @param {string|((error?: Error) => void)} pViewIdentifier - The hash of the view to render. By default, the main viewport view is rendered. (or the callback)
         * @param {string|((error?: Error) => void)} [pRenderableHash] - The hash of the renderable to render. (or the callback)
         * @param {string|((error?: Error) => void)} [pRenderDestinationAddress] - The address where the renderable will be rendered. (or the callback)
         * @param {string|((error?: Error) => void)} [pTemplateDataAddress] - The address where the data for the template is stored. (or the callback)
         * @param {(error?: Error) => void} [fCallback] - The callback, if all other parameters are provided.
         *
         * TODO: Should we support objects for pTemplateDataAddress for parity with pict-view?
         */
        renderAsync(pViewIdentifier, pRenderableHash, pRenderDestinationAddress, pTemplateDataAddress, fCallback) {
          let tmpViewIdentifier = typeof pViewIdentifier !== 'string' ? this.options.MainViewportViewIdentifier : pViewIdentifier;
          let tmpRenderableHash = typeof pRenderableHash !== 'string' ? this.options.MainViewportRenderableHash : pRenderableHash;
          let tmpRenderDestinationAddress = typeof pRenderDestinationAddress !== 'string' ? this.options.MainViewportDestinationAddress : pRenderDestinationAddress;
          let tmpTemplateDataAddress = typeof pTemplateDataAddress !== 'string' ? this.options.MainViewportDefaultDataAddress : pTemplateDataAddress;

          // Allow the callback to be passed in as the last parameter no matter what
          let tmpCallback = typeof fCallback === 'function' ? fCallback : typeof pTemplateDataAddress === 'function' ? pTemplateDataAddress : typeof pRenderDestinationAddress === 'function' ? pRenderDestinationAddress : typeof pRenderableHash === 'function' ? pRenderableHash : typeof pViewIdentifier === 'function' ? pViewIdentifier : false;
          if (!tmpCallback) {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} VIEW Renderable[${tmpRenderableHash}] Destination[${tmpRenderDestinationAddress}] TemplateDataAddress[${tmpTemplateDataAddress}] renderAsync:`);
          }
          let tmpRenderAnticipate = this.fable.newAnticipate();
          tmpRenderAnticipate.anticipate(this.onBeforeRenderAsync.bind(this));
          let tmpView = typeof tmpViewIdentifier === 'string' ? this.servicesMap.PictView[tmpViewIdentifier] : false;
          if (!tmpView) {
            let tmpErrorMessage = `PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} could not asynchronously render from View ${tmpViewIdentifier} because it is not a valid view.`;
            if (this.pict.LogNoisiness > 3) {
              this.log.error(tmpErrorMessage);
            }
            return tmpCallback(new Error(tmpErrorMessage));
          }
          tmpRenderAnticipate.anticipate(this.onRenderAsync.bind(this));
          tmpRenderAnticipate.anticipate(fNext => {
            tmpView.renderAsync.call(tmpView, tmpRenderableHash, tmpRenderDestinationAddress, tmpTemplateDataAddress, fNext);
          });
          tmpRenderAnticipate.anticipate(this.onAfterRenderAsync.bind(this));
          return tmpRenderAnticipate.wait(tmpCallback);
        }

        /**
         * @return {boolean}
         */
        onAfterRender() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} onAfterRender:`);
          }
          return true;
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        onAfterRenderAsync(fCallback) {
          this.onAfterRender();
          return fCallback();
        }

        /**
         * @return {boolean}
         */
        renderMainViewport() {
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderMainViewport:`);
          }
          return this.render();
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        renderMainViewportAsync(fCallback) {
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow APPLICATION [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderMainViewportAsync:`);
          }
          return this.renderAsync(fCallback);
        }
        /**
         * @return {void}
         */
        renderAutoViews() {
          if (this.pict.LogNoisiness > 0) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} beginning renderAutoViews...`);
          }
          // Now walk through any loaded views and sort them by the AutoRender ordinal
          let tmpLoadedViews = Object.keys(this.pict.views);
          // Sort the views by their priority
          // If they are all the default priority 0, it will end up being add order due to JSON Object Property Key order stuff
          tmpLoadedViews.sort((a, b) => {
            return this.pict.views[a].options.AutoRenderOrdinal - this.pict.views[b].options.AutoRenderOrdinal;
          });
          for (let i = 0; i < tmpLoadedViews.length; i++) {
            let tmpView = this.pict.views[tmpLoadedViews[i]];
            if (tmpView.options.AutoRender) {
              tmpView.render();
            }
          }
          if (this.pict.LogNoisiness > 0) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAutoViewsAsync complete.`);
          }
        }
        /**
         * @param {(error?: Error) => void} fCallback
         */
        renderAutoViewsAsync(fCallback) {
          let tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');

          // Allow the callback to be passed in as the last parameter no matter what
          let tmpCallback = typeof fCallback === 'function' ? fCallback : false;
          if (!tmpCallback) {
            this.log.warn(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAutoViewsAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAutoViewsAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          if (this.pict.LogNoisiness > 0) {
            this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} beginning renderAutoViewsAsync...`);
          }

          // Now walk through any loaded views and sort them by the AutoRender ordinal
          // TODO: Some optimization cleverness could be gained by grouping them into a parallelized async operation, by ordinal.
          let tmpLoadedViews = Object.keys(this.pict.views);
          // Sort the views by their priority
          // If they are all the default priority 0, it will end up being add order due to JSON Object Property Key order stuff
          tmpLoadedViews.sort((a, b) => {
            return this.pict.views[a].options.AutoRenderOrdinal - this.pict.views[b].options.AutoRenderOrdinal;
          });
          for (let i = 0; i < tmpLoadedViews.length; i++) {
            let tmpView = this.pict.views[tmpLoadedViews[i]];
            if (tmpView.options.AutoRender) {
              tmpAnticipate.anticipate(tmpView.renderAsync.bind(tmpView));
            }
          }
          tmpAnticipate.wait(pError => {
            this.lastAutoRenderTimestamp = this.fable.log.getTimeStamp();
            if (this.pict.LogNoisiness > 0) {
              this.log.trace(`PictApp [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAutoViewsAsync complete.`);
            }
            return tmpCallback(pError);
          });
        }

        /**
         * @return {boolean}
         */
        get isPictApplication() {
          return true;
        }
      }
      module.exports = PictApplication;
    }, {
      "../package.json": 3,
      "fable-serviceproviderbase": 2
    }],
    5: [function (require, module, exports) {
      module.exports = {
        "name": "pict-provider",
        "version": "1.0.12",
        "description": "Pict Provider Base Class",
        "main": "source/Pict-Provider.js",
        "scripts": {
          "start": "node source/Pict-Provider.js",
          "test": "npx quack test",
          "tests": "npx quack test -g",
          "coverage": "npx quack coverage",
          "build": "npx quack build",
          "docker-dev-build": "docker build ./ -f Dockerfile_LUXURYCode -t pict-provider-image:local",
          "docker-dev-run": "docker run -it -d --name pict-provider-dev -p 24125:8080 -p 30027:8086 -v \"$PWD/.config:/home/coder/.config\"  -v \"$PWD:/home/coder/pict-provider\" -u \"$(id -u):$(id -g)\" -e \"DOCKER_USER=$USER\" pict-provider-image:local",
          "docker-dev-shell": "docker exec -it pict-provider-dev /bin/bash",
          "lint": "eslint source/**",
          "types": "tsc -p ."
        },
        "types": "types/source/Pict-Provider.d.ts",
        "repository": {
          "type": "git",
          "url": "git+https://github.com/stevenvelozo/pict-provider.git"
        },
        "author": "steven velozo <steven@velozo.com>",
        "license": "MIT",
        "bugs": {
          "url": "https://github.com/stevenvelozo/pict-provider/issues"
        },
        "homepage": "https://github.com/stevenvelozo/pict-provider#readme",
        "devDependencies": {
          "@eslint/js": "^9.39.1",
          "eslint": "^9.39.1",
          "pict": "^1.0.351",
          "quackage": "^1.0.58",
          "typescript": "^5.9.3"
        },
        "dependencies": {
          "fable-serviceproviderbase": "^3.0.19"
        },
        "mocha": {
          "diff": true,
          "extension": ["js"],
          "package": "./package.json",
          "reporter": "spec",
          "slow": "75",
          "timeout": "5000",
          "ui": "tdd",
          "watch-files": ["source/**/*.js", "test/**/*.js"],
          "watch-ignore": ["lib/vendor"]
        }
      };
    }, {}],
    6: [function (require, module, exports) {
      const libFableServiceBase = require('fable-serviceproviderbase');
      const libPackage = require('../package.json');
      const defaultPictProviderSettings = {
        ProviderIdentifier: false,
        // If this is set to true, when the App initializes this will.
        // After the App initializes, initialize will be called as soon as it's added.
        AutoInitialize: true,
        AutoInitializeOrdinal: 0,
        AutoLoadDataWithApp: true,
        AutoLoadDataOrdinal: 0,
        AutoSolveWithApp: true,
        AutoSolveOrdinal: 0,
        Manifests: {},
        Templates: []
      };
      class PictProvider extends libFableServiceBase {
        /**
         * @param {import('fable')} pFable - The Fable instance.
         * @param {Record<string, any>} [pOptions] - The options for the provider.
         * @param {string} [pServiceHash] - The service hash for the provider.
         */
        constructor(pFable, pOptions, pServiceHash) {
          // Intersect default options, parent constructor, service information
          let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictProviderSettings)), pOptions);
          super(pFable, tmpOptions, pServiceHash);

          /** @type {import('fable') & import('pict') & { instantiateServiceProviderWithoutRegistration(pServiceType: string, pOptions?: Record<string, any>, pCustomServiceHash?: string): any }} */
          this.fable;
          /** @type {import('fable') & import('pict') & { instantiateServiceProviderWithoutRegistration(pServiceType: string, pOptions?: Record<string, any>, pCustomServiceHash?: string): any }} */
          this.pict;
          /** @type {any} */
          this.log;
          /** @type {Record<string, any>} */
          this.options;
          /** @type {string} */
          this.UUID;
          /** @type {string} */
          this.Hash;
          if (!this.options.ProviderIdentifier) {
            this.options.ProviderIdentifier = `AutoProviderID-${this.fable.getUUID()}`;
          }
          this.serviceType = 'PictProvider';
          /** @type {Record<string, any>} */
          this._Package = libPackage;

          // Convenience and consistency naming
          this.pict = this.fable;

          // Wire in the essential Pict application state
          /** @type {Record<string, any>} */
          this.AppData = this.pict.AppData;
          /** @type {Record<string, any>} */
          this.Bundle = this.pict.Bundle;
          this.initializeTimestamp = false;
          this.lastSolvedTimestamp = false;
          for (let i = 0; i < this.options.Templates.length; i++) {
            let tmpDefaultTemplate = this.options.Templates[i];
            if (!tmpDefaultTemplate.hasOwnProperty('Postfix') || !tmpDefaultTemplate.hasOwnProperty('Template')) {
              this.log.error(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} could not load Default Template ${i} in the options array.`, tmpDefaultTemplate);
            } else {
              if (!tmpDefaultTemplate.Source) {
                tmpDefaultTemplate.Source = `PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} options object.`;
              }
              this.pict.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix, tmpDefaultTemplate.Postfix, tmpDefaultTemplate.Template, tmpDefaultTemplate.Source);
            }
          }
        }

        /* -------------------------------------------------------------------------- */
        /*                        Code Section: Initialization                        */
        /* -------------------------------------------------------------------------- */
        onBeforeInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onBeforeInitialize:`);
          }
          return true;
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after pre-pinitialization.
         *
         * @return {void}
         */
        onBeforeInitializeAsync(fCallback) {
          this.onBeforeInitialize();
          return fCallback();
        }
        onInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onInitialize:`);
          }
          return true;
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after initialization.
         *
         * @return {void}
         */
        onInitializeAsync(fCallback) {
          this.onInitialize();
          return fCallback();
        }
        initialize() {
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow PROVIDER [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initialize:`);
          }
          if (!this.initializeTimestamp) {
            this.onBeforeInitialize();
            this.onInitialize();
            this.onAfterInitialize();
            this.initializeTimestamp = this.pict.log.getTimeStamp();
            return true;
          } else {
            this.log.warn(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initialize called but initialization is already completed.  Aborting.`);
            return false;
          }
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after initialization.
         *
         * @return {void}
         */
        initializeAsync(fCallback) {
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow PROVIDER [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initializeAsync:`);
          }
          if (!this.initializeTimestamp) {
            let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');
            if (this.pict.LogNoisiness > 0) {
              this.log.info(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} beginning initialization...`);
            }
            tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));
            tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));
            tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));
            tmpAnticipate.wait(pError => {
              this.initializeTimestamp = this.pict.log.getTimeStamp();
              if (pError) {
                this.log.error(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initialization failed: ${pError.message || pError}`, {
                  Stack: pError.stack
                });
              } else if (this.pict.LogNoisiness > 0) {
                this.log.info(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} initialization complete.`);
              }
              return fCallback();
            });
          } else {
            this.log.warn(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} async initialize called but initialization is already completed.  Aborting.`);
            // TODO: Should this be an error?
            return fCallback();
          }
        }
        onAfterInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onAfterInitialize:`);
          }
          return true;
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after initialization.
         *
         * @return {void}
         */
        onAfterInitializeAsync(fCallback) {
          this.onAfterInitialize();
          return fCallback();
        }
        onPreRender() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onPreRender:`);
          }
          return true;
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after pre-render.
         *
         * @return {void}
         */
        onPreRenderAsync(fCallback) {
          this.onPreRender();
          return fCallback();
        }
        render() {
          return this.onPreRender();
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after render.
         *
         * @return {void}
         */
        renderAsync(fCallback) {
          this.onPreRender();
          return fCallback();
        }
        onPreSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onPreSolve:`);
          }
          return true;
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after pre-solve.
         *
         * @return {void}
         */
        onPreSolveAsync(fCallback) {
          this.onPreSolve();
          return fCallback();
        }
        solve() {
          return this.onPreSolve();
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after solve.
         *
         * @return {void}
         */
        solveAsync(fCallback) {
          this.onPreSolve();
          return fCallback();
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after the data pre-load.
         */
        onBeforeLoadDataAsync(fCallback) {
          return fCallback();
        }

        /**
         * Hook to allow the provider to load data during application data load.
         *
         * @param {(pError?: Error) => void} fCallback - The callback to call after the data load.
         */
        onLoadDataAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onLoadDataAsync:`);
          }
          return fCallback();
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after the data post-load.
         */
        onAfterLoadDataAsync(fCallback) {
          return fCallback();
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after the data pre-load.
         *
         * @return {void}
         */
        onBeforeSaveDataAsync(fCallback) {
          return fCallback();
        }

        /**
         * Hook to allow the provider to load data during application data load.
         *
         * @param {(pError?: Error) => void} fCallback - The callback to call after the data load.
         *
         * @return {void}
         */
        onSaveDataAsync(fCallback) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictProvider [${this.UUID}]::[${this.Hash}] ${this.options.ProviderIdentifier} onSaveDataAsync:`);
          }
          return fCallback();
        }

        /**
         * @param {(pError?: Error) => void} fCallback - The callback to call after the data post-load.
         *
         * @return {void}
         */
        onAfterSaveDataAsync(fCallback) {
          return fCallback();
        }
      }
      module.exports = PictProvider;
    }, {
      "../package.json": 5,
      "fable-serviceproviderbase": 2
    }],
    7: [function (require, module, exports) {
      module.exports = {
        "name": "pict-view",
        "version": "1.0.67",
        "description": "Pict View Base Class",
        "main": "source/Pict-View.js",
        "scripts": {
          "test": "npx quack test",
          "tests": "npx quack test -g",
          "start": "node source/Pict-View.js",
          "coverage": "npx quack coverage",
          "build": "npx quack build",
          "docker-dev-build": "docker build ./ -f Dockerfile_LUXURYCode -t pict-view-image:local",
          "docker-dev-run": "docker run -it -d --name pict-view-dev -p 30001:8080 -p 38086:8086 -v \"$PWD/.config:/home/coder/.config\"  -v \"$PWD:/home/coder/pict-view\" -u \"$(id -u):$(id -g)\" -e \"DOCKER_USER=$USER\" pict-view-image:local",
          "docker-dev-shell": "docker exec -it pict-view-dev /bin/bash",
          "types": "tsc -p .",
          "lint": "eslint source/**"
        },
        "types": "types/source/Pict-View.d.ts",
        "repository": {
          "type": "git",
          "url": "git+https://github.com/stevenvelozo/pict-view.git"
        },
        "author": "steven velozo <steven@velozo.com>",
        "license": "MIT",
        "bugs": {
          "url": "https://github.com/stevenvelozo/pict-view/issues"
        },
        "homepage": "https://github.com/stevenvelozo/pict-view#readme",
        "devDependencies": {
          "@eslint/js": "^9.39.1",
          "browser-env": "^3.3.0",
          "eslint": "^9.39.1",
          "pict": "^1.0.348",
          "quackage": "^1.0.58",
          "typescript": "^5.9.3"
        },
        "mocha": {
          "diff": true,
          "extension": ["js"],
          "package": "./package.json",
          "reporter": "spec",
          "slow": "75",
          "timeout": "5000",
          "ui": "tdd",
          "watch-files": ["source/**/*.js", "test/**/*.js"],
          "watch-ignore": ["lib/vendor"]
        },
        "dependencies": {
          "fable": "^3.1.63",
          "fable-serviceproviderbase": "^3.0.19"
        }
      };
    }, {}],
    8: [function (require, module, exports) {
      const libFableServiceBase = require('fable-serviceproviderbase');
      const libPackage = require('../package.json');
      const defaultPictViewSettings = {
        DefaultRenderable: false,
        DefaultDestinationAddress: false,
        DefaultTemplateRecordAddress: false,
        ViewIdentifier: false,
        // If this is set to true, when the App initializes this will.
        // After the App initializes, initialize will be called as soon as it's added.
        AutoInitialize: true,
        AutoInitializeOrdinal: 0,
        // If this is set to true, when the App autorenders (on load) this will.
        // After the App initializes, render will be called as soon as it's added.
        AutoRender: true,
        AutoRenderOrdinal: 0,
        AutoSolveWithApp: true,
        AutoSolveOrdinal: 0,
        CSSHash: false,
        CSS: false,
        CSSProvider: false,
        CSSPriority: 500,
        Templates: [],
        DefaultTemplates: [],
        Renderables: [],
        Manifests: {}
      };

      /** @typedef {(error?: Error) => void} ErrorCallback */
      /** @typedef {number | boolean} PictTimestamp */

      /**
       * @typedef {'replace' | 'append' | 'prepend' | 'append_once' | 'virtual-assignment'} RenderMethod
       */
      /**
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
       */

      /**
       * Represents a view in the Pict ecosystem.
       */
      class PictView extends libFableServiceBase {
        /**
         * @param {any} pFable - The Fable object that this service is attached to.
         * @param {any} [pOptions] - (optional) The options for this service.
         * @param {string} [pServiceHash] - (optional) The hash of the service.
         */
        constructor(pFable, pOptions, pServiceHash) {
          // Intersect default options, parent constructor, service information
          let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictViewSettings)), pOptions);
          super(pFable, tmpOptions, pServiceHash);
          //FIXME: add types to fable and ancillaries
          /** @type {any} */
          this.fable;
          /** @type {any} */
          this.options;
          /** @type {String} */
          this.UUID;
          /** @type {String} */
          this.Hash;
          /** @type {any} */
          this.log;
          const tmpHashIsUUID = this.Hash === this.UUID;
          //NOTE: since many places are using the view UUID as the HTML element ID, we prefix it to avoid starting with a number
          this.UUID = `V-${this.UUID}`;
          if (tmpHashIsUUID) {
            this.Hash = this.UUID;
          }
          if (!this.options.ViewIdentifier) {
            this.options.ViewIdentifier = `AutoViewID-${this.fable.getUUID()}`;
          }
          this.serviceType = 'PictView';
          /** @type {Record<string, any>} */
          this._Package = libPackage;
          // Convenience and consistency naming
          /** @type {import('pict') & { log: any, instantiateServiceProviderWithoutRegistration: (hash: String) => any, instantiateServiceProviderIfNotExists: (hash: string) => any, TransactionTracking: import('pict/types/source/services/Fable-Service-TransactionTracking') }} */
          this.pict = this.fable;
          // Wire in the essential Pict application state
          this.AppData = this.pict.AppData;
          this.Bundle = this.pict.Bundle;

          /** @type {PictTimestamp} */
          this.initializeTimestamp = false;
          /** @type {PictTimestamp} */
          this.lastSolvedTimestamp = false;
          /** @type {PictTimestamp} */
          this.lastRenderedTimestamp = false;
          /** @type {PictTimestamp} */
          this.lastMarshalFromViewTimestamp = false;
          /** @type {PictTimestamp} */
          this.lastMarshalToViewTimestamp = false;
          this.pict.instantiateServiceProviderIfNotExists('TransactionTracking');

          // Load all templates from the array in the options
          // Templates are in the form of {Hash:'Some-Template-Hash',Template:'Template content',Source:'TemplateSource'}
          for (let i = 0; i < this.options.Templates.length; i++) {
            let tmpTemplate = this.options.Templates[i];
            if (!('Hash' in tmpTemplate) || !('Template' in tmpTemplate)) {
              this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Template ${i} in the options array.`, tmpTemplate);
            } else {
              if (!tmpTemplate.Source) {
                tmpTemplate.Source = `PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} options object.`;
              }
              this.pict.TemplateProvider.addTemplate(tmpTemplate.Hash, tmpTemplate.Template, tmpTemplate.Source);
            }
          }

          // Load all default templates from the array in the options
          // Templates are in the form of {Prefix:'',Postfix:'-List-Row',Template:'Template content',Source:'TemplateSourceString'}
          for (let i = 0; i < this.options.DefaultTemplates.length; i++) {
            let tmpDefaultTemplate = this.options.DefaultTemplates[i];
            if (!('Postfix' in tmpDefaultTemplate) || !('Template' in tmpDefaultTemplate)) {
              this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Default Template ${i} in the options array.`, tmpDefaultTemplate);
            } else {
              if (!tmpDefaultTemplate.Source) {
                tmpDefaultTemplate.Source = `PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} options object.`;
              }
              this.pict.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix, tmpDefaultTemplate.Postfix, tmpDefaultTemplate.Template, tmpDefaultTemplate.Source);
            }
          }

          // Load the CSS if it's available
          if (this.options.CSS) {
            let tmpCSSHash = this.options.CSSHash ? this.options.CSSHash : `View-${this.options.ViewIdentifier}`;
            let tmpCSSProvider = this.options.CSSProvider ? this.options.CSSProvider : tmpCSSHash;
            this.pict.CSSMap.addCSS(tmpCSSHash, this.options.CSS, tmpCSSProvider, this.options.CSSPriority);
          }

          // Load all renderables
          // Renderables are launchable renderable instructions with templates
          // They look as such: {Identifier:'ContentEntry', TemplateHash:'Content-Entry-Section-Main', ContentDestinationAddress:'#ContentSection', RecordAddress:'AppData.Content.DefaultText', ManifestTransformation:'ManyfestHash', ManifestDestinationAddress:'AppData.Content.DataToTransformContent'}
          // The only parts that are necessary are Identifier and Template
          // A developer can then do render('ContentEntry') and it just kinda works.  Or they can override the ContentDestinationAddress
          /** @type {Record<String, Renderable>} */
          this.renderables = {};
          for (let i = 0; i < this.options.Renderables.length; i++) {
            /** @type {Renderable} */
            let tmpRenderable = this.options.Renderables[i];
            this.addRenderable(tmpRenderable);
          }
        }

        /**
         * Adds a renderable to the view.
         *
         * @param {string | Renderable} pRenderableHash - The hash of the renderable, or a renderable object.
         * @param {string} [pTemplateHash] - (optional) The hash of the template for the renderable.
         * @param {string} [pDefaultTemplateRecordAddress] - (optional) The default data address for the template.
         * @param {string} [pDefaultDestinationAddress] - (optional) The default destination address for the renderable.
         * @param {RenderMethod} [pRenderMethod=replace] - (optional) The method to use when rendering the renderable (ex. 'replace').
         */
        addRenderable(pRenderableHash, pTemplateHash, pDefaultTemplateRecordAddress, pDefaultDestinationAddress, pRenderMethod) {
          /** @type {Renderable} */
          let tmpRenderable;
          if (typeof pRenderableHash == 'object') {
            // The developer passed in the renderable as an object.
            // Use theirs instead!
            tmpRenderable = pRenderableHash;
          } else {
            /** @type {RenderMethod} */
            let tmpRenderMethod = typeof pRenderMethod !== 'string' ? pRenderMethod : 'replace';
            tmpRenderable = {
              RenderableHash: pRenderableHash,
              TemplateHash: pTemplateHash,
              DefaultTemplateRecordAddress: pDefaultTemplateRecordAddress,
              ContentDestinationAddress: pDefaultDestinationAddress,
              RenderMethod: tmpRenderMethod
            };
          }
          if (typeof tmpRenderable.RenderableHash != 'string' || typeof tmpRenderable.TemplateHash != 'string') {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Renderable; RenderableHash or TemplateHash are invalid.`, tmpRenderable);
          } else {
            if (this.pict.LogNoisiness > 0) {
              this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} adding renderable [${tmpRenderable.RenderableHash}] pointed to template ${tmpRenderable.TemplateHash}.`);
            }
            this.renderables[tmpRenderable.RenderableHash] = tmpRenderable;
          }
        }

        /* -------------------------------------------------------------------------- */
        /*                        Code Section: Initialization                        */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before the view is initialized.
         */
        onBeforeInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeInitialize:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before the view is initialized (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onBeforeInitializeAsync(fCallback) {
          this.onBeforeInitialize();
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers when the view is initialized.
         */
        onInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onInitialize:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers when the view is initialized (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onInitializeAsync(fCallback) {
          this.onInitialize();
          return fCallback();
        }

        /**
         * Performs view initialization.
         */
        initialize() {
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialize:`);
          }
          if (!this.initializeTimestamp) {
            this.onBeforeInitialize();
            this.onInitialize();
            this.onAfterInitialize();
            this.initializeTimestamp = this.pict.log.getTimeStamp();
            return true;
          } else {
            this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialize called but initialization is already completed.  Aborting.`);
            return false;
          }
        }

        /**
         * Performs view initialization (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        initializeAsync(fCallback) {
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initializeAsync:`);
          }
          if (!this.initializeTimestamp) {
            let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');
            if (this.pict.LogNoisiness > 0) {
              this.log.info(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} beginning initialization...`);
            }
            tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));
            tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));
            tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));
            tmpAnticipate.wait(/** @param {Error} pError */
            pError => {
              if (pError) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialization failed: ${pError.message || pError}`, {
                  stack: pError.stack
                });
              }
              this.initializeTimestamp = this.pict.log.getTimeStamp();
              if (this.pict.LogNoisiness > 0) {
                this.log.info(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialization complete.`);
              }
              return fCallback();
            });
          } else {
            this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} async initialize called but initialization is already completed.  Aborting.`);
            // TODO: Should this be an error?
            return fCallback();
          }
        }
        onAfterInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterInitialize:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after the view is initialized (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onAfterInitializeAsync(fCallback) {
          this.onAfterInitialize();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                            Code Section: Render                            */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before the view is rendered.
         *
         * @param {Renderable} pRenderable - The renderable that will be rendered.
         */
        onBeforeRender(pRenderable) {
          // Overload this to mess with stuff before the content gets generated from the template
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeRender:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before the view is rendered (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that will be rendered.
         */
        onBeforeRenderAsync(fCallback, pRenderable) {
          this.onBeforeRender(pRenderable);
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers before the view is projected into the DOM.
         *
         * @param {Renderable} pRenderable - The renderable that will be projected.
         */
        onBeforeProject(pRenderable) {
          // Overload this to mess with stuff before the content gets generated from the template
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeProject:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before the view is projected into the DOM (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that will be projected.
         */
        onBeforeProjectAsync(fCallback, pRenderable) {
          this.onBeforeProject(pRenderable);
          return fCallback();
        }

        /**
         * Builds the render options for a renderable.
         *
         * For DRY purposes on the three flavors of render.
         *
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         */
        buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress) {
          let tmpRenderOptions = {
            Valid: true
          };
          tmpRenderOptions.RenderableHash = typeof pRenderableHash === 'string' ? pRenderableHash : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;
          if (!tmpRenderOptions.RenderableHash) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not find a suitable RenderableHash ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`);
            tmpRenderOptions.Valid = false;
          }
          tmpRenderOptions.Renderable = this.renderables[tmpRenderOptions.RenderableHash];
          if (!tmpRenderOptions.Renderable) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}) because it does not exist.`);
            tmpRenderOptions.Valid = false;
          }
          tmpRenderOptions.DestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderOptions.Renderable.ContentDestinationAddress === 'string' ? tmpRenderOptions.Renderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : false;
          if (!tmpRenderOptions.DestinationAddress) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address (param ${pRenderDestinationAddress}).`);
            tmpRenderOptions.Valid = false;
          }
          if (typeof pTemplateRecordAddress === 'object') {
            tmpRenderOptions.RecordAddress = 'Passed in as object';
            tmpRenderOptions.Record = pTemplateRecordAddress;
          } else {
            tmpRenderOptions.RecordAddress = typeof pTemplateRecordAddress === 'string' ? pTemplateRecordAddress : typeof tmpRenderOptions.Renderable.DefaultTemplateRecordAddress === 'string' ? tmpRenderOptions.Renderable.DefaultTemplateRecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
            tmpRenderOptions.Record = typeof tmpRenderOptions.RecordAddress === 'string' ? this.pict.DataProvider.getDataByAddress(tmpRenderOptions.RecordAddress) : undefined;
          }
          return tmpRenderOptions;
        }

        /**
         * Assigns the content to the destination address.
         *
         * For DRY purposes on the three flavors of render.
         *
         * @param {Renderable} pRenderable - The renderable to render.
         * @param {string} pRenderDestinationAddress - The address where the renderable will be rendered.
         * @param {string} pContent - The content to render.
         * @returns {boolean} - Returns true if the content was assigned successfully.
         * @memberof PictView
         */
        assignRenderContent(pRenderable, pRenderDestinationAddress, pContent) {
          return this.pict.ContentAssignment.projectContent(pRenderable.RenderMethod, pRenderDestinationAddress, pContent, pRenderable.TestAddress);
        }

        /**
         * Render a renderable from this view.
         *
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
         * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
         * @return {boolean}
         */
        render(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable) {
          return this.renderWithScope(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable);
        }

        /**
         * Render a renderable from this view, providing a specifici scope for the template.
         *
         * @param {any} pScope - The scope to use for the template rendering.
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
         * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
         * @return {boolean}
         */
        renderWithScope(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable) {
          let tmpRenderableHash = typeof pRenderableHash === 'string' ? pRenderableHash : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;
          if (!tmpRenderableHash) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it is not a valid renderable.`);
            return false;
          }

          /** @type {Renderable} */
          let tmpRenderable;
          if (tmpRenderableHash == '__Virtual') {
            tmpRenderable = {
              RenderableHash: '__Virtual',
              TemplateHash: this.renderables[this.options.DefaultRenderable].TemplateHash,
              ContentDestinationAddress: typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : null,
              RenderMethod: 'virtual-assignment',
              TransactionHash: pRootRenderable && pRootRenderable.TransactionHash,
              RootRenderableViewHash: pRootRenderable && pRootRenderable.RootRenderableViewHash
            };
          } else {
            tmpRenderable = Object.assign({}, this.renderables[tmpRenderableHash]);
            tmpRenderable.ContentDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : null;
          }
          if (!tmpRenderable.TransactionHash) {
            tmpRenderable.TransactionHash = `ViewRender-V-${this.options.ViewIdentifier}-R-${tmpRenderableHash}-U-${this.pict.getUUID()}`;
            tmpRenderable.RootRenderableViewHash = this.Hash;
            this.pict.TransactionTracking.registerTransaction(tmpRenderable.TransactionHash);
          }
          if (!tmpRenderable) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`);
            return false;
          }
          if (!tmpRenderable.ContentDestinationAddress) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address.`);
            return false;
          }
          let tmpRecordAddress;
          let tmpRecord;
          if (typeof pTemplateRecordAddress === 'object') {
            tmpRecord = pTemplateRecordAddress;
            tmpRecordAddress = 'Passed in as object';
          } else {
            tmpRecordAddress = typeof pTemplateRecordAddress === 'string' ? pTemplateRecordAddress : typeof tmpRenderable.DefaultTemplateRecordAddress === 'string' ? tmpRenderable.DefaultTemplateRecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
            tmpRecord = typeof tmpRecordAddress === 'string' ? this.pict.DataProvider.getDataByAddress(tmpRecordAddress) : undefined;
          }

          // Execute the developer-overridable pre-render behavior
          this.onBeforeRender(tmpRenderable);
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderable.ContentDestinationAddress}] TemplateRecordAddress[${tmpRecordAddress}] render:`);
          }
          if (this.pict.LogNoisiness > 0) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Render of Renderable[${tmpRenderableHash}] to Destination [${tmpRenderable.ContentDestinationAddress}]...`);
          }
          // Generate the content output from the template and data
          tmpRenderable.Content = this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpRecord, null, [this], pScope, {
            RootRenderable: typeof pRootRenderable === 'object' ? pRootRenderable : tmpRenderable
          });
          if (this.pict.LogNoisiness > 0) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${tmpRenderableHash}] content length ${tmpRenderable.Content.length} to Destination [${tmpRenderable.ContentDestinationAddress}] using render method [${tmpRenderable.RenderMethod}].`);
          }
          this.onBeforeProject(tmpRenderable);
          this.onProject(tmpRenderable);
          if (tmpRenderable.RenderMethod !== 'virtual-assignment') {
            this.onAfterProject(tmpRenderable);

            // Execute the developer-overridable post-render behavior
            this.onAfterRender(tmpRenderable);
          }
          return true;
        }

        /**
         * Render a renderable from this view.
         *
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address where the data for the template is stored.
         * @param {Renderable|ErrorCallback} [pRootRenderable] - The root renderable for the render operation, if applicable.
         * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
         *
         * @return {void}
         */
        renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback) {
          return this.renderWithScopeAsync(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback);
        }

        /**
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
         */
        renderWithScopeAsync(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback) {
          let tmpRenderableHash = typeof pRenderableHash === 'string' ? pRenderableHash : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;

          // Allow the callback to be passed in as the last parameter no matter what
          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : typeof pTemplateRecordAddress === 'function' ? pTemplateRecordAddress : typeof pRenderDestinationAddress === 'function' ? pRenderDestinationAddress : typeof pRenderableHash === 'function' ? pRenderableHash : typeof pRootRenderable === 'function' ? pRootRenderable : null;
          if (!tmpCallback) {
            this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          if (!tmpRenderableHash) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`);
            return tmpCallback(new Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`));
          }

          /** @type {Renderable} */
          let tmpRenderable;
          if (tmpRenderableHash == '__Virtual') {
            tmpRenderable = {
              RenderableHash: '__Virtual',
              TemplateHash: this.renderables[this.options.DefaultRenderable].TemplateHash,
              ContentDestinationAddress: typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : null,
              RenderMethod: 'virtual-assignment',
              TransactionHash: pRootRenderable && typeof pRootRenderable !== 'function' && pRootRenderable.TransactionHash,
              RootRenderableViewHash: pRootRenderable && typeof pRootRenderable !== 'function' && pRootRenderable.RootRenderableViewHash
            };
          } else {
            tmpRenderable = Object.assign({}, this.renderables[tmpRenderableHash]);
            tmpRenderable.ContentDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : null;
          }
          if (!tmpRenderable.TransactionHash) {
            tmpRenderable.TransactionHash = `ViewRender-V-${this.options.ViewIdentifier}-R-${tmpRenderableHash}-U-${this.pict.getUUID()}`;
            tmpRenderable.RootRenderableViewHash = this.Hash;
            this.pict.TransactionTracking.registerTransaction(tmpRenderable.TransactionHash);
          }
          if (!tmpRenderable) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`);
            return tmpCallback(new Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`));
          }
          if (!tmpRenderable.ContentDestinationAddress) {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address.`);
            return tmpCallback(new Error(`Could not render ${tmpRenderableHash}`));
          }
          let tmpRecordAddress;
          let tmpRecord;
          if (typeof pTemplateRecordAddress === 'object') {
            tmpRecord = pTemplateRecordAddress;
            tmpRecordAddress = 'Passed in as object';
          } else {
            tmpRecordAddress = typeof pTemplateRecordAddress === 'string' ? pTemplateRecordAddress : typeof tmpRenderable.DefaultTemplateRecordAddress === 'string' ? tmpRenderable.DefaultTemplateRecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
            tmpRecord = typeof tmpRecordAddress === 'string' ? this.pict.DataProvider.getDataByAddress(tmpRecordAddress) : undefined;
          }
          if (this.pict.LogControlFlow) {
            this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderable.ContentDestinationAddress}] TemplateRecordAddress[${tmpRecordAddress}] renderAsync:`);
          }
          if (this.pict.LogNoisiness > 2) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Asynchronous Render (callback-style)...`);
          }
          let tmpAnticipate = this.fable.newAnticipate();
          tmpAnticipate.anticipate(fOnBeforeRenderCallback => {
            this.onBeforeRenderAsync(fOnBeforeRenderCallback, tmpRenderable);
          });
          tmpAnticipate.anticipate(fAsyncTemplateCallback => {
            // Render the template (asynchronously)
            this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpRecord, (pError, pContent) => {
              if (pError) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render (asynchronously) ${tmpRenderableHash} (param ${pRenderableHash}) because it did not parse the template.`, pError);
                return fAsyncTemplateCallback(pError);
              }
              tmpRenderable.Content = pContent;
              return fAsyncTemplateCallback();
            }, [this], pScope, {
              RootRenderable: typeof pRootRenderable === 'object' ? pRootRenderable : tmpRenderable
            });
          });
          tmpAnticipate.anticipate(fNext => {
            this.onBeforeProjectAsync(fNext, tmpRenderable);
          });
          tmpAnticipate.anticipate(fNext => {
            this.onProjectAsync(fNext, tmpRenderable);
          });
          if (tmpRenderable.RenderMethod !== 'virtual-assignment') {
            tmpAnticipate.anticipate(fNext => {
              this.onAfterProjectAsync(fNext, tmpRenderable);
            });

            // Execute the developer-overridable post-render behavior
            tmpAnticipate.anticipate(fNext => {
              this.onAfterRenderAsync(fNext, tmpRenderable);
            });
          }
          tmpAnticipate.wait(tmpCallback);
        }

        /**
         * Renders the default renderable.
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        renderDefaultAsync(fCallback) {
          // Render the default renderable
          this.renderAsync(fCallback);
        }

        /**
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         */
        basicRender(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress) {
          return this.basicRenderWithScope(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
        }

        /**
         * @param {any} pScope - The scope to use for the template rendering.
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         */
        basicRenderWithScope(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress) {
          let tmpRenderOptions = this.buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
          if (tmpRenderOptions.Valid) {
            this.assignRenderContent(tmpRenderOptions.Renderable, tmpRenderOptions.DestinationAddress, this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash, tmpRenderOptions.Record, null, [this], pScope, {
              RootRenderable: tmpRenderOptions.Renderable
            }));
            return true;
          } else {
            this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not perform a basic render of ${tmpRenderOptions.RenderableHash} because it is not valid.`);
            return false;
          }
        }

        /**
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
         */
        basicRenderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback) {
          return this.basicRenderWithScopeAsync(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback);
        }

        /**
         * @param {any} pScope - The scope to use for the template rendering.
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
         */
        basicRenderWithScopeAsync(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback) {
          // Allow the callback to be passed in as the last parameter no matter what
          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : typeof pTemplateRecordAddress === 'function' ? pTemplateRecordAddress : typeof pRenderDestinationAddress === 'function' ? pRenderDestinationAddress : typeof pRenderableHash === 'function' ? pRenderableHash : null;
          if (!tmpCallback) {
            this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} basicRenderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} basicRenderAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          const tmpRenderOptions = this.buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
          if (tmpRenderOptions.Valid) {
            this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash, tmpRenderOptions.Record,
            /**
             * @param {Error} [pError] - The error that occurred during template parsing.
             * @param {string} [pContent] - The content that was rendered from the template.
             */
            (pError, pContent) => {
              if (pError) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render (asynchronously) ${tmpRenderOptions.RenderableHash} because it did not parse the template.`, pError);
                return tmpCallback(pError);
              }
              this.assignRenderContent(tmpRenderOptions.Renderable, tmpRenderOptions.DestinationAddress, pContent);
              return tmpCallback();
            }, [this], pScope, {
              RootRenderable: tmpRenderOptions.Renderable
            });
          } else {
            let tmpErrorMessage = `PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not perform a basic render of ${tmpRenderOptions.RenderableHash} because it is not valid.`;
            this.log.error(tmpErrorMessage);
            return tmpCallback(new Error(tmpErrorMessage));
          }
        }

        /**
         * @param {Renderable} pRenderable - The renderable that was rendered.
         */
        onProject(pRenderable) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onProject:`);
          }
          if (pRenderable.RenderMethod === 'virtual-assignment') {
            this.pict.TransactionTracking.pushToTransactionQueue(pRenderable.TransactionHash, {
              ViewHash: this.Hash,
              Renderable: pRenderable
            }, 'Deferred-Post-Content-Assignment');
          }
          if (this.pict.LogNoisiness > 0) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${pRenderable.RenderableHash}] content length ${pRenderable.Content.length} to Destination [${pRenderable.ContentDestinationAddress}] using Async render method ${pRenderable.RenderMethod}.`);
          }

          // Assign the content to the destination address
          this.pict.ContentAssignment.projectContent(pRenderable.RenderMethod, pRenderable.ContentDestinationAddress, pRenderable.Content, pRenderable.TestAddress);
          this.lastRenderedTimestamp = this.pict.log.getTimeStamp();
        }

        /**
         * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
         *
         * @param {(error?: Error, content?: string) => void} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that is being projected.
         */
        onProjectAsync(fCallback, pRenderable) {
          this.onProject(pRenderable);
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers after the view is rendered.
         *
         * @param {Renderable} pRenderable - The renderable that was rendered.
         */
        onAfterRender(pRenderable) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRender:`);
          }
          if (pRenderable && pRenderable.RootRenderableViewHash === this.Hash) {
            const tmpTransactionQueue = this.pict.TransactionTracking.clearTransactionQueue(pRenderable.TransactionHash) || [];
            for (const tmpEvent of tmpTransactionQueue) {
              const tmpView = this.pict.views[tmpEvent.Data.ViewHash];
              if (!tmpView) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRender: Could not find view for transaction hash ${pRenderable.TransactionHash} and ViewHash ${tmpEvent.Data.ViewHash}.`);
                continue;
              }
              tmpView.onAfterProject();

              // Execute the developer-overridable post-render behavior
              tmpView.onAfterRender(tmpEvent.Data.Renderable);
            }
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after the view is rendered (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that was rendered.
         */
        onAfterRenderAsync(fCallback, pRenderable) {
          this.onAfterRender(pRenderable);
          const tmpAnticipate = this.fable.newAnticipate();
          if (pRenderable && pRenderable.RootRenderableViewHash === this.Hash) {
            const queue = this.pict.TransactionTracking.clearTransactionQueue(pRenderable.TransactionHash) || [];
            for (const event of queue) {
              /** @type {PictView} */
              const tmpView = this.pict.views[event.Data.ViewHash];
              if (!tmpView) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRenderAsync: Could not find view for transaction hash ${pRenderable.TransactionHash} and ViewHash ${event.Data.ViewHash}.`);
                continue;
              }
              tmpAnticipate.anticipate(tmpView.onAfterProjectAsync.bind(tmpView));
              tmpAnticipate.anticipate(fNext => {
                tmpView.onAfterRenderAsync(fNext, event.Data.Renderable);
              });

              // Execute the developer-overridable post-render behavior
            }
          }
          return tmpAnticipate.wait(fCallback);
        }

        /**
         * Lifecycle hook that triggers after the view is projected into the DOM.
         *
         * @param {Renderable} pRenderable - The renderable that was projected.
         */
        onAfterProject(pRenderable) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterProject:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that was projected.
         */
        onAfterProjectAsync(fCallback, pRenderable) {
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                            Code Section: Solver                            */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before the view is solved.
         */
        onBeforeSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeSolve:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before the view is solved (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onBeforeSolveAsync(fCallback) {
          this.onBeforeSolve();
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers when the view is solved.
         */
        onSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onSolve:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers when the view is solved (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onSolveAsync(fCallback) {
          this.onSolve();
          return fCallback();
        }

        /**
         * Performs view solving and triggers lifecycle hooks.
         *
         * @return {boolean} - True if the view was solved successfully, false otherwise.
         */
        solve() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);
          }
          this.onBeforeSolve();
          this.onSolve();
          this.onAfterSolve();
          this.lastSolvedTimestamp = this.pict.log.getTimeStamp();
          return true;
        }

        /**
         * Performs view solving and triggers lifecycle hooks (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        solveAsync(fCallback) {
          let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : null;
          if (!tmpCallback) {
            this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeSolveAsync.bind(this));
          tmpAnticipate.anticipate(this.onSolveAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterSolveAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} solveAsync() complete.`);
            }
            this.lastSolvedTimestamp = this.pict.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * Lifecycle hook that triggers after the view is solved.
         */
        onAfterSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterSolve:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after the view is solved (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onAfterSolveAsync(fCallback) {
          this.onAfterSolve();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Marshal From View                        */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before data is marshaled from the view.
         *
         * @return {boolean} - True if the operation was successful, false otherwise.
         */
        onBeforeMarshalFromView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeMarshalFromView:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before data is marshaled from the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onBeforeMarshalFromViewAsync(fCallback) {
          this.onBeforeMarshalFromView();
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers when data is marshaled from the view.
         */
        onMarshalFromView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onMarshalFromView:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers when data is marshaled from the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onMarshalFromViewAsync(fCallback) {
          this.onMarshalFromView();
          return fCallback();
        }

        /**
         * Marshals data from the view.
         *
         * @return {boolean} - True if the operation was successful, false otherwise.
         */
        marshalFromView() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);
          }
          this.onBeforeMarshalFromView();
          this.onMarshalFromView();
          this.onAfterMarshalFromView();
          this.lastMarshalFromViewTimestamp = this.pict.log.getTimeStamp();
          return true;
        }

        /**
         * Marshals data from the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        marshalFromViewAsync(fCallback) {
          let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : null;
          if (!tmpCallback) {
            this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeMarshalFromViewAsync.bind(this));
          tmpAnticipate.anticipate(this.onMarshalFromViewAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterMarshalFromViewAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} marshalFromViewAsync() complete.`);
            }
            this.lastMarshalFromViewTimestamp = this.pict.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * Lifecycle hook that triggers after data is marshaled from the view.
         */
        onAfterMarshalFromView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterMarshalFromView:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after data is marshaled from the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onAfterMarshalFromViewAsync(fCallback) {
          this.onAfterMarshalFromView();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Marshal To View                          */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before data is marshaled into the view.
         */
        onBeforeMarshalToView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeMarshalToView:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before data is marshaled into the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onBeforeMarshalToViewAsync(fCallback) {
          this.onBeforeMarshalToView();
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers when data is marshaled into the view.
         */
        onMarshalToView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onMarshalToView:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers when data is marshaled into the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onMarshalToViewAsync(fCallback) {
          this.onMarshalToView();
          return fCallback();
        }

        /**
         * Marshals data into the view.
         *
         * @return {boolean} - True if the operation was successful, false otherwise.
         */
        marshalToView() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);
          }
          this.onBeforeMarshalToView();
          this.onMarshalToView();
          this.onAfterMarshalToView();
          this.lastMarshalToViewTimestamp = this.pict.log.getTimeStamp();
          return true;
        }

        /**
         * Marshals data into the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        marshalToViewAsync(fCallback) {
          let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : null;
          if (!tmpCallback) {
            this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
            tmpCallback = pError => {
              if (pError) {
                this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewAsync Auto Callback Error: ${pError}`, pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeMarshalToViewAsync.bind(this));
          tmpAnticipate.anticipate(this.onMarshalToViewAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterMarshalToViewAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} marshalToViewAsync() complete.`);
            }
            this.lastMarshalToViewTimestamp = this.pict.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * Lifecycle hook that triggers after data is marshaled into the view.
         */
        onAfterMarshalToView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterMarshalToView:`);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after data is marshaled into the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onAfterMarshalToViewAsync(fCallback) {
          this.onAfterMarshalToView();
          return fCallback();
        }

        /** @return {boolean} - True if the object is a PictView. */
        get isPictView() {
          return true;
        }
      }
      module.exports = PictView;
    }, {
      "../package.json": 7,
      "fable-serviceproviderbase": 2
    }],
    9: [function (require, module, exports) {
      module.exports = {
        "Name": "Retold Facto",
        "Hash": "Facto",
        "MainViewportViewIdentifier": "Facto-Layout",
        "MainViewportDestinationAddress": "#Facto-Application-Container",
        "MainViewportDefaultDataAddress": "AppData.Facto",
        "pict_configuration": {
          "Product": "Facto"
        },
        "AutoRenderMainViewportViewAfterInitialize": false
      };
    }, {}],
    10: [function (require, module, exports) {
      const libPictApplication = require('pict-application');
      const libProvider = require('./providers/Pict-Provider-Facto.js');
      const libViewLayout = require('./views/PictView-Facto-Layout.js');
      const libViewSources = require('./views/PictView-Facto-Sources.js');
      const libViewRecords = require('./views/PictView-Facto-Records.js');
      const libViewDatasets = require('./views/PictView-Facto-Datasets.js');
      const libViewIngest = require('./views/PictView-Facto-Ingest.js');
      const libViewProjections = require('./views/PictView-Facto-Projections.js');
      const libViewCatalog = require('./views/PictView-Facto-Catalog.js');
      class FactoApplication extends libPictApplication {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);

          // Register provider
          this.pict.addProvider('Facto', libProvider.default_configuration, libProvider);

          // Register views
          this.pict.addView('Facto-Layout', libViewLayout.default_configuration, libViewLayout);
          this.pict.addView('Facto-Sources', libViewSources.default_configuration, libViewSources);
          this.pict.addView('Facto-Records', libViewRecords.default_configuration, libViewRecords);
          this.pict.addView('Facto-Datasets', libViewDatasets.default_configuration, libViewDatasets);
          this.pict.addView('Facto-Ingest', libViewIngest.default_configuration, libViewIngest);
          this.pict.addView('Facto-Projections', libViewProjections.default_configuration, libViewProjections);
          this.pict.addView('Facto-Catalog', libViewCatalog.default_configuration, libViewCatalog);
        }
        onAfterInitializeAsync(fCallback) {
          // Centralized application state
          this.pict.AppData.Facto = {
            CatalogEntries: [],
            Sources: [],
            Datasets: [],
            Records: [],
            IngestJobs: [],
            SelectedSource: null,
            SelectedDataset: null,
            RecordPage: 0,
            RecordPageSize: 50
          };

          // Make pict available for inline onclick handlers
          window.pict = this.pict;

          // Render layout (which cascades child view renders)
          this.pict.views['Facto-Layout'].render();
          return fCallback();
        }
      }
      module.exports = FactoApplication;
      module.exports.default_configuration = require('./Pict-Application-Facto-Configuration.json');
    }, {
      "./Pict-Application-Facto-Configuration.json": 9,
      "./providers/Pict-Provider-Facto.js": 12,
      "./views/PictView-Facto-Catalog.js": 13,
      "./views/PictView-Facto-Datasets.js": 14,
      "./views/PictView-Facto-Ingest.js": 15,
      "./views/PictView-Facto-Layout.js": 16,
      "./views/PictView-Facto-Projections.js": 17,
      "./views/PictView-Facto-Records.js": 18,
      "./views/PictView-Facto-Sources.js": 19,
      "pict-application": 4
    }],
    11: [function (require, module, exports) {
      module.exports = {
        FactoApplication: require('./Pict-Application-Facto.js')
      };
      if (typeof window !== 'undefined') {
        window.FactoApplication = module.exports.FactoApplication;
      }
    }, {
      "./Pict-Application-Facto.js": 10
    }],
    12: [function (require, module, exports) {
      const libPictProvider = require('pict-provider');
      class FactoProvider extends libPictProvider {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);
        }

        // ================================================================
        // API Helper
        // ================================================================

        api(pMethod, pPath, pBody) {
          let tmpOpts = {
            method: pMethod,
            headers: {}
          };
          if (pBody) {
            tmpOpts.headers['Content-Type'] = 'application/json';
            tmpOpts.body = JSON.stringify(pBody);
          }
          return fetch(pPath, tmpOpts).then(function (pResponse) {
            return pResponse.text().then(function (pText) {
              let tmpData;
              try {
                tmpData = JSON.parse(pText);
              } catch (pParseError) {
                return {
                  Error: 'HTTP ' + pResponse.status + ' (non-JSON): ' + pText.substring(0, 200)
                };
              }
              // Translate Restify error format {code, message} to {Error}
              if (!pResponse.ok && tmpData && tmpData.code && !tmpData.Error) {
                tmpData.Error = tmpData.code + ': ' + (tmpData.message || 'HTTP ' + pResponse.status);
              }
              return tmpData;
            });
          }).catch(function (pError) {
            return {
              Error: pError.message || 'Network error'
            };
          });
        }
        setStatus(pElementId, pMessage, pType) {
          let tmpEl = document.getElementById(pElementId);
          if (!tmpEl) return;
          tmpEl.className = 'status ' + (pType || 'info');
          tmpEl.textContent = pMessage;
          tmpEl.style.display = 'block';
        }
        clearStatus(pElementId) {
          let tmpEl = document.getElementById(pElementId);
          if (!tmpEl) return;
          tmpEl.style.display = 'none';
          tmpEl.textContent = '';
        }

        // ================================================================
        // Catalog Operations
        // ================================================================

        loadCatalogEntries() {
          return this.api('GET', '/facto/catalog/entries').then(pResponse => {
            this.pict.AppData.Facto.CatalogEntries = pResponse && pResponse.Entries ? pResponse.Entries : [];
          });
        }
        searchCatalog(pQuery) {
          return this.api('GET', '/facto/catalog/search?q=' + encodeURIComponent(pQuery)).then(pResponse => {
            return pResponse;
          });
        }
        createCatalogEntry(pData) {
          return this.api('POST', '/facto/catalog/entry', pData).then(pResponse => {
            return pResponse;
          });
        }
        deleteCatalogEntry(pIDEntry) {
          return this.api('DELETE', '/facto/catalog/entry/' + pIDEntry).then(pResponse => {
            return pResponse;
          });
        }
        loadCatalogEntryDatasets(pIDEntry) {
          return this.api('GET', '/facto/catalog/entry/' + pIDEntry + '/datasets').then(pResponse => {
            return pResponse;
          });
        }
        addCatalogDataset(pIDEntry, pData) {
          return this.api('POST', '/facto/catalog/entry/' + pIDEntry + '/dataset', pData).then(pResponse => {
            return pResponse;
          });
        }
        provisionCatalogDataset(pIDCatalogDataset) {
          return this.api('POST', '/facto/catalog/dataset/' + pIDCatalogDataset + '/provision').then(pResponse => {
            return pResponse;
          });
        }
        fetchCatalogDataset(pIDCatalogDataset) {
          return this.api('POST', '/facto/catalog/dataset/' + pIDCatalogDataset + '/fetch').then(pResponse => {
            return pResponse;
          });
        }
        importCatalog(pEntries) {
          return this.api('POST', '/facto/catalog/import', pEntries).then(pResponse => {
            return pResponse;
          });
        }
        exportCatalog() {
          return this.api('GET', '/facto/catalog/export').then(pResponse => {
            return pResponse;
          });
        }

        // ================================================================
        // Source Operations
        // ================================================================

        loadSources() {
          return this.api('GET', '/1.0/Sources/0/100').then(pResponse => {
            this.pict.AppData.Facto.Sources = pResponse || [];
          });
        }
        loadActiveSources() {
          return this.api('GET', '/facto/sources/active').then(pResponse => {
            return pResponse;
          });
        }
        createSource(pSourceData) {
          return this.api('POST', '/1.0/Source', pSourceData).then(pResponse => {
            return pResponse;
          });
        }
        activateSource(pIDSource) {
          return this.api('PUT', `/facto/source/${pIDSource}/activate`).then(pResponse => {
            return pResponse;
          });
        }
        deactivateSource(pIDSource) {
          return this.api('PUT', `/facto/source/${pIDSource}/deactivate`).then(pResponse => {
            return pResponse;
          });
        }
        loadSourceSummary(pIDSource) {
          return this.api('GET', `/facto/source/${pIDSource}/summary`).then(pResponse => {
            return pResponse;
          });
        }

        // ================================================================
        // Dataset Operations
        // ================================================================

        loadDatasets() {
          return this.api('GET', '/1.0/Datasets/0/100').then(pResponse => {
            this.pict.AppData.Facto.Datasets = pResponse || [];
          });
        }
        createDataset(pDatasetData) {
          return this.api('POST', '/1.0/Dataset', pDatasetData).then(pResponse => {
            return pResponse;
          });
        }
        loadDatasetStats(pIDDataset) {
          return this.api('GET', `/facto/dataset/${pIDDataset}/stats`).then(pResponse => {
            return pResponse;
          });
        }
        loadDatasetSources(pIDDataset) {
          return this.api('GET', `/facto/dataset/${pIDDataset}/sources`).then(pResponse => {
            return pResponse;
          });
        }
        linkDatasetSource(pIDDataset, pIDSource, pReliabilityWeight) {
          return this.api('POST', `/facto/dataset/${pIDDataset}/source`, {
            IDSource: pIDSource,
            ReliabilityWeight: pReliabilityWeight || 1.0
          }).then(pResponse => {
            return pResponse;
          });
        }
        loadDatasetRecords(pIDDataset, pBegin, pCap) {
          return this.api('GET', `/facto/dataset/${pIDDataset}/records/${pBegin || 0}/${pCap || 50}`).then(pResponse => {
            return pResponse;
          });
        }

        // ================================================================
        // Record Operations
        // ================================================================

        loadRecords(pPage) {
          let tmpPageSize = this.pict.AppData.Facto.RecordPageSize;
          let tmpBegin = (pPage || 0) * tmpPageSize;
          return this.api('GET', `/1.0/Records/${tmpBegin}/${tmpPageSize}`).then(pResponse => {
            this.pict.AppData.Facto.Records = pResponse || [];
          });
        }
        ingestRecords(pRecords, pIDDataset, pIDSource) {
          return this.api('POST', '/facto/record/ingest', {
            Records: pRecords,
            IDDataset: pIDDataset,
            IDSource: pIDSource
          }).then(pResponse => {
            return pResponse;
          });
        }
        loadRecordCertainty(pIDRecord) {
          return this.api('GET', `/facto/record/${pIDRecord}/certainty`).then(pResponse => {
            return pResponse;
          });
        }
        addRecordCertainty(pIDRecord, pCertaintyValue, pDimension, pJustification) {
          return this.api('POST', `/facto/record/${pIDRecord}/certainty`, {
            CertaintyValue: pCertaintyValue,
            Dimension: pDimension || 'overall',
            Justification: pJustification || ''
          }).then(pResponse => {
            return pResponse;
          });
        }
        loadRecordVersions(pIDRecord) {
          return this.api('GET', `/facto/record/${pIDRecord}/versions`).then(pResponse => {
            return pResponse;
          });
        }

        // ================================================================
        // Ingest Job Operations
        // ================================================================

        loadIngestJobs() {
          return this.api('GET', '/facto/ingest/jobs').then(pResponse => {
            this.pict.AppData.Facto.IngestJobs = pResponse && pResponse.Jobs ? pResponse.Jobs : [];
          });
        }
        createIngestJob(pIDSource, pIDDataset, pConfiguration) {
          return this.api('POST', '/facto/ingest/job', {
            IDSource: pIDSource,
            IDDataset: pIDDataset,
            Configuration: pConfiguration || {}
          }).then(pResponse => {
            return pResponse;
          });
        }
        startIngestJob(pIDIngestJob) {
          return this.api('PUT', `/facto/ingest/job/${pIDIngestJob}/start`).then(pResponse => {
            return pResponse;
          });
        }
        completeIngestJob(pIDIngestJob, pCounters, pStatus) {
          let tmpBody = Object.assign({}, pCounters || {});
          if (pStatus) {
            tmpBody.Status = pStatus;
          }
          return this.api('PUT', `/facto/ingest/job/${pIDIngestJob}/complete`, tmpBody).then(pResponse => {
            return pResponse;
          });
        }
        loadIngestJobDetails(pIDIngestJob) {
          return this.api('GET', `/facto/ingest/job/${pIDIngestJob}`).then(pResponse => {
            return pResponse;
          });
        }

        // ================================================================
        // Projection Operations
        // ================================================================

        loadProjections() {
          return this.api('GET', '/facto/projections').then(pResponse => {
            return pResponse;
          });
        }
        loadDatasetsByType(pType) {
          return this.api('GET', `/facto/datasets/by-type/${pType}`).then(pResponse => {
            return pResponse;
          });
        }
        queryRecords(pParams) {
          return this.api('POST', '/facto/projections/query', pParams).then(pResponse => {
            return pResponse;
          });
        }
        aggregateRecords(pParams) {
          return this.api('POST', '/facto/projections/aggregate', pParams).then(pResponse => {
            return pResponse;
          });
        }
        queryCertainty(pParams) {
          return this.api('POST', '/facto/projections/certainty', pParams).then(pResponse => {
            return pResponse;
          });
        }
        compareDatasets(pDatasetIDs) {
          return this.api('POST', '/facto/projections/compare', {
            DatasetIDs: pDatasetIDs
          }).then(pResponse => {
            return pResponse;
          });
        }
        loadProjectionSummary() {
          return this.api('GET', '/facto/projections/summary').then(pResponse => {
            return pResponse;
          });
        }
        ingestFileContent(pIDDataset, pIDSource, pContent, pFormat, pType) {
          return this.api('POST', '/facto/ingest/file', {
            IDDataset: pIDDataset || 0,
            IDSource: pIDSource || 0,
            Content: pContent,
            Format: pFormat || 'Auto',
            Type: pType || 'data'
          }).then(pResponse => {
            return pResponse;
          });
        }
      }
      module.exports = FactoProvider;
      module.exports.default_configuration = {
        ProviderIdentifier: 'Facto',
        AutoInitialize: true
      };
    }, {
      "pict-provider": 6
    }],
    13: [function (require, module, exports) {
      const libPictView = require('pict-view');
      class FactoCatalogView extends libPictView {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);
        }
        onAfterRender() {
          // Load catalog entries from API on first render
          this.pict.providers.Facto.loadCatalogEntries().then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error loading catalog: ' + pError.message, 'error');
          });
        }
        refreshList() {
          let tmpContainer = document.getElementById('facto-catalog-list');
          if (!tmpContainer) return;
          let tmpEntries = this.pict.AppData.Facto.CatalogEntries;
          if (!tmpEntries || tmpEntries.length === 0) {
            tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No catalog entries yet. Add sources to your research catalog.</p>';
            return;
          }
          let tmpHtml = '<table><thead><tr><th>ID</th><th>Agency</th><th>Name</th><th>Type</th><th>Category</th><th>Region</th><th>Verified</th><th>Actions</th></tr></thead><tbody>';
          for (let i = 0; i < tmpEntries.length; i++) {
            let tmpEntry = tmpEntries[i];
            let tmpVerified = tmpEntry.Verified ? '<span style="color:#28a745;">&#10003;</span>' : '<span style="color:#ccc;">&#10007;</span>';
            tmpHtml += '<tr>';
            tmpHtml += '<td>' + (tmpEntry.IDSourceCatalogEntry || '') + '</td>';
            tmpHtml += '<td>' + (tmpEntry.Agency || '') + '</td>';
            tmpHtml += '<td>' + (tmpEntry.Name || '') + '</td>';
            tmpHtml += '<td>' + (tmpEntry.Type || '') + '</td>';
            tmpHtml += '<td>' + (tmpEntry.Category || '') + '</td>';
            tmpHtml += '<td>' + (tmpEntry.Region || '') + '</td>';
            tmpHtml += '<td style="text-align:center;">' + tmpVerified + '</td>';
            tmpHtml += '<td>';
            tmpHtml += '<button class="primary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].viewEntry(' + tmpEntry.IDSourceCatalogEntry + ')">Datasets</button> ';
            tmpHtml += '<button class="danger" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].deleteEntry(' + tmpEntry.IDSourceCatalogEntry + ')">Delete</button>';
            tmpHtml += '</td>';
            tmpHtml += '</tr>';
          }
          tmpHtml += '</tbody></table>';
          tmpContainer.innerHTML = tmpHtml;
        }
        searchCatalog() {
          let tmpQuery = (document.getElementById('facto-catalog-search') || {}).value || '';
          if (!tmpQuery) {
            // Reload all entries
            this.pict.providers.Facto.loadCatalogEntries().then(() => {
              this.refreshList();
            });
            return;
          }
          this.pict.providers.Facto.searchCatalog(tmpQuery).then(pResponse => {
            this.pict.AppData.Facto.CatalogEntries = pResponse && pResponse.Entries ? pResponse.Entries : [];
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Search error: ' + pError.message, 'error');
          });
        }
        addEntry() {
          let tmpAgency = (document.getElementById('facto-catalog-agency') || {}).value || '';
          let tmpName = (document.getElementById('facto-catalog-name') || {}).value || '';
          let tmpType = (document.getElementById('facto-catalog-type') || {}).value || '';
          let tmpURL = (document.getElementById('facto-catalog-url') || {}).value || '';
          let tmpProtocol = (document.getElementById('facto-catalog-protocol') || {}).value || '';
          let tmpCategory = (document.getElementById('facto-catalog-category') || {}).value || '';
          let tmpRegion = (document.getElementById('facto-catalog-region') || {}).value || '';
          let tmpUpdateFrequency = (document.getElementById('facto-catalog-frequency') || {}).value || '';
          let tmpDescription = (document.getElementById('facto-catalog-description') || {}).value || '';
          if (!tmpAgency && !tmpName) {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Agency or Name is required', 'warn');
            return;
          }
          this.pict.providers.Facto.createCatalogEntry({
            Agency: tmpAgency,
            Name: tmpName,
            Type: tmpType,
            URL: tmpURL,
            Protocol: tmpProtocol,
            Category: tmpCategory,
            Region: tmpRegion,
            UpdateFrequency: tmpUpdateFrequency,
            Description: tmpDescription
          }).then(pResponse => {
            if (pResponse && pResponse.Success) {
              this.pict.providers.Facto.setStatus('facto-catalog-status', 'Catalog entry created: ' + (tmpAgency || tmpName), 'ok');
              // Clear form
              let tmpFields = ['agency', 'name', 'url', 'description'];
              for (let i = 0; i < tmpFields.length; i++) {
                let tmpEl = document.getElementById('facto-catalog-' + tmpFields[i]);
                if (tmpEl) tmpEl.value = '';
              }
              // Reload list
              return this.pict.providers.Facto.loadCatalogEntries();
            } else {
              this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + (pResponse && pResponse.Error || 'Unknown error'), 'error');
            }
          }).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
          });
        }
        deleteEntry(pIDEntry) {
          if (!confirm('Remove this catalog entry?')) return;
          this.pict.providers.Facto.deleteCatalogEntry(pIDEntry).then(() => {
            return this.pict.providers.Facto.loadCatalogEntries();
          }).then(() => {
            this.refreshList();
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Entry removed', 'ok');
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
          });
        }
        viewEntry(pIDEntry) {
          let tmpDetailContainer = document.getElementById('facto-catalog-detail');
          if (!tmpDetailContainer) return;
          this.pict.providers.Facto.loadCatalogEntryDatasets(pIDEntry).then(pResponse => {
            let tmpDatasets = pResponse && pResponse.Datasets ? pResponse.Datasets : [];
            let tmpHtml = '<h3 style="margin-bottom:8px; font-size:1em; color:#444;">Dataset Definitions for Entry #' + pIDEntry + '</h3>';
            if (tmpDatasets.length === 0) {
              tmpHtml += '<p style="color:#888; font-style:italic; margin-bottom:8px;">No dataset definitions yet.</p>';
            } else {
              tmpHtml += '<table><thead><tr><th>ID</th><th>Name</th><th>Format</th><th>Endpoint URL</th><th>Version Policy</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
              for (let i = 0; i < tmpDatasets.length; i++) {
                let tmpDS = tmpDatasets[i];
                let tmpStatusLabel = tmpDS.Provisioned ? '<span style="color:#28a745;">Provisioned (Source #' + tmpDS.IDSource + ', Dataset #' + tmpDS.IDDataset + ')</span>' : '<span style="color:#888;">Not provisioned</span>';
                let tmpActionBtn = '';
                if (tmpDS.Provisioned) {
                  tmpActionBtn = '<button class="primary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].fetchDataset(' + tmpDS.IDCatalogDatasetDefinition + ', ' + pIDEntry + ')">Fetch</button>';
                } else {
                  tmpActionBtn = '<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].provisionDataset(' + tmpDS.IDCatalogDatasetDefinition + ', ' + pIDEntry + ')">Provision</button>';
                }
                tmpHtml += '<tr>';
                tmpHtml += '<td>' + (tmpDS.IDCatalogDatasetDefinition || '') + '</td>';
                tmpHtml += '<td>' + (tmpDS.Name || '') + '</td>';
                tmpHtml += '<td>' + (tmpDS.Format || '') + '</td>';
                tmpHtml += '<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpDS.EndpointURL || '') + '</td>';
                tmpHtml += '<td>' + (tmpDS.VersionPolicy || 'Append') + '</td>';
                tmpHtml += '<td>' + tmpStatusLabel + '</td>';
                tmpHtml += '<td>' + tmpActionBtn + '</td>';
                tmpHtml += '</tr>';
              }
              tmpHtml += '</tbody></table>';
            }

            // Add dataset definition form
            tmpHtml += '<h4 style="margin-top:12px; margin-bottom:8px; font-size:0.95em; color:#555;">Add Dataset Definition</h4>';
            tmpHtml += '<div class="inline-group">';
            tmpHtml += '<div><label for="facto-catds-name">Name</label><input type="text" id="facto-catds-name" placeholder="e.g. Monthly Earthquake Feed"></div>';
            tmpHtml += '<div><label for="facto-catds-format">Format</label>';
            tmpHtml += '<select id="facto-catds-format"><option value="csv">CSV</option><option value="json">JSON</option><option value="xml">XML</option><option value="geojson">GeoJSON</option><option value="other">Other</option></select></div>';
            tmpHtml += '</div>';
            tmpHtml += '<div class="inline-group">';
            tmpHtml += '<div><label for="facto-catds-endpoint">Endpoint URL</label><input type="text" id="facto-catds-endpoint" placeholder="https://api.example.gov/data.csv"></div>';
            tmpHtml += '<div><label for="facto-catds-versionpolicy">Version Policy</label>';
            tmpHtml += '<select id="facto-catds-versionpolicy"><option value="Append">Append</option><option value="Replace">Replace</option></select></div>';
            tmpHtml += '</div>';
            tmpHtml += '<div><label for="facto-catds-description">Description</label><input type="text" id="facto-catds-description" placeholder="Description of the dataset"></div>';
            tmpHtml += '<button class="primary" onclick="pict.views[\'Facto-Catalog\'].addDatasetDefinition(' + pIDEntry + ')">Add Dataset Definition</button>';
            tmpHtml += '<button class="secondary" onclick="document.getElementById(\'facto-catalog-detail\').innerHTML=\'\';">Close</button>';
            tmpDetailContainer.innerHTML = tmpHtml;
          }).catch(pError => {
            tmpDetailContainer.innerHTML = '<p style="color:#dc3545;">Error loading datasets: ' + pError.message + '</p>';
          });
        }
        addDatasetDefinition(pIDEntry) {
          let tmpName = (document.getElementById('facto-catds-name') || {}).value || '';
          let tmpFormat = (document.getElementById('facto-catds-format') || {}).value || '';
          let tmpEndpointURL = (document.getElementById('facto-catds-endpoint') || {}).value || '';
          let tmpVersionPolicy = (document.getElementById('facto-catds-versionpolicy') || {}).value || 'Append';
          let tmpDescription = (document.getElementById('facto-catds-description') || {}).value || '';
          if (!tmpName) {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Dataset name is required', 'warn');
            return;
          }
          this.pict.providers.Facto.addCatalogDataset(pIDEntry, {
            Name: tmpName,
            Format: tmpFormat,
            EndpointURL: tmpEndpointURL,
            VersionPolicy: tmpVersionPolicy,
            Description: tmpDescription
          }).then(pResponse => {
            if (pResponse && pResponse.Success) {
              this.pict.providers.Facto.setStatus('facto-catalog-status', 'Dataset definition added: ' + tmpName, 'ok');
              this.viewEntry(pIDEntry);
            } else {
              this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + (pResponse && pResponse.Error || 'Unknown error'), 'error');
            }
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
          });
        }
        provisionDataset(pIDCatalogDataset, pIDEntry) {
          this.pict.providers.Facto.setStatus('facto-catalog-status', 'Provisioning...', 'info');
          this.pict.providers.Facto.provisionCatalogDataset(pIDCatalogDataset).then(pResponse => {
            if (pResponse && pResponse.Success) {
              let tmpMsg = 'Provisioned! Source #' + pResponse.Source.IDSource + ', Dataset #' + pResponse.Dataset.IDDataset;
              this.pict.providers.Facto.setStatus('facto-catalog-status', tmpMsg, 'ok');
              this.viewEntry(pIDEntry);
              // Refresh sources and datasets views if they exist
              if (this.pict.views['Facto-Sources']) {
                this.pict.providers.Facto.loadSources().then(() => {
                  this.pict.views['Facto-Sources'].refreshList();
                });
              }
              if (this.pict.views['Facto-Datasets']) {
                this.pict.providers.Facto.loadDatasets().then(() => {
                  this.pict.views['Facto-Datasets'].refreshList();
                });
              }
            } else {
              this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + (pResponse && pResponse.Error || 'Unknown error'), 'error');
            }
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
          });
        }
        fetchDataset(pIDCatalogDataset, pIDEntry) {
          this.pict.providers.Facto.setStatus('facto-catalog-status', 'Fetching data from endpoint...', 'info');
          this.pict.providers.Facto.fetchCatalogDataset(pIDCatalogDataset).then(pResponse => {
            if (pResponse && pResponse.Success) {
              let tmpMsg = 'Fetched! ' + pResponse.Ingested + ' records ingested (v' + pResponse.DatasetVersion + ', ' + pResponse.Format + ')';
              if (pResponse.IsDuplicate) {
                tmpMsg += ' [duplicate content detected]';
              }
              this.pict.providers.Facto.setStatus('facto-catalog-status', tmpMsg, 'ok');
              this.viewEntry(pIDEntry);
              // Refresh records view if it exists
              if (this.pict.views['Facto-Records']) {
                this.pict.providers.Facto.loadRecords().then(() => {
                  this.pict.views['Facto-Records'].refreshList();
                });
              }
            } else {
              this.pict.providers.Facto.setStatus('facto-catalog-status', 'Fetch error: ' + (pResponse && pResponse.Error || 'Unknown error'), 'error');
            }
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Fetch error: ' + pError.message, 'error');
          });
        }
        importCatalog() {
          let tmpTextArea = document.getElementById('facto-catalog-import-json');
          if (!tmpTextArea || !tmpTextArea.value) {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Paste JSON to import', 'warn');
            return;
          }
          let tmpEntries;
          try {
            tmpEntries = JSON.parse(tmpTextArea.value);
          } catch (pParseError) {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Invalid JSON: ' + pParseError.message, 'error');
            return;
          }
          this.pict.providers.Facto.importCatalog(tmpEntries).then(pResponse => {
            if (pResponse && pResponse.Success) {
              this.pict.providers.Facto.setStatus('facto-catalog-status', 'Imported ' + pResponse.EntriesCreated + ' entries with ' + pResponse.DatasetsCreated + ' datasets', 'ok');
              tmpTextArea.value = '';
              return this.pict.providers.Facto.loadCatalogEntries();
            } else {
              let tmpError = pResponse && pResponse.Error || 'Unknown';
              if (tmpError === 'Unknown') {
                try {
                  tmpError = 'Unexpected response: ' + JSON.stringify(pResponse).substring(0, 300);
                } catch (e) {/* ignore */}
              }
              this.pict.providers.Facto.setStatus('facto-catalog-status', 'Import error: ' + tmpError, 'error');
            }
          }).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
          });
        }
        exportCatalog() {
          this.pict.providers.Facto.exportCatalog().then(pResponse => {
            let tmpTextArea = document.getElementById('facto-catalog-import-json');
            if (tmpTextArea) {
              tmpTextArea.value = JSON.stringify(pResponse && pResponse.Entries ? pResponse.Entries : pResponse, null, 2);
            }
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Catalog exported to JSON text area', 'ok');
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
          });
        }
      }
      module.exports = FactoCatalogView;
      module.exports.default_configuration = {
        ViewIdentifier: 'Facto-Catalog',
        DefaultRenderable: 'Facto-Catalog',
        DefaultDestinationAddress: '#Facto-Section-Catalog',
        Templates: [{
          Hash: 'Facto-Catalog',
          Template: /*html*/`
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
`
        }],
        Renderables: [{
          RenderableHash: 'Facto-Catalog',
          TemplateHash: 'Facto-Catalog',
          DestinationAddress: '#Facto-Section-Catalog'
        }]
      };
    }, {
      "pict-view": 8
    }],
    14: [function (require, module, exports) {
      const libPictView = require('pict-view');
      class FactoDatasetsView extends libPictView {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);
        }
        onAfterRender() {
          this.pict.providers.Facto.loadDatasets().then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-datasets-status', 'Error loading datasets: ' + pError.message, 'error');
          });
        }
        refreshList() {
          let tmpContainer = document.getElementById('facto-datasets-list');
          if (!tmpContainer) return;
          let tmpDatasets = this.pict.AppData.Facto.Datasets;
          if (!tmpDatasets || tmpDatasets.length === 0) {
            tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No datasets created yet.</p>';
            return;
          }
          let tmpBadgeClass = {
            Raw: 'badge-raw',
            Compositional: 'badge-compositional',
            Projection: 'badge-projection',
            Derived: 'badge-derived'
          };
          let tmpHtml = '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
          for (let i = 0; i < tmpDatasets.length; i++) {
            let tmpDataset = tmpDatasets[i];
            let tmpBadge = tmpBadgeClass[tmpDataset.Type] || 'badge-raw';
            tmpHtml += '<tr>';
            tmpHtml += '<td>' + (tmpDataset.IDDataset || '') + '</td>';
            tmpHtml += '<td>' + (tmpDataset.Name || '') + '</td>';
            tmpHtml += '<td><span class="badge ' + tmpBadge + '">' + (tmpDataset.Type || '') + '</span></td>';
            tmpHtml += '<td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpDataset.Description || '') + '</td>';
            tmpHtml += '<td><button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Datasets\'].viewStats(' + tmpDataset.IDDataset + ')">Stats</button></td>';
            tmpHtml += '</tr>';
          }
          tmpHtml += '</tbody></table>';
          tmpContainer.innerHTML = tmpHtml;
        }
        viewStats(pIDDataset) {
          this.pict.providers.Facto.loadDatasetStats(pIDDataset).then(pResponse => {
            let tmpMsg = 'Dataset: ' + (pResponse.Dataset ? pResponse.Dataset.Name : '#' + pIDDataset);
            tmpMsg += ' | Records: ' + (pResponse.RecordCount || 0);
            tmpMsg += ' | Linked Sources: ' + (pResponse.SourceCount || 0);
            this.pict.providers.Facto.setStatus('facto-datasets-status', tmpMsg, 'info');
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-datasets-status', 'Error: ' + pError.message, 'error');
          });
        }
        addDataset() {
          let tmpName = (document.getElementById('facto-dataset-name') || {}).value || '';
          let tmpType = (document.getElementById('facto-dataset-type') || {}).value || 'Raw';
          let tmpDescription = (document.getElementById('facto-dataset-desc') || {}).value || '';
          if (!tmpName) {
            this.pict.providers.Facto.setStatus('facto-datasets-status', 'Name is required', 'warn');
            return;
          }
          this.pict.providers.Facto.createDataset({
            Name: tmpName,
            Type: tmpType,
            Description: tmpDescription
          }).then(pResponse => {
            if (pResponse && pResponse.IDDataset) {
              this.pict.providers.Facto.setStatus('facto-datasets-status', 'Dataset created: ' + pResponse.Name, 'ok');
              if (document.getElementById('facto-dataset-name')) document.getElementById('facto-dataset-name').value = '';
              if (document.getElementById('facto-dataset-desc')) document.getElementById('facto-dataset-desc').value = '';
              return this.pict.providers.Facto.loadDatasets();
            } else {
              this.pict.providers.Facto.setStatus('facto-datasets-status', 'Error creating dataset', 'error');
            }
          }).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-datasets-status', 'Error: ' + pError.message, 'error');
          });
        }
      }
      module.exports = FactoDatasetsView;
      module.exports.default_configuration = {
        ViewIdentifier: 'Facto-Datasets',
        DefaultRenderable: 'Facto-Datasets',
        DefaultDestinationAddress: '#Facto-Section-Datasets',
        Templates: [{
          Hash: 'Facto-Datasets',
          Template: /*html*/`
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
`
        }],
        Renderables: [{
          RenderableHash: 'Facto-Datasets',
          TemplateHash: 'Facto-Datasets',
          DestinationAddress: '#Facto-Section-Datasets'
        }]
      };
    }, {
      "pict-view": 8
    }],
    15: [function (require, module, exports) {
      const libPictView = require('pict-view');
      class FactoIngestView extends libPictView {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);
        }
        onAfterRender() {
          this.pict.providers.Facto.loadIngestJobs().then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error loading jobs: ' + pError.message, 'error');
          });
        }
        refreshList() {
          let tmpContainer = document.getElementById('facto-ingest-list');
          if (!tmpContainer) return;
          let tmpJobs = this.pict.AppData.Facto.IngestJobs;
          if (!tmpJobs || tmpJobs.length === 0) {
            tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No ingest jobs yet.</p>';
            return;
          }
          let tmpStatusColors = {
            Pending: '#ffc107',
            Running: '#17a2b8',
            Completed: '#28a745',
            Failed: '#dc3545',
            Cancelled: '#6c757d'
          };
          let tmpHtml = '<table><thead><tr><th>ID</th><th>Status</th><th>Source</th><th>Dataset</th><th>Processed</th><th>Created</th><th>Errors</th><th>Start</th><th>Actions</th></tr></thead><tbody>';
          for (let i = 0; i < tmpJobs.length; i++) {
            let tmpJob = tmpJobs[i];
            let tmpColor = tmpStatusColors[tmpJob.Status] || '#888';
            tmpHtml += '<tr>';
            tmpHtml += '<td>' + (tmpJob.IDIngestJob || '') + '</td>';
            tmpHtml += '<td><span style="color:' + tmpColor + '; font-weight:600;">' + (tmpJob.Status || '') + '</span></td>';
            tmpHtml += '<td>' + (tmpJob.IDSource || '') + '</td>';
            tmpHtml += '<td>' + (tmpJob.IDDataset || '') + '</td>';
            tmpHtml += '<td>' + (tmpJob.RecordsProcessed || 0) + '</td>';
            tmpHtml += '<td>' + (tmpJob.RecordsCreated || 0) + '</td>';
            tmpHtml += '<td>' + (tmpJob.RecordsErrored || 0) + '</td>';
            tmpHtml += '<td>' + (tmpJob.StartDate || '-') + '</td>';
            tmpHtml += '<td>';
            if (tmpJob.Status === 'Pending') {
              tmpHtml += '<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Ingest\'].startJob(' + tmpJob.IDIngestJob + ')">Start</button>';
            }
            tmpHtml += '<button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Ingest\'].viewLog(' + tmpJob.IDIngestJob + ')">Log</button>';
            tmpHtml += '</td>';
            tmpHtml += '</tr>';
          }
          tmpHtml += '</tbody></table>';
          tmpContainer.innerHTML = tmpHtml;
        }
        startJob(pIDIngestJob) {
          this.pict.providers.Facto.startIngestJob(pIDIngestJob).then(() => {
            this.pict.providers.Facto.setStatus('facto-ingest-status', 'Job #' + pIDIngestJob + ' started', 'ok');
            return this.pict.providers.Facto.loadIngestJobs();
          }).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error: ' + pError.message, 'error');
          });
        }
        viewLog(pIDIngestJob) {
          this.pict.providers.Facto.loadIngestJobDetails(pIDIngestJob).then(pResponse => {
            if (pResponse && pResponse.Job) {
              let tmpLog = pResponse.Job.Log || '(empty)';
              let tmpLogContainer = document.getElementById('facto-ingest-log');
              if (tmpLogContainer) {
                tmpLogContainer.textContent = 'Job #' + pIDIngestJob + ' Log:\n' + tmpLog;
                tmpLogContainer.style.display = 'block';
              }
            }
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error: ' + pError.message, 'error');
          });
        }
        ingestPastedContent() {
          let tmpIDDataset = parseInt((document.getElementById('facto-ingest-paste-dataset') || {}).value, 10) || 0;
          let tmpIDSource = parseInt((document.getElementById('facto-ingest-paste-source') || {}).value, 10) || 0;
          let tmpFormat = (document.getElementById('facto-ingest-paste-format') || {}).value || 'Auto';
          let tmpType = (document.getElementById('facto-ingest-paste-type') || {}).value || 'data';
          let tmpContent = (document.getElementById('facto-ingest-paste-content') || {}).value || '';
          if (!tmpContent.trim()) {
            this.pict.providers.Facto.setStatus('facto-ingest-status', 'Content is required', 'warn');
            return;
          }
          this.pict.providers.Facto.setStatus('facto-ingest-status', 'Ingesting...', 'info');
          this.pict.providers.Facto.ingestFileContent(tmpIDDataset, tmpIDSource, tmpContent, tmpFormat, tmpType).then(pResponse => {
            if (pResponse && pResponse.Success) {
              this.pict.providers.Facto.setStatus('facto-ingest-status', 'Ingested ' + (pResponse.RecordsCreated || 0) + ' records', 'ok');
              if (document.getElementById('facto-ingest-paste-content')) {
                document.getElementById('facto-ingest-paste-content').value = '';
              }
            } else {
              this.pict.providers.Facto.setStatus('facto-ingest-status', 'Ingest error: ' + (pResponse && pResponse.Error || 'Unknown'), 'error');
            }
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error: ' + pError.message, 'error');
          });
        }
        createJob() {
          let tmpIDSource = parseInt((document.getElementById('facto-ingest-source') || {}).value, 10) || 0;
          let tmpIDDataset = parseInt((document.getElementById('facto-ingest-dataset') || {}).value, 10) || 0;
          if (!tmpIDSource || !tmpIDDataset) {
            this.pict.providers.Facto.setStatus('facto-ingest-status', 'Source ID and Dataset ID are required', 'warn');
            return;
          }
          this.pict.providers.Facto.createIngestJob(tmpIDSource, tmpIDDataset).then(pResponse => {
            if (pResponse && pResponse.Success) {
              this.pict.providers.Facto.setStatus('facto-ingest-status', 'Ingest job created: #' + pResponse.Job.IDIngestJob, 'ok');
              if (document.getElementById('facto-ingest-source')) document.getElementById('facto-ingest-source').value = '';
              if (document.getElementById('facto-ingest-dataset')) document.getElementById('facto-ingest-dataset').value = '';
              return this.pict.providers.Facto.loadIngestJobs();
            } else {
              this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error creating job', 'error');
            }
          }).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error: ' + pError.message, 'error');
          });
        }
      }
      module.exports = FactoIngestView;
      module.exports.default_configuration = {
        ViewIdentifier: 'Facto-Ingest',
        DefaultRenderable: 'Facto-Ingest',
        DefaultDestinationAddress: '#Facto-Section-Ingest',
        Templates: [{
          Hash: 'Facto-Ingest',
          Template: /*html*/`
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
`
        }],
        Renderables: [{
          RenderableHash: 'Facto-Ingest',
          TemplateHash: 'Facto-Ingest',
          DestinationAddress: '#Facto-Section-Ingest'
        }]
      };
    }, {
      "pict-view": 8
    }],
    16: [function (require, module, exports) {
      const libPictView = require('pict-view');
      class FactoLayoutView extends libPictView {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);
        }
        onAfterRender() {
          // Render all section views into their containers
          this.pict.views['Facto-Catalog'].render();
          this.pict.views['Facto-Sources'].render();
          this.pict.views['Facto-Datasets'].render();
          this.pict.views['Facto-Records'].render();
          this.pict.views['Facto-Ingest'].render();
          this.pict.views['Facto-Projections'].render();
          this.pict.CSSMap.injectCSS();
        }
        toggleSection(pSectionId) {
          let tmpCard = document.getElementById(pSectionId);
          if (!tmpCard) return;
          tmpCard.classList.toggle('open');
        }
        expandAllSections() {
          let tmpCards = document.querySelectorAll('.accordion-card');
          for (let i = 0; i < tmpCards.length; i++) {
            tmpCards[i].classList.add('open');
          }
        }
        collapseAllSections() {
          let tmpCards = document.querySelectorAll('.accordion-card');
          for (let i = 0; i < tmpCards.length; i++) {
            tmpCards[i].classList.remove('open');
          }
        }
      }
      module.exports = FactoLayoutView;
      module.exports.default_configuration = {
        ViewIdentifier: 'Facto-Layout',
        DefaultRenderable: 'Facto-Layout',
        DefaultDestinationAddress: '#Facto-Application-Container',
        CSS: /*css*/`
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
`,
        Templates: [{
          Hash: 'Facto-Layout',
          Template: /*html*/`
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
`
        }],
        Renderables: [{
          RenderableHash: 'Facto-Layout',
          TemplateHash: 'Facto-Layout',
          DestinationAddress: '#Facto-Application-Container'
        }]
      };
    }, {
      "pict-view": 8
    }],
    17: [function (require, module, exports) {
      const libPictView = require('pict-view');
      class FactoProjectionsView extends libPictView {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);
        }
        onAfterRender() {
          this.loadSummary();
        }
        loadSummary() {
          this.pict.providers.Facto.loadProjectionSummary().then(pResponse => {
            let tmpContainer = document.getElementById('facto-projections-summary');
            if (!tmpContainer || !pResponse) return;
            let tmpHtml = '<table><tbody>';
            tmpHtml += '<tr><td style="font-weight:600;">Sources</td><td>' + (pResponse.Sources || 0) + '</td>';
            tmpHtml += '<td style="font-weight:600;">Datasets</td><td>' + (pResponse.Datasets || 0) + '</td></tr>';
            tmpHtml += '<tr><td style="font-weight:600;">Records</td><td>' + (pResponse.Records || 0) + '</td>';
            tmpHtml += '<td style="font-weight:600;">Certainty Indices</td><td>' + (pResponse.CertaintyIndices || 0) + '</td></tr>';
            tmpHtml += '<tr><td style="font-weight:600;">Ingest Jobs</td><td>' + (pResponse.IngestJobs || 0) + '</td>';
            tmpHtml += '<td></td><td></td></tr>';
            if (pResponse.DatasetsByType) {
              tmpHtml += '<tr><td colspan="4" style="padding-top:12px; font-weight:600; border-bottom:2px solid #ddd;">Datasets by Type</td></tr>';
              tmpHtml += '<tr>';
              tmpHtml += '<td><span class="badge badge-raw">Raw</span></td><td>' + (pResponse.DatasetsByType.Raw || 0) + '</td>';
              tmpHtml += '<td><span class="badge badge-compositional">Compositional</span></td><td>' + (pResponse.DatasetsByType.Compositional || 0) + '</td>';
              tmpHtml += '</tr><tr>';
              tmpHtml += '<td><span class="badge badge-projection">Projection</span></td><td>' + (pResponse.DatasetsByType.Projection || 0) + '</td>';
              tmpHtml += '<td><span class="badge badge-derived">Derived</span></td><td>' + (pResponse.DatasetsByType.Derived || 0) + '</td>';
              tmpHtml += '</tr>';
            }
            tmpHtml += '</tbody></table>';
            tmpContainer.innerHTML = tmpHtml;
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-projections-status', 'Error loading summary: ' + pError.message, 'error');
          });
        }
        runQuery() {
          let tmpDatasetIDsRaw = (document.getElementById('facto-proj-dataset-ids') || {}).value || '';
          let tmpType = (document.getElementById('facto-proj-type') || {}).value || '';
          let tmpCertaintyThreshold = parseFloat((document.getElementById('facto-proj-certainty') || {}).value) || 0;
          let tmpTimeStart = (document.getElementById('facto-proj-time-start') || {}).value || '';
          let tmpTimeStop = (document.getElementById('facto-proj-time-stop') || {}).value || '';
          let tmpDatasetIDs = tmpDatasetIDsRaw.split(',').map(function (s) {
            return parseInt(s.trim(), 10);
          }).filter(function (n) {
            return !isNaN(n) && n > 0;
          });
          if (tmpDatasetIDs.length === 0) {
            this.pict.providers.Facto.setStatus('facto-projections-status', 'Enter at least one Dataset ID', 'warn');
            return;
          }
          let tmpParams = {
            DatasetIDs: tmpDatasetIDs,
            Begin: 0,
            Cap: 100
          };
          if (tmpType) tmpParams.Type = tmpType;
          if (tmpCertaintyThreshold > 0) tmpParams.CertaintyThreshold = tmpCertaintyThreshold;
          if (tmpTimeStart) tmpParams.TimeRangeStart = parseInt(tmpTimeStart, 10) || 0;
          if (tmpTimeStop) tmpParams.TimeRangeStop = parseInt(tmpTimeStop, 10) || 0;
          this.pict.providers.Facto.setStatus('facto-projections-status', 'Querying...', 'info');
          this.pict.providers.Facto.queryRecords(tmpParams).then(pResponse => {
            this.pict.providers.Facto.clearStatus('facto-projections-status');
            this.refreshResults(pResponse);
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-projections-status', 'Query error: ' + pError.message, 'error');
          });
        }
        runCompare() {
          let tmpDatasetIDsRaw = (document.getElementById('facto-proj-dataset-ids') || {}).value || '';
          let tmpDatasetIDs = tmpDatasetIDsRaw.split(',').map(function (s) {
            return parseInt(s.trim(), 10);
          }).filter(function (n) {
            return !isNaN(n) && n > 0;
          });
          if (tmpDatasetIDs.length === 0) {
            this.pict.providers.Facto.setStatus('facto-projections-status', 'Enter at least one Dataset ID', 'warn');
            return;
          }
          this.pict.providers.Facto.setStatus('facto-projections-status', 'Comparing...', 'info');
          this.pict.providers.Facto.compareDatasets(tmpDatasetIDs).then(pResponse => {
            this.pict.providers.Facto.clearStatus('facto-projections-status');
            let tmpContainer = document.getElementById('facto-projections-results');
            if (!tmpContainer || !pResponse || !pResponse.Datasets) return;
            let tmpHtml = '<h4 style="margin:12px 0 8px; font-size:0.95em;">Dataset Comparison</h4>';
            tmpHtml += '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Records</th><th>Sources</th></tr></thead><tbody>';
            for (let i = 0; i < pResponse.Datasets.length; i++) {
              let tmpDS = pResponse.Datasets[i];
              let tmpTypeLower = (tmpDS.Type || '').toLowerCase();
              tmpHtml += '<tr>';
              tmpHtml += '<td>' + (tmpDS.IDDataset || '') + '</td>';
              tmpHtml += '<td>' + (tmpDS.Name || '') + '</td>';
              tmpHtml += '<td><span class="badge badge-' + tmpTypeLower + '">' + (tmpDS.Type || '') + '</span></td>';
              tmpHtml += '<td>' + (tmpDS.RecordCount || 0) + '</td>';
              tmpHtml += '<td>' + (tmpDS.SourceCount || 0) + '</td>';
              tmpHtml += '</tr>';
            }
            tmpHtml += '</tbody></table>';
            tmpContainer.innerHTML = tmpHtml;
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-projections-status', 'Compare error: ' + pError.message, 'error');
          });
        }
        refreshResults(pResponse) {
          let tmpContainer = document.getElementById('facto-projections-results');
          if (!tmpContainer) return;
          if (!pResponse || !pResponse.Records || pResponse.Records.length === 0) {
            tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No records match the query.</p>';
            return;
          }
          let tmpHtml = '<h4 style="margin:12px 0 8px; font-size:0.95em;">Query Results (' + (pResponse.Count || pResponse.Records.length) + ' records)</h4>';
          tmpHtml += '<table><thead><tr><th>ID</th><th>Dataset</th><th>Source</th><th>Type</th><th>Version</th><th>Ingest Date</th><th>Content</th></tr></thead><tbody>';
          for (let i = 0; i < pResponse.Records.length; i++) {
            let tmpRecord = pResponse.Records[i];
            let tmpContent = tmpRecord.Content || '';
            if (tmpContent.length > 80) tmpContent = tmpContent.substring(0, 80) + '...';
            tmpHtml += '<tr>';
            tmpHtml += '<td>' + (tmpRecord.IDRecord || '') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.IDDataset || '') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.IDSource || '') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.Type || '') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.Version || 1) + '</td>';
            tmpHtml += '<td>' + (tmpRecord.IngestDate || '-') + '</td>';
            tmpHtml += '<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + tmpContent + '</td>';
            tmpHtml += '</tr>';
          }
          tmpHtml += '</tbody></table>';
          tmpContainer.innerHTML = tmpHtml;
        }
      }
      module.exports = FactoProjectionsView;
      module.exports.default_configuration = {
        ViewIdentifier: 'Facto-Projections',
        DefaultRenderable: 'Facto-Projections',
        DefaultDestinationAddress: '#Facto-Section-Projections',
        Templates: [{
          Hash: 'Facto-Projections',
          Template: /*html*/`
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
`
        }],
        Renderables: [{
          RenderableHash: 'Facto-Projections',
          TemplateHash: 'Facto-Projections',
          DestinationAddress: '#Facto-Section-Projections'
        }]
      };
    }, {
      "pict-view": 8
    }],
    18: [function (require, module, exports) {
      const libPictView = require('pict-view');
      class FactoRecordsView extends libPictView {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);
        }
        onAfterRender() {
          this.pict.providers.Facto.loadRecords(0).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-records-status', 'Error loading records: ' + pError.message, 'error');
          });
        }
        refreshList() {
          let tmpContainer = document.getElementById('facto-records-list');
          if (!tmpContainer) return;
          let tmpRecords = this.pict.AppData.Facto.Records;
          if (!tmpRecords || tmpRecords.length === 0) {
            tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No records ingested yet.</p>';
            return;
          }
          let tmpHtml = '<table><thead><tr><th>ID</th><th>Type</th><th>Dataset</th><th>Source</th><th>Version</th><th>Ingest Date</th><th>Content Preview</th><th>Actions</th></tr></thead><tbody>';
          for (let i = 0; i < tmpRecords.length; i++) {
            let tmpRecord = tmpRecords[i];
            let tmpPreview = (tmpRecord.Content || '').substring(0, 60);
            if ((tmpRecord.Content || '').length > 60) tmpPreview += '...';
            tmpHtml += '<tr>';
            tmpHtml += '<td>' + (tmpRecord.IDRecord || '') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.Type || '') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.IDDataset || '') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.IDSource || '') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.Version || '1') + '</td>';
            tmpHtml += '<td>' + (tmpRecord.IngestDate || '') + '</td>';
            tmpHtml += '<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:monospace; font-size:0.85em;">' + tmpPreview + '</td>';
            tmpHtml += '<td><button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Records\'].viewCertainty(' + tmpRecord.IDRecord + ')">Certainty</button></td>';
            tmpHtml += '</tr>';
          }
          tmpHtml += '</tbody></table>';

          // Pagination controls
          let tmpPage = this.pict.AppData.Facto.RecordPage || 0;
          tmpHtml += '<div style="margin-top:12px; display:flex; gap:8px; align-items:center;">';
          if (tmpPage > 0) {
            tmpHtml += '<button class="secondary" style="padding:4px 12px; font-size:0.85em;" onclick="pict.views[\'Facto-Records\'].changePage(' + (tmpPage - 1) + ')">&#9664; Previous</button>';
          }
          tmpHtml += '<span style="color:#888; font-size:0.85em;">Page ' + (tmpPage + 1) + '</span>';
          if (tmpRecords.length >= this.pict.AppData.Facto.RecordPageSize) {
            tmpHtml += '<button class="secondary" style="padding:4px 12px; font-size:0.85em;" onclick="pict.views[\'Facto-Records\'].changePage(' + (tmpPage + 1) + ')">Next &#9654;</button>';
          }
          tmpHtml += '</div>';
          tmpContainer.innerHTML = tmpHtml;
        }
        changePage(pPage) {
          this.pict.AppData.Facto.RecordPage = pPage;
          this.pict.providers.Facto.loadRecords(pPage).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-records-status', 'Error: ' + pError.message, 'error');
          });
        }
        viewCertainty(pIDRecord) {
          this.pict.providers.Facto.loadRecordCertainty(pIDRecord).then(pResponse => {
            if (!pResponse || !pResponse.CertaintyIndices || pResponse.CertaintyIndices.length === 0) {
              this.pict.providers.Facto.setStatus('facto-records-status', 'No certainty indices for record #' + pIDRecord, 'info');
              return;
            }
            let tmpParts = [];
            for (let i = 0; i < pResponse.CertaintyIndices.length; i++) {
              let tmpCI = pResponse.CertaintyIndices[i];
              tmpParts.push(tmpCI.Dimension + ': ' + tmpCI.CertaintyValue);
            }
            this.pict.providers.Facto.setStatus('facto-records-status', 'Record #' + pIDRecord + ' certainty: ' + tmpParts.join(', '), 'info');
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-records-status', 'Error: ' + pError.message, 'error');
          });
        }
      }
      module.exports = FactoRecordsView;
      module.exports.default_configuration = {
        ViewIdentifier: 'Facto-Records',
        DefaultRenderable: 'Facto-Records',
        DefaultDestinationAddress: '#Facto-Section-Records',
        Templates: [{
          Hash: 'Facto-Records',
          Template: /*html*/`
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
`
        }],
        Renderables: [{
          RenderableHash: 'Facto-Records',
          TemplateHash: 'Facto-Records',
          DestinationAddress: '#Facto-Section-Records'
        }]
      };
    }, {
      "pict-view": 8
    }],
    19: [function (require, module, exports) {
      const libPictView = require('pict-view');
      class FactoSourcesView extends libPictView {
        constructor(pFable, pOptions, pServiceHash) {
          super(pFable, pOptions, pServiceHash);
        }
        onAfterRender() {
          // Load sources from API on first render
          this.pict.providers.Facto.loadSources().then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-sources-status', 'Error loading sources: ' + pError.message, 'error');
          });
        }
        refreshList() {
          let tmpContainer = document.getElementById('facto-sources-list');
          if (!tmpContainer) return;
          let tmpSources = this.pict.AppData.Facto.Sources;
          if (!tmpSources || tmpSources.length === 0) {
            tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No sources registered yet.</p>';
            return;
          }
          let tmpHtml = '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>URL</th><th>Active</th><th>Actions</th></tr></thead><tbody>';
          for (let i = 0; i < tmpSources.length; i++) {
            let tmpSource = tmpSources[i];
            let tmpActiveLabel = tmpSource.Active ? '<span style="color:#28a745;">Active</span>' : '<span style="color:#888;">Inactive</span>';
            let tmpToggleBtn = tmpSource.Active ? '<button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Sources\'].toggleActive(' + tmpSource.IDSource + ', false)">Deactivate</button>' : '<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Sources\'].toggleActive(' + tmpSource.IDSource + ', true)">Activate</button>';
            tmpHtml += '<tr>';
            tmpHtml += '<td>' + (tmpSource.IDSource || '') + '</td>';
            tmpHtml += '<td>' + (tmpSource.Name || '') + '</td>';
            tmpHtml += '<td>' + (tmpSource.Type || '') + '</td>';
            tmpHtml += '<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpSource.URL || '') + '</td>';
            tmpHtml += '<td>' + tmpActiveLabel + '</td>';
            tmpHtml += '<td>' + tmpToggleBtn + '</td>';
            tmpHtml += '</tr>';
          }
          tmpHtml += '</tbody></table>';
          tmpContainer.innerHTML = tmpHtml;
        }
        toggleActive(pIDSource, pActivate) {
          let tmpPromise = pActivate ? this.pict.providers.Facto.activateSource(pIDSource) : this.pict.providers.Facto.deactivateSource(pIDSource);
          tmpPromise.then(() => {
            return this.pict.providers.Facto.loadSources();
          }).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-sources-status', 'Error: ' + pError.message, 'error');
          });
        }
        addSource() {
          let tmpName = (document.getElementById('facto-source-name') || {}).value || '';
          let tmpType = (document.getElementById('facto-source-type') || {}).value || '';
          let tmpURL = (document.getElementById('facto-source-url') || {}).value || '';
          let tmpProtocol = (document.getElementById('facto-source-protocol') || {}).value || '';
          if (!tmpName) {
            this.pict.providers.Facto.setStatus('facto-sources-status', 'Name is required', 'warn');
            return;
          }
          this.pict.providers.Facto.createSource({
            Name: tmpName,
            Type: tmpType,
            URL: tmpURL,
            Protocol: tmpProtocol,
            Active: 1
          }).then(pResponse => {
            if (pResponse && pResponse.IDSource) {
              this.pict.providers.Facto.setStatus('facto-sources-status', 'Source created: ' + pResponse.Name, 'ok');
              // Clear form
              if (document.getElementById('facto-source-name')) document.getElementById('facto-source-name').value = '';
              if (document.getElementById('facto-source-url')) document.getElementById('facto-source-url').value = '';
              // Reload list
              return this.pict.providers.Facto.loadSources();
            } else {
              this.pict.providers.Facto.setStatus('facto-sources-status', 'Error creating source', 'error');
            }
          }).then(() => {
            this.refreshList();
          }).catch(pError => {
            this.pict.providers.Facto.setStatus('facto-sources-status', 'Error: ' + pError.message, 'error');
          });
        }
      }
      module.exports = FactoSourcesView;
      module.exports.default_configuration = {
        ViewIdentifier: 'Facto-Sources',
        DefaultRenderable: 'Facto-Sources',
        DefaultDestinationAddress: '#Facto-Section-Sources',
        Templates: [{
          Hash: 'Facto-Sources',
          Template: /*html*/`
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
`
        }],
        Renderables: [{
          RenderableHash: 'Facto-Sources',
          TemplateHash: 'Facto-Sources',
          DestinationAddress: '#Facto-Section-Sources'
        }]
      };
    }, {
      "pict-view": 8
    }]
  }, {}, [11])(11);
});
//# sourceMappingURL=retold-facto.js.map
