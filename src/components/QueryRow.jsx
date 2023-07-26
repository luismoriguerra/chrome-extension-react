import React from "react";

export default function QueryRow({ query }) {
  return (
    <div className="grid grid-cols-[100px,1fr] border divide-x-2">
      <div className="overflow-x-scroll whitespace-pre-wrap">{query.time}</div>
      {/*  */}
      <div className="details w-full max-h-[500px] overflow-auto">
        {/*  */}
        <div>
          {query.links &&
            query.links.map((link, index) => (
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
          {query.count} - {query.status} - {query.errors}
        </div>
        {/*  */}
        <div>isAdditive: {JSON.stringify(query.isAdditive)}</div>
        {/*  */}
        <div>slowQuery: {JSON.stringify(query.slowQuery)}</div>
        {/*  */}
        <details className="border rounded-md m-1 p-1  ">
          <summary>{JSON.stringify(query.query)}</summary>
          <div>
            <pre>{JSON.stringify(query.query, null, 2)}</pre>
          </div>
        </details>
        {/*  */}
        <details className="border rounded-md m-1 p-1  ">
          <summary>{`filters`}</summary>
          <div>
            <pre>
              {query.filters && JSON.stringify(query.filters[0], null, 2)}
            </pre>
          </div>
        </details>
        {/*  */}
        <details className="border rounded-md m-1 p-1  ">
          <summary>preagg</summary>
          <div>
            {query.preagg &&
              query.preagg.map((p, index) => (
                <div key={index}>
                  <pre>{JSON.stringify(p, null, 2)}</pre>
                </div>
              ))}
          </div>
        </details>
        {/*  */}
        <details className="border rounded-md m-1 p-1  ">
          <summary>Response</summary>
          <div>
            {query.data &&
              query.data.map((data, index) => (
                <div key={index}>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
              ))}
          </div>
        </details>
        {/*  */}
        <details className="border rounded-md m-1 p-1  ">
          <summary>full results</summary>
          <div>
            {query.fullResult &&
              query.fullResults.map((data, index) => (
                <div key={index}>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
              ))}
          </div>
        </details>
        {/*  */}
      </div>
      {/*  */}
    </div>
  );
}
