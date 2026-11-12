import { useUpdateDevice } from '../api/update-device'
import {
    Button,
    FieldError,
    Form,
    Input,
    Label,
    ListBox,
    Select,
    Switch,
    TextField,
} from '@heroui/react'
import { type Device, UpdateDeviceSchema } from '@smart-home/packages/devices'
import { type SyntheticEvent, useState } from 'react'
import type { ValidationErrors } from '@/utils/toValidationErrors'
import * as z from 'zod'
import { useRooms } from '@/features/rooms/api/get-rooms'
import { Save, Undo } from '@mui/icons-material'

type UpdateDeviceProps = {
    device: Device
}

export const UpdateDevice = ({ device }: UpdateDeviceProps) => {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
    const roomsQuery = useRooms({})
    const updateDeviceMutation = useUpdateDevice()

    const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const result = UpdateDeviceSchema.safeParse({
            name: formData.get('name'),
        })

        if (!result.success) {
            setValidationErrors(z.flattenError(result.error).fieldErrors)
            return
        }

        updateDeviceMutation.mutate({ deviceId: String(device.id), data: result.data })
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
                <Form
                    validationErrors={validationErrors}
                    onSubmit={onSubmit}
                    className={'flex items-end gap-4'}
                >
                    <TextField
                        className="w-full"
                        name="name"
                        type="text"
                        defaultValue={device?.name}
                        variant={'primary'}
                    >
                        <Label>Name</Label>
                        <Input placeholder="Device name" />
                        <FieldError />
                    </TextField>
                    <div className={'flex justify-end gap-2'}>
                        <Button
                            type="reset"
                            isPending={updateDeviceMutation.isPending}
                            isIconOnly={true}
                            variant={'ghost'}
                        >
                            <Undo />
                        </Button>
                        <Button
                            type="submit"
                            isPending={updateDeviceMutation.isPending}
                            isIconOnly={true}
                        >
                            <Save />
                        </Button>
                    </div>
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
