const { createRequestHandler } = require("@remix-run/netlify");
const path = require("path");

const BUILD_DIR = path.join(process.cwd(), "netlify");

exports.handler =
  process.env.NODE_ENV === "development"
    ? (event, context) => {
        console.log("event", event);
        for (const key of Object.keys(require.cache)) {
          console.log(key);
          if (key.startsWith(BUILD_DIR)) {
            delete require.cache[key];
          }
        }
        return createRequestHandler({
          build: require("./build"),
        })(event, context);
      }
    : createRequestHandler({ build: require("./build") });
