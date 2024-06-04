import { BrowserRouter as Router } from "react-router-dom";
import Routes from './routes'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {

  return (
    <Router>
        <Routes/>
        <ToastContainer hideProgressBar={false} autoClose={5000} />
    </Router>
  )
}

export default App
