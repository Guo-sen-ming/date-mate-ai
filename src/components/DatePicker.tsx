import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse, isValid, getDaysInMonth } from 'date-fns'
import { TextField, Button } from '@radix-ui/themes'
import { CalendarIcon } from '@radix-ui/react-icons'
import Picker from 'react-mobile-picker'
import 'react-day-picker/style.css'
import styles from './DatePicker.module.scss'

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

const MOBILE_BREAKPOINT = 768

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

// Generate year options from 1950 to current year
function getYears(): string[] {
  const currentYear = new Date().getFullYear()
  const years: string[] = []
  for (let y = currentYear; y >= 1950; y--) {
    years.push(String(y))
  }
  return years
}

// Generate month options 01-12
function getMonths(): string[] {
  return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
}

// Generate day options based on year and month
function getDays(year: number, month: number): string[] {
  const count = getDaysInMonth(new Date(year, month - 1))
  return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0'))
}

// Derive picker value from external value prop
function derivePickerValue(value?: string) {
  if (value) {
    const d = parse(value, 'yyyy-MM-dd', new Date())
    if (isValid(d)) {
      return {
        year: String(d.getFullYear()),
        month: String(d.getMonth() + 1).padStart(2, '0'),
        day: String(d.getDate()).padStart(2, '0'),
      }
    }
  }
  const now = new Date()
  return {
    year: String(now.getFullYear()),
    month: '01',
    day: '01',
  }
}

export default function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const displayValue = selected && isValid(selected) ? format(selected, 'yyyy/MM/dd') : ''

  // Initialize picker value from prop; re-derive when opening
  const [pickerValue, setPickerValue] = useState(() => derivePickerValue(value))

  const years = useMemo(() => getYears(), [])
  const months = useMemo(() => getMonths(), [])
  const days = useMemo(
    () => getDays(Number(pickerValue.year), Number(pickerValue.month)),
    [pickerValue.year, pickerValue.month]
  )

  // Handle picker column changes with day clamping
  const handlePickerChange = useCallback(
    (nextValue: { year: string; month: string; day: string }) => {
      const maxDay = getDaysInMonth(
        new Date(Number(nextValue.year), Number(nextValue.month) - 1)
      )
      const clampedDay = Number(nextValue.day) > maxDay
        ? String(maxDay).padStart(2, '0')
        : nextValue.day
      setPickerValue({ ...nextValue, day: clampedDay })
    },
    []
  )

  // Re-sync picker value when opening the sheet
  const handleOpen = useCallback(() => {
    if (!open) {
      setPickerValue(derivePickerValue(value))
    }
    setOpen((prev) => !prev)
  }, [open, value])

  const handleConfirm = useCallback(() => {
    const { year, month, day } = pickerValue
    onChange(`${year}-${month}-${day}`)
    setOpen(false)
  }, [pickerValue, onChange])

  // Click outside for desktop calendar
  useEffect(() => {
    if (isMobile || !open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, isMobile])

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.inputWrap} onClick={handleOpen}>
        <TextField.Root
          size="2"
          value={displayValue}
          placeholder={placeholder}
          readOnly
        />
        <CalendarIcon className={styles.icon} width={14} height={14} />
      </div>

      {open && !isMobile && (
        <div className={styles.dropdown}>
          <DayPicker
            className={styles.calendar}
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(day) => {
              if (day) {
                onChange(format(day, 'yyyy-MM-dd'))
              }
              setOpen(false)
            }}
            captionLayout="dropdown"
            fromYear={1950}
            toYear={new Date().getFullYear()}
          />
        </div>
      )}

      {open && isMobile && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <button
                type="button"
                className={styles.sheetCancel}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <span className={styles.sheetTitle}>Select Date</span>
              <Button
                type="button"
                size="1"
                variant="soft"
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </div>
            <div className={styles.pickerWrap}>
              <Picker
                value={pickerValue}
                onChange={handlePickerChange}
                wheelMode="natural"
                height={200}
              >
                <Picker.Column name="year">
                  {years.map((y) => (
                    <Picker.Item key={y} value={y}>
                      {y}
                    </Picker.Item>
                  ))}
                </Picker.Column>
                <Picker.Column name="month">
                  {months.map((m) => (
                    <Picker.Item key={m} value={m}>
                      {m}
                    </Picker.Item>
                  ))}
                </Picker.Column>
                <Picker.Column name="day">
                  {days.map((d) => (
                    <Picker.Item key={d} value={d}>
                      {d}
                    </Picker.Item>
                  ))}
                </Picker.Column>
              </Picker>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
