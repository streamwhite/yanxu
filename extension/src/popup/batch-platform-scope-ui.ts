import type { PlatformId } from '@yanxu/domain';
import {
  BATCH_PLATFORM_SCOPE_ALL,
  type BatchPlatformScope,
  formatBatchPlatformScopeLabel,
  isSinglePlatformScope,
} from '../shared/batch-platform-scope.js';
import { PLATFORM_TAB_LABELS } from '../sw/constants/platform-tab-labels.js';

export function batchPlatformScopeUploadFillButtonLabel(
  scope: BatchPlatformScope,
): string {
  return isSinglePlatformScope(scope)
    ? `开始（仅 ${PLATFORM_TAB_LABELS[scope]}）`
    : '开始';
}

export function batchPlatformScopeSinglePlatformHelp(
  scope: BatchPlatformScope,
): string {
  if (!isSinglePlatformScope(scope)) return '';
  return `仅上传 ${formatBatchPlatformScopeLabel(scope)}，任务文件需含待上传条目。`;
}

export function platformItemSelectionLabel(platform: PlatformId): string {
  return `${PLATFORM_TAB_LABELS[platform]} 待上传条目`;
}

export function batchPlatformScopeOpeningLabel(
  scope: BatchPlatformScope,
): string {
  return isSinglePlatformScope(scope)
    ? `正在打开 ${PLATFORM_TAB_LABELS[scope]} 标签页…`
    : '正在打开上传标签页…';
}

function formatSettleWait(fieldsSettleMs: number): string {
  if (fieldsSettleMs <= 0) return '无需等待';
  return fieldsSettleMs % 1000 === 0
    ? `${String(fieldsSettleMs / 1000)} 秒`
    : `${String(fieldsSettleMs)} 毫秒`;
}

export function batchPlatformScopeUploadBusyLabel(
  scope: BatchPlatformScope,
  fieldsSettleMs: number,
): string {
  const waitLabel = formatSettleWait(fieldsSettleMs);
  return isSinglePlatformScope(scope)
    ? `正在上传 ${PLATFORM_TAB_LABELS[scope]} 视频（等待 ${waitLabel}）…`
    : `正在上传视频（等待 ${waitLabel}）…`;
}

export function batchPlatformScopeUploadSuccessLabel(
  scope: BatchPlatformScope,
): string {
  return isSinglePlatformScope(scope)
    ? `${PLATFORM_TAB_LABELS[scope]} 上传与填写已完成`
    : '上传与填写已完成';
}

export function isBatchPlatformScopeValue(
  value: string,
): value is BatchPlatformScope {
  return value === BATCH_PLATFORM_SCOPE_ALL || value in PLATFORM_TAB_LABELS;
}
