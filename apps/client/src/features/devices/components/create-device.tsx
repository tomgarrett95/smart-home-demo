import { useState, type SyntheticEvent } from 'react'
import {
    Button,
    FieldError,
    Form,
    Input,
    Label,
    ListBox,
    Modal,
    Select,
    Surface,
    TextField,
    useOverlayState,
} from '@heroui/react'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import * as z from 'zod'
import { CreateDeviceSchema, DeviceTypeSchema } from '@smart-home/packages/devices'
import { useCreateDevice } from '../api/create-device'
import { useRooms } from '@/features/rooms/api/get-rooms'
import { toValidationErrors, type ValidationErrors } from '@/utils/toValidationErrors'

export const CreateDevice = () => {
    const roomsQuery = useRooms({})
    const modal = useOverlayState()
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

    const createDeviceMutation = useCreateDevice({
        mutationConfig: {
            onSuccess: () => modal.close(),
            onError: (error) => setValidationErrors(toValidationErrors(error)),
        },
    })

    const onOpenChange = (isOpen: boolean) => {
        setValidationErrors({})
        modal.setOpen(isOpen)
    }

    const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const result = CreateDeviceSchema.safeParse({
            deviceType: formData.get('deviceType'),
            name: formData.get('name'),
            roomId: Number(formData.get('roomId')),
        })

        if (!result.success) {
            setValidationErrors(z.flattenError(result.error).fieldErrors)
            return
        }

        createDeviceMutation.mutate({ data: result.data })
    }

    return (
        <Modal>
            <Button
                variant="primary"
                aria-label="Add a device"
                onPress={() => onOpenChange(true)}
            >
                <AddCircleIcon className="size-5" />
                Add Device
            </Button>
            <Modal.Backdrop
                isOpen={modal.isOpen}
                onOpenChange={onOpenChange}
            >
                <Modal.Container placement="auto">
                    <Modal.Dialog className="sm:max-w-md">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                                <AddCircleIcon className="size-5" />
                            </Modal.Icon>
                            <Modal.Heading>Add a Device</Modal.Heading>
                        </Modal.Header>
                        <Form
                            validationErrors={validationErrors}
                            onSubmit={onSubmit}
                        >
                            <Modal.Body className="p-6">
                                <Surface variant="default">
                                    <div className="flex flex-col gap-4">
                                        <Select
                                            placeholder="Select one"
                                            name="deviceType"
                                            isRequired={true}
                                        >
                                            <Label>Device Type</Label>
                                            <Select.Trigger>
                                                <Select.Value />
                                                <Select.Indicator />
                                            </Select.Trigger>
                                            <FieldError />
                                            <Select.Popover>
                                                <ListBox>
                                                    {DeviceTypeSchema.options.map(
                                                        (type) => (
                                                            <ListBox.Item
                                                                key={type}
                                                                id={type}
                                                                textValue={type}
                                                            >
                                                                {type}
                                                                <ListBox.ItemIndicator />
                                                            </ListBox.Item>
                                                        )
                                                    )}
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>
                                        <Select
                                            placeholder="Select one"
                                            name="roomId"
                                            isRequired={true}
                                            isDisabled={!roomsQuery.data}
                                        >
                                            <Label>Room</Label>
                                            <Select.Trigger>
                                                <Select.Value />
                                                <Select.Indicator />
                                            </Select.Trigger>
                                            <FieldError />
                                            <Select.Popover>
                                                <ListBox>
                                                    {(roomsQuery.data || []).map(
                                                        (room) => (
                                                            <ListBox.Item
                                                                key={room.id}
                                                                id={room.id}
                                                                textValue={room.name}
                                                            >
                                                                {room.name}
                                                                <ListBox.ItemIndicator />
                                                            </ListBox.Item>
                                                        )
                                                    )}
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>
                                        <TextField
                                            className="w-full"
                                            name="name"
                                            type="text"
                                            variant="secondary"
                                            isRequired={true}
                                        >
                                            <Label>Name</Label>
                                            <Input placeholder="Device name" />
                                            <FieldError />
                                        </TextField>
                                    </div>
                                </Surface>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    slot="close"
                                    variant="secondary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isPending={createDeviceMutation.isPending}
                                >
                                    Add Device
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
