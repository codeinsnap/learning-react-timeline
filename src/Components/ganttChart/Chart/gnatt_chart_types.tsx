export type Tgroup = {
  id: number;
  title: string;
  stall: string;
  prod_line: string;
}[];

export type TEntries = {
  prod_line: string;
  stall: string;
  vin: string;
  serial_no: string;
  model_year: string;
  model_type: string;
  planned_start_time: string;
  planned_end_time: string;
  std_install_time: string;
  member_id: string;
};

export type TstallProdLine = {
  id?: number;
  stall: string;
  prod_line: string;
  title?: string;
};

export type TRawPlannedData = {
  prod_line: string;
  stall: string;
  vin: string;
  serial_no: string;
  model_year: string;
  model_type: string;
  planned_start_time: string;
  planned_end_time: string;
  std_install_time: string;
  member_id: string;

  // Completed Data 
  actual_start_time?: string;
  actual_end_time?: string;
  no_of_persons?: string;
};

export type TPlannedData = {
  prod_line: string;
  stall: string;
  vin: string;
  serial_no: string;
  model_year: string;
  model_type: string;
  planned_start_time: string;
  planned_end_time: string;
  std_install_time: string;
  member_id: string;
  actual_start_time?: string;
  actual_end_time?: string;
  prevtime?: {
    start?: string;
    end?: string;
    actual_start?: string;
    actual_end?: string
  };
  isAfterBreak?: boolean;
  style?: any
};

export type TTimeLineItem = {
  id: number;
  group: number;
  title: string;
  start_time: Date;
  end_time: Date;
  prod_line: string;
  itemData: TPlannedData;
  prevtime: string | {
    start: string;
    end: string;
  };
}
export type TBreak = {
  breakStart: string;
  breakEnd: string;
  breakDuration: number;
};

export type TBreakTimes = {
  breakStart: string;
  breakEnd: string;
};

export type Tshift = { start: string; end: string };

export type TSelectedFilters = {
  selectedLines: string[];
  selectedVins: string[];
  selectedMembers: string[];
  selectedStatus: string[];
  selectedStalls: string[];
  fromTime: string;
  toTime: string;
};