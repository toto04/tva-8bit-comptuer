import fs from 'fs'

import { instructionList } from './instructions.js'

const adr_in = 1 << 0
const m_in = 1 << 1
const m_out = 1 << 2
const ins_in = 1 << 3

const out = 1 << 4
const pc_in = 1 << 5
const pc_out = 1 << 6
const pc_en = 1 << 7
const dsp = 1 << 8
const a_in = 1 << 9
const a_out = 1 << 10
const b_in = 1 << 11
const f_in = 1 << 12
const sub = 1 << 13
const sum_out = 1 << 14
const hlt = 1 << 15

const steps: [number, number, number, number][] = [
    [0, 0, 0, 0],
    [adr_in + pc_out, adr_in + m_out + pc_en, m_out + a_in, 0],
    [adr_in + pc_out, adr_in + m_out + pc_en, m_out + b_in, sum_out + a_in + f_in],
    [adr_in + pc_out, adr_in + m_out + pc_en, m_out + b_in, sum_out + a_in + f_in + sub],
    [adr_in + pc_out, adr_in + m_out + pc_en, a_out + m_in, 0],
    [adr_in + pc_out, m_out + pc_en + a_in, 0, 0],
    [adr_in + pc_out, m_out + pc_en + b_in, sum_out + a_in + f_in, 0],
    [adr_in + pc_out, m_out + pc_en + b_in, sum_out + a_in + f_in + sub, 0],
    [adr_in + pc_out, m_out + pc_in, 0, 0],
    [adr_in + pc_out, m_out + pc_in, 0, 0],
    [adr_in + pc_out, m_out + pc_in, 0, 0],
    [adr_in + pc_out, m_out + pc_in, 0, 0],
    [adr_in + pc_out, m_out + pc_in, 0, 0],
    [a_out + dsp, 0, 0, 0],
    [a_out + out, 0, 0, 0],
    [hlt, hlt, hlt, hlt]
]

export function generateMicrocode() {
    let content: Buffer = Buffer.alloc(2048)

    const JMC = instructionList.get('JMC')?.bytecode
    const JMZ = instructionList.get('JMZ')?.bytecode
    const JNC = instructionList.get('JNC')?.bytecode
    const JNZ = instructionList.get('JNZ')?.bytecode

    for (let index = 0; index < 2048; index++) {
        // 0 zc b sss iiii 
        const inst = (index & 0b1111) >> 0
        const step = (index & 0b111_0000) >> 4
        const bs = (index & 0b1_000_0000) >> 7
        const c_flag = (index & 0b01_0_000_0000) >> 8
        const z_flag = (index & 0b10_0_000_0000) >> 9

        let cell: number

        if (step === 0)
            cell = pc_out + adr_in
        else if (step === 1)
            cell = m_out + ins_in + pc_en
        else {
            if (
                (inst === JMC && !c_flag)
                || (inst === JMZ && !z_flag)
                || (inst === JNC && c_flag)
                || (inst === JNZ && z_flag)
            ) cell = (step === 2) ? pc_en : 0
            else cell = steps[inst][step - 2]
        }

        // select the byte with bs
        cell = cell >> (8 * bs) & 0xff
        // active low, invert the bits
        content[index] = cell ^ 0xff
    }

    return content
}