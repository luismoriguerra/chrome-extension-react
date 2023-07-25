/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import { tryInPlayground, getPlayQueriesFromRawQuery } from "./utils/utils";
import QueryRow from "./components/QueryRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

const DevToolsPanel = () => {
  const [requests, setRequests] = useState({});
  const [search, setSearch] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);

  function clearList() {
    setRequests({});
    setSearch("");
  }

  function onSearchChange(e) {
    setSearch(e.target.value);
  }

  useEffect(() => {
    if (search === "") {
      setFilteredRequests(Object.values(requests));
    } else {
      setFilteredRequests(
        Object.values(requests).filter((e) =>
          JSON.stringify(e)
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase())
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
          prevQueryData.isAdditive =
            cubeResponse &&
            cubeResponse.results &&
            cubeResponse.results.map((r) => ({
              isAdditive: r.transformedQuery && r.transformedQuery.isAdditive,
            }));
          prevQueryData.fullResults = cubeResponse && cubeResponse.results;
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
            isAdditive:
              cubeResponse &&
              cubeResponse.results &&
              cubeResponse.results.map((r) => ({
                isAdditive: r.transformedQuery && r.transformedQuery.isAdditive,
              })),
            isAdditive:
              cubeResponse &&
              cubeResponse.results &&
              cubeResponse.results.map((r) => ({
                isAdditive: r.transformedQuery && r.transformedQuery.isAdditive,
              })),
            fullResults: cubeResponse && cubeResponse.results,
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
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="loading">Loading</TabsTrigger>
            <TabsTrigger value="success">success</TabsTrigger>
            <TabsTrigger value="slow">slow</TabsTrigger>
            <TabsTrigger value="pre-agg">pre-agg</TabsTrigger>
            <TabsTrigger value="db">db query</TabsTrigger>
            <TabsTrigger value="raw">raw</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {Object.values(filteredRequests)
              .sort((a, b) => b.status - a.status)
              .sort((a, b) => b.created - a.created)
              .map((e, index) => (
                <QueryRow query={e} key={index} />
              ))}
          </TabsContent>
          <TabsContent value="loading">
            {Object.values(filteredRequests)
              .filter((e) => e.status === "loading or error ")
              .map((e, index) => (
                <QueryRow query={e} key={index} />
              ))}
          </TabsContent>
          <TabsContent value="success">
            {Object.values(filteredRequests)
              .filter((e) => e.status === "success")
              .map((e, index) => (
                <QueryRow query={e} key={index} />
              ))}
          </TabsContent>
          <TabsContent value="slow">
            {Object.values(filteredRequests)
              .filter((e) => e.count > 1)
              .map((e, index) => (
                <QueryRow query={e} key={index} />
              ))}
          </TabsContent>
          <TabsContent value="pre-agg">
            {Object.values(filteredRequests)
              .filter((e) => e.status === "success")
              .filter((e) => e.preagg[0])
              .filter(
                (e) => Object.keys(e.preagg[0].usedPreAggregations).length > 0
              )
              .map((e, index) => (
                <QueryRow query={e} key={index} />
              ))}
          </TabsContent>
          <TabsContent value="db">
            {Object.values(filteredRequests)
              .filter((e) => e.status === "success")
              .filter((e) => e.preagg[0])
              .filter(
                (e) => Object.keys(e.preagg[0].usedPreAggregations).length === 0
              )
              .map((e, index) => (
                <QueryRow query={e} key={index} />
              ))}
          </TabsContent>
          <TabsContent value="raw">
            <pre>
              {JSON.stringify(
                Object.values(filteredRequests).map((e) => e.query),
                null,
                2
              )}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DevToolsPanel;
