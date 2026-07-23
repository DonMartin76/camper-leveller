import type { VehicleGeometry } from '../lib/leveling'

export type VehiclePreset = VehicleGeometry & {
  id: string
  manufacturer: string
  model: string
  variant: string
  years: string
}

type VehiclePresetRow = [string, string, string, string, string, number, number]

const vehiclePresetRows: VehiclePresetRow[] = [
  ['fiat-ducato-l1', 'Fiat', 'Ducato', 'L1 (4.96m)', '2021-', 2050, 3000],
  ['fiat-ducato-l2', 'Fiat', 'Ducato', 'L2 (5.40m)', '2021-', 2050, 3450],
  ['fiat-ducato-l3', 'Fiat', 'Ducato', 'L3 (6.00m)', '2021-', 2050, 4035],
  ['fiat-ducato-l4', 'Fiat', 'Ducato', 'L4 (6.40m)', '2021-', 2050, 4035],
  ['citroen-jumper-l1', 'Citroen', 'Jumper', 'L1 (4.96m)', '2024-', 2050, 3000],
  ['citroen-jumper-l2', 'Citroen', 'Jumper', 'L2 (5.40m)', '2024-', 2050, 3450],
  ['citroen-jumper-l3', 'Citroen', 'Jumper', 'L3 (6.00m)', '2024-', 2050, 4035],
  ['citroen-jumper-l4', 'Citroen', 'Jumper', 'L4 (6.40m)', '2024-', 2050, 4035],
  ['peugeot-boxer-l1', 'Peugeot', 'Boxer', 'L1 (4.96m)', '2024-', 2050, 3000],
  ['peugeot-boxer-l2', 'Peugeot', 'Boxer', 'L2 (5.40m)', '2024-', 2050, 3450],
  ['peugeot-boxer-l3', 'Peugeot', 'Boxer', 'L3 (6.00m)', '2024-', 2050, 4035],
  ['peugeot-boxer-l4', 'Peugeot', 'Boxer', 'L4 (6.40m)', '2024-', 2050, 4035],
  ['opel-movano-stellantis-l1', 'Opel', 'Movano (Stellantis)', 'L1 (4.96m)', '2024-', 2050, 3000],
  ['opel-movano-stellantis-l2', 'Opel', 'Movano (Stellantis)', 'L2 (5.40m)', '2024-', 2050, 3450],
  ['opel-movano-stellantis-l3', 'Opel', 'Movano (Stellantis)', 'L3 (6.00m)', '2024-', 2050, 4035],
  ['opel-movano-stellantis-l4', 'Opel', 'Movano (Stellantis)', 'L4 (6.40m)', '2024-', 2050, 4035],
  ['mercedes-sprinter-l2', 'Mercedes', 'Sprinter', 'L2', '2018-', 2020, 3250],
  ['mercedes-sprinter-l3', 'Mercedes', 'Sprinter', 'L3', '2018-', 2020, 3665],
  ['mercedes-sprinter-l4', 'Mercedes', 'Sprinter', 'L4', '2018-', 2020, 3925],
  ['mercedes-sprinter-l5', 'Mercedes', 'Sprinter', 'L5', '2018-', 2020, 4325],
  ['volkswagen-crafter-l3', 'Volkswagen', 'Crafter', 'L3', '2017-', 2040, 3640],
  ['volkswagen-crafter-l4', 'Volkswagen', 'Crafter', 'L4', '2017-', 2040, 4490],
  ['man-tge-l3', 'MAN', 'TGE', 'L3', '2017-', 2040, 3640],
  ['man-tge-l4', 'MAN', 'TGE', 'L4', '2017-', 2040, 4490],
  ['ford-transit-l2', 'Ford', 'Transit', 'L2', '2019-', 2059, 3300],
  ['ford-transit-l3', 'Ford', 'Transit', 'L3', '2019-', 2059, 3750],
  ['ford-transit-l4', 'Ford', 'Transit', 'L4', '2019-', 2059, 3954],
  ['ford-transit-custom-l1', 'Ford', 'Transit Custom', 'L1', '2023-', 2032, 3100],
  ['ford-transit-custom-l2', 'Ford', 'Transit Custom', 'L2', '2023-', 2032, 3500],
  ['renault-master-l2', 'Renault', 'Master', 'L2', '2024-', 2080, 3585],
  ['renault-master-l3', 'Renault', 'Master', 'L3', '2024-', 2080, 4215],
  ['nissan-interstar-l2', 'Nissan', 'Interstar', 'L2', '2024-', 2080, 3585],
  ['nissan-interstar-l3', 'Nissan', 'Interstar', 'L3', '2024-', 2080, 4215],
  ['iveco-daily-l1', 'Iveco', 'Daily', 'L1', '2019-', 2010, 3000],
  ['iveco-daily-l2', 'Iveco', 'Daily', 'L2', '2019-', 2010, 3450],
  ['iveco-daily-l3', 'Iveco', 'Daily', 'L3', '2019-', 2010, 3750],
  ['iveco-daily-l4', 'Iveco', 'Daily', 'L4', '2019-', 2010, 4100],
  ['iveco-daily-l5', 'Iveco', 'Daily', 'L5', '2019-', 2010, 4350],
  ['iveco-daily-l6', 'Iveco', 'Daily', 'L6', '2019-', 2010, 4750],
  ['renault-trafic-l1', 'Renault', 'Trafic', 'L1', '2022-', 1956, 3098],
  ['renault-trafic-l2', 'Renault', 'Trafic', 'L2', '2022-', 1956, 3498],
  ['nissan-primastar-l1', 'Nissan', 'Primastar', 'L1', '2022-', 1956, 3098],
  ['nissan-primastar-l2', 'Nissan', 'Primastar', 'L2', '2022-', 1956, 3498],
  ['opel-vivaro-l1', 'Opel', 'Vivaro', 'L1', '2019-', 1920, 3275],
  ['opel-vivaro-l2', 'Opel', 'Vivaro', 'L2', '2019-', 1920, 3275],
  ['peugeot-expert-l1', 'Peugeot', 'Expert', 'L1', '2019-', 1920, 3275],
  ['peugeot-expert-l2', 'Peugeot', 'Expert', 'L2', '2019-', 1920, 3275],
  ['citroen-jumpy-l1', 'Citroen', 'Jumpy', 'L1', '2019-', 1920, 3275],
  ['citroen-jumpy-l2', 'Citroen', 'Jumpy', 'L2', '2019-', 1920, 3275],
  ['toyota-proace-l1', 'Toyota', 'Proace', 'L1', '2019-', 1920, 3275],
  ['toyota-proace-l2', 'Toyota', 'Proace', 'L2', '2019-', 1920, 3275],
  ['fiat-scudo-l1', 'Fiat', 'Scudo', 'L1', '2022-', 1920, 3275],
  ['fiat-scudo-l2', 'Fiat', 'Scudo', 'L2', '2022-', 1920, 3275],
  ['mercedes-vito-l2', 'Mercedes', 'Vito', 'L2', '2024-', 1928, 3200],
  ['mercedes-vito-l3', 'Mercedes', 'Vito', 'L3', '2024-', 1928, 3430],
  ['volkswagen-transporter-t61-swb', 'Volkswagen', 'Transporter T6.1', 'SWB', '2019-2024', 1904, 3000],
  ['volkswagen-transporter-t61-lwb', 'Volkswagen', 'Transporter T6.1', 'LWB', '2019-2024', 1904, 3400],
  ['volkswagen-transporter-t7-l1', 'Volkswagen', 'Transporter (T7)', 'L1', '2025-', 2032, 3100],
  ['volkswagen-transporter-t7-l2', 'Volkswagen', 'Transporter (T7)', 'L2', '2025-', 2032, 3500],
]

export const vehiclePresets: VehiclePreset[] = vehiclePresetRows
  .map(([id, manufacturer, model, variant, years, widthMm, wheelbaseMm]) => ({
    id,
    manufacturer,
    model,
    variant,
    years,
    widthMm,
    wheelbaseMm,
  }))
  .sort((first, second) =>
    first.manufacturer.localeCompare(second.manufacturer)
    || first.model.localeCompare(second.model)
    || first.variant.localeCompare(second.variant, undefined, { numeric: true }),
  )

export const defaultVehiclePreset = vehiclePresets.find((preset) => preset.id === 'citroen-jumper-l3')!

export function vehiclePresetLabel(preset: VehiclePreset) {
  return `${preset.manufacturer} ${preset.model} ${preset.variant} (${preset.years})`
}