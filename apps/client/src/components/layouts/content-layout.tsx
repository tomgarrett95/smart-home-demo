import * as React from 'react'

import { Head } from '../seo'

type ContentLayoutProps = {
    children: React.ReactNode
    title: string
    header?: React.ReactNode
}

export const ContentLayout = ({ children, title, header }: ContentLayoutProps) => {
    return (
        <>
            <Head title={title} />
            <div className="py-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 md:px-8">
                    {header ? (
                        header
                    ) : (
                        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
                    )}
                </div>
                <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 md:px-8">
                    {children}
                </div>
            </div>
        </>
    )
}
