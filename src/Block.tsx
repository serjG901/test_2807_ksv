interface IBlock {
  color: string | null;
  handleDelete: (color: string) => void;
  active: string[];
  handleSetActive: (color: string) => void;
}

export default function Input({
  color,
  handleDelete,
  active,
  handleSetActive,
}: IBlock) {
  const handleDubleClick = () => {
    if (color) handleDelete(color);
  };
  const handleClick = () => {
    if (color) handleSetActive(color);
  };
  return (
    <div
      className={`block ${color ? color : ""} ${
        active.find((c) => c === color) ? "active" : ""
      }`}
      onDoubleClick={handleDubleClick}
      onClick={handleClick}
    ></div>
  );
}
