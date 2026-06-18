"use client"

import { format } from "date-fns"
import * as React from "react"

import { Calendar03Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function dateStringToDate(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function dateToDateString(date: Date | undefined): string {
  if (!date) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  id?: string
  disabled?: boolean
  clearable?: boolean
}

function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder = "Pick a date",
  className,
  triggerClassName,
  id,
  disabled,
  clearable = true,
}: DatePickerProps) {
  const selected = dateStringToDate(value)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              data-empty={!selected}
              onBlur={onBlur}
              className={cn(
                "flex-1 justify-start h-12 rounded-none hover:bg-zinc-950 hover:text-white text-left font-normal  data-[empty=true]:text-muted-foreground",
                triggerClassName
              )}
            />
          }
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            strokeWidth={2}
            className="size-4"
          />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => onChange(dateToDateString(date))}
          />
        </PopoverContent>
      </Popover>
      {clearable && selected ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange("")}
          aria-label="Clear date"
          className="hover:bg-transparent hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}

export { DatePicker, dateStringToDate, dateToDateString }
