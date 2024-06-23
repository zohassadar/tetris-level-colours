import React, { useState } from 'react';
import { render } from 'react-dom';
import { saveAs } from './saveas.js';
import {
    vanillaTable,
    prideTable,
    gym6Table1,
    gym6Table2,
    gym6Table3,
    lookup,
} from './colors';

function findOffset(table, rom) {
    return rom.findIndex((_, i, a) => {
        return a.slice(i, i + table.length).every((d, i) => d === table[i]);
    });
}

const lookupChunks = [];
const lookupClone = [...lookup];
while (lookupClone.length) {
    lookupChunks.push(lookupClone.splice(0, 0x10));
}

function genie(address, value) {
    const code = [];
    code[0] = (value & 7) + ((value >> 4) & 8);
    code[1] = ((value >> 4) & 7) + ((address >> 4) & 8);
    code[2] = (address >> 4) & 7;
    code[3] = (address >> 12) + (address & 8);
    code[4] = (address & 7) + ((address >> 8) & 8);
    code[5] = (address >> 8) & 7;
    code[5] += value & 8;
    return code.map((d) => 'APZLGITYEOXUKSVN'[d]).join('');
}
function getType(e, setRomType, setRom) {
    e.preventDefault();
    const reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onloadend = () => {
        const rom = [...new Uint8Array(reader.result)];
        setRom(rom);
        const offset = findOffset(vanillaTable, rom.slice(0x10));
        if (offset !== -1) {
            setRomType(new VanillaType(offset + 0x8000));
            return;
        }

        const offset1 = findOffset(gym6Table1, rom.slice(0x10)) + 0x8000;
        const offset2 = findOffset(gym6Table2, rom.slice(0x10)) + 0x8000;
        const offset3 = findOffset(gym6Table3, rom.slice(0x10)) + 0x8000;
        if (offset1 !== 0x7fff && offset2 !== 0x7fff && offset3 !== 0x7fff) {
            setRomType(new Gym6Type(offset1, offset2, offset3));
            return;
        }

        alert('ROM doesnt contain original colour data');
    };
}

function applyPatch(segments, rom, filename) {
    console.log(rom.length);
    let buffer = new Array(...rom);
    for (const [offset, table] of segments) {
        buffer.splice(offset - 0x7ff0, table.length, ...table);
    }
    saveAs(new Blob([new Uint8Array(buffer)]), `${filename}.nes`);
}

function getIPS(segments, filename) {
    let buffer = [];
    const sendWord = (word) =>
        buffer.push(
            ...[...Array(word.length).keys()].map((i) => word.charCodeAt(i)),
        );

    sendWord('PATCH');
    for (const [offset, table] of segments) {
        console.log(`${offset.toString(16)} ${JSON.stringify(table)}`);
        const converted = offset - 0x7ff0;
        buffer.push(0);
        buffer.push(converted >> 8);
        buffer.push(converted & 0xff);
        buffer.push(0);
        buffer.push(table.length);
        buffer.push(...table);
    }
    sendWord('EOF');
    saveAs(new Blob([new Uint8Array(buffer)]), `${filename}.ips`);
}
function VanillaType(offset) {
    this.offset = offset;

    this.getGgCode = function (level, color, chosen) {
        return genie(this.offset + level * 4 + color - 0x8000, chosen);
    };
    this.getSegments = function (table) {
        return [[this.offset, table]];
    };
    this.getOffset = function (level, color) {
        return (this.offset + level * 4 + color).toString(16);
    };
    this.getInfo = function () {
        return (
            <>
                {this.offset == 0x984c ? 'vanilla' : 'shifted'} table offset:{' '}
                <strong>0x{this.offset.toString(16)}</strong>{' '}
            </>
        );
    };
}

function Gym6Type(offset1, offset2, offset3) {
    this.offsets = [null, offset1, offset2, offset3];

    this.getGgCode = function (level, color, chosen) {
        return genie(this.offsets[color] + level - 0x8000, chosen);
    };
    this.getSegments = function (table) {
        let table1 = [];
        let table2 = [];
        let table3 = [];
        for (let i = 0; i < table.length; i += 4) {
            table1.push(table[i + 1]);
            table2.push(table[i + 2]);
            table3.push(table[i + 3]);
        }
        return [
            [this.offsets[1], table1],
            [this.offsets[2], table2],
            [this.offsets[3], table3],
        ];
    };
    this.getOffset = function (level, color) {
        return (this.offsets[color] + level).toString(16);
    };
    this.getInfo = function () {
        return (
            <>
                gym6 table offsets:{' '}
                <strong>
                    {`0x${this.offsets[1].toString(16)}`}
                    {', '}
                    {`0x${this.offsets[2].toString(16)}`}
                    {', '}
                    {`0x${this.offsets[3].toString(16)}`}
                </strong>{' '}
            </>
        );
    };
}

