import SerialPort from 'serialport'

async function read(serial: SerialPort, length: number, tt = 1000) {
    function readChunk(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject('serial timed out'), tt)
            serial.once('data', data => {
                clearTimeout(timeout)
                resolve(data)
            })
        })
    }

    let buf = Buffer.from([])
    while (buf.length < length) {
        buf = Buffer.concat([buf, await readChunk()])

    }
    return buf
}

async function write(serial: SerialPort, data: Buffer): Promise<void> {
    const chunkSize = 32
    function writeChunk(chunk: Buffer) {
        return new Promise<void>((res, rej) => {
            serial.write(chunk, () => res())
        })
    }

    let currentLenght = 0
    while (currentLenght < data.length) {
        await writeChunk(data.slice(currentLenght, currentLenght + chunkSize))
        currentLenght += chunkSize
    }
}

function connect(serial: SerialPort): Promise<void> {
    return new Promise((resolve, reject) => {
        let conn = async () => {
            await write(serial, Buffer.from([0x01]))
            try {
                let buf = await read(serial, 1)
                if (buf.at(0) !== 0x01) {
                    console.log(buf)
                    throw new Error('')
                }
                resolve()
            } catch (e) {
                process.stdout.write('.')
                setTimeout(conn, 100)
            }
        }
        conn()
        setTimeout(() => reject('Connection timed out'), 100000)
    })
}

export async function upload(port: string, data: Buffer): Promise<void> {
    const serial = new SerialPort(port, { baudRate: 115200 })
    process.stdout.write('connecting.')
    await connect(serial)
    await write(serial, Buffer.from([data.length >> 8, data.length]))
    const checkLengthBuf = await read(serial, 2)
    const checkLength = (checkLengthBuf.at(0)! << 8) + checkLengthBuf.at(1)!
    if (checkLength === data.length) {
        process.stdout.write('writing to EEPROM!\n')
        await write(serial, data)
        let checkData = await read(serial, data.length, 100000)
        let errors = checkData.reduce((tot, b, i) => tot += (b === data.at(i)) ? 0 : 1, 0)
        process.stdout.write(`upload completed with ${errors} errors!\n`)
    } else {
        process.stderr.write(`wrong length recieved (correct: ${data.length}, recieved: ${checkLength})\n`)
    }
}