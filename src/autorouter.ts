import * as fs from 'fs';
import * as path from 'path';
import {Router} from 'express';

export interface AutoRouterOptions {
    base?: string;
    force?: boolean;
}

export interface AutoRouterFilename {
    filebase: string;
    extension: string;
}

export interface AutoRouterMap {
    [key: string]: string;
}

export class AutoRouter implements AutoRouterOptions {
    base = 'routes';
    force = false;

    constructor(options?: AutoRouterOptions) {
        if (options) {
            if (options.base) this.base = options.base;
            if (options.force) this.force = options.force;
        }

        if (this.base[0] !== path.sep) this.base = path.join(process.cwd(), this.base);
    }

    static getName(filename: string): AutoRouterFilename {
        const [fn, filebase, extension] = filename.match(/^(.+?)(\.(js|ts)|)$/);
        return {filebase, extension};
    }

    static getFiles(dir: string): string[] {
        return fs.readdirSync(dir);
    }

    getRoutingFilesRecursively(dir: string, entry: string, map: AutoRouterMap = {}): AutoRouterMap {
        const handleFile = (filename: string) => {
            const {filebase, extension} = AutoRouter.getName(filename);
            const file = path.join(dir, filename);

            let endpoint = entry + (filebase === 'index' ? '' : filebase);
            if (endpoint[endpoint.length - 1] === '/') endpoint = endpoint.slice(0, -1);

            if (!extension) {
                this.getRoutingFilesRecursively(file, endpoint + '/', map);
                return;
            }

            if (map[endpoint]) {
                const message = `Route ${endpoint} already exists in route map`;
                if (!this.force) throw new Error(message);
                console.warn(message);
            }

            map[endpoint] = file;
        };

        AutoRouter.getFiles(dir).map(handleFile);
        return map;
    }

    getRouter(): Router {
        const router = Router();
        const map = this.getRoutingFilesRecursively(this.base, '/');

        const keys = Object.keys(map);
        let i = keys.length;

        while (i--) {
            const endpoint = keys[i];
            const subRouter = require(map[endpoint]);

            router.use(endpoint, subRouter);
        }

        return router;
    }
}
