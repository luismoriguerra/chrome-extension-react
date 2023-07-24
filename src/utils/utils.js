//@ts-check
export function getPlayQueriesFromRawQuery(rawQuery = {}, opts = {}) {
  const { message = "", exclude = "", include = "", log = false } = opts || {};

  const toText = JSON.stringify(rawQuery).toLowerCase();
  if (include && toText.includes(include.toLowerCase())) {
    return [];
  }

  if (exclude && !toText.includes(exclude.toLowerCase())) {
    return [];
  }

  const query = JSON.parse(JSON.stringify(rawQuery));

  if (query.timeDimensions) {
    const timeDimension = query.timeDimensions[0];
    const { compareDateRange } = timeDimension || {};
    if (compareDateRange) {
      const [current, previous] = compareDateRange || [];

      const currentTimedimensionDateRange = query.timeDimensions[0];
      delete currentTimedimensionDateRange.compareDateRange;
      currentTimedimensionDateRange.dateRange = current;

      const currentQuery = JSON.parse(
        JSON.stringify({
          ...query,
          timeDimensions: [currentTimedimensionDateRange],
        })
      );
      // const currentUrl = tryInPlayground(currentQuery);

      const previousTimedimensionDateRange = query.timeDimensions[0];
      delete previousTimedimensionDateRange.compareDateRange;
      previousTimedimensionDateRange.dateRange = previous;

      const previousQuery = JSON.parse(
        JSON.stringify({
          ...query,
          timeDimensions: [previousTimedimensionDateRange],
        })
      );
      // const previousUrl = tryInPlayground(previousQuery);

      return [currentQuery, previousQuery];
    }
  }
  // const url = tryInPlayground(query);

  return [query];
}

export function tryInPlayground(query, isLocalhost = true) {
  if (Array.isArray(query)) {
    return query.map((query) => tryInPlayground(query, isLocalhost));
  }
  //http://localhost:4000/#/build?query={}
  const localhost = "http://localhost:4000/#/build";
  const dev = "https://lfx-dev.cubecloud.dev/deployments/25/playground";

  const playgroundUrl = isLocalhost ? localhost : dev;

  const queryUrl = `query=${encodeURIComponent(JSON.stringify(query))}`;
  const url = `${playgroundUrl}?${queryUrl}`;
  return url;
}
