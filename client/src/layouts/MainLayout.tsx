import { Footer } from '../components/common/Footer'
import { Navbar } from '../components/common/Navbar'
import { Sidebar } from '../components/common/Sidebar'

export function MainLayout() {
  return (
    <div>
      <Navbar />
      <div>
        <Sidebar />
        <main>
          <h1>Intervio</h1>
          <p>Your interview preparation workspace.</p>
        </main>
      </div>
      <Footer />
    </div>
  )
}
