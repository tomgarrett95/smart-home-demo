import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import type { MutationConfig } from '@/lib/react-query'

import { getDevicesQueryOptions } from './get-devices'

export const deleteDevice = ({ deviceId }: { deviceId: string }) => {
    return api.delete(`/devices/${deviceId}`)
}

type UseDeleteDeviceOptions = {
    mutationConfig?: MutationConfig<typeof deleteDevice>
}

export const useDeleteDevice = ({ mutationConfig }: UseDeleteDeviceOptions = {}) => {
    const queryClient = useQueryClient()

    const { onSuccess, ...restConfig } = mutationConfig || {}

    return useMutation({
        onSuccess: (...args) => {
            queryClient.invalidateQueries({
                queryKey: getDevicesQueryOptions().queryKey,
            })
            onSuccess?.(...args)
        },
        ...restConfig,
        mutationFn: deleteDevice,
    })
}
