import { useState } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <main>
        <p>Welcome to the Recipe Generator App!</p>
      </main>
    </>
  )
}

export default App
