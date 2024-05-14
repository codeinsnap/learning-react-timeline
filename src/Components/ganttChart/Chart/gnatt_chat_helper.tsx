import { TPlannedData, Tgroup, Tshift, TstallProdLine, TBreakTimes, TEntries, TRawPlannedData } from './gnatt_chart_types'


const greenCode = { background: "green", borderColor: "black", color: "green"}
const blueCode = { background: "blue", borderColor: "black", color: "blue"}
const redCode = { background: "red", borderColor: "black", color: "red"}

export const handleNewGroups = (groups: Tgroup) => {
  if (groups.length === 0) return [];
  let newList = [];
  for (let i = 0; i <= groups.length; i++) {
    if (groups[i]) {
      newList.push(groups[i]);
      if (i < groups.length) {
        newList.push({
          id: Math.floor(Math.random() * 10),
          title: ``,
          stall: ``,
          line: ``,
          prod_line: ``
        });
      }
    }
  }

  newList.forEach((element, index) => (element.id = index + 1));
  return newList;
};

const containsStallProdLine = (arr: TstallProdLine[], item: TstallProdLine) => {
  return arr.some(elem => elem.stall === item.stall && elem.prod_line === item.prod_line)
}

export const handleUniqueStallsAndProdLines = (plannedData: TEntries[]) => {
  let uniqueStallsAndProdLines: TstallProdLine[] = [];
  plannedData.forEach(data => {
    const stallProdLine: TstallProdLine = { stall: data.stall, prod_line: data.prod_line };
    if (!containsStallProdLine(uniqueStallsAndProdLines, stallProdLine)) {
      uniqueStallsAndProdLines.push(stallProdLine);
    }
  })

  uniqueStallsAndProdLines.sort((a, b) => {
    if (a.prod_line !== b.prod_line) {
      return a.prod_line.localeCompare(b.prod_line)
    } else {
      return parseInt(a.stall) - parseInt(b.stall)
    }
  })

  return uniqueStallsAndProdLines.map((item, index) => ({ id: index + 1, stall: item.stall, prod_line: item.prod_line, title: '' })) ?? []
}

const handleDuplicate = (entry: TPlannedData, list: TPlannedData[]) => {

  const isValid = list.filter((item: TPlannedData) => item.actual_end_time === entry.actual_end_time && item.actual_start_time === entry.actual_start_time && item.serial_no === entry.serial_no )
  return isValid.length > 1 ? false : true

}

export const splitTimeSlotsByBreaks = (breakTimes: TBreakTimes[], plannedData: TPlannedData[], currentTime?: string) => {

  if (breakTimes.length === 0 || plannedData.length === 0) return plannedData

  const updatedTimeSlots: TPlannedData[] = [];
  plannedData.forEach(slot => {
    let isOverLapped = false
    breakTimes.forEach(breakTime => {

      if (slot?.actual_end_time && slot?.actual_start_time) {

        if (currentTime && slot.actual_start_time < currentTime && handleDuplicate(slot, updatedTimeSlots)) {
          let style = {}
          if (slot.actual_end_time < slot.planned_end_time) style = greenCode
          if (slot.actual_start_time > slot.planned_end_time) style = redCode
          if (currentTime < slot.actual_end_time) style = blueCode

          if (isOverlapping(slot, breakTime)) {
            isOverLapped = true
            const prevtime = { actual_start: slot.actual_start_time, actual_end: slot.actual_end_time }
            const beforeBreak = { ...slot, actual_start_time: slot.actual_start_time, actual_end_time: breakTime.breakStart, prevtime }
            const afterBreak = { ...slot, actual_start_time: breakTime.breakEnd, actual_end_time: slot.actual_end_time, prevtime }
            if (isValidSlot(beforeBreak)) updatedTimeSlots.push({...beforeBreak, style});
            updatedTimeSlots.push({ ...slot, serial_no: '', actual_start_time: breakTime.breakStart, actual_end_time: breakTime.breakEnd , planned_start_time: '', planned_end_time: ''})
            if (isValidSlot(afterBreak)) updatedTimeSlots.push({ ...afterBreak, isAfterBreak: true , style});
          } else {
            updatedTimeSlots.push({ ...slot, serial_no: '', actual_start_time: breakTime.breakStart, actual_end_time: breakTime.breakEnd, planned_start_time: '', planned_end_time: '' })
          }
        }

      } else {
        if (isOverlapping(slot, breakTime)) {
          isOverLapped = true



          const prevtime = { start: slot.planned_start_time, end: slot.planned_end_time }
          const beforeBreak = { ...slot, planned_start_time: slot.planned_start_time, planned_end_time: breakTime.breakStart, prevtime }
          const afterBreak = { ...slot, planned_start_time: breakTime.breakEnd, planned_end_time: slot.planned_end_time, prevtime }
          if (isValidSlot(beforeBreak)) updatedTimeSlots.push(beforeBreak);
          updatedTimeSlots.push({ ...slot, serial_no: '', planned_start_time: breakTime.breakStart, planned_end_time: breakTime.breakEnd })
          if (isValidSlot(afterBreak)) updatedTimeSlots.push({ ...afterBreak, isAfterBreak: true });


        } else {
          updatedTimeSlots.push({ ...slot, serial_no: '', planned_start_time: breakTime.breakStart, planned_end_time: breakTime.breakEnd })
        }
      }
    })
    if (!isOverLapped) updatedTimeSlots.push(slot)
  })
  return updatedTimeSlots;
}

