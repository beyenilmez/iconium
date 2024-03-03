import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/profile-provider";
/* import { GetDesktopIcons } from "wailsjs/go/main/App"; */
import { FileContainer } from "./FileContainer"

import { fileInfo } from "@/structs"

export const FileGrid = () => {
    const { profile } = useProfile();
    const [fileInfos, setFileInfos] = useState<fileInfo[]>();

    /* const GetDesktopIconsF = () => {
        GetDesktopIcons().then((res) => {
            console.log(res);
            setFileInfos(res);
        })
    }

    useEffect(() => {
        GetDesktopIconsF();
    }, []) */

    useEffect(() => {
        console.log(profile?.value)
        setFileInfos(profile?.value);
    }, [profile])


    return (
        <div className="grid grid-cols-1">
            {fileInfos?.map((fileInfo, i) => (
                <FileContainer key={i} index={i} fileInfo={fileInfo} />
            ))}
        </div>
    )
}