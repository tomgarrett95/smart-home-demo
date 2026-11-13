import { useUpdateDevice } from '../api/update-device'
import {
    FieldError,
    Form,
    Input,
    Label,
    labelVariants,
    ListBox,
    Select,
    Switch,
    TextField,
} from '@heroui/react'
import { UpdateDeviceSchema } from '@smart-home/packages/devices'
import { type SyntheticEvent, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { toValidationErrors, type ValidationErrors } from '@/utils/toValidationErrors'
import * as z from 'zod'
import { useRooms } from '@/features/rooms/api/get-rooms'
import { useSuspenseDevice } from '@/features/devices/api/get-device'
import { useParams } from 'react-router'

export const UpdateDevice = () => {
    const params = useParams()
    const deviceId = params.deviceId as string
    const { data: device } = useSuspenseDevice({ deviceId })
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
    const [name, setName] = useState(device.name)
    const roomsQuery = useRooms({})
    const updateDeviceMutation = useUpdateDevice()

    const saveName = useDebouncedCallback((name: string) => {
        updateDeviceMutation.mutate(
            { deviceId: String(device.id), data: { name } },
            { onError: (error) => setValidationErrors(toValidationErrors(error)) }
        )
    }, 500)

    // Leaving the page within the delay still saves what was typed
    useEffect(() => () => saveName.flush(), [saveName])

    const onNameChange = (value: string) => {
        setName(value)

        const result = UpdateDeviceSchema.safeParse({ name: value })
        if (!result.success) {
            saveName.cancel()
            setValidationErrors(z.flattenError(result.error).fieldErrors)
            return
        }

        setValidationErrors({})
        if (result.data.name === undefined || result.data.name === device.name) {
            saveName.cancel()
            return
        }
        saveName(result.data.name)
    }

    // Enter saves straight away
    const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        saveName.flush()
    }

    return (
        <div className={'flex flex-col gap-4'}>
            <Switch
                size="lg"
                isSelected={device.status === 'on'}
                onChange={() =>
                    updateDeviceMutation.mutate({
                        deviceId: String(device.id),
                        data: { status: device.status === 'on' ? 'off' : 'on' },
                    })
                }
                aria-label="Toggle device status"
                className="w-fit"
            >
                <Switch.Content>
                    <Switch.Control>
                        <Switch.Thumb />
                    </Switch.Control>
                    Enable device
                </Switch.Content>
            </Switch>
            <div className="flex flex-col gap-4">
                <div>
                    <p className={labelVariants()}>Device Type</p>
                    <p>{device.deviceType}</p>
                </div>
                <Form
                    validationErrors={validationErrors}
                    onSubmit={onSubmit}
                    className={'flex items-end gap-4'}
                >
                    <TextField
                        className="w-full"
                        name="name"
                        type="text"
                        value={name}
                        onChange={onNameChange}
                        onBlur={() => saveName.flush()}
                        variant={'primary'}
                    >
                        <Label>Name</Label>
                        <Input placeholder="Device name" />
                        <FieldError />
                    </TextField>
                </Form>
                <Select
                    placeholder="Select one"
                    name="roomId"
                    isDisabled={!roomsQuery.data}
                    defaultValue={device?.room.id}
                    onChange={(value) => {
                        const selectedRoom = roomsQuery.data?.find(
                            (room) => room.id === value
                        )
                        if (!selectedRoom) return
                        updateDeviceMutation.mutate({
                            deviceId: String(device.id),
                            data: { roomId: selectedRoom.id },
                        })
                    }}
                >
                    <Label>Room</Label>
                    <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                    </Select.Trigger>
                    <FieldError />
                    <Select.Popover>
                        <ListBox>
                            {(roomsQuery.data || []).map((room) => (
                                <ListBox.Item
                                    key={room.id}
                                    id={room.id}
                                    textValue={room.name}
                                >
                                    {room.name}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            </div>
        </div>
    )
}
