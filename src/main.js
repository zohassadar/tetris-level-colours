import React, { useState } from 'react';
import { render } from 'react-dom';

const colorTable = [
    0x0f, 0x30, 0x21, 0x12, 0x0f, 0x30, 0x29, 0x1a, 0x0f, 0x30, 0x24, 0x14,
    0x0f, 0x30, 0x2a, 0x12, 0x0f, 0x30, 0x2b, 0x15, 0x0f, 0x30, 0x22, 0x2b,
    0x0f, 0x30, 0x00, 0x16, 0x0f, 0x30, 0x05, 0x13, 0x0f, 0x30, 0x16, 0x12,
    0x0f, 0x30, 0x27, 0x16,
];

// use meatfighter


function findOffset(rom) {
    return rom.findIndex((_, i, a) => {
        return a.slice(i, i + 7).every((d, i) => d === colorTable[i]);
    });
}

function LevelColours() {
    const [offset, setOffset] = useState(0x984c);

    return (
        <main>
            <h1>Universal ROM Level Colour GG Code Generator</h1>
            <p>
                colour table offset: <strong>0x{offset.toString(16)}</strong>
                {' '}
                <label htmlFor="file" className="file">
                    use custom ROM
                </label>
                <input id="file" type="file" onChange={(e) => {
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(e.target.files[0]);
                    reader.onloadend = () => {
                        const rom = [...new Uint8Array(reader.result)];
                        const offset = findOffset(rom.slice(0x10));
                        if (offset !== -1) {
                            setOffset(offset + 0x8000);
                        } else {
                            alert('ROM doesnt contain original colour data');
                        }
                    };
                    e.preventDefault();
                }} />
            </p>
        </main>
    );
}

render(
    <LevelColours />,
    document.body.appendChild(document.createElement('div')),
);
