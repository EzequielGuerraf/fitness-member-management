const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function App() {
  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">Coding Challenge Setup</p>
        <h1>Fitness Member Management</h1>
        <p>
          Frontend and backend scaffolding are ready. Start building features
          from this baseline.
        </p>
        <p className="api-url">API URL: {apiUrl}</p>
      </section>
    </main>
  );
}

export default App;
