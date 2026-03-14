export default function HomePage() {
  return (
    <section className="home-panel">
      <p className="app-subtitle">what would you like to do today?</p>

      <div className="actions-grid">
        <button className="action-button">New schedule</button>
        <button className="action-button">New employee</button>
        <button className="action-button">Update employee</button>
        <button className="action-button">Delete employee</button>
      </div>
    </section>
  );
}
