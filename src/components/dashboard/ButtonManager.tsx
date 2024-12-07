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
import { Plus, Minus } from "lucide-react";
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = buttons.findIndex((btn) => btn.id === active.id);
      const newIndex = buttons.findIndex((btn) => btn.id === over.id);
      onChange(arrayMove(buttons, oldIndex, newIndex));
    }
  };

  const addButton = () => {
    if (buttons.length < 4) {
      const newButton = {
        id: crypto.randomUUID(),
        label: "",
        url: "",
      };
      onChange([...buttons, newButton]);
    }
  };

  const removeButton = (id: string) => {
    onChange(buttons.filter((btn) => btn.id !== id));
  };

  const updateButton = (id: string, field: "label" | "url", value: string) => {
    onChange(
      buttons.map((btn) =>
        btn.id === id ? { ...btn, [field]: value } : btn
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Chatbot Buttons</h3>
        <Button
          onClick={addButton}
          disabled={buttons.length >= 4}
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
        <SortableContext items={buttons} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {buttons.map((button) => (
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