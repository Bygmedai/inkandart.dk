/** Clothed hop to Book.dk — we dress the door, we do not rebuild the engine. */
export function BookDoor({
  id,
  className = "rum-book",
}: {
  id?: string;
  className?: string;
}) {
  return (
    <a
      id={id}
      className={className}
      href="https://inkart.book.dk/"
      rel="noopener noreferrer"
    >
      Book tid
    </a>
  );
}
