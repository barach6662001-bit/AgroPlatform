import * as React from 'react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function DateRangePicker({
  value, onChange, className,
}: {
  value?: DateRange
  onChange?: (r: DateRange | undefined) => void
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal', !value?.from && 'text-fg-tertiary', className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>{format(value.from, 'dd.MM.yy', { locale: uk })} – {format(value.to, 'dd.MM.yy', { locale: uk })}</>
            ) : (
              format(value.from, 'dd.MM.yyyy', { locale: uk })
            )
          ) : 'Виберіть діапазон'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          locale={uk}
          weekStartsOn={1}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
