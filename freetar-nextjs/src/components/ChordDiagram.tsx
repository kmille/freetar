import { ChordVariant } from '@/types';

interface ChordDiagramProps {
  chordName: string;
  chordMap: ChordVariant;
  fingering: string[];
}

export default function ChordDiagram({ chordName, chordMap, fingering }: ChordDiagramProps) {
  return (
    <div className="text-center">
      <div>{chordName}</div>
      <table className="table table-borderless table-sm p-2 bg-light rounded text-black">
        <thead>
          <tr>
            <th></th>
            {fingering.map((finger, index) => (
              <th key={index}>{finger !== '0' ? finger : ''}</th>
            ))}
          </tr>
        </thead>
        <tbody className="border-3 border-start-0 border-end-0 border-bottom-0 border-black">
          {Object.entries(chordMap).map(([fret, strings]) => (
            <tr key={fret} style={{ fontSize: '0.75rem' }}>
              <td className="m-0 p-0">{fret}</td>
              {strings.map((string, index) => (
                <td
                  key={index}
                  className="m-0 p-0 border-bottom border-black"
                  style={{
                    background: 'linear-gradient(#000, #000) no-repeat center/1px 100%',
                  }}
                >
                  <div
                    className={`text-align-center text-center m-0 p-0 ${
                      string === 1 ? 'bg-black rounded-circle' : ''
                    }`}
                    style={{ height: '1rem', width: '1rem' }}
                  ></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
