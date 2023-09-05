const fs = require('fs/promises');
const chroma = require('chroma-js')

async function main() {
  try {
    const flags = (await fs.readFile('color-list.txt', { encoding: 'utf8' })).split(/\n{2,}/g).map(s => s.split("\n").filter(s => !s.startsWith("##") && s.trim() !== ""));

    let border = "background: linear-gradient(200deg";
    let background = "background: linear-gradient(200deg";

    flags.forEach((flag, flagIndex) => {
      flag.forEach((segment, segmentIndex) => {
        const start = 100 * (flagIndex * flag.length + segmentIndex) / flags.length / flag.length;
        const end = 100 * (flagIndex * flag.length + segmentIndex + 1) / flags.length / flag.length;

        border += `, rgba(${chroma(segment).rgba()}) ${start}% ${end}%`
        background += `, rgba(${chroma.mix(segment, "white", 0.6, "rgb").alpha(0.6).rgba()}) ${start}% ${end}%`
      });
    });

    border += ') border-box;'
    background += ');'

    console.log("Border gaydient:")
    console.log(border)
    console.log()
    console.log("Background gaydient:")
    console.log(background)
  } catch (err) {
    console.log(err);
  }
}

main();