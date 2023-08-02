import { useRef } from "react";
import colors from "./colors";

const getPayload = (size: number) => Array(+size).fill(Math.round(Math.random()));

interface IInput {
  files: Map<string, [number, number][]>;
  handleAdd: (name: string, size: number[]) => void;
}

export default function Input({ files, handleAdd }: IInput) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSave = () => {
    const size = inputRef.current?.value || 0;
    if (size) {
      let randomColor = colors[Math.trunc(Math.random() * colors.length)];
      while (files.has(randomColor)) {
        randomColor = colors[Math.trunc(Math.random() * colors.length)];
      }
      handleAdd(randomColor, getPayload(+size));
    }
  };
  return (
    <div className="field">
      <div>Enter size new block</div>
      <input
        type="number"
        ref={inputRef}
        required
        placeholder="5 or 9 and etc."
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
