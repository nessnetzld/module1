export interface Employee {
  userId: string;
  name: string;
  lob: string;
}

export interface Schedule {
  employeeId: string;
  day: string;
  startTime: string;
  endTime: string;
  totalHours: number;
}
