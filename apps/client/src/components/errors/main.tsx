import { LinkButton } from '@/components/ui'
import { paths } from '@/config/paths'
import { Home } from '@mui/icons-material'

export const MainErrorFallback = () => {
    return (
        <div
            className="flex h-screen w-screen flex-col items-center justify-center"
            role="alert"
        >
            <h2 className="text-lg font-semibold">Ooops, something went wrong :( </h2>
            <LinkButton
                to={paths.app.devices.getHref()}
                className="mt-4"
            >
                <Home />
                Go Back to Your Devices
            </LinkButton>
        </div>
    )
}
