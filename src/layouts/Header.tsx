import { GitHubLogoIcon } from "@radix-ui/react-icons";
import icon from "../assets/icon.png";

export function Header() {
  return (
    <header className="top-0 z-50 sticky backdrop-blur w-full">
      <div className="flex items-center px-4 md:px-8 w-full h-14">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="flex items-center gap-1.5">
            <img src={icon} alt="Logo" className="w-8 h-8" />
            <div className="font-semibold text-2xl">Iconium</div>
          </div>

          <nav className="flex items-center gap-3">
            <a
              href="https://github.com/beyenilmez/iconium"
              target="_blank"
              rel="noreferrer"
            >
              <GitHubLogoIcon className="w-8 h-8" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
