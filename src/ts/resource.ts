import path from 'path';
import fs from 'fs/promises';

const resourceFolder = path.join(__dirname, '..', 'resources')
const siteFolder = path.join(__dirname, '..', '..', 'site');

class Resource {
    output: string = "";

    async init(file: string) {
        this.output = (await fs.readFile(path.join(resourceFolder, file), { encoding: 'utf8' }));
        return this;
    }

    replace(find:string, replace:string) {
        this.output = this.output.replace(find, replace);
        return this;
    }

    replaceAll(find:string, replace:string) {
        this.output = this.output.replaceAll(find, replace);
        return this;
    }

    async replaceFile(find:string, file:string) {
        return this.replace(find, (await new Resource().init(file)).toString());
    }

    async replaceFileAll(find:string, file:string) {
        return this.replaceAll(find, (await new Resource().init(file)).toString());
    }

    async process(func: (current: string) => Promise<string>) {
        this.output = await func(this.output);
        return this;
    }

    async write(file: string) {
        await fs.mkdir(siteFolder, { recursive: true });
        await fs.writeFile(path.join(siteFolder, file), this.output, { flag: 'w' });
    }

    toString() {
        return this.output;
    }
}

export default async function (file: string) {
    return new Resource().init(file);
}
