import { Breadcrumbs } from '@heroui/react'
import React from 'react'

interface BaseLayoutProps {
    children: React.ReactNode
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className={'sticky top-0 z-40 p-4'}>
                <nav>
                    <Breadcrumbs>
                        <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
                        <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
                        <Breadcrumbs.Item>Current Page</Breadcrumbs.Item>
                    </Breadcrumbs>
                </nav>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                {children}
            </main>
        </div>
    )
}
