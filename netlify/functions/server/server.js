const { createRequestHandler } = require("@remix-run/netlify");
const path = require("path");

const BUILD_DIR = path.join(process.cwd(), "netlify");

exports.handler =
  process.env.NODE_ENV === "production"
    ? createRequestHandler({ build: require("./build") })
    : (event, context) => {
        for (const key of Object.keys(require.cache)) {
          if (key.startsWith(BUILD_DIR)) {
            delete require.cache[key];
          }
        }

        return createRequestHandler({ build: require("./build") })(
          event,
          context
        );
      };
