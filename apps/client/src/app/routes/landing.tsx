import { useNavigate } from 'react-router'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { Head } from '@/components/seo'
import { Button } from '@heroui/react'
import { paths } from '@/config/paths'

const LandingRoute = () => {
    const navigate = useNavigate()

    const handleStart = () => {
        navigate(paths.myHome.root.getHref())
    }

    return (
        <>
            <Head description="Welcome to Smart Home Demo" />
            <div className="flex h-screen items-center bg-white">
                <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        <span className="block">Smart Home Demo</span>
                    </h2>
                    <p>
                        A small full-stack application for managing IoT devices in a smart
                        home environment.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Button onClick={handleStart}>
                            Get started
                            <ArrowForwardIosIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LandingRoute
