"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    elements: { value: any; label: string }[];
    placeholder?: string;
    noElementsText?: string;
    initialValue?: any;
    searchBar?: boolean;
    onChange: (value: any) => void;
    onExpand?: () => void;
    onElementContextMenu?: (value: any) => void;
}

export function Combobox(props: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(props.initialValue ? props.initialValue : "")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-[200px]"
                    onClick={props.onExpand}
                >
                    {value
                        ? props.elements.find((element) => element.value === value)?.label
                        : (props.placeholder ? props.placeholder : "Search element...")}
                    <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]">
                <Command>
                    {(props.searchBar === true || props.searchBar === undefined) && (
                        <CommandInput placeholder={props.placeholder ? props.placeholder : "Search element..."} />
                    )}
                    <CommandEmpty>{props.noElementsText ? props.noElementsText : "No element found."}</CommandEmpty>
                    <CommandGroup>
                        {props.elements.map((element) => (
                            <CommandItem
                                key={element.value}
                                value={element.value}
                                onSelect={(currentValue) => {
                                    setValue(currentValue === value ? "" : currentValue)
                                    props.onChange(currentValue === value ? "" : currentValue)
                                    setOpen(false)
                                }}
                                onContextMenu={(value) => {
                                    props.onElementContextMenu?.(value.currentTarget.getAttribute("data-value"))
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === element.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {element.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
