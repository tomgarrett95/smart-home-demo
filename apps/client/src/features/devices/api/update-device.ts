import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { MutationConfig } from '@/lib/react-query'
import { getDeviceQueryOptions } from './get-device'
import type { Device, UpdateDeviceInput } from '@smart-home/packages/devices'
import { getDevicesQueryOptions } from '@/features/devices/api/get-devices'

export const updateDevice = ({
    data,
    deviceId,
}: {
    data: UpdateDeviceInput
    deviceId: string
}): Promise<Device> => {
    return api.patch(`/devices/${deviceId}`, data)
}

type UseUpdateDeviceOptions = {
    mutationConfig?: MutationConfig<typeof updateDevice>
}

export const useUpdateDevice = ({ mutationConfig }: UseUpdateDeviceOptions = {}) => {
    const queryClient = useQueryClient()

    const { onSuccess, ...restConfig } = mutationConfig || {}

    return useMutation({
        onSuccess: async (modifiedDevice, ...args) => {
            queryClient.setQueryData<Device[]>(
                getDevicesQueryOptions().queryKey,
                (devices) =>
                    devices?.map((device) =>
                        String(device.id) === String(modifiedDevice.id)
                            ? modifiedDevice
                            : device
                    )
            )

            await queryClient.refetchQueries({
                queryKey: getDeviceQueryOptions(String(modifiedDevice.id)).queryKey,
            })
            onSuccess?.(modifiedDevice, ...args)
        },
        ...restConfig,
        mutationFn: updateDevice,
    })
}
