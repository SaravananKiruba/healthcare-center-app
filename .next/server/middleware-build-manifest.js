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
    "/doctor-dashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/doctor-dashboard.js"
    ],
    "/login": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/login.js"
    ],
    "/patient/register": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/patient/register.js"
    ],
    "/patients": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/patients.js"
    ],
    "/reports": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/reports.js"
    ],
    "/search": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/search.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];