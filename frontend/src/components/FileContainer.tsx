import { useEffect, useRef, useState } from "react"
import { GetIconByName, SaveIcon, SaveProfile } from "wailsjs/go/main/App"
import { Input } from "@/components/ui/input"
import { Pencil, Settings2, XOctagon } from "lucide-react"
import { Button } from "./ui/button"
import { useProfile } from "@/contexts/profile-provider"

import unknown from "../assets/folder-search.svg"
import { fileInfo } from "@/structs"


interface FileContainerProps {
    fileInfo: fileInfo
    index: number
}

export const FileContainer = (props: FileContainerProps) => {
    const { profile, setProfile } = useProfile();
    const [editing, setEditing] = useState(false);

    const iconRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        GetIconF();
    }, [])

    useEffect(() => {
        if (editing) {
            SaveProfile(profile.name, JSON.stringify(profile)).then(() => setEditing(false))
        }
    }, [profile])

    function GetIconF() {
        GetIconByName("default", props.fileInfo.iconName).then((res) => {
            if (res) iconRef.current!.src = res
        });
    }

    return (
        <div className="flex justify-between space-x-2 p-2 border-b">
            <div className="flex items-center space-x-2 w-full">
                <Button variant={"ghost"} size={"icon"} className="static group shrink-0" onClick={() => {
                    SaveIcon("default", props.fileInfo).then((uuid) => {
                        if (uuid !== "") {
                            setEditing(true)
                            setProfile({ ...profile, value: profile.value.map((f, i) => i === props.index ? { ...f, iconName: uuid } : f) })
                            GetIconByName("default", uuid).then((res) => {
                                if (res) iconRef.current!.src = res
                            });
                        }
                    })
                }}>
                    <div className="group-hover:flex absolute justify-center items-center hidden bg-muted opacity-70 w-10 h-10">
                        <Pencil />
                    </div>
                    <img ref={iconRef} src={unknown} alt="Icon" />
                </Button>
                <Input type="text" placeholder="Name" value={props.fileInfo.name} onChange={(e) => {
                    setEditing(true)
                    setProfile({ ...profile, value: profile.value.map((f, i) => i === props.index ? { ...f, name: e.target.value } : f) })
                }}
                />
                <Input type="text" placeholder="Description" value={props.fileInfo.description} onChange={(e) => {
                    setEditing(true);
                    setProfile({ ...profile, value: profile.value.map((f, i) => i === props.index ? { ...f, description: e.target.value } : f) })
                }} />
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size={"icon"}>
                    <XOctagon />
                </Button>
                <Button variant="outline" size={"icon"}>
                    <Settings2 />
                </Button>
            </div>
        </div>
    )
}