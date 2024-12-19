
import { BrowserRouter , Routes, Route,  } from 'react-router-dom';
import CreatePoll from './PollingComponent/CreatePoll';
import Poll from './PollingComponent/Poll';
import { Toaster } from 'sonner';

const App = () => {
    return (
        <BrowserRouter>
        <Toaster/>
            <Routes>
                <Route path="/" element={<CreatePoll />} />
                <Route path="/poll/:id" element={<Poll />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
