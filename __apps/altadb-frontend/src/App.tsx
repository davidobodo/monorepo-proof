import "./App.css";
import { useState } from "react";
import axios from "axios";
import { Button } from "ui";

const API_URL = "http://127.0.0.1:5002";

console.log("In here");

const getData = () => {
	return axios.get(`${API_URL}/api/data`);
};

const getStatus = () => {
	return axios.get(`${API_URL}/api/status`);
};

function App() {
	const [data, setData] = useState(null);
	const [status, setStatus] = useState(null);

	const handleGetData = async () => {
		try {
			const response = await getData();
			setData(response.data);
		} catch (error) {
			alert(error);
		}
	};

	const handleGetStatus = async () => {
		try {
			const response = await getStatus();
			setStatus(response.data);
		} catch (error) {
			alert(error);
		}
	};
	return (
		<>
			<h1>THE SECOND APPLICATION</h1>
			<p>Add paragraph into second app, and now alter it. This day at noon with more text. Add more text, another</p>
			<Button onClick={handleGetData} text="Get Data" />
			<Button onClick={handleGetStatus} text="Get Status" />

			<div>
				<h2>Data:</h2>
				<pre>{data && JSON.stringify(data, null, 2)}</pre>
			</div>
			<div>
				<h2>Status:</h2>
				<pre>{status && JSON.stringify(status, null, 2)}</pre>
			</div>
		</>
	);
}

export default App;
