import React, { useState } from 'react';
import { render } from 'react-dom';

const flashSequence = [0xa9,0x3f,
    0x8d,0x06,0x20,
    0xa9,0x0e,
    0x8d,0x06,0x20];

const solidSequence = [0x29, 0x03,
    0xd0, 0x0d,
    0xa2, 0x30,
    0xa5, 0xb1,
    0x29, 0x07,
    0xd0, 0x05];

function findOffset(rom, sequence) {
    return rom.findIndex((_, i, a) => {
        return a.slice(i, i + sequence.length).every((d, i) => d === sequence[i]);
    });
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
    const [flashOffset, setFlashOffset] = useState(0x9673);
    const [solidOffset, setSolidOffset] = useState(0x9687);

    return (
        <main>
            <h1>disable tetris flash in any rom</h1>

            <p className="offset">
                flash code offset: <strong>0x{flashOffset.toString(16)}</strong><br />
                solid code offset: <strong>0x{solidOffset.toString(16)}</strong>
                <p>
                    <label htmlFor="file" className="file">
                        use custom ROM
                    </label>
                </p>
                <input
                    id="file"
                    type="file"
                    onChange={(e) => {
                        const reader = new FileReader();
                        reader.readAsArrayBuffer(e.target.files[0]);
                        reader.onloadend = () => {
                            const rom = [...new Uint8Array(reader.result)];
                            const flashOffset = findOffset(rom.slice(0x10), flashSequence);
                            const solidOffset = findOffset(rom.slice(0x10), solidSequence);

                            if (flashOffset !== -1) {
                                setFlashOffset(flashOffset + 0x8000);
                            } else {
                                setFlashOffset(0);
                                alert(
                                    'ROM doesnt contain flash byte sequence',
                                );
                            }
                            if (solidOffset != -1) {
                                setSolidOffset(solidOffset + 0x8000);
                            } else {
                                setSolidOffset(0);
                                alert(
                                    'ROM doesnt contain solid byte sequence',
                                );
                            }
                        };
                        e.preventDefault();
                    }}
                />
            </p>
            <p>no flash</p>
            <pre>{ flashOffset ? genie(flashOffset + 0x1 - 0x8000, 0x16) : "N/A" }</pre>
            <p>solid white alternative</p>
            <pre>{ solidOffset ? genie(solidOffset + 0x1 - 0x8000, 0x00) : "N/A" }</pre>
        </main>
    );
}

render(
    <LevelColours />,
    document.body.appendChild(document.createElement('div')),
);