function LevelColours() {
    const [rom, setRom] = useState(undefined);
    const [filename, setFilename] = useState('custom-colors');
    const [romType, setRomType] = useState(new VanillaType(0x984c));
    const [level, setLevel] = useState(0);
    const [color, setColor] = useState(1);
    const [chosen, setChosen] = useState(undefined);
    const [newTable, setNewTable] = useState(vanillaTable.slice());

    let colorIndex = 0;

    return (
        <main>
            <h1>Universal Tetris ROM Colour Generator</h1>

            <p className="offset">
                {romType.getInfo()}
                <label htmlFor="file" className="file">
                    use custom ROM
                </label>
                <input
                    id="file"
                    type="file"
                    onChange={(e) => getType(e, setRomType, setRom)}
                />
            </p>
            <p>
                <button onClick={() => setNewTable(vanillaTable.slice())}>
                    Reset Defaults
                </button>
            </p>
            <p>
                <button onClick={() => setNewTable(prideTable.slice())}>
                    Pride Colors
                </button>
            </p>
            {/*
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {Array.from({ length: 30 }, (_, i) => (
                    <option key={i} value={i}>
                        level {i}
                    </option>
                ))}
            </select>
            */}
            {Array.from({ length: 10 }, (_, l) => (
                <p key={l} className={level == l ? 'selectedRow' : ''}>
                    {l}
                    {'  '}
                    {Array.from({ length: 3 }, (_, i) => (
                        <button
                            key={i}
                            style={{
                                backgroundColor:
                                    lookup[newTable[l * 4 + i + 1]],
                                borderColor:
                                    level == l && color == i + 1
                                        ? '#DDD'
                                        : '#777',
                            }}
                            onClick={() => {
                                setLevel(l);
                                setColor(i + 1);
                            }}
                        >
                            &nbsp;
                        </button>
                    ))}
                </p>
            ))}
            {!!color && (
                <p>
                    choose colour for level: <strong>{level}</strong> colour:{' '}
                    <strong>{color}</strong>
                </p>
            )}
            {!!color &&
                lookupChunks.map((chunk, i) => (
                    <div key={i}>
                        {chunk.map((hex, i) => (
                            <button
                                style={{ backgroundColor: hex }}
                                key={i}
                                data-index={colorIndex}
                                onClick={(e) => {
                                    const newChosen = Number(
                                        e.target.dataset.index,
                                    );
                                    setChosen(newChosen);

                                    const newNewTable = newTable.slice();
                                    newNewTable[level * 4 + color] = newChosen;
                                    setNewTable(newNewTable);
                                }}
                            >
                                {(colorIndex++)
                                    .toString(16)
                                    .toUpperCase()
                                    .padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                ))}
            {typeof chosen !== 'undefined' && (
                <p>
                    offset:
                    <strong>
                        0x{romType.getOffset(level, color)}
                    </strong> value: <strong>0x{chosen.toString(16)}</strong>
                </p>
            )}

            {typeof chosen !== 'undefined' && (
                <pre>{romType.getGgCode(level, color, chosen)}</pre>
            )}
            <>
                <p>
                    filename:
                    <input
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                    />
                </p>
                <p>
                    Patch:
                    <button
                        onClick={() =>
                            getIPS(romType.getSegments(newTable), filename)
                        }
                    >
                        {`${filename}.ips`}
                    </button>
                </p>
            </>
            {typeof rom !== 'undefined' && (
                <p>
                    Patched:
                    <button
                        onClick={() =>
                            applyPatch(
                                romType.getSegments(newTable),
                                rom,
                                filename,
                            )
                        }
                    >
                        {`${filename}.nes`}
                    </button>
                </p>
            )}
        </main>
    );
}

render(
    <LevelColours />,
    document.body.appendChild(document.createElement('div')),
);
