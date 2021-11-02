import React, { useState } from 'react';
import { render } from 'react-dom';
import { colorTable, lookup } from './colors';

// use meatfighter for colour format

function findOffset(rom) {
    return rom.findIndex((_, i, a) => {
        return a.slice(i, i + 7).every((d, i) => d === colorTable[i]);
    });
}

// make lookup table for hex to colours
// level dropdown with 3 colours

function LevelColours() {
    const [offset, setOffset] = useState(0x984c);

    return (
        <main>
            <h1>Universal Tetris ROM Colour Generator</h1>
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
            <p>

            </p>
        </main>
    );
}

render(
    <LevelColours />,
    document.body.appendChild(document.createElement('div')),
);
