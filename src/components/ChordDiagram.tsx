import { ChordVariant } from '@/types';

interface ChordDiagramProps {
  chordName: string;
  chordMap: ChordVariant;
  fingering: string[];
}

export default function ChordDiagram({ chordName, chordMap, fingering }: ChordDiagramProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-semibold mb-2 text-center">{chordName}</div>
      <div className="bg-base-200 rounded-lg p-3">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-6"></th>
              {fingering.map((finger, index) => (
                <th key={index} className="w-6 text-center text-xs font-medium pb-1">
                  {finger !== '0' ? finger : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="border-t-2 border-base-content">
            {Object.entries(chordMap).map(([fret, strings]) => (
              <tr key={fret}>
                <td className="text-xs text-center pr-1">{fret}</td>
                {strings.map((isPressed: number, index: number) => (
                  <td
                    key={index}
                    className="relative border-b border-base-content"
                    style={{
                      background: 'linear-gradient(currentColor, currentColor) no-repeat center/1px 100%',
                    }}
                  >
                    <div className="h-4 w-6 flex items-center justify-center">
                      {isPressed === 1 && (
                        <div className="h-3 w-3 bg-base-content rounded-full"></div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
