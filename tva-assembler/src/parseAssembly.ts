import fs from 'fs'
import { createInterface } from 'readline'

import chalk from 'chalk'

import { commandList } from './commands.js'

let lineCount = 0

let binary: Buffer

let variables: Map<string, number>
let labels: Map<string, number>
let currentByte = 0

function parseLine(line: string) {
    lineCount++;

    let setVariable = line.match(/^([a-zA-Z_]+)[ \t]*=[ \t]*((?:0x)?\d+)[ \t]*(?:;.*)?$/)
    if (setVariable) {
        let value = parseInt(setVariable[2])
        if (value < -128 || value > 255)
            exitWithErrorOnLine(line, lineCount, 'bruh, you just have 8 bits ಠ_ಠ')
        variables.set(setVariable[1], value)
        return
    }

    let setLabel = line.match(/^([a-zA-Z_]+)[ \t]*:[ \t]*(?:;.*)?$/)
    if (setLabel) {
        if (labels.has(setLabel[1])) exitWithErrorOnLine(line, lineCount, 'label already assigned')
        labels.set(setLabel[1], currentByte)
        return
    }

    let command = line.match(/^[ \t]+([A-Z]+)[ \t]*(?:([a-zA-Z_]+)|(\d+))?[ \t]*(?:;.*)?$/)
    if (command) {
        if (!commandList.has(command[1])) exitWithErrorOnLine(line, lineCount, 'invalid command')
        let cmd = commandList.get(command[1])!

        let value = command[3] ? parseInt(command[3]) : undefined
        if (value && (value < -128 || value > 255))
            exitWithErrorOnLine(line, lineCount, 'bruh, you just have 8 bits ಠ_ಠ')

        let parameter: number | undefined
        let isJmp = /JMP|JMZ|JMC|JNZ|JNC/.test(command[1])
        if (isJmp && labels.has(command[2])) {
            parameter = labels.get(command[2])
        } else {
            if (command[2]) {
                if (!variables.has(command[2]))
                    exitWithErrorOnLine(line, lineCount, 'no such variable' + (isJmp ? ' or label' : ''))
                parameter = variables.get(command[2])
            } else parameter = value
        }

        if (!cmd.requiresParameter && parameter !== undefined)
            exitWithErrorOnLine(line, lineCount, `command ${command[1]} doesn't require a parameter`)

        binary.writeInt8(cmd.bytecode >= 128 ? cmd.bytecode - 256 : cmd.bytecode, currentByte)
        currentByte++

        if (cmd.requiresParameter) {
            if (parameter === undefined)
                exitWithErrorOnLine(line, lineCount, 'missing parameter for command ' + command[1])
            if (parameter! >= 128) { parameter! -= 256 }
            binary.writeInt8(parameter!, currentByte)
            currentByte++
        }
        return
    }
    if (!/[ \t]*/.test(line)) exitWithErrorOnLine(line, lineCount, 'cannot match line')
}

export function parseAssembly(inputFile: string) {
    return new Promise<Buffer>((resolve, reject) => {
        if (!inputFile) exitWithError('specify an input file\nuse\n' + chalk.whiteBright('\ttva -h') + '\nfor help')
        if (!fs.existsSync(inputFile)) exitWithError(`${inputFile} no such file`)

        lineCount = 0
        variables = new Map()
        labels = new Map()
        currentByte = 0
        binary = Buffer.alloc(128)

        const readInterface = createInterface({ input: fs.createReadStream(inputFile) })
        readInterface.on('line', line => parseLine(line))
        readInterface.on('close', () => {
            resolve(binary)
        })
    })
}

function exitWithErrorOnLine(line: string, lineNumber: number, error: string) {
    let ln = lineNumber + ''
    let e = chalk.black.bgWhite(ln) + ' ' + chalk.white.bgBlack(line) + '\n'
    ln.split('').forEach(() => e += ' ')
    let s = ' '
    line.split('').forEach(() => s += '˜')
    e += chalk.red.bgBlack(s) + '\n'
    e += '\n' + error
    exitWithError(e)
}

function exitWithError(error: string) {
    console.error(chalk.redBright(error + '\n'))
    process.exit(1)
}