import { createContext, useContext, useState } from "react"

import { profile as profStruct } from "@/structs"

type ProfileProviderProps = {
    children: React.ReactNode
}

type ProfileProviderState = {
    profile: profStruct
    setProfile: (profileName: profStruct) => void
}

const initialState: ProfileProviderState = {
    profile: { name: "", id: "", value: [] },
    setProfile: () => null,
}

const ProfileProviderContext = createContext<ProfileProviderState>(initialState)

export function ProfileProvider({
    children,
    ...props
}: ProfileProviderProps) {
    const [profile, setProfile] = useState<profStruct>({ name: "", id: "", value: [] });

    const value = {
        profile: profile,
        setProfile: (prof: profStruct) => {
            setProfile(prof)
        },
    }

    return (
        <ProfileProviderContext.Provider {...props} value={value}>
            {children}
        </ProfileProviderContext.Provider>
    )
}

export const useProfile = () => {
    const context = useContext(ProfileProviderContext)

    if (context === undefined)
        throw new Error("useProfile must be used within a ProfileProvider")

    return context
}
