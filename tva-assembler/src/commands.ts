type Command = {
    bytecode: number,
    requiresParameter: boolean
}

export let commandList = new Map<string, Command>([
    ['NOP', { bytecode: 0b0000, requiresParameter: false }],
    ['LDA', { bytecode: 0b0001, requiresParameter: true }],
    ['ADD', { bytecode: 0b0010, requiresParameter: true }],
    ['SUB', { bytecode: 0b0011, requiresParameter: true }],
    ['STA', { bytecode: 0b0100, requiresParameter: true }],
    ['LDV', { bytecode: 0b0101, requiresParameter: true }],
    ['ADV', { bytecode: 0b0110, requiresParameter: true }],
    ['SBV', { bytecode: 0b0111, requiresParameter: true }],
    ['JMP', { bytecode: 0b1000, requiresParameter: true }],
    ['JMZ', { bytecode: 0b1001, requiresParameter: true }],
    ['JMC', { bytecode: 0b1010, requiresParameter: true }],
    ['JNZ', { bytecode: 0b1011, requiresParameter: true }],
    ['JNC', { bytecode: 0b1100, requiresParameter: true }],
    ['OUT', { bytecode: 0b1110, requiresParameter: false }],
    ['HLT', { bytecode: 0b1111, requiresParameter: false }],
])
