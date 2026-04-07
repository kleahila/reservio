function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-lg bg-white p-5 shadow ${className}`}>
      {title ? (
        <h2 className="mb-3 text-lg font-semibold text-brand-primary">
          {title}
        </h2>
      ) : null}
      <div>{children}</div>
    </section>
  );
}

export default Card;
