import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Home from "./Home";
import CreateItem from "./CreateItem";

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/CreateItem">Create Token</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path='CreateItem' element={<CreateItem />} />
          <Route path='/' element={<Home/>} />
        </Routes>
      </div>
    </Router>
  );
}




export default App;





































