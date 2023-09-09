const path = require('path')
const fs = require('fs/promises');

const resourceFolder = path.join(__dirname, '..', 'resources')
const siteFolder = path.join(__dirname, '..', '..', 'site');

class Resource {
    async init(file) {
        this.output = (await fs.readFile(path.join(resourceFolder, file), { encoding: 'utf8' }));
        return this;
    }

    replace(find, replace) {
        this.output = this.output.replace(find, replace);
        return this;
    }

    replaceAll(find, replace) {
        this.output = this.output.replaceAll(find, replace);
        return this;
    }

    async replaceFile(find, file) {
        return this.replace(find, (await new Resource().init(file)).toString());
    }

    async replaceFileAll(find, file) {
        return this.replaceAll(find, (await new Resource().init(file)).toString());
    }

    async process(func) {
        this.output = await func(this.output);
        return this;
    }

    async write(file) {
        await fs.mkdir(siteFolder, { recursive: true });
        await fs.writeFile(path.join(siteFolder, file), this.output, { flag: 'w' });
    }

    toString() {
        return this.output;
    }
}

module.exports = async function (file) {
    return new Resource().init(file);
}
