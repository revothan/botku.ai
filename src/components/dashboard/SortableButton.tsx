import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus } from "lucide-react";
import type { ButtonConfig } from "@/types/chatbot";

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

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  const handleInputChange = (field: "label" | "url", value: string) => {
    onUpdate(button.id, field, value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border"
      {...attributes}
    >
      <div className="flex-1 grid grid-cols-2 gap-3">
        <div className="relative">
          <Input
            placeholder="Button Label"
            value={button.label}
            onChange={(e) => handleInputChange("label", e.target.value)}
            onClick={(e) => e.stopPropagation()}
            {...listeners}
          />
        </div>
        <div className="relative">
          <Input
            placeholder="Button URL"
            value={button.url}
            onChange={(e) => handleInputChange("url", e.target.value)}
            onClick={(e) => e.stopPropagation()}
            {...listeners}
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        className="shrink-0"
        type="button"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SortableButton;