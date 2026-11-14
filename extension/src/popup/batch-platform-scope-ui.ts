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
  return `仅在 ${formatBatchPlatformScopeLabel(scope)} 上运行——请使用包含需重新上传条目的任务文件。`;
}

export function platformItemSelectionLabel(platform: PlatformId): string {
  return `${PLATFORM_TAB_LABELS[platform]} 待上传条目`;
}

export function batchPlatformScopeOpeningLabel(
  scope: BatchPlatformScope,
): string {
  return isSinglePlatformScope(scope)
    ? `正在打开 ${PLATFORM_TAB_LABELS[scope]} 上传标签页…`
    : '正在为全部平台打开上传标签页…';
}

export function batchPlatformScopeUploadBusyLabel(
  scope: BatchPlatformScope,
  fieldsSettleMs: number,
): string {
  const waitLabel = String(fieldsSettleMs);
  return isSinglePlatformScope(scope)
    ? `正在上传 ${PLATFORM_TAB_LABELS[scope]} 视频，等待 ${waitLabel} 毫秒后填充字段…`
    : `正在上传视频，等待 ${waitLabel} 毫秒后填充字段…`;
}

export function batchPlatformScopeUploadSuccessLabel(
  scope: BatchPlatformScope,
): string {
  return isSinglePlatformScope(scope)
    ? `${PLATFORM_TAB_LABELS[scope]} 上传与填充已完成。请在下方查看进度，然后手动发布。`
    : '上传与填充已完成。请在下方查看进度，然后手动发布。';
}

export function isBatchPlatformScopeValue(
  value: string,
): value is BatchPlatformScope {
  return value === BATCH_PLATFORM_SCOPE_ALL || value in PLATFORM_TAB_LABELS;
}
