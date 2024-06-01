import "module-alias/register";
import "reflect-metadata";

import moduleAlias from "module-alias";

import * as path from "node:path";

moduleAlias.addAlias("@", __dirname);
moduleAlias.addAlias("@root", path.join(__dirname, ".."));

moduleAlias.addAlias(
    "@db",
    path.resolve(__dirname, "../prisma/generated/client")
);

const moduleAliases = {
    "@src": __dirname,
    "@telegram": path.join(__dirname, "telegram"),
    "@logger": path.join(__dirname, "logger"),
    "@api": path.join(__dirname, "api"),
    "@cache": path.join(__dirname, "cache"),
    "@app": path.join(__dirname, "app"),
    "@utils": path.join(__dirname, "utils"),
    "@schedule": path.join(__dirname, "schedule"),
    "@container": path.join(__dirname, "container"),
    "@database": path.join(__dirname, "database"),
    "@types": path.join(__dirname, "types"),
    "@websocket": path.join(__dirname, "websocket"),
    "@storage": path.join(__dirname, "storage"),
}

console.log(moduleAliases)

moduleAlias.addAliases(moduleAliases)
