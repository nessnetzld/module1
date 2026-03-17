// CLASS: ScheduleCalculator groups all time-based schedule computation logic into one
// namespace. Using a CLASS prevents naming collisions and keeps related methods together,
// making it easy to import and call them consistently across actions and components.
export class ScheduleCalculator {
  // Converts a "HH:MM" time string to total minutes since midnight.
  // This normalization allows simple arithmetic comparisons between two times
  // without having to handle hour/minute boundaries manually.
  // HANDLING EXCEPTIONS: throws an Error when the hour or minute values fall outside
  // valid ranges, so callers receive a clear message instead of a silent wrong result.
  private static parseTimeToMinutes(value: string): number {
    const [hourPart, minutePart] = value.split(":");
    const hour = Number(hourPart);
    const minute = Number(minutePart);

    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      throw new Error("Invalid time format.");
    }

    return hour * 60 + minute;
  }

  // Calculates payable work hours by subtracting 90 minutes (1 h lunch + 30 m break)
  // from the raw shift duration. This is the authoritative calculation used before
  // writing hours to the database.
  // HANDLING EXCEPTIONS: throws descriptive Errors when end <= start or when the
  // resulting payable minutes are zero or negative, preventing invalid data from
  // being persisted to the database.
  static computeWorkHoursOrThrow(start: string, end: string): number {
    const startMinutes = this.parseTimeToMinutes(start);
    const endMinutes = this.parseTimeToMinutes(end);

    if (endMinutes <= startMinutes) {
      throw new Error("End time must be later than start time.");
    }

    const payableMinutes = endMinutes - startMinutes - 90;

    if (payableMinutes <= 0) {
      throw new Error(
        "Work period must be longer than 1 hour and 30 minutes (lunch + break).",
      );
    }

    return Number((payableMinutes / 60).toFixed(2));
  }

  // Safe wrapper around computeWorkHoursOrThrow used for real-time UI previews.
  // Returns null instead of throwing so the component can show a placeholder
  // while the user is still typing and the input is temporarily invalid.
  // HANDLING EXCEPTIONS: wraps computeWorkHoursOrThrow in a try/catch and returns
  // null on failure, keeping the UI stable without surfacing raw error messages.
  static tryComputeWorkHours(start: string, end: string): number | null {
    if (!start || !end) {
      return null;
    }

    try {
      return this.computeWorkHoursOrThrow(start, end);
    } catch {
      return null;
    }
  }
}

// Adds up an array of numeric hour values by calling itself with an incremented index.
// RECURSION: each call adds the current element at `index` to the result of calling
// sumHoursRecursive again with index + 1. The base case returns 0 when the index
// reaches the end of the array, unwinding the call stack with the accumulated total.
export function sumHoursRecursive(values: number[], index = 0): number {
  // Base case: no more elements to process, return 0 to end the recursion.
  if (index >= values.length) {
    return 0;
  }

  // Recursive case: add the current value to the sum of the rest of the array.
  return values[index] + sumHoursRecursive(values, index + 1);
}
