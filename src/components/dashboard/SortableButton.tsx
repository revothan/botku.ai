import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { minus } from "lucide-react";

type ButtonConfig = {
  id: string;
  label: string;
  url: string;
};

type SortableButtonProps = {
  button: ButtonConfig;
  onRemove: () => void;
  onUpdate: (id: string, field: "label" | "url", value: string) => void;
};

const SortableButton = ({ button, onRemove, onUpdate }: SortableButtonProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: button.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="flex-1 grid grid-cols-2 gap-3">
        <Input
          placeholder="Button Label"
          value={button.label}
          onChange={(e) => onUpdate(button.id, "label", e.target.value)}
        />
        <Input
          placeholder="Button URL"
          value={button.url}
          onChange={(e) => onUpdate(button.id, "url", e.target.value)}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="shrink-0"
      >
        <minus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SortableButton;