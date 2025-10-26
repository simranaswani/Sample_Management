self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/create-sample": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/create-sample.js"
    ],
    "/packing-slip-history": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/packing-slip-history.js"
    ],
    "/receiver-history": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/receiver-history.js"
    ],
    "/stock-status": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/stock-status.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];