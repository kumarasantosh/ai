"use client";

import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";

interface SectionFormProps {
  sectionIndex: number;
  removeSection: (index: number) => void;
}

export default function SectionForm({
  sectionIndex,
  removeSection,
}: SectionFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.units`,
  });

  return (
    <div className="border p-4 rounded space-y-4 bg-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Section {sectionIndex + 1}</h3>
        <Button
          variant="destructive"
          type="button"
          onClick={() => removeSection(sectionIndex)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Input
        {...register(`sections.${sectionIndex}.title`)}
        placeholder="Section Title"
      />
      <Input
        {...register(`sections.${sectionIndex}.description`)}
        placeholder="Section Description"
      />

      {unitFields.map((unit, unitIndex) => (
        <div
          key={unit.id || unitIndex}
          className="border p-3 rounded space-y-2 bg-white"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Unit {unitIndex + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeUnit(unitIndex)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
          <Input
            {...register(`sections.${sectionIndex}.units.${unitIndex}.title`)}
            placeholder="Unit Title"
          />
          <Input
            {...register(`sections.${sectionIndex}.units.${unitIndex}.content`)}
            placeholder="Unit Content"
          />
          <Input
            {...register(`sections.${sectionIndex}.units.${unitIndex}.prompt`)}
            placeholder="Unit Prompt"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          appendUnit({
            title: "",
            content: "",
            prompt: "",
          })
        }
      >
        <Plus className="mr-2 w-4 h-4" />
        Add Unit
      </Button>
    </div>
  );
}
