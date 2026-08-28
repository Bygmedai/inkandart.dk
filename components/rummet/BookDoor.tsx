/** Clothed hop to Book.dk — we dress the door, we do not rebuild the engine. */
export function BookDoor({ id }: { id?: string }) {
  return (
    <a
      id={id}
      className="rum-book"
      href="https://inkart.book.dk/"
      rel="noopener noreferrer"
    >
      Book tid
    </a>
  );
}
