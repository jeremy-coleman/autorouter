"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var express_1 = require("express");
var AutoRouter = (function () {
    function AutoRouter(options) {
        this.base = 'routes';
        this.force = false;
        if (options) {
            if (options.base)
                this.base = options.base;
            if (options.force)
                this.force = options.force;
        }
        if (this.base[0] !== path.sep)
            this.base = path.join(process.cwd(), this.base);
    }
    AutoRouter.getName = function (filename) {
        var _a = filename.match(/^(.+?)(\.(js|ts)|)$/), fn = _a[0], filebase = _a[1], extension = _a[2];
        return { filebase: filebase, extension: extension };
    };
    AutoRouter.getFiles = function (dir) {
        return fs.readdirSync(dir);
    };
    AutoRouter.prototype.getRoutingFilesRecursively = function (dir, entry, map) {
        var _this = this;
        if (map === void 0) { map = {}; }
        var handleFile = function (filename) {
            var _a = AutoRouter.getName(filename), filebase = _a.filebase, extension = _a.extension;
            var file = path.join(dir, filename);
            var endpoint = entry + (filebase === 'index' ? '' : filebase);
            if (endpoint[endpoint.length - 1] === '/')
                endpoint = endpoint.slice(0, -1);
            if (!extension) {
                _this.getRoutingFilesRecursively(file, endpoint + '/', map);
                return;
            }
            if (map[endpoint]) {
                var message = "Route " + endpoint + " already exists in route map";
                if (!_this.force)
                    throw new Error(message);
                console.warn(message);
            }
            map[endpoint] = file;
        };
        AutoRouter.getFiles(dir).map(handleFile);
        return map;
    };
    AutoRouter.prototype.getRouter = function () {
        var router = express_1.Router();
        var map = this.getRoutingFilesRecursively(this.base, '/');
        var keys = Object.keys(map);
        var i = keys.length;
        while (i--) {
            var endpoint = keys[i];
            var subRouter = require(map[endpoint]);
            router.use(endpoint, subRouter);
        }
        return router;
    };
    return AutoRouter;
}());
exports.AutoRouter = AutoRouter;
//# sourceMappingURL=autorouter.js.map