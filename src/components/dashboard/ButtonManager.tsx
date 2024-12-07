import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import SortableButton from "./SortableButton";

type ButtonConfig = {
  id: string;
  label: string;
  url: string;
};

type ButtonManagerProps = {
  buttons: ButtonConfig[];
  onChange: (buttons: ButtonConfig[]) => void;
};

const ButtonManager = ({ buttons = [], onChange }: ButtonManagerProps) => {
  const [localButtons, setLocalButtons] = useState<ButtonConfig[]>(buttons);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = localButtons.findIndex((btn) => btn.id === active.id);
      const newIndex = localButtons.findIndex((btn) => btn.id === over.id);
      const newButtons = arrayMove(localButtons, oldIndex, newIndex);
      setLocalButtons(newButtons);
      onChange(newButtons);
    }
  };

  const addButton = () => {
    if (localButtons.length < 4) {
      const newButton = {
        id: crypto.randomUUID(),
        label: "",
        url: "",
      };
      const newButtons = [...localButtons, newButton];
      setLocalButtons(newButtons);
      onChange(newButtons);
    }
  };

  const removeButton = (id: string) => {
    const newButtons = localButtons.filter((btn) => btn.id !== id);
    setLocalButtons(newButtons);
    onChange(newButtons);
  };

  const updateButton = (id: string, field: "label" | "url", value: string) => {
    const newButtons = localButtons.map((btn) =>
      btn.id === id ? { ...btn, [field]: value } : btn
    );
    setLocalButtons(newButtons);
    onChange(newButtons);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Chatbot Buttons</h3>
        <Button
          onClick={addButton}
          disabled={localButtons.length >= 4}
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Button
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localButtons} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {localButtons.map((button) => (
              <SortableButton
                key={button.id}
                button={button}
                onRemove={() => removeButton(button.id)}
                onUpdate={updateButton}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ButtonManager;