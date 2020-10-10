import React, { useState, useEffect } from 'react';
import { withRouter } from "react-router-dom";
import { Button, Form, FormGroup, FormControl } from "react-bootstrap";
import { api } from "../apis/apiCalls";
import Switch from "react-switch";
import "../styles/login.css";
import '../styles/spinner.css';

const Register = (props) =>{
    const [validated, setValidated] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cbpKey, setCbpKey] = useState("");
    const [cbpSecret, setCbpSecret] = useState("");
    const [cbpPassphrase, setCbpPassphrase] = useState("");
    const [showSpinner, setShowSpinner] = useState(true);
    const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
    const [registrationSuccessful, setRegistrationSuccessful] = useState(false);

    useEffect(() =>{
        checkDatabaseForUsers();
    },[])

    const checkDatabaseForUsers = () => {
        if(localStorage.getItem("jwt-access-token")) window.location.href="/";
        // api().get('/users/count').then((resp) => {
        //     //if no users exist, route to /register
        //         let userCount = resp.data.data;
        //         console.log("NUMBER OF USERS FOUND: ",resp.data)
        //     if(userCount === 0) {
        //         setShowSpinner(false);
        //     }
        //     else{
        //         //window.location.href="/";
        //         setShowSpinner(false);
        //     }
        // }).catch(err => console.log("Unable to get user count.",err))
    }
    
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(validated);
        if(validateForm()){
            api().post('/users', {email, password, enableEmailAlerts, cbpKey, cbpSecret, cbpPassphrase}).then((resp) => {   
                console.log(resp);
                setRegistrationSuccessful(true);
                setTimeout(() => {  window.location.href="/"; }, 2000);
            }).catch(err=>console.log("Cannot send auth request.",err))
        }
    }

    const divStyle = {
        fontSize: "14px",
        color: "white",
        textAlign: "left",
        margin: "auto 0",
        textAlign: "center"
    }

    function validateForm() {
        console.log("Running form check...")
        let valid = false;
        if(email.length > 0 &&
            password.length > 0 &&
            cbpKey.length > 0 && 
            cbpPassphrase.length > 0 && 
            cbpKey.length > 0
        ) {
            setValidated(true);
            return true;
        }
        else{
            setValidated(false);
            return false;
        }
    }

    let register = ( 
        <div className="register">
            <Form validated={validated} onSubmit={handleSubmit}>
                <div className="centerFlex" > 
                    <p style={divStyle}>Already have an account? <a href="/login">Login here.</a></p>
                </div>
                <FormGroup controlId="userinfo">
                <Form.Label>Name</Form.Label>
                <FormControl
                    autoFocus
                    required
                    type="name"
                    value={name}
                    onChange={e => {
                        setName(e.target.value)
                        validateForm();
                    }}
                />
                
                <Form.Label>Email</Form.Label>
                <FormControl
                    type="email"
                    value={email}
                    required
                    onChange={e => {
                        setEmail(e.target.value)
                        validateForm();
                    }}
                />
                
                <Form.Label>Password</Form.Label>
                <FormControl
                    value={password}
                    required
                    onChange={e => {
                        setPassword(e.target.value);
                        validateForm();
                    }}
                    type="password"
                /><br /><br />
                <Form.Label>Enable Alert Emails</Form.Label><br />
                <Switch checked={enableEmailAlerts} onChange={(el, state) => setEnableEmailAlerts(!enableEmailAlerts)} name='test' />
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
                        value={cbpPassphrase}
                        required
                        onChange={e => {
                            setCbpPassphrase(e.target.value);
                            validateForm();
                        }}
                        type="text"
                    />
                    <br /><a style={{color:"white"}} href="#">More info</a>
                </div>
                </FormGroup>
                <Button block disabled={false} type="submit">
                Register
                </Button><br />
                
            </Form>
        </div>
    );

    let regSuccessDiv = (<div style={divStyle}>
            <p>SUCCESS..</p>
            <p>Returning you to login page</p>
        </div>
    );
    if(registrationSuccessful) register = regSuccessDiv;
    let spinner = (<div className="loader">Loading...</div>);
    
    return (<> {showSpinner ? spinner : register} </>);
}

export default withRouter(Register);
