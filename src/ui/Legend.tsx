const LEG: [string, string][] = [
  ['#E04808', 'Root'], ['#149A70', '3rd'], ['#3A70B8', '5th'],
  ['#A028B0', '7th'], ['#6840C8', 'Extension'],
];

export default function Legend() {
  return (
    <div id="legend">
      {LEG.map(([c, l]) => (
        <div key={l} className="leg">
          <div className="leg-dot" style={{ background: c }} />
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}
