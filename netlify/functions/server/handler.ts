import type { AppLoadContext, RequestInit, ServerBuild } from "@remix-run/node";
import {
  Headers,
  Request,
  createRequestHandler as createRemixRequestHandler,
} from "@remix-run/node";
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export interface GetLoadContextFunction {
  (event: HandlerEvent, context: HandlerContext): AppLoadContext;
}

export type RequestHandler = ReturnType<typeof createRequestHandler>;

export function createRequestHandler({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV,
}: {
  build: ServerBuild;
  getLoadContext?: AppLoadContext;
  mode?: string;
}): Handler {
  let handleRequest = createRemixRequestHandler(build, mode);

  return async (event, context) => {
    let request = createRemixRequest(event);
    let loadContext =
      typeof getLoadContext === "function"
        ? getLoadContext(event, context)
        : undefined;

    let response = await handleRequest(request, loadContext);

    return {
      statusCode: response.status,
      multiValueHeaders: response.headers.raw(),
      body: await response.text(),
    };
  };
}

export function createRemixRequest(event: HandlerEvent) {
  let init: RequestInit = {
    method: event.httpMethod,
    headers: createRemixHeaders(event.multiValueHeaders),
  };

  if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD" && event.body) {
    init.body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString()
      : event.body;
  }

  let url: URL;

  if (process.env.NODE_ENV === "development") {
    let origin = event.headers.host;
    let rawPath = getRawPath(event);
    url = new URL(rawPath, `http://${origin}`);
  } else {
    url = new URL(event.rawUrl);
  }

  return new Request(url.toString(), init);
}

export function createRemixHeaders(
  requestHeaders: HandlerEvent["multiValueHeaders"]
): Headers {
  let headers = new Headers();

  for (const [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      for (const value of values) {
        headers.append(key, value);
      }
    }
  }

  return headers;
}

// `netlify dev` doesn't give you the full url in event.rawUrl
function getRawPath(event: HandlerEvent) {
  let searchParams = new URLSearchParams();
  let paramKeys = Object.keys(event.multiValueQueryStringParameters);
  for (let key of paramKeys) {
    let values = event.multiValueQueryStringParameters[key];
    for (let val of values) {
      searchParams.append(key, val);
    }
  }
  let rawParams = searchParams.toString();

  let rawPath = event.path;
  if (rawParams) rawPath += `?${rawParams}`;

  return rawPath;
}
