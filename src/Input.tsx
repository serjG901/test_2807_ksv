import { useRef } from "react";
import colors from "./colors";

const getPayload = (size: number) => Array(+size).fill(Math.round(Math.random()));

interface IInput {
  files: Map<string, [number, number][]>;
  handleAdd: (name: string, size: number[]) => void;
}

export default function Input({ files, handleAdd }: IInput) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSave = (sizeFromButton = 0) => {
    const size = sizeFromButton || +inputRef.current?.value || 0;
    size = size < 1 ? 0 : size;
    if (size) {
      let randomColor = colors[Math.trunc(Math.random() * colors.length)];
      while (files.has(randomColor)) {
        randomColor = colors[Math.trunc(Math.random() * colors.length)];
      }
      handleAdd(randomColor, getPayload(size));
    }
  };
  return (
    <div className="field">
      <div>Enter size new block</div>
      <div className="buttons">{Array(10).fill(null).map((_,i) => (
      <button 
        onClick={() => handleSave(i%2 ? (i+1)*2 : (i+1)*2+1)}
        >
        {i%2 ? (i+1)*2 : (i+1)*2+1}
      </button>))}
      </div>
      <input
        type="number"
        ref={inputRef}
        required
        placeholder="5 or 9 and etc."
        min="1"
        max="100"
      />
      <button onClick={() => handleSave()}>Save</button>
    </div>
  );
}
