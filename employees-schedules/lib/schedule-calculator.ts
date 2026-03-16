export class ScheduleCalculator {
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

export function sumHoursRecursive(values: number[], index = 0): number {
  if (index >= values.length) {
    return 0;
  }

  return values[index] + sumHoursRecursive(values, index + 1);
}
