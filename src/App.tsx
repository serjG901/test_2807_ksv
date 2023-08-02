import { useState } from "react";
import "./App.css";
import FS from "./core";
import Input from "./Input";
import Block from "./Block";

type TBit = number | null;
type TMemory = TBit[];

const fs = new FS(100, 10);

export default function App() {
  const [state, setState] = useState<TMemory>(fs.memory);
  const [error, setError] = useState("");
  const [stateOfActive, setStateOfActive] = useState<string[]>([]);
  const handleAdd = (name: string, size: number[]) => {
    try {
      const newState = fs.add(name, size);
      setError(``);
      setState([...newState]);
    } catch (error) {
      setError(`Can't save, not enough memory.`);
    }
  };
  const handleDelete = (color: string) => {
    const newState = fs.del(color);
    setState([...newState]);
  };
  const handleSetActive = (color: string) => {
    if (stateOfActive.find((c) => c === color)) {
      setStateOfActive((s) => s.filter((c) => c !== color));
    } else {
      setStateOfActive((s) => [...s, color]);
    }
  };
  const handleDefrag = () => {
    const newState = FS.defragmentation(fs);
    setState([...newState]);
  };
  return (
    <div className="app">
      <Input files={fs.fileRegyster} handleAdd={handleAdd} />
      <div>{error}</div>
      <div className="blocks">
        {state.map((_, index) => (
          <Block
            key={index}
            color={fs.checkFileName(index)}
            handleDelete={handleDelete}
            active={stateOfActive}
            handleSetActive={handleSetActive}
          />)
          )}
      </div>
      <button onClick={handleDefrag}>Defragmentation</button>
    </div>
  );
}
