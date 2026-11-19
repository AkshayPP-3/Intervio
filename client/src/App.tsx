import { Route, Routes } from 'react-router-dom'
import { InterviewRoom } from './features/interview/pages/InterviewRoom'
import { InterviewLayout } from './layouts/InterviewLayout'
import { MainLayout } from './layouts/MainLayout'

function App() {
  return (
    <Routes>
      <Route
        path="/interviews/:interviewId"
        element={
          <InterviewLayout>
            <InterviewRoom />
          </InterviewLayout>
        }
      />
      <Route path="*" element={<MainLayout />} />
    </Routes>
  )
}

export default App;