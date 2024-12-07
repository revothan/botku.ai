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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border"
    >
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-8 h-8 cursor-move hover:bg-gray-100 rounded-md"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="currentColor"
          className="text-gray-400"
        >
          <path d="M4 6h8v1H4V6zm0 3h8v1H4V9z" />
        </svg>
      </div>
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