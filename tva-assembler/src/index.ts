#!/usr/bin/env node

import fs from 'fs/promises'

import commander from 'commander'
const { program } = commander
import chalk from 'chalk'

import { parseAssembly } from './parseAssembly.js'
import { generateMicrocode } from './microcode.js'
import { upload } from './serial.js'

console.log(chalk.yellow(`
⠿⠏⠿⠿⠹⠿⠄⠀⠠⠟⠠⠾⠻⠆   
⠏⠀⠿⠿⠀⠹⠻⠆⠾⠁⠾⠏⠹⠿⠄  
⠀⠀⠿⠿⠀⠀⠹⠿⠏⠼⠏⠀⠀⠹⠿⠄ `))
console.log(chalk.cyanBright(' ~~ assembler ~~ \n'))

function createCString(data: Buffer) {
    let code = '#include <Arduino.h>\nconst uint8_t code[] = {'
    data.forEach(b => { code += `0x${b.toString(16).padStart(2, '0')},` })
    code += '};'
    return code
}

program
    .command('upload [binary]')
    .action(async (binary: string, { serial }: { serial: string }) => {
        let data = await fs.readFile(binary)
        await upload(serial, data)
        process.stdout.write(chalk.greenBright('\n ✅ Done  \n\n'))
        process.exit(0)
    })
    .description('uploads a binary file to the eeprom')
    .requiredOption('-s, --serial <serialport>', 'write to serial')

type CompileArgs = { output: string, cArray: boolean, serial?: string }

program
    .command('compile [inputFile]')
    .action(async (inputFile: string, { output, cArray, serial }: CompileArgs) => {
        let data = await parseAssembly(inputFile)
        if (serial) {
            await upload(serial, data)
        } else {
            if (cArray && output === 'out.bin') output = 'code.c'
            await fs.writeFile(output, cArray ? createCString(data) : data, cArray ? 'utf-8' : 'binary')
            process.stdout.write(`wrote data to ${output}!\n`)
        }
        process.stdout.write(chalk.greenBright('\n ✅ Done  \n\n'))
        process.exit(0)
    })
    .description('assembles tva instructions to binary')
    .option('-o, --output <outpath>', 'the output .bin file', 'out.bin')
    .option('-c, --c-array', 'if set, output file will be a C array')
    .option('-s, --serial <serialport>', 'write to serial')

program
    .command('microcode')
    .action(async ({ output, cArray, serial }: CompileArgs) => {
        let data = generateMicrocode()
        if (serial) {
            await upload(serial, data)
        } else {
            if (cArray && output === 'out.bin') output = 'code.c'
            await fs.writeFile(output, cArray ? createCString(data) : data, cArray ? 'utf-8' : 'binary')
            process.stdout.write(`wrote data to ${output}!\n`)
        }
        process.stdout.write(chalk.greenBright('\n ✅ Done  \n\n'))
        process.exit(0)
    })
    .description('creates the binary for the TVA microcode')
    .option('-o, --output <outpath>', 'the output .bin file', 'out.bin')
    .option('-c, --c-array', 'if set, output file will be a C array')
    .option('-s, --serial <serialport>', 'write to serial')

program.parse()