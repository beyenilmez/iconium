import screenshot1 from "@/assets/screenshot-1.png";
import { Button } from "../ui/button";
import { DownloadIcon } from "@radix-ui/react-icons";

export function Content() {
  const handleDownload = () => {
    window.location.href =
      "https://github.com/beyenilmez/iconium/releases/latest/download/iconium-amd64-installer.exe";
  };

  return (
    <div className="relative flex flex-col flex-grow px-4 md:px-8 container">
      <div className="relative z-0 inset-0 flex justify-center items-center">
        <div className="flex justify-between gap-16 mt-28 mb-8 w-full">
          <div className="flex flex-col justify-between gap-10">
            <div className="flex flex-col gap-5">
              <h1 className="font-bold text-6xl">
                Customize Your Icons with Ease
              </h1>
              <p className="text-2xl text-muted-foreground">
                Craft your own icon packs, edit your icons, and share your
                creations. Whether for personal or
                professional use, Iconium gives you the power to bring your
                icons to life.
              </p>
            </div>
            <Button
              className="gap-2 hover:shadow-xl hover:scale-[101%] rounded-xl h-16 font-semibold text-md hover:text-[#6253a0] transition-all"
              onClick={handleDownload}
            >
              <DownloadIcon className="w-8 h-8" />
              Download for Windows
            </Button>
          </div>
          <img
            src={screenshot1}
            className="opacity-75 w-[50rem] hover:scale-[101%] md:block hidden transition-all"
            alt="Iconium screenshot showing user interface"
          />
        </div>
      </div>
    </div>
  );
}
