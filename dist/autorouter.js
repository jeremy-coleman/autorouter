"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");
var path = require("path");
var express = require("express");

var getName = function getName(fn) {
    return fn.match(/^(.+?)(\.(js|ts)|)$/);
};

var AutoRouter = function () {
    function AutoRouter(options) {
        _classCallCheck(this, AutoRouter);

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

    _createClass(AutoRouter, [{
        key: "route",
        value: function route(base, entry) {
            var _this = this;

            var files = fs.readdirSync(path.join(process.cwd(), base));
            files.map(function (fn) {
                var file = getName(fn);
                if (!file[2]) return _this.route(path.join(base, file[1]), entry + "/" + file[1]);

                var name = file[1] === "index" ? "" : file[1];
                var newEntry = entry + "/" + name;
                var router = require(path.join(process.cwd(), base, name));

                if (_this.map[newEntry]) {
                    var message = "Entry " + newEntry + " is added more than one time.";

                    if (_this.force) console.warn(message);else throw new Error(message);
                }

                _this.map[newEntry] = router;
                _this.router.use(newEntry, router);
            });
        }
    }]);

    return AutoRouter;
}();

module.exports = function (options) {
    return new AutoRouter(options);
};

//# sourceMappingURL=autorouter.js.map