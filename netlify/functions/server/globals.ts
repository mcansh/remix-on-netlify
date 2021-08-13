import {
  Headers as NodeHeaders,
  Request as NodeRequest,
  Response as NodeResponse,
  fetch as nodeFetch,
} from "@remix-run/node";

// @ts-ignore
global.Headers = NodeHeaders;
// @ts-ignore
global.Request = NodeRequest;
// @ts-ignore
global.Response = NodeResponse;
// @ts-ignore
global.fetch = nodeFetch;
