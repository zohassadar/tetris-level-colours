import React, { useState } from 'react';
import { render } from 'react-dom';
import { colorTable, lookup } from './colors';

function findOffset(rom) {
    return rom.findIndex((_, i, a) => {
        return a.slice(i, i + colorTable.length).every((d, i) => d === colorTable[i]);
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

function LevelColours() {
    const [offset, setOffset] = useState(0x984c);
    const [level, setLevel] = useState(18);
    const levelOffset = (level % 10) * 4;
    const [color, setColor] = useState(0);
    const [chosen, setChosen] = useState(undefined);

    let colorIndex = 0;

    return (
        <main>
            <h1>Universal Tetris ROM Colour Generator</h1>

            <p className="offset">
                colour table offset: <strong>0x{offset.toString(16)}</strong>{' '}
                <label htmlFor="file" className="file">
                    use custom ROM
                </label>
                <input
                    id="file"
                    type="file"
                    onChange={(e) => {
                        const reader = new FileReader();
                        reader.readAsArrayBuffer(e.target.files[0]);
                        reader.onloadend = () => {
                            const rom = [...new Uint8Array(reader.result)];
                            const offset = findOffset(rom.slice(0x10));
                            if (offset !== -1) {
                                setOffset(offset + 0x8000);
                            } else {
                                alert(
                                    'ROM doesnt contain original colour data',
                                );
                            }
                        };
                        e.preventDefault();
                    }}
                />
            </p>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {Array.from({ length: 30 }, (_, i) => (
                    <option key={i} value={i}>
                        level {i}
                    </option>
                ))}
            </select>
            <p>
                {Array.from({ length: 3 }, (_, i) => (
                    <button
                        key={i}
                        style={{
                            backgroundColor:
                                lookup[colorTable[levelOffset + i + 1]],
                        }}
                        onClick={() => setColor(i + 1)}
                    >
                        &nbsp;
                    </button>
                ))}
            </p>
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
                                onClick={(e) =>
                                    setChosen(Number(e.target.dataset.index))
                                }
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
                    offset:{' '}
                    <strong>
                        0x{(offset + levelOffset + color).toString(16)}
                    </strong>{' '}
                    value: <strong>0x{chosen.toString(16)}</strong>
                </p>
            )}

            {typeof chosen !== 'undefined' && (
                <pre>{genie(offset + levelOffset + color - 0x8000, chosen)}</pre>
            )}
        </main>
    );
}

render(
    <LevelColours />,
    document.body.appendChild(document.createElement('div')),
);
