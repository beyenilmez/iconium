import { GetBase64Png } from "@/wailsjs/go/main/App";
import { CircleHelp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectImageProps {
  icon: string;
  onIconChange: (icon: string) => void;
  editable?: boolean;
  className?: string;
  sizeClass: string;
  editSizeClass: string;
}

const SelectImage: React.FC<SelectImageProps> = ({
  icon,
  onIconChange,
  editable = true,
  className,
  sizeClass,
  editSizeClass,
  ...rest
}) => {
  const handleIconEdit = () => {
    GetBase64Png().then((base64) => {
      onIconChange(base64);
    });
  };

  const selectedIcon = icon ? (
    <img src={icon} alt="pack-icon" className={`${sizeClass}`} />
  ) : (
    <CircleHelp className={`${sizeClass}`} />
  );

  return (
    <Button
      type="button"
      onClick={handleIconEdit}
      variant="ghost"
      size="icon"
      className={`static rounded-none overflow-clip group shrink-0 ${sizeClass}
        ${!editable ? "pointer-events-none" : ""} ${className}`}
      {...rest}
    >
      <Upload
        className={`group-hover:flex absolute justify-center items-center hidden bg-muted opacity-70 transition-all ${editSizeClass}`}
      />
      <div className="group-hover:opacity-10 transition-all">
        {selectedIcon}
      </div>
    </Button>
  );
};

export default SelectImage;
