export default function IndexPage() {
  fetch("/api/stations")
    .then((res) => res.json())
    .then((data) => console.log("stations data:", data));
  return (
    <div>
      <h1>Welcome to Earthwatch</h1>
    </div>
  );
}
