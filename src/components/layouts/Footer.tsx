export function Footer() {
  return (
    <footer className="flex md:flex-row flex-col justify-between items-center gap-4 py-2 md:h-20 min-h-[3rem]">
      <p className="w-full text-left text-muted-foreground text-sm md:text-center leading-loose">
        Built by{" "}
        <a
          href="https://github.com/beyenilmez"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          beyenilmez
        </a>
        . The source code is available on{" "}
        <a
          href="https://github.com/beyenilmez/iconium"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>
    </footer>
  );
}
