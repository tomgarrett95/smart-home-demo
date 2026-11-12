import type { ApiErrorBody } from '@smart-home/packages/api'
import { isAxiosError } from 'axios'

export type ValidationErrors = Record<string, string | string[]>

export const toValidationErrors = (error: unknown): ValidationErrors => {
    if (!isAxiosError<ApiErrorBody>(error)) return {}
    const details = error.response?.data.error.details
    if (!Array.isArray(details)) return {}

    return Object.fromEntries(
        details
            .filter(
                (d): d is { path: string; message: string } => typeof d?.path === 'string'
            )
            .map((d) => [d.path, d.message])
    )
}
