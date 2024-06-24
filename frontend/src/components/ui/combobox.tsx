import * as React from "react"
import { ChevronsUpDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    elements: { value: any; label: string }[];
    placeholder?: string;
    searchPlaceholder?: string;
    nothingFoundMessage?: string;
    mandatory?: boolean;
    value: any;
    setValue: (value: any) => void;
}


export function Combobox(props: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[200px]"
        >
          {props.value
            ? props.elements.find((element) => element.value === props.value)?.label
            : (props.placeholder ? props.placeholder : "Select...")}
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder={props.searchPlaceholder ? props.searchPlaceholder : "Search..."} className="h-9" />
          <CommandList>
            <CommandEmpty>{props.nothingFoundMessage ? props.nothingFoundMessage : "Nothing found..."}</CommandEmpty>
            <CommandGroup>
              {props.elements.map((element) => (
                <CommandItem
                  key={element.value}
                  value={element.value}
                  onSelect={(currentValue) => {
                    props.setValue(!props.mandatory && currentValue === props.value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {element.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      props.value === element.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
