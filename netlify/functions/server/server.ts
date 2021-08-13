require("./globals");
import { createRequestHandler } from "./handler";

exports.handler = createRequestHandler({
  build: require("./build"),
});
