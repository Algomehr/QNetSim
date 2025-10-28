import React from 'react';

interface DensityMatrixViewerProps {
    matrixString: string;
}

type ComplexNumber = [number, number]; // [real, imaginary]
type DensityMatrix = ComplexNumber[][];

const formatComplex = (c: ComplexNumber): string => {
    const real = c[0];
    const imag = c[1];

    if (Math.abs(real) < 1e-4 && Math.abs(imag) < 1e-4) return "0";
    if (Math.abs(imag) < 1e-4) return real.toFixed(2);
    if (Math.abs(real) < 1e-4) return `${imag.toFixed(2)}i`;

    return `${real.toFixed(2)} ${imag > 0 ? '+' : '-'} ${Math.abs(imag).toFixed(2)}i`;
};

export const DensityMatrixViewer: React.FC<DensityMatrixViewerProps> = ({ matrixString }) => {
    let matrix: DensityMatrix;
    try {
        matrix = JSON.parse(matrixString);
        if (!Array.isArray(matrix) || !Array.isArray(matrix[0]) || !Array.isArray(matrix[0][0])) {
            throw new Error("Invalid matrix format");
        }
    } catch (error) {
        console.error("Failed to parse density matrix:", error);
        return <p className="text-xs text-red-400">خطا در نمایش ماتریس چگالی.</p>;
    }

    const numQubits = Math.log2(matrix.length);
    const basisLabels = Array.from({ length: matrix.length }, (_, i) =>
        `|${i.toString(2).padStart(numQubits, '0')}⟩`
    );

    const getCellColor = (c: ComplexNumber): React.CSSProperties => {
        const magnitude = Math.sqrt(c[0] * c[0] + c[1] * c[1]);
        if (magnitude < 1e-4) {
            return { backgroundColor: 'rgba(31, 41, 55, 0.5)' }; // Corresponds to bg-gray-800/50
        }
        const opacity = Math.min(1, magnitude * 1.5);
        return { backgroundColor: `rgba(22, 163, 175, ${opacity})` }; // teal color
    }

    return (
        <div className="overflow-x-auto p-2 bg-gray-900 rounded-lg border border-gray-700">
            <table className="w-full text-center text-xs font-mono border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 border border-gray-600">ρ</th>
                        {basisLabels.map(label => (
                            <th key={label} className="p-2 border border-gray-600 text-cyan-300">{label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {matrix.map((row, i) => (
                        <tr key={i}>
                            <td className="p-2 border border-gray-600 text-cyan-300">{basisLabels[i]}</td>
                            {row.map((cell, j) => (
                                <td key={j} className="p-2 border border-gray-600" style={getCellColor(cell)}>
                                    <div className="flex flex-col">
                                        <span>{cell[0].toFixed(2)}</span>
                                        <span className={cell[1] >= 0 ? "text-green-400" : "text-red-400"}>
                                          {cell[1] >= 0 ? '+' : ''}{cell[1].toFixed(2)}i
                                        </span>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};