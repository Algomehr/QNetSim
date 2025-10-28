import React from 'react';

type ComplexNumber = [number, number]; // [real, imaginary]
type DensityMatrix = ComplexNumber[][];

interface HintonDiagramProps {
    matrixString: string;
}

export const HintonDiagram: React.FC<HintonDiagramProps> = ({ matrixString }) => {
    let matrix: DensityMatrix;
    try {
        matrix = JSON.parse(matrixString);
        if (!Array.isArray(matrix) || !Array.isArray(matrix[0]) || !Array.isArray(matrix[0][0])) {
            throw new Error("Invalid matrix format");
        }
    } catch (error) {
        console.error("Failed to parse density matrix:", error);
        return <p className="text-xs text-red-400">خطا در نمایش نمودار هینتون.</p>;
    }

    const size = matrix.length;
    const numQubits = Math.log2(size);
    if (!Number.isInteger(numQubits)) {
        return <p className="text-xs text-red-400">اندازه ماتریس نامعتبر است.</p>;
    }

    const basisLabels = Array.from({ length: size }, (_, i) =>
        `|${i.toString(2).padStart(numQubits, '0')}⟩`
    );

    let maxAbsVal = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const val = Math.abs(matrix[i][j][0]); // Using real part
            if (val > maxAbsVal) {
                maxAbsVal = val;
            }
        }
    }
    
    if (maxAbsVal === 0) maxAbsVal = 1; // Avoid division by zero

    const boxSize = 250;
    const cellSize = boxSize / size;
    const labelOffset = 40;
    const totalSize = boxSize + labelOffset;

    return (
        <div className="flex justify-center items-center bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <svg viewBox={`-5 -${labelOffset} ${totalSize+5} ${totalSize+5}`} width="100%" height="auto">
                {/* Labels */}
                {basisLabels.map((label, i) => (
                    <React.Fragment key={`label-${i}`}>
                        <text x={i * cellSize + cellSize / 2} y={-10} textAnchor="middle" fontSize="10" fill="#9ca3af" className="font-mono">{label}</text>
                        <text x={-10} y={i * cellSize + cellSize / 2} dominantBaseline="middle" textAnchor="end" fontSize="10" fill="#9ca3af" className="font-mono">{label}</text>
                    </React.Fragment>
                ))}

                {/* Grid Lines */}
                {Array.from({ length: size + 1 }).map((_, i) => (
                    <React.Fragment key={`grid-${i}`}>
                        <line x1={i * cellSize} y1={0} x2={i * cellSize} y2={boxSize} stroke="#4b5563" strokeWidth="0.5" />
                        <line x1={0} y1={i * cellSize} x2={boxSize} y2={i * cellSize} stroke="#4b5563" strokeWidth="0.5" />
                    </React.Fragment>
                ))}

                {/* Hinton Squares */}
                {matrix.map((row, i) =>
                    row.map((cell, j) => {
                        const realPart = cell[0];
                        const squareSize = Math.sqrt(Math.abs(realPart) / maxAbsVal) * cellSize * 0.95;
                        const offset = (cellSize - squareSize) / 2;

                        return (
                            <rect
                                key={`${i}-${j}`}
                                x={j * cellSize + offset}
                                y={i * cellSize + offset}
                                width={squareSize}
                                height={squareSize}
                                fill={realPart >= 0 ? '#67e8f9' : '#1e293b'}
                                stroke={realPart >=0 ? '#0891b2' : '#475569' }
                                strokeWidth="0.5"
                            >
                                <title>{`ρ[${i},${j}] = ${realPart.toFixed(3)}`}</title>
                            </rect>
                        );
                    })
                )}
            </svg>
        </div>
    );
};