import { Header } from "./Header";
import { Footer } from "./Footer";
import { Content } from "./Content";

export function Applayout() {
  return (
    <div className="flex flex-col justify-between items-center md:px-36 w-screen min-h-screen">
      <Header />
      <div className="flex flex-col flex-grow px-4 md:px-8 container">
        <Content />
      </div>
      <div className="px-4 md:px-8 container">
        <Footer />
      </div>
    </div>
  );
}
