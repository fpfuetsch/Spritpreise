import { GAS_TYPES } from "./data/model";

export function getReadableGasType(type: string): string {
    if (!GAS_TYPES.includes(type)) {
        return 'Fehler'
    } else {
        switch (type) {
            case 'e5': return 'Super'
            case 'e10': return 'E10'
            case 'diesel': return 'Diesel'
            default: return 'Fehler'
        }
    }
}