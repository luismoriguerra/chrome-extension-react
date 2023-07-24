/* eslint-disable no-undef */
chrome.devtools.panels.create(
  "React",
  null, // No icon path
  "index.html", // Path to HTML of new panel
  function (panel) {
    chrome.devtools.network.onRequestFinished.addListener(function (request) {
      var url = new URL(request.request.url);
      var isLocalhost = url.hostname === "localhost";
      var params = new URLSearchParams(url.search);
      var query = params.get("query");

      if (request.request.method !== "GET") {
        return;
      }

      if (url.href.includes("svg")) {
        return;
      }

      if (!query) {
        return;
      }
      // Send a message to the panel
      // chrome.runtime.sendMessage({ message: request });
      request.getContent((body) => {
        chrome.runtime.sendMessage({
          message: {
            cubeRequest: request.request,
            cubeTime: request.time,
            cubeResponse: JSON.parse(body),
          },
        });
      });
    });
  }
);
