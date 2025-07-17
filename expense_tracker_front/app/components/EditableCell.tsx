import { CellProps } from "react-table";
import { useState } from "react";
import { Expense } from "../interfaces/interfaces";
import { validateUpdate } from "../utils/validations";

interface EditableCellProps extends CellProps<Expense> {
  updateExpense: (
    rowIndex: number,
    columnId: string,
    value: number | string | boolean
  ) => void;
  editable: boolean;
  identifier: string;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value: initialValue,
  row,
  column,
  updateExpense,
  editable,
  identifier,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const onBlur = (identifier: string) => {
    const isUpdateValid = validateUpdate(value, identifier);
    if (value === initialValue || !isUpdateValid) {
      alert(`Invalid ${identifier} update!`);
      setValue(initialValue);
      setIsEditing(false);
      return;
    } // No change or invalid update

    setIsEditing(false);
    updateExpense(row.index, column.id, value);
  };

  return (
    <div
      onClick={() => editable && setIsEditing(true)}
      style={{ cursor: editable ? "pointer" : "default" }}
    >
      {isEditing ? (
        <input
          type="text"
          value={value}
          className="text-center"
          placeholder={`Enter new ${identifier}`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setValue(event.target.value)
          }
          onBlur={() => onBlur(identifier)}
          autoFocus
        />
      ) : (
        value // React will implicitly convert non-string values to strings
      )}
    </div>
  );
};

export default EditableCell;
