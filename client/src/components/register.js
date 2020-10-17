import React, { useState, useEffect } from 'react';
import { withRouter } from "react-router-dom";
import { Button, Form, FormGroup, FormControl } from "react-bootstrap";
import { api } from "../apis/apiCalls";
import Switch from "react-switch";
import "../styles/login.css";
import '../styles/spinner.css';

const Register = (props) =>{
    const [validated, setValidated] = useState(false);
    const [keysChecked, setKeysChecked] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cbpKey, setCbpKey] = useState("");
    const [cbpSecret, setCbpSecret] = useState("");
    const [cbpPassphrase, setCbpPassphrase] = useState("");
    const [showSpinner, setShowSpinner] = useState(true);
    const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
    const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
    const [apiKeysValid, setApiKeysValid] = useState(false);

    useEffect(() =>{
        checkDatabaseForUsers();
    },[])

    useEffect(() =>{
        // Enable submit button
        // Diable
        // Show green check mark
    },[apiKeysValid])

    const checkDatabaseForUsers = () => {
        if(localStorage.getItem("jwt-access-token")) window.location.href="/";
        setShowSpinner(false);
    }
    
    const handleSubmit = (event) => {
        if(validateForm()){
            api().post('/users', {email, password, enableEmailAlerts, cbpKey, cbpSecret, cbpPassphrase}).then((resp) => {   
                console.log(resp);
                setRegistrationSuccessful(true);
                setTimeout(() => {  window.location.href="/"; }, 2000);
            }).catch(err=>console.log("Cannot send auth request.",err))
        }
    }

    const validateApiKeys = () => {
        api().post('/coinbase/checkApiKeys',{cbpKey, cbpSecret, cbpPassphrase}).then(res=>{
            setKeysChecked(true);
            if(res.data.data.success) setApiKeysValid(true);
            if(!res.data.data.success) setApiKeysValid(false);
        }).catch(err=>{
            console.log(err);
            setApiKeysValid(false);
        })
    }

    const divStyle = {
        fontSize: "14px",
        color: "white",
        textAlign: "left",
        margin: "auto 0",
        textAlign: "center"
    }

    // let const keyEntryHandler = (value, attrib) =>{
                
    // }

    function validateForm() {
        let valid = false;
        if(name.length > 0 &&
            email.length > 0 &&
            password.length > 0 &&
            cbpKey.length > 0 && 
            cbpPassphrase.length > 0 && 
            cbpKey.length > 0 &&
            apiKeysValid
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
            <Form>
                <div className="centerFlex" > 
                    <p style={divStyle}>Already have an account? <a href="/login">Login here.</a></p>
                </div>
                <br />
                <FormGroup controlId="userinfo">
                <Form.Label>Full Name</Form.Label>
                <FormControl
                    autoFocus
                    required
                    type="fullname"
                    id="fullname"
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
                    id="email"
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
                    id="password"
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
                    <h5>Coinbase Pro API Keys</h5>
                    <a style={{color:"white"}} href="#">More info</a><br /><br />
                    <Form.Label>Key</Form.Label>
                    <FormControl
                        required
                        id="cbpKey"
                        value={cbpKey}
                        disabled={apiKeysValid}
                        onChange={e => {
                            setCbpKey(e.target.value);
                            validateForm();
                        }}
                        type="password"
                    />
                    <Form.Label>Secret</Form.Label>
                    <FormControl
                        value={cbpSecret}
                        id="cbpSecret"
                        disabled={apiKeysValid}
                        required
                        onChange={e => {
                            setCbpSecret(e.target.value);
                            validateForm();
                        }}
                        type="password"
                    />
                    <Form.Label>Passphrase</Form.Label>
                    <FormControl
                        value={cbpPassphrase}
                        required
                        id="cbpPassphrase"
                        disabled={apiKeysValid}
                        onChange={e => {
                            setCbpPassphrase(e.target.value);
                            validateForm();
                        }}
                        type="password"
                    />
                    <br />
                    {keysChecked ? (apiKeysValid ? <p >Keys validated! ✅</p> : <p>Invalid keys! ⚠</p>) : ""}
                </div>
                </FormGroup>
                <div>
                    {apiKeysValid ? 
                        <Button block disabled={!apiKeysValid} onClick={handleSubmit}>
                        Register
                        </Button> :
                        <Button className="btn btn-dark btn-outline-secondary" block disabled={apiKeysValid} onClick={()=>validateApiKeys()}>
                        Validate Keys
                        </Button>
                    }
                    
                </div>
                <br />
                
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
