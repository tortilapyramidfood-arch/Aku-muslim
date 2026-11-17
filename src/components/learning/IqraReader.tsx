/**
 * IqraReader Re-export & Backward Compatibility Module
 * AKU MUSLIM — PYRAMID GROUP
 * Memastikan komponen pembaca Iqra dapat diakses baik melalui IqraReader maupun IqraInteractiveModule
 */

import {
  IqraInteractiveModule,
  IqraInteractiveModuleProps,
} from './IqraInteractiveModule';

export const IqraReader = IqraInteractiveModule;
export default IqraInteractiveModule;
export type { IqraInteractiveModuleProps };
export type IqraReaderProps = IqraInteractiveModuleProps;
