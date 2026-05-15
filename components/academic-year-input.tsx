'use client'

import { Input } from '@/components/ui/input'

interface AcademicYearInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function AcademicYearInput({
  value,
  onChange,
  placeholder = '2026',
  className,
}: AcademicYearInputProps) {
  const startYear = value.split('/')[0] || ''

  const endYear =
    startYear.length === 4
      ? String(Number(startYear) + 1)
      : ''

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Input
          value={startYear}
          placeholder={placeholder}
          maxLength={4}
          inputMode="numeric"
          className={className}
          onChange={(e) => {
            const cleaned = e.target.value
              .replace(/\D/g, '')
              .slice(0, 4)

            if (!cleaned) {
              onChange('')
              return
            }

            onChange(
              `${cleaned}/${Number(cleaned) + 1}`
            )
          }}
        />

        <span className="text-sm text-muted-foreground">
          /
        </span>

        <div className="flex h-10 min-w-[90px] items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
          {endYear || '----'}
        </div>
      </div>

      {value && (
        <p className="text-xs text-muted-foreground">
          Academic Year: {value}
        </p>
      )}
    </div>
  )
}