import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p className="muted">There&apos;s nothing at this address.</p>
      <Link to="/">Go to the home page</Link>
    </section>
  );
}

NotFoundPage.propTypes = {};
