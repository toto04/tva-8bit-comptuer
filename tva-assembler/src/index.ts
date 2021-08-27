#!/usr/bin/env node

import fs from 'fs'

import commander from 'commander'
const { program } = commander
import chalk from 'chalk'

import { parseAssembly } from './parseAssembly.js'
import { generateMicrocode } from './microcode.js'

program
    .argument('[file-name]', 'the input file name')
    .option('-o, --output <outpath>', 'the output .bin file', 'out.bin')
    .option('-c, --c-array', 'if set, output file will be a C array')
    .option('--microcode', 'generates the EEPROM content for decoding instructions into microcode')

program.parse()

const inputFile = program.args[0]
let { output, cArray, microcode } = program.opts<{ output: string, cArray: boolean, microcode: boolean }>()
if (cArray && output === 'out.bin') output = 'code.c'

console.log(chalk.yellow.bgBlack(`
⠿⠏⠿⠿⠹⠿⠄⠀⠠⠟⠠⠾⠻⠆
⠏⠀⠿⠿⠀⠹⠻⠆⠾⠁⠾⠏⠹⠿⠄
⠀⠀⠿⠿⠀⠀⠹⠿⠏⠼⠏⠀⠀⠹⠿⠄`))
console.log(chalk.cyanBright.bgBlack('~~~ assembler ~~~\n'))

async function main() {
    let buffer = microcode ? generateMicrocode() : await parseAssembly(inputFile)
    if (cArray) {
        let code = '#include <Arduino.h>\nconst uint8_t code[] = {'
        buffer.forEach(b => {
            code += `0x${b.toString(16).padStart(2, '0')},`
        })
        code += '};'
        fs.writeFileSync(output, code, 'utf-8')
    } else {
        fs.writeFileSync(output, buffer, 'binary')
    }
    console.log(chalk.greenBright.bgBlack(' ✅ Done  \n'))
}
main()