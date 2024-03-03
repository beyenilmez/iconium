export interface fileInfo {
    name: string
    description: string
    path: string
    destination: string
    iconDestination: string
    iconIndex: number
    extension: string
    isFolder: boolean
    iconId: string
}

export interface profileInfo {
    value: any
    label: string
}

export interface profile {
    name: string
    id: string
    value: fileInfo[]
}