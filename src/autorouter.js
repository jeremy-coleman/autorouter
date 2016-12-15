const fs = require("fs");
const path = require("path");
const express = require("express");

const getName = (fn) => fn.match(/^(.+?)(\.(js|ts)|)$/);

class AutoRouter {
    constructor(options) {
        this.map = {};
        this.base = "routes";
        this.entry = "/";
        this.force = false;

        this.router = express.Router();

        if (options) {
            if (options.base) this.base = options.base;
            if (options.entry) this.entry = options.entry;
            if (options.force) this.force = true;
        }

        this.route(this.base, this.entry);
    }

    route(base, entry) {
        const files = fs.readdirSync(path.join(process.cwd(), base));
        files.map((fn) => {
            const file = getName(fn);
            if (!file[2]) return this.route(path.join(base, file[1]), entry + "/" + file[1]);

            const name = file[1] === "index" ? "" : file[1];
            const newEntry = entry + "/" + name;
            const router = require(path.join(process.cwd(), base, name));

            if (this.map[newEntry]) {
                const message = `Entry ${newEntry} is added more than one time.`;

                if (this.force) console.warn(message);
                else throw new Error(message);
            }

            this.map[newEntry] = router;
            this.router.use(newEntry, router);
        });
    }
}

module.exports = (options) => new AutoRouter(options);
