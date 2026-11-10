import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils.ts";

export function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold text-stone-900",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 h-7 w-7 rounded-lg border border-stone-200 bg-white p-0 text-stone-500 hover:bg-rose-50 hover:text-[#B3202A]",
        button_next:
          "absolute right-1 h-7 w-7 rounded-lg border border-stone-200 bg-white p-0 text-stone-500 hover:bg-rose-50 hover:text-[#B3202A]",
        chevron: "h-4 w-4",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "w-9 rounded-md text-[0.7rem] font-semibold text-stone-400",
        week: "mt-1 flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-xs",
        day_button:
          "h-9 w-9 rounded-lg p-0 font-normal hover:bg-rose-50 hover:text-[#B3202A]",
        selected:
          "bg-[#B3202A] text-white hover:bg-[#8B1820] hover:text-white focus:bg-[#B3202A] focus:text-white",
        today: "font-bold text-[#B3202A]",
        outside: "text-stone-300",
        disabled: "text-stone-300 opacity-50",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
