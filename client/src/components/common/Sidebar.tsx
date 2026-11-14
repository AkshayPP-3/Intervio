export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Intervio</h2>
      </div>

      <nav className="sidebar-nav">
        <a href="#dashboard" className="nav-item active">
          Dashboard
        </a>

        <a href="#interviews" className="nav-item">
          My interviews
        </a>

        <a href="#resume" className="nav-item">
          resume
        </a>

        <a href="#profile" className="nav-item">
          Profile
        </a>
      </nav>
    </aside>
  )
}
