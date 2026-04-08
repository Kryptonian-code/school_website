import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  fromYear?: number;
  toYear?: number;
}

const DatePicker = ({
  id,
  value,
  onChange,
  placeholder = "Select a date",
  className,
  fromYear = 1990,
  toYear = new Date().getFullYear(),
}: DatePickerProps) => {
  const selectedDate = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-start rounded-xl border-input/90 bg-background/90 px-3.5 text-left text-sm font-normal shadow-sm hover:bg-background",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {selectedDate ? format(selectedDate, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-2xl border-border/80 bg-popover/95 p-0 shadow-lg">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          captionLayout="dropdown-buttons"
          fromYear={fromYear}
          toYear={toYear}
          className="rounded-2xl"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
