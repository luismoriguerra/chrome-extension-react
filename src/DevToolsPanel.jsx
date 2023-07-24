//@ts-check
/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import { tryInPlayground, getPlayQueriesFromRawQuery } from "./utils/utils";

const DevToolsPanel = () => {
  const [requests, setRequests] = useState({});
  const [search, setSearch] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);

  function clearList() {
    setRequests({});
  }

  function onSearchChange(e) {
    setSearch(e.target.value);
  }

  useEffect(() => {
    if (search === "") {
      setFilteredRequests(Object.values(requests));
    } else {
      setFilteredRequests(
        // @ts-ignore
        Object.values(requests).filter((e) =>
          JSON.stringify(e).toLocaleLowerCase().includes(search)
        )
      );
    }
  }, [search, requests]);

  useEffect(() => {
    const listener = (outerMessage, sender, sendResponse) => {
      const { cubeRequest, cubeResponse, cubeTime } = outerMessage.message;
      const request = cubeRequest;

      let url = new URL(request.url);
      let isLocalhost = url.hostname === "localhost";
      let params = new URLSearchParams(url.search);
      let query = params.get("query");

      if (request.method !== "GET") {
        return;
      }

      if (url.href.includes("svg")) {
        return;
      }

      if (!query) {
        return;
      }

      query = decodeURIComponent(query);

      setRequests((prevRequests) => {
        let prevQueryData = prevRequests[query];

        if (prevQueryData) {
          prevQueryData.count = prevQueryData.count + 1;
          prevQueryData.time = prevQueryData.time + cubeTime;
          prevQueryData.created = new Date().getTime();
          prevQueryData.links = tryInPlayground(
            getPlayQueriesFromRawQuery(JSON.parse(query)),
            isLocalhost
          );
          prevQueryData.status =
            cubeResponse && cubeResponse.error
              ? "loading or error "
              : "success";
          prevQueryData.filters =
            (cubeResponse &&
              cubeResponse.results &&
              cubeResponse.results.map((r) => r.query.filters)) ||
            [];
          prevQueryData.errors = cubeResponse && cubeResponse.error;
          prevQueryData.data =
            (cubeResponse &&
              cubeResponse.results &&
              cubeResponse.results.map((r) => r.data)) ||
            [];
          prevQueryData.preagg =
            cubeResponse &&
            cubeResponse.results &&
            cubeResponse.results.map((r) => ({
              usedPreAggregations: r.usedPreAggregations,
            }));
        } else {
          prevQueryData = {
            query: JSON.parse(query),
            created: new Date().getTime(),
            time: cubeTime,
            links: tryInPlayground(
              getPlayQueriesFromRawQuery(JSON.parse(query)),
              isLocalhost
            ),
            count: 1,
            errors: cubeResponse && cubeResponse.error,
            status:
              cubeResponse && cubeResponse.error
                ? "loading or error "
                : "success",
            filters:
              (cubeResponse &&
                cubeResponse.results &&
                cubeResponse.results.map((r) => r.query.filters)) ||
              [],
            data:
              (cubeResponse &&
                cubeResponse.results &&
                cubeResponse.results.map((r) => r.data)) ||
              [],
            preagg:
              cubeResponse &&
              cubeResponse.results &&
              cubeResponse.results.map((r) => ({
                usedPreAggregations: r.usedPreAggregations,
              })),
          };
        }

        return {
          ...prevRequests,
          [query]: prevQueryData,
        };
      });
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return (
    <div>
      <div>Total Queries : {Object.keys(requests).length} </div>
      <div>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
          onClick={(e) => clearList()}
        >
          Clear List
        </button>
        <input
          type="text"
          placeholder="seach"
          className="border rounded-md m-1 p-1 w-full"
          value={search}
          onChange={onSearchChange}
        />
        <div className="table">
          <div className="grid grid-cols-[100px,1fr]">
            <div>time</div>
            <div>Response</div>
          </div>
          <div>
            <div className="">
              {Object.values(filteredRequests)
                .sort((a, b) => b.status - a.status)
                .sort((a, b) => b.created - a.created)
                .map((e, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[100px,1fr] border divide-x-2"
                  >
                    <div className="overflow-x-scroll whitespace-pre-wrap">
                      {e.time}
                    </div>
                    {/*  */}
                    <div className="details w-full max-h-[500px] overflow-auto">
                      {/*  */}
                      <div>
                        {e.links.map((link, index) => (
                          <div key={index}>
                            <a
                              className="text-blue-500 hover:text-blue-800"
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              play url
                            </a>{" "}
                          </div>
                        ))}
                      </div>
                      {/*  */}
                      <div>
                        {e.count} - {e.status} - {e.errors}
                      </div>
                      {/*  */}
                      <details className="border rounded-md m-1 p-1  ">
                        <summary>{JSON.stringify(e.query)}</summary>
                        <div>
                          <pre>{JSON.stringify(e.query, null, 2)}</pre>
                        </div>
                      </details>
                      {/*  */}
                      <details className="border rounded-md m-1 p-1  ">
                        <summary>{`filters`}</summary>
                        <div>
                          <pre>{JSON.stringify(e.filters[0], null, 2)}</pre>
                        </div>
                      </details>
                      {/*  */}
                      <details className="border rounded-md m-1 p-1  ">
                        <summary>Response</summary>
                        <div>
                          {e.data.map((data, index) => (
                            <div key={index}>
                              <pre>{JSON.stringify(data, null, 2)}</pre>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                    {/*  */}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevToolsPanel;
