import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from "react-router-dom";
import { Button, Form, FormGroup, FormControl } from "react-bootstrap";
import { api } from "../apis/apiCalls";
import Switch from "react-switch";
import axios from 'axios';
import moment from 'moment';
import PerformanceData from './performanceData';
import { Line, Pie } from 'react-chartjs-2';
import "../styles/login.css";
import '../styles/spinner.css';
import '../styles/profile.css';



const Profile = (props) =>{
    const [validated, setValidated] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cbpKey, setCbpKey] = useState("");
    const [cbpSecret, setCbpSecret] = useState("");
    const [cbpPassphrase, setCbpPassphrase] = useState("");
    const [showSpinner, setShowSpinner] = useState(true);
    const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
    const [updateData, setUpdateData] = useState({});
    const isFirstRun = useRef(true);
    const [sizeChartData, setSizeChartData] = useState({});
    const [sizeChartDataset, setSizeChartDataset] = useState({});
    const [dsetsArrayAdjusted, setDsetsArrayAdjusted] = useState({});
    const [dsetsArrayActual, setDsetsArrayActual] = useState({});
    const [performanceDataAdjusted, setPerformanceDataAdjusted] = useState([]);
    const [performanceDataActual, setPerformanceDataActual] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    

    useEffect(() =>{
        checkDatabaseForUsers();
        let baseUrl = process.env.REACT_APP_API_URL;
        axios.get(baseUrl+"/profile/getTimeSeriesBuys",{params:{type:"actualUsd"}}).then((response, error) => {    
            if(error) throw error;
            let callData = response.data.data.orderPerProduct;
            //get product ids
            setPerformanceDataActual(response.data.data.spendingTotals);
            let dsets = [];
            let newObj = {};
            let count = 0;
            let cLabels = [];
            let colors = ["red","blue","green","purple","orange"]
            Object.keys(callData).forEach(k=>{
                newObj = {};
                newObj.label = k;
                newObj.borderColor = colors[count++];
                newObj.data = callData[k];
                // data: [eth: [x:123]]
                dsets.push(newObj);
            });
            setDsetsArrayActual({ datasets: dsets })
        }).catch(err => console.log(err));
        axios.get(baseUrl+"/profile/getTimeSeriesBuys",{params:{type:"adjustedUsd"}}).then((response, error) => {    
            if(error) throw error;
            let callData = response.data.data.orderPerProduct;
            let spendingTotals = response.data.data.spendingTotals;
            //get product ids
            setPerformanceDataAdjusted(response.data.data.spendingTotals);
            let dsets = [];
            let newObj = {};
            let count = 0;
            let cLabels = [];
            let colors = ["red","blue","green","purple","orange"]
            Object.keys(callData).forEach(k=>{
                newObj = {};
                newObj.label = k;
                newObj.borderColor = colors[count++];
                newObj.data = callData[k];
                // data: [eth: [x:123]]
                dsets.push(newObj);
            });
            setDsetsArrayAdjusted({ datasets: dsets })
        }).catch(err => console.log(err));
    },[])

    useEffect(() =>{
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        else{
            let data = {};
            data.enableEmailAlerts = enableEmailAlerts;
            api().post('/users/updateByEmail',{data}).then((resp) => {
                
            }).catch(err => console.log("Failed user data update.",err))
        }
    },[enableEmailAlerts]);

    useEffect(() =>{
        console.log("adjusted:",performanceDataAdjusted , "actual:",performanceDataActual)
        console.log(performanceDataAdjusted>0 , performanceDataActual.length>0);
        if (performanceDataAdjusted.length>0 && performanceDataActual.length>0) {
            let data = [];
            let record = {};
            let totals = {};
            totals.actualUsd = 0;
            totals.actualSize = 0;
            totals.adjustedUsd = 0;
            totals.adjustedSize = 0;
            performanceDataAdjusted.forEach(adj =>{
                performanceDataActual.forEach(act => {
                    if(adj.productId === act.productId){
                        record.productId = adj.productId;
                        record.actualUsd = act.usdSpend;
                        record.size = act.size;
                        record.adjustedUsd = adj.usdSpend;
                        record.profit = adj.usdSpend - act.usdSpend;
                        data.push(record);
                        record = {};
                        totals.actualUsd = totals.actualUsd + act.usdSpend;
                        totals.actualSize = totals.actualSize + act.actSize;
                        totals.adjustedUsd = totals.adjustedUsd + adj.usdSpend;
                    }
                })
            })
            totals.productId = "totals";
            totals.profit = totals.adjustedUsd - totals.actualUsd;
            data.push(totals);
            console.log("DATA",data)
            setPerformanceData(data);
        }
    },[performanceDataActual,performanceDataAdjusted])

    const checkDatabaseForUsers = () => {
        api().get('/users/getCurrentUser').then((resp) => {
                let num = resp.data.user;
                setEmail(resp.data.email);
                setEnableEmailAlerts(resp.data.enableEmailAlerts);
                setShowSpinner(false);
        }).catch(err => console.log("Unable to get user count.",err))
    }
    
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(validated);
        if(validateForm()){
            api().patch(`/users/${email}`, {updateData}).then((resp) => {   
                console.log(resp)
            }).catch(err=>console.log("Cannot send auth request.",err))
        }
    }

    function validateForm() {
        let valid = false;
        let data = {};
        if(password.length > 0) data.password = password;
        if(cbpKey.length > 0) data.cbpKey = cbpKey;
        if(cbpPassphrase.length > 0) data.cbpPassphrase = cbpPassphrase;
        if(cbpSecret.length > 0) data.cbpSecret = cbpSecret;
        setUpdateData(data);
        if(cbpKey.length > 0 
          && cbpPassphrase.length > 0 
          && cbpSecret.length > 0){
            setValidated(true);
            return true;
        }
        else{
            setValidated(false);
            return false;
        }
    }

    const handleLogout = () => {
      localStorage.removeItem("jwt-access-token");
      localStorage.removeItem("jwt-refresh-token");
      window.location.href="/";
    }

    let profileView = ( 
        <div className="center">
            <Form validated={validated} onSubmit={handleSubmit}>
                <FormGroup controlId="userinfo">
                <Form.Label>Enable Email Alerts</Form.Label><br />
                <Switch checked={enableEmailAlerts} onChange={(el, state) => setEnableEmailAlerts(!enableEmailAlerts)} name='test' />
                <br /><br />

                </FormGroup>
                <div type="button" className="btn btn-outline-secondary" onClick={()=>handleLogout()}>Logout</div>

            </Form>
            <br />
            <div>
                <PerformanceData performanceData={performanceData} />
            </div>
            <div className="center" style={{"width":"95%","height": "500px","margin":"auto 0"}}>
                <Line 
                    data={dsetsArrayActual} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        title: {
                            text: "Actual USD Spend",
                            display: true,
                            fontSize: 30
                        },
                        scales: {
                            xAxes: [{
                                type: 'time',
                                ticks: {
                                    maxTicksLimit: 8
                                }
                            }]
                        }
                }}
                />
            </div>
            <div style={{"width":"95%","height": "500px"}}>
                <Line 
                    data={dsetsArrayAdjusted} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        title: {
                            text: "Adjusted USD Spend", 
                            display: true,
                            fontSize: 30
                        },
                        scales: {
                            xAxes: [{
                                type: 'time',
                                ticks: {
                                    maxTicksLimit: 8
                                }
                            }]
                        }
                }}
                />
            </div>
        </div>
    );
    let spinner = (<div className="loader">Loading...</div>);
    
    return (<> {showSpinner ? spinner : profileView} </>);
}

export default withRouter(Profile);
