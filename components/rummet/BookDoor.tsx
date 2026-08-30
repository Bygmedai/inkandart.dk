/** Clothed hop to Book.dk — we dress the door, we do not rebuild the engine. */
export function BookDoor({
  id,
  className = "rum-book",
  label = "Book tid",
}: {
  id?: string;
  className?: string;
  label?: string;
}) {
  return (
    <a
      id={id}
      className={className}
      href="https://inkart.book.dk/"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
