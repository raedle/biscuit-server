const path = require("path");
const BiscuitServer = require("./codesandbox-server");

const pkgPath = path.join(process.env.PWD, "package.json");

const pkg = require(pkgPath);

let biscuitOptions = pkg.biscuit;

console.log("Biscuit Options", biscuitOptions);

BiscuitServer.start(biscuitOptions);

