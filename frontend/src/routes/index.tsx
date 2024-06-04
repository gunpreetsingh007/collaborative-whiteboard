import { Route, Routes } from "react-router-dom";
import Home from "../screens/home";
import Whiteboard from "../screens/whiteboard";


export default () => {
    return (
        <Routes>
            <Route path="/" Component={Home} />
            <Route path="/whiteboard/:roomId" Component={Whiteboard} />
        </Routes>
    );
}