const isOverlapping = (slot: TPlannedData, breakTime: TBreakTimes) => {
  const slotStart = convertTimeToMinutes(slot?.actual_start_time || slot?.planned_start_time)
  const slotEnd = convertTimeToMinutes(slot?.actual_end_time || slot?.planned_end_time)
  const breakStart = convertTimeToMinutes(breakTime.breakStart)
  const breakEnd = convertTimeToMinutes(breakTime.breakEnd)
  return (slotStart < breakEnd && slotEnd > breakStart);
}

const convertTimeToMinutes = (time: string) => {
  if (!time) return 0
  const [hours, minutes] = time?.split(':')?.map(Number);
  return hours * 60 + minutes;
}

const isValidSlot = (slot: TPlannedData) => {
  const slotStart = convertTimeToMinutes(slot?.actual_start_time || slot.planned_start_time)
  const slotEnd = convertTimeToMinutes(slot?.actual_end_time || slot.planned_end_time)
  return (slotStart < slotEnd)
}

export const handleTimeModifications = (data: TPlannedData, currentTime: string) => {

  if (data.actual_start_time && data.actual_start_time > currentTime) {
    return { isValid: false, obj: {} }
  }

  if (data.actual_end_time && data.actual_end_time > currentTime) {
    return { isValid: true, obj: { ...data, actual_end_time: currentTime } }
  }

  return { isValid: true, obj: data }
};

export const entiresBeforeShiftTimings = (stall: TstallProdLine[], shiftTimings: Tshift, currentTime: string) => {
  if (!stall || !shiftTimings) return []

  const entriesBeforeShift: TPlannedData[] = [];
  const { start, end } = shiftTimings
  const emptyObj = {
    "prod_line": '',
    "stall": '',
    "vin": '',
    "serial_no": "",
    "model_year": "",
    "model_type": "",
    "planned_start_time": '',
    "planned_end_time": '',
    "actual_start_time": '',
    "actual_end_time": '',
    "member_id": ""
  }

  stall?.forEach((entry, index) => {
    const beforeshift = handleTimeModifications({
      ...emptyObj,
      "prod_line": entry?.prod_line ? entry?.prod_line : stall[index - 1].prod_line,
      "stall": entry?.stall ? entry?.stall : stall[index - 1].stall,
      "planned_start_time": entry?.prod_line ? "00:00:00" : '',
      "planned_end_time": entry?.prod_line ? start : '',
      "actual_start_time": entry?.prod_line ? '' : "00:00:00",
      "actual_end_time": entry?.prod_line ? '' : start,
      std_install_time: ''
    }, currentTime)

    const middleofShift = handleTimeModifications({
      ...emptyObj,
      "prod_line": entry?.prod_line ? entry?.prod_line : stall[index - 1].prod_line,
      "stall": entry?.stall ? entry?.stall : stall[index - 1].stall,
      "planned_start_time": entry?.prod_line ? start : "",
      "planned_end_time": entry?.prod_line ? end : "",
      "actual_start_time": entry?.prod_line ? '' : start,
      "actual_end_time": entry?.prod_line ? '' : end,
      std_install_time: '',
      style: entry?.prod_line ? null : {
        background: "yellow",
        borderColor: "black",
        color: "yellow",
      }
    }, currentTime)

    const afterShift = handleTimeModifications({
      ...emptyObj,
      "prod_line": entry?.prod_line ? entry?.prod_line : stall[index - 1].prod_line,
      "stall": entry?.stall ? entry?.stall : stall[index - 1].stall,
      "planned_start_time": entry?.prod_line ? end : '',
      "planned_end_time": entry?.prod_line ? '23:59:59' : '',
      "actual_start_time": entry?.prod_line ? '' : end,
      "actual_end_time": entry?.prod_line ? '' : '23:59:59',
      std_install_time: ''
    }, currentTime)
    beforeshift?.isValid && entriesBeforeShift.push(beforeshift.obj as TPlannedData)
    beforeshift?.isValid && entriesBeforeShift.push(middleofShift?.obj as TPlannedData)
    afterShift?.isValid && entriesBeforeShift.push(afterShift.obj as TPlannedData)
  })

  return entriesBeforeShift
}

export const setColorAndTooltip = (itemData: any, newItemProps: any, breakTimes: any, start_time: string, end_time: string, ShiftDetails: any, isFilteredApplied: boolean) => {
  let color = "white";
  let showTooltip = true;
  let newStyle: any = null

  const defaultStyle = {
    background: "gray",
    borderColor: "gray",
    color: "gray",
    zIndex: '99'
  };

  if (itemData.style) {
    showTooltip = false
    newStyle = { ...newItemProps.style, ...itemData.style };
  } else {
    const isInBreakTime = breakTimes.some((breakTime: any) => start_time <= breakTime.start && end_time >= breakTime.end);
    const isShiftBoundary = itemData?.planned_start_time <= "00:00:00" || itemData?.planned_end_time === "23:59:59";

    if (isInBreakTime || isShiftBoundary) {
      showTooltip = false;
      newStyle = { ...newItemProps.style, ...defaultStyle, zIndex: isShiftBoundary ? '10' : '99' };
    } else {
      if (itemData?.vin && itemData?.serial_no) {
        newStyle = {
          ...newItemProps.style,
          background: "#FFE4D4",
          borderColor: "black",
          color: "black",
        };
      } else if (itemData?.isAfterBreak) {
        newStyle = {
          ...newItemProps.style,
          background: "#FFE4D4",
          borderColor: "black",
          color: "#FFE4D4",

        };
      }
    }
  }
  return {
    showTooltip, newStyle: newStyle ? newStyle : newItemProps.style
  };
};

export const handleCompleteData = (CompleteData: TRawPlannedData[], currentTime: string, breakTime: TBreakTimes[]) => {
  const updateList = [...splitTimeSlotsByBreaks(breakTime, CompleteData)]
  const breakTimeList = []


  return []

}