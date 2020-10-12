import React, { useState, useEffect } from 'react';
import { withRouter } from "react-router-dom";
import { Button, Form, FormGroup, FormControl } from "react-bootstrap";
import { api } from "../apis/apiCalls";
import Switch from "react-switch";
import "../styles/login.css";
import '../styles/spinner.css';



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

    useEffect(() =>{
        checkDatabaseForUsers();
    },[])

    useEffect(() =>{
      console.log(updateData);
    },[updateData])

    const checkDatabaseForUsers = () => {
        api().get('/users/getCurrentUser').then((resp) => {
            //if no users exist, route to /register
                let num = resp.data.user;
                console.log("NUMBER OF USERS FOUND: ",resp.data)
                setEmail(resp.data.email)
            if(num === 0) {
                setShowSpinner(false);
            }
            else{
                //window.location.href="/";
                setShowSpinner(false);
            }
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
        <div>
            <Form validated={validated} onSubmit={handleSubmit}>
                <FormGroup controlId="userinfo">
                <Form.Label>Enable Email Alerts</Form.Label><br />
                <Switch checked={enableEmailAlerts} onChange={(el, state) => setEnableEmailAlerts(!enableEmailAlerts)} name='test' />
                <br /><br />
                {/* <Form.Label>Old Password</Form.Label>
                <FormControl
                    disabled
                    value={password}
                    required
                    onChange={e => {
                        setPassword(e.target.value);
                        validateForm();
                    }}
                    type="password"
                />
                <Form.Label>New Password</Form.Label>
                <FormControl
                    disabled
                    value={password}
                    required
                    onChange={e => {
                        setPassword(e.target.value);
                        validateForm();
                    }}
                    type="password"
                />
                <br />
                </FormGroup>
                <FormGroup controlId="cbp">
                <div><hr /></div>
                <div className="cbp">
                    <Form.Label>Coinbase Pro Key</Form.Label>
                    <FormControl
                        value={cbpKey}
                        required
                        onChange={e => {
                            setCbpKey(e.target.value);
                            validateForm();
                        }}
                        type="text"
                    />
                    <Form.Label>Coinbase Pro Secret</Form.Label>
                    <FormControl
                        value={cbpSecret}
                        required
                        onChange={e => {
                            setCbpSecret(e.target.value);
                            validateForm();
                        }}
                        type="text"
                    />
                    <Form.Label>Coinbase Pro Passphrase</Form.Label>
                    <FormControl
                        required
                        value={cbpPassphrase}
                        required
                        onChange={e => {
                            setCbpPassphrase(e.target.value);
                            validateForm();
                        }}
                        type="text"
                    />
                    <br /><a style={{color:"white"}} href="#">More info</a>
                </div> */}
                </FormGroup>
                <Button block disabled={false} type="submit">
                Save
                </Button><br />
                <div type="button" className="btn btn-outline-secondary" onClick={()=>handleLogout()}>Logout</div>

            </Form>
        </div>
    );
    let spinner = (<div className="loader">Loading...</div>);
    
    return (<> {showSpinner ? spinner : profileView} </>);
}

export default withRouter(Profile);
