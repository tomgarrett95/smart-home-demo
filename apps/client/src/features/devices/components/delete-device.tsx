import { useDeleteDevice } from '../api/delete-device'
import { useNavigate } from 'react-router'
import { paths } from '@/config/paths'
import { Button, Modal } from '@heroui/react'
import { Delete } from '@mui/icons-material'
import type { Device } from '@smart-home/packages/devices'

type DeleteDeviceProps = {
    device: Device
}

export const DeleteDevice = ({ device }: DeleteDeviceProps) => {
    const navigate = useNavigate()
    const deleteDeviceMutation = useDeleteDevice({
        mutationConfig: {
            onSuccess: () => {
                navigate(paths.app.devices.getHref())
            },
        },
    })

    return (
        <Modal>
            <Button variant="danger">Delete Device</Button>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-90">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Icon className="bg-default text-foreground">
                                <Delete className="size-5" />
                            </Modal.Icon>
                            <Modal.Heading>Delete {device.name}?</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                This action cannot be undone. Are you sure you want to
                                delete {device.name}?
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button slot="close">Cancel</Button>
                            <Button
                                className="w-full"
                                variant="danger"
                                onClick={() =>
                                    deleteDeviceMutation.mutate({
                                        deviceId: String(device.id),
                                    })
                                }
                            >
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
