import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { type MutationConfig } from '@/lib/react-query'

import { getDevicesQueryOptions } from './get-devices'
import type { Device, CreateDeviceInput } from '@smart-home/packages/devices'

export const createDevice = ({ data }: { data: CreateDeviceInput }): Promise<Device> => {
    return api.post(`/devices`, data)
}

type UseCreateDeviceOptions = {
    mutationConfig?: MutationConfig<typeof createDevice>
}

export const useCreateDevice = ({ mutationConfig }: UseCreateDeviceOptions = {}) => {
    const queryClient = useQueryClient()

    const { onSuccess, ...restConfig } = mutationConfig || {}

    return useMutation({
        onSuccess: async (newDevice, ...args) => {
            queryClient.setQueryData<Device[]>(
                getDevicesQueryOptions().queryKey,
                (devices) => [...(devices ?? []), newDevice]
            )
            onSuccess?.(newDevice, ...args)
        },
        ...restConfig,
        mutationFn: createDevice,
    })
}
