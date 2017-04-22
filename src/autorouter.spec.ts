import * as fs from 'fs';
import * as path from "path";

import {spy} from 'sinon';
import {expect} from 'chai';
import {AutoRouter} from './autorouter';

describe('AutoRouter', () => {
    beforeEach(() => {
        try {
            fs.mkdirSync('routes');
            fs.mkdirSync('routes/a');
            fs.writeFileSync('routes/a.js', 'module.exports = function(req,res,next){}');
            fs.writeFileSync('routes/b.js', 'module.exports = function(req,res,next){}');
            fs.writeFileSync('routes/a/index.js', 'module.exports = function(req,res,next){}');
        } catch (err) {
            console.log('Files or folders already exist');
        }
    });

    it('Should get the correct files', () => {
        const files = AutoRouter.getFiles('routes');
        const files2 = AutoRouter.getFiles('routes/a');

        expect(files).to.deep.equal(['a', 'a.js', 'b.js']);
        expect(files2).to.deep.equal(['index.js']);
    });

    it('Should throw an error on adding "a" twice', () => {
        const autorouter = new AutoRouter();
        const errorFunction = autorouter.getRoutingFilesRecursively.bind(autorouter, 'routes', '/');

        expect(errorFunction).to.throw(Error, /Route \/a already exists in route map/);
    });

    it('Should not throw an error on adding "a" twice when forced', () => {
        const warnSpy = spy();
        const _warn = console.warn;
        console.warn = warnSpy;

        const autorouter = new AutoRouter({force: true});
        const errorFunction = autorouter.getRoutingFilesRecursively.bind(autorouter, 'routes', '/');

        expect(errorFunction).not.to.throw(Error);
        expect(warnSpy.called).to.be.true;

        console.warn = _warn;
    });

    it('Should create a map of flat files', () => {
        const _getFiles = AutoRouter.getFiles;
        AutoRouter.getFiles = function () {
            return ['a.js', 'b.js'];
        };

        const autorouter = new AutoRouter({});
        const map = autorouter.getRoutingFilesRecursively(autorouter.base, '/');

        expect(map).to.have.property('/a', path.join(autorouter.base, 'a.js'));
        expect(map).to.have.property('/b', path.join(autorouter.base, 'b.js'));

        AutoRouter.getFiles = _getFiles;
    });

    it('Should create a map of mixed files', () => {
        const _getFiles = AutoRouter.getFiles;
        AutoRouter.getFiles = function (dir) {
            return dir === path.join(process.cwd(), 'routes') ? ['a', 'b.js'] : ['index.js'];
        };

        const autorouter = new AutoRouter({});
        const map = autorouter.getRoutingFilesRecursively(autorouter.base, '/');

        expect(map).to.have.property('/a', path.join(autorouter.base, 'a', 'index.js'));
        expect(map).to.have.property('/b', path.join(autorouter.base, 'b.js'));

        AutoRouter.getFiles = _getFiles;
    });

    it('Should create an Express Router of mixed files', () => {
        const _getFiles = AutoRouter.getFiles;
        AutoRouter.getFiles = function (dir) {
            return dir === path.join(process.cwd(), 'routes') ? ['a', 'b.js'] : ['index.js'];
        };

        const autorouter = new AutoRouter({});
        const router = autorouter.getRouter();

        expect(router).to.have.property('stack').which.have.lengthOf(2);

        AutoRouter.getFiles = _getFiles;
    });

    it('Should handle different base', () => {
        const autorouter = new AutoRouter({base: path.join('routes', 'a')});
        const map = autorouter.getRoutingFilesRecursively(autorouter.base, '/');

        expect(map).to.have.property('/', path.join(autorouter.base, 'index.js'));
    });

    it('Should handle absolute base', () => {
        const autorouter = new AutoRouter({base: path.join(process.cwd(), 'routes', 'a')});
        const map = autorouter.getRoutingFilesRecursively(autorouter.base, '/');

        expect(map).to.have.property('/', path.join(autorouter.base, 'index.js'));
    });

    afterEach(() => {
        fs.unlinkSync('routes/a.js');
        fs.unlinkSync('routes/b.js');
        fs.unlinkSync('routes/a/index.js');
        fs.rmdirSync('routes/a');
        fs.rmdirSync('routes');
    });
});
