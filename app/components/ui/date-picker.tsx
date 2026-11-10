import * as Popover from "@radix-ui/react-popover";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Calendar } from "~/components/ui/calendar.tsx";
import { cn } from "~/lib/utils.ts";

interface DatePickerProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function DatePicker({ name, value, onChange, placeholder }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? parseISO(value) : undefined;

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3 text-left text-xs shadow-sm outline-none transition focus:border-[#B3202A] focus:ring-2 focus:ring-rose-100",
              !value && "text-stone-400"
            )}
          >
            {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: es }) : placeholder}
            <CalendarDays className="h-4 w-4 text-stone-400" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-50 rounded-2xl border border-stone-200 bg-white shadow-xl"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onChange(date ? format(date, "yyyy-MM-dd") : "");
                setOpen(false);
              }}
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="mb-3 ml-3 text-xs font-semibold text-stone-500 hover:text-[#B3202A]"
              >
                Limpiar fecha
              </button>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